'use strict';

var Swarm = require('swarm');
var TodoItem = require('./TodoItem');

var TodoList = Swarm.Vector.extend('TodoList', {

    objectType: TodoItem,

    completeAll: function() {
        for (var key in this.objects) {
            var obj = this.objects[key];
            if (obj && obj._version && !obj.completed) {
                obj.complete();
            }
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
        for(var spec in this.objects) {
            var obj = this.objects[spec];
            ret.entries++;
            if (obj.completed) {
                ret.completed++;
            } else {
                ret.left++;
            }
        }
        return ret;
    }
});

module.exports = TodoList;
