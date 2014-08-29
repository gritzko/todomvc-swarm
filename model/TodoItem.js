'use strict';

var Swarm = require('swarm');

var TodoItem = Swarm.Model.extend('TodoItem', {
    defaults: {
        textID: String,
        completed: false
    },

    complete: function (reverse) {
        this.set({ completed: !reverse });
    }

});

module.exports = TodoItem;
