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

var React         = require('react');
var Swarm         = require('swarm');
var Spec = Swarm.Spec;

var TodoList = require('./model/TodoList');
var TodoItem = require('./model/TodoItem');

Swarm.env.debug = true;

var TodoAppView       = require('./dist/TodoAppView');

function TodoApp (ssnid, listId) {
    this.history = [];
    this.ssnid = ssnid;
    this.moving = false;

    this.initSwarm();
    this.installListeners();

    if (listId) {
        this.right(listId);
    }
}

TodoApp.prototype.initSwarm = function () {
    this.storage = new Swarm.SharedWebStorage();
    this.storage.authoritative = true;
    this.wsServerUri = 'ws://'+window.location.host;
    this.host = Swarm.env.localhost = 
        new Swarm.Host(this.ssnid,'',this.storage);
    this.host.connect(this.wsServerUri, {delay: 50});
};

TodoApp.prototype.installListeners = function () {
    var self = this;
    window.onhashchange = function () {
        if (self.moving) {return;}
        var hash = window.location.hash;
        var idre = Spec.reTokExt;
        var m = idre.exec(hash), entryId = m&&m[0];
        this.go(entryId);
    }
    document.addEventListener('keydown', function (ev) {
        switch (ev.keyCode) {
            case 9: // tab
            case 39: self.right(); break;
            case 27: // esc
            case 37: self.left();  break;
            case 40: self.down();  break;
            case 38: self.up();    break;
            case 32: self.toggle();break;
            case 13: self.create();break;
            default: return true;
        }
        return false;
    });
};

TodoApp.prototype.getActiveItem = function () {
    var state = this.history[this.history.length-1];
    var list = this.host.get('/TodoList#'+state.listId);
    if (!state.itemId) {
        return undefined;
    }
    var item = this.host.get('/TodoItem#'+state.itemId);
    return item;
};

TodoApp.prototype.refresh = function () {
    React.renderComponent(
        TodoAppView ({
            key: 'root',
            UIState: this.history
        }),
        document.getElementById('todoapp')
    );
};

// invoked by onClick and onHashChange
TodoApp.prototype.go = function (listId, itemId) {
    // find in history
    var hi = this.history;
    var back=0; 
    while (back<hi.length && hi[hi.length-back-1].listId!==listId) {
        back++;
    }
    while (back--) {
        this.left();
    }
    if (back===hi.length) {
        // finally, go right
        this.right(listId,itemId);
    }
};

TodoApp.prototype.left = function () {
    this.moving = true;
    this.history.pop();
    window.history.back();
    this.moving = false;
    this.refresh();
};

TodoApp.prototype.right = function (listId, itemId) {
    if (!listId) {
        var item = this.getActiveItem();
        listId = item.childList;
    }
    if (!listId) {
        // TODO create
        throw new Error("no active item > nowhere to go");
    }
    if (!itemId) {
        var list = this.host.get('/TodoList#'+listId); // TODO fn+id sig
        if (list._version && list.length()){
            var item1 = list.objectAt(0);
            itemId = item1._id;
        }
    }
    this.moving = true;
    window.history.pushState(window.location.origin + '/' + listId + '#' + itemId);
    this.history.push({
        listId: listId,
        itemId: itemId
    });
    this.moving = false;
    this.refresh();
};

TodoApp.prototype.up = function () {
    var state = this.history[this.history.length-1];
    var listId = state.listId;
    var list = this.host.get('/TodoList#'+listId);
    var i = list.indexOf(state.itemId);
    if (i>0) {
        var newId = list.objectAt(i-1);
        state.itemId = newId._id;
        this.refresh();
    }
};

TodoApp.prototype.down = function () {
    // may create entry
    var state = this.history[this.history.length-1];
    var listId = state.listId;
    var list = this.host.get('/TodoList#'+listId);
    var i = list.indexOf(state.itemId);
    if (i<list.length()-1) {
        var newId = list.objectAt(i+1);
        state.itemId = newId._id;
        this.refresh();
    }
};

TodoApp.prototype.toggle = function () {
    var item = this.getActiveItem();
    if (item) {
        item.set({completed:!item.completed});
    }
};

TodoApp.prototype.create = function () {
    var item = this.getActiveItem();
    var state = this.history[this.history.length-1];
    var listId = state.listId;
    var list = this.host.get('/TodoList#'+listId);
    if (list && item) {
        list.insertAfter(new TodoItem(), item);
    }
};

var sessionId = window.localStorage.getItem('.localuser') ||
    'anon'+Spec.int2base((Math.random()*10000)|0);
window.localStorage.setItem('.localuser',sessionId);

var app = window.app = new TodoApp(sessionId, 'tensymbols');



