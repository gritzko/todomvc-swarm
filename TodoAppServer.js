"use strict";

// node libs
var url = require('url');
var http = require('http');

// WebSockets support
var ws_lib = require('ws');
// Express
var express = require('express');
var browserify = require('connect-browserify');
var compression = require('compression');
var jsx_views = require('express-react-views');

// React jsx support
var nodejsx = require('node-jsx');
nodejsx.install();

// Swarm
var Swarm = require('swarm');
var Spec = Swarm.Spec;
var EinarosWSStream = Swarm.EinarosWSStream;

// TodoApp models
var TodoList = require('./model/TodoList');
var TodoItem = require('./model/TodoItem');

var todoRouter = require('./todoRouter');

var args = process.argv.slice(2);
var argv = require('minimist')(args, {
    alias: {
        port: 'p',
        debug: 'D',
        store: 's'
    },
    boolean: ['debug'],
    default: {
        store: '.swarm',
        port: 8000,
        debug: false
    }
});

Swarm.env.debug = argv.debug;

var app = express();
app.use(compression());
app.use(express.static('.'));
app.use('/js/bundle.js', browserify({
    entry: './TodoApp.js',
    debug: false
}));

// configure view rendering engine
var jsx_options = {
    jsx: {
        harmony: false
    }
};
app.engine('jsx', jsx_views.createEngine(jsx_options));
app.set('view engine', 'jsx');
app.set('views', process.cwd() + '/view');

app.get(/[/+A-Za-z0-9_~]*/, function (req, res) {
    var route = req.path;
    todoRouter.load(route, function (path) {
        // real route may differ (for ex: when now object with specified id found)
        res.header('Location', todoRouter.buildRoute(path));
        res.render('index', {
            app: {path: path}
        });
    });
});


// use file storage
var fileStorage = new Swarm.FileStorage(argv.store);

// create Swarm Host
app.swarmHost = new Swarm.Host('swarm~nodejs', 0, fileStorage);
Swarm.env.localhost = app.swarmHost;

// start the HTTP server
var httpServer = http.createServer(app);

httpServer.listen(argv.port, function (err) {
    if (err) {
        console.warn('Can\'t start server. Error: ', err, err.stack);
        return;
    }
    console.log('Swarm server started port', argv.port);
});

// start WebSocket server
var wsServer = new ws_lib.Server({
    server: httpServer
});

// accept pipes on connection
wsServer.on('connection', function (ws) {
    var params = url.parse(ws.upgradeReq.url, true);
    console.log('incomingWS %s', params.path);
    app.swarmHost.accept(new EinarosWSStream(ws), { delay: 50 });
});

process.on('SIGTERM', onExit);
process.on('SIGINT', onExit);
process.on('SIGQUIT', onExit);

function onExit(exitCode) {
    console.log('shutting down http-server...');
    httpServer.close();

    console.log('closing swarm host...');
    app.swarmHost.close(function () {
        console.log('swarm host closed');
        process.exit(exitCode);
    });
}
