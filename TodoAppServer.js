"use strict";

// node libs
var url = require('url');
var http = require('http');
var fs = require('fs');

// WebSockets support
var ws_lib = require('ws');
// Express
var express = require('express');
var compression = require('compression');

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

var TodoRouter = require('./TodoRouter');

var args = process.argv.slice(2);
var argv = require('minimist')(args, {
    alias: {
        port:  'p',
        debug: 'D',
        store: 's',
        repl:  'r',
        cdn:   'c'
    },
    boolean: ['debug','repl','cdn'],
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

var htmlTemplate = loadHtmlTemplate();

// empty page for offline support
app.get('/offline.html', function (req, res) {
    res.write(htmlTemplate.head);
    res.write(htmlTemplate.tail);
    res.end();
});

app.get(/[/+A-Za-z0-9_~]*/, function (req, res) {
    var route = req.path;
    var router = new TodoRouter();
    res.header('Content-Type', 'text/html; charset=utf-8');
    res.header('Cache-Control', 'private, max-age=0, no-cache');
    res.write(htmlTemplate.head);
    router.load(route, function (path) {
        res.write(
            React.renderComponentToString(
                TodoAppView({
                    key: 'TodoApp',
                    app: {path: path}
                })
            )
        );
        res.write(htmlTemplate.tail);
        res.end();
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

process.on('uncaughtException', function(err) {
    console.log('uncaught:', err, err.stack);
    onExit(100);
});

function onExit(exitCode) {
    console.log('shutting down http-server...');
    httpServer.close();

    console.log('closing swarm host...');
    var exitTimeoutTimer = setTimeout(function () {
        console.log('swarm host close timeout');
        process.exit(exitCode);
    }, 5000);

    app.swarmHost.close(function () {
        console.log('swarm host closed');
        clearTimeout(exitTimeoutTimer);
        process.exit(exitCode);
    });
}

if (argv.repl) {
    var repl = require('repl');
    repl.start('>');
}

// Some ungodly magic to send prerendered displayable HTML in one
// piece. Less RTTs => faster load times, you know.
function loadHtmlTemplate () {
    // The code depends on the version of React.
    // Better if React versions match (here and in package.json)
    var reactUrl = argv.cdn ? 'http://fb.me/react-0.11.2.min.js' : '/dist/react.min.js'
    var css1 = fs.readFileSync('./css/base.css').toString();
    var css2 = fs.readFileSync('./css/add.css').toString();
    var css3 = fs.readFileSync('./css/touch.css').toString();
    var css = css1 + css2 + css3; // the license differs :(
    var template = fs.readFileSync('./view/index.html').toString();
    template = template.replace('$CSS',css);
    template = template.replace('$REACT',reactUrl);
    var i = template.indexOf('$VIEW');
    return {
        head: template.substr(0,i),
        tail: template.substr(i+'$VIEW'.length)
    };
}
