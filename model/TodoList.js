"use strict";

var Swarm = require('swarm');
var TodoItem = require('./TodoItem');

var TodoList = Swarm.Vector.extend('TodoList', {

    objectType: TodoItem,

    completeAll: function() {
        var stats = this.stats();
        if (stats.left === 0) {
            // all todos completed, so uncomplete them
            this.objects.forEach(function (obj) {
                if (obj && obj._version) {
                    obj.uncomplete();
                }
            });
        } else {
            this.objects.forEach(function (obj) {
                if (obj && obj._version && !obj.completed) {
                    obj.complete();
                }
            });
        }
    },

    removeCompleted: function () {
        // TODO one op - repeated spec? long spec?
        var rms = [], rm;
        this.objects.forEach(function(obj){
            if (obj.completed) {
                rms.push(obj);
            }
        });
        while (rm = rms.pop()) {
            this.remove(rm);
        }
    },

    stats: function() {
        var ret = {
            entries: 0,
            completed: 0,
            left: 0
        };
        this.objects.forEach(function (obj) {
            ret.entries++;
            if (obj.completed) {
                ret.completed++;
            } else {
                ret.left++;
            }
        });
        return ret;
    }
});

module.exports = TodoList;
