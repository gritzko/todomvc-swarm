'use strict';

var Swarm = require('swarm');

var TodoList = Swarm.Set.extend('TodoList', {

    completeAll: function() {
        for (var key in this.objects) {
            var obj = this.objects[key];
            if (obj && obj._version && !obj.completed) {
                obj.complete();
            }
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
