"use strict";

// node libs
var url = require('url');
var http = require('http');

// WebSockets support
var ws_lib = require('ws');
// Express
var express = require('express');
var compression = require('compression');
var lodash_views = require('lodash-express');

// React
// jsx support
var nodejsx = require('node-jsx');
nodejsx.install();

var React = require('react');
var TodoAppView = require('./view/TodoAppView.jsx');

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
        store: 's',
        repl: 'r'
    },
    boolean: ['debug','repl'],
    default: {
        store: '.swarm',
        port: 8000,
        debug: false,
        repl: false
    }
});

Swarm.env.debug = argv.debug;

var app = express();
app.use(compression());
app.use(express.static('.'));

// configure view rendering engine
lodash_views(app, 'lodash.html');
app.set('view engine', 'lodash.html');
app.set('views', process.cwd() + '/view');

// empty page for offline support
app.get('/offline.html', function (req, res) {
    res.render('index', {
        appView: ''
    });
});

app.get(/[/+A-Za-z0-9_~]*/, function (req, res) {
    var route = req.path;
    todoRouter.load(route, function (path) {
        // real route may differ (for ex: when now object with specified id found)
        res.header('Location', todoRouter.buildRoute(path));
        res.render('index', {
            appView: React.renderComponentToString(TodoAppView({
                key: 'TodoApp',
                app: {path: path}
            }))
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

if (argv.repl) {
    var repl = require('repl');
    repl.start('>');
}
