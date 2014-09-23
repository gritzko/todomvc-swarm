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
var EinarosWSStream = Swarm.EinarosWSStream;

// TodoApp models
require('./model/TodoList');
require('./model/TodoItem');


var port = 8000;

var app = express();
app.use(compression());
app.use(express.static('.'));
app.use('/js/bundle.js', browserify({
    entry: './TodoApp.js',
    debug: true
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

var runAppJS = '(function(){\n'+
    'var sessionId = window.localStorage.getItem(\'.localuser\') ||\n' +
    '\'anon\'+Swarm.Spec.int2base((Math.random()*10000)|0);\n' +
    'window.localStorage.setItem(\'.localuser\',sessionId);\n' +
    'window.app = new window.TodoApp(sessionId);' +
    '})();';

app.get(/(?:\/([A-Za-z0-9_~]+))*/, function (req, res) {
    if (req.params.length === 0) {
        res.render('index', {
            runAppJS: runAppJS,
            UIState: []
        });
    } else {
        var listId = req.params[0];
        var itemId;
        if (req.params.length > 1) {
            itemId = req.params[1];
        } else {
            itemId = null;
        }
        var todoList = app.swarmHost.get('/TodoList#' + listId);
        // wait for all TodoItems inited
        todoList.onObjectStateReady(function () {
            res.render('index', {
                runAppJS: runAppJS,
                UIState: [{
                    listId: listId,
                    itemId: itemId
                }]
            });
        });
    }
});


// use file storage
var fileStorage = new Swarm.FileStorage('.swarm');

// create Swarm Host
app.swarmHost = new Swarm.Host('swarm~nodejs', 0, fileStorage);
Swarm.env.localhost = app.swarmHost;

// start the HTTP server
var httpServer = http.createServer(app);

httpServer.listen(port, function (err) {
    if (err) {
        console.warn('Can\'t start server. Error: ', err, err.stack);
        return;
    }
    console.log('Swarm server started port', port);
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
