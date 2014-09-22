"use strict";

// Simple Swarm sync server: picks model classes from a directory,
// starts a WebSocket server at a port. Serves some static content,
// although I'd recomment to shield it with nginx.
var fs = require('fs');
var path = require('path');
var url = require('url');
var http = require('http');

var nopt = require('nopt');
var ws_lib = require('ws');
var pushserve = require('pushserve');

var Swarm = require('swarm');
var EinarosWSStream = Swarm.EinarosWSStream;

var options = nopt({
    models : path,
    index : path,
    port : Number
});

// boot model classes
var modelPathList = options.models||'model/';
modelPathList.split(/[\:;,]/g).forEach(function (modelPath) {
    modelPath = path.resolve(modelPath);
    console.log('scanning',modelPath);
    var modelClasses = fs.readdirSync(modelPath), modelFile;
    while (modelFile = modelClasses.pop()) {
        if (!/^\w+\.js$/.test(modelFile)) { continue; }
        var modpath = path.join(modelPath, modelFile);
        var fn = require(modpath);
        if (fn.constructor !== Function) { continue; }
        if (fn.extend !== Swarm.Syncable.extend) { continue; }
        console.log('Model loaded', fn.prototype._type, ' at ', modpath);
    }
});

// use file storage
var fileStorage = new Swarm.FileStorage('.swarm');

// create Swarm Host
var swarmHost = new Swarm.Host('swarm~nodejs', 0, fileStorage);
Swarm.localhost = swarmHost;

// start the HTTP server
var httpServer = pushserve(options);
console.log('HTTP server started');

// start WebSocket server
var wsServer = new ws_lib.Server({
    server: httpServer
});
console.log('Swarm server started');

// add pipes
wsServer.on('connection', function(ws) {
    var params = url.parse(ws.upgradeReq.url,true);
    console.log('incomingWS %s', params.path);
    // check the secret
    // FIXME grant ssn
    swarmHost.accept(new EinarosWSStream(ws), { delay: 50 });
});

