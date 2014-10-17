/**
 * Copyright 2013-2014 Victor Grishchenko
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @jsx React.DOM
 */

var React = require('react');
var Swarm = require('swarm');
var Spec = Swarm.Spec;

var TodoRouter = require('./TodoRouter');

var TodoList = require('./model/TodoList');
var TodoItem = require('./model/TodoItem');

Swarm.env.debug = false;
var isEmbed = (window.parent!==window);

var TodoAppView = require('./view/TodoAppView.jsx');

function TodoApp (ssnid, listId) {
    this.path = [];
    this.active = false;
    this.ssnid = ssnid;

    this.router = new TodoRouter();
    this.refreshBound = this.refresh.bind(this);
    this.initSwarm();
    this.parseUri();
    this.isTouch = ('ontouchstart' in window)
      || (navigator.MaxTouchPoints > 0)
      || (navigator.msMaxTouchPoints > 0);
}

TodoApp.prototype.initSwarm = function () {
    //this.storage = null;
    this.storage = new Swarm.SharedWebStorage('webst',{persistent:true});
    this.wsServerUri = 'ws://'+window.location.host;
    this.host = Swarm.env.localhost = new Swarm.Host(this.ssnid,'',this.storage);
    this.host.connect(this.wsServerUri, {delay: 50});
};

TodoApp.prototype.parseUri = function () {
    var route = window.location.pathname + window.location.hash;
    this.router.load(route, this.refreshBound);
};

TodoApp.prototype.installListeners = function () {
    var self = this;
    document.addEventListener('keydown', function (ev) {
        switch (ev.keyCode) {
            case 9:  ev.shiftKey ? self.back(1) : self.forward(); break; // [shift+]tab
            case 27: self.back(1);  break; // esc
            case 40: self.down();   break; // down arrow
            case 38: self.up();     break; // up arrow
            case 45: self.toggle(); break; // insert
            case 107:                      // numpad plus
            case 13: self.create(); break; // enter
            case 109:self.delete(); break; // numpad minus
            default: return true;
        }
        ev.preventDefault();
        return false;
    });
};

TodoApp.prototype.getItem = function (itemId) {
    if (!itemId) {
        var state = this.path[this.path.length-1];
        itemId = state.itemId;
    }
    return this.host.get('/TodoItem#'+itemId);
};

TodoApp.prototype.getList = function (listId) {
    if (!listId) {
        var state = this.path[this.path.length-1];
        listId = state.listId;
    }
    return this.host.get('/TodoList#'+listId);
};

TodoApp.prototype.refresh = function (path) {
    var self = this;
    self.path = path || self.path;
    if (!self.active) {
        self.installListeners();
        self.active = true;
    }
    // rerender DOM
    React.renderComponent(
        TodoAppView ({
            key: 'TodoApp',
            app: self
        }),
        document.getElementById('todoapp')
    );
    // recover focus
    var item = this.getItem();
    var edit = document.getElementById(item._id);
    if (edit) {
        edit.focus();
        // safari text select fix
        edit.value = edit.value;
        // TODO scroll into view
    }
    // set URI
    var route = this.router.buildRoute(this.path);
    var newLink = window.location.origin + route;
    window.history.replaceState({},"",newLink);
    if (isEmbed) {
        var link = document.getElementById("self");
        link.setAttribute('href', newLink);
        link.innerHTML = 'link';
    }
};

// Suddenly jump to some entry in some list.
// Invoked by onClick and onHashChange
TodoApp.prototype.go = function (listId, itemId) {
    // find in history
    var path = this.path;
    var backSteps = 0;
    while (backSteps < path.length && path[path.length-backSteps-1].listId !== listId) {
        backSteps++;
    }
    this.back(backSteps);
    this.selectItem(itemId);
};

TodoApp.prototype.back = function (steps) {
    if (this.path.length <= 1) return;

    for (var i = 0; i < steps && i < this.path.length; i++) {
        this.path.pop();
    }
    this.refresh();
};

/** Go deeper into child lists (may create them if necessary).
 * itemIds  must be an id (selected entry) or an Array of ids
 *          (chain of selections) or falsy (1st item on the list)
 * */
TodoApp.prototype.forward = function (listId, itemIds) {
    var fwdList;
    if (!listId) { // default Tab behavior
        var item = this.getItem();
        listId = item.childList;
    }
    if (!listId) { // create a new list if none exists
        fwdList = new TodoList();
        listId = fwdList._id;
        item.set({childList: listId});
    }

    this.router.addPathItem(listId, itemIds, this.path, this.refreshBound);
};

TodoApp.prototype.selectItem = function (itemId) {
    var list = this.getList();
    if (itemId.constructor===Number) {
        var i = itemId;
        if (i<0) { i=0; }
        if (i>=list.length()) { i=list.length()-1; } // TODO .length
        itemId = i>=0 ? list.objectAt(i)._id : '';
    } if (itemId._id) {
        itemId = itemId._id;
    }
    var state = this.path[this.path.length-1];
    state.itemId = itemId;
    this.refresh();
};

TodoApp.prototype.up = function () {
    var list = this.getList();
    var item = this.getItem();
    var i = list.indexOf(item);
    if (i>0) {
        this.selectItem(i-1);
    }
};

TodoApp.prototype.down = function () {
    var list = this.getList();
    var item = this.getItem();
    var i = list.indexOf(item);
    if (i+1<list.length()) {
        this.selectItem(i+1);
    }
};

TodoApp.prototype.toggle = function () {
    var item = this.getItem();
    if (item) {
        item.set({completed:!item.completed});
    }
};

TodoApp.prototype.create = function () {
    var item = this.getItem();
    var list = this.getList();
    if (list && item) {
        var newItem = new TodoItem({text:''});
        list.insertAfter(newItem, item);
        this.selectItem(newItem);
    }
};

TodoApp.prototype.delete = function (listId, itemId) {
    var list = this.getList(listId);
    var item = this.getItem(itemId);
    var pos = list.indexOf(item);
    if (list && item && pos!==-1) {
        list.remove(item);
        this.selectItem(pos);
    }
};

module.exports = window.TodoApp = TodoApp;
