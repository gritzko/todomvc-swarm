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

Swarm.env.debug = true;

var port = 8000;

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
    Spec.reQTokExt.lastIndex = 0;
    var path = req.path;
    var rootListId = null;
    var itemIds = [];
    var m;
    Spec.reQTokExt.lastIndex = 0;
    while (m = Spec.reQTokExt.exec(path)) {
        var id = m && m[2];
        if (!rootListId) {
            rootListId = id;
        } else {
            itemIds.push(id);
        }
    }

    if (!rootListId) {
        res.render('index', {
            app: {path: []}
        });
        return;
    }

    function loadPath(path, listId, itemIds) {
        console.log('loadPath(%s, %j)', listId, itemIds);
        var list = app.swarmHost.get('/TodoList#' + listId);

        list.onObjectStateReady(function(){
            if (!list.length()) {
                list.addObject(new TodoItem({text:'just do it'}));
            }
            if (!itemIds) {
                itemIds = [fwdList.objectAt(0)._id];
            } else if ('string' === typeof itemIds) {
                itemIds = [itemIds];
            }

            var itemId = itemIds.shift();
            path.push({
                listId: listId,
                itemId: itemId
            });
            var item = list.getObject(itemId);
            if (!itemIds.length || !item.childList) {
                res.header('Location', '/' + rootListId + '/' + path.map(function (el) {return el.itemId;}).join('/'));
                res.render('index', {
                    app: {path: path}
                });
            } else {
                loadPath(path, item.childList, itemIds);
            }
            // TODO max delay
        });

    }

    loadPath([], rootListId, itemIds);
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
