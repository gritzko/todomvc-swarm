"use strict";

var Swarm = require('swarm');

var TodoItem = Swarm.Model.extend('TodoItem', {
    defaults: {
        text: String,
        completed: false,
        childList: ''
    },

    toggle: function () {
        this.set({ completed: !this.completed });
    },

    complete: function () {
        this.set({ completed: true });
    },

    uncomplete: function () {
        this.set({ completed: false });
    }

});

module.exports = TodoItem;
