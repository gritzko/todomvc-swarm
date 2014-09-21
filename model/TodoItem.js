'use strict';

var Swarm = require('swarm');

var TodoItem = Swarm.Model.extend('TodoItem', {
    defaults: {
        textID: String,
        completed: false,
        childList: ''
    },

    toggle: function () {
        this.set({ completed: !this.completed });
    },

    complete: function () {
        this.set({ completed: true });
    }

});

module.exports = TodoItem;
