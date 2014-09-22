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
    this.parseUri();
}

TodoApp.prototype.initSwarm = function () {
    this.storage = new Swarm.SharedWebStorage();
    this.storage.authoritative = true;
    this.wsServerUri = 'ws://'+window.location.host;
    this.host = Swarm.env.localhost =
        new Swarm.Host(this.ssnid,'',this.storage);
    this.host.connect(this.wsServerUri, {delay: 50});
};

TodoApp.prototype.parseUri = function () {
    var hash = window.location.hash;
    var path = window.location.pathname;
    var idre = Spec.reQTokExt;
    idre.lastIndex = 0;
    var ml = idre.exec(path), listId = ml&&ml[2];
    idre.lastIndex = 0;
    var mi = idre.exec(hash), itemId = mi&&mi[2];
    if (!listId) {
        var list = new TodoList();
        var item = new TodoItem();
        list.addObject(item);
        listId = list._id;
        itemId = item._id;
    }
    this.forward(listId,itemId);
};


TodoApp.prototype.installListeners = function () {
    var self = this;
    document.addEventListener('keydown', function (ev) {
        switch (ev.keyCode) {
            case 9:  self.forward();break; // tab
            case 27: self.back();   break; // esc
            case 40: self.down();   break; // down arrow
            case 38: self.up();     break; // up arrow
            case 45: self.toggle(); break; // insert
            case 13: self.create(); break; // enter
            //case 46: self.delete(); break; // delete
            default: return true;
        }
        ev.preventDefault();
        return false;
    });
};

TodoApp.prototype.getItem = function (itemId) {
    if (!itemId) {
        var state = this.history[this.history.length-1];
        itemId = state.itemId;
    }
    return this.host.get('/TodoItem#'+itemId);
};

TodoApp.prototype.getList = function (listId) {
    if (!listId) {
        var state = this.history[this.history.length-1];
        listId = state.listId;
    }
    return this.host.get('/TodoList#'+listId);
};

TodoApp.prototype.refresh = function () {
    // rerender DOM
    React.renderComponent(
        TodoAppView ({
            key: 'root',
            app: this,
            UIState: this.history
        }),
        document.getElementById('todoapp')
    );
    // recover focus
    var item = this.getItem();
    var edit = document.getElementById(item._id);
    if (edit) {
        edit.focus();
    }
    // set URI
};

// Suddenly jump to some entry in some list.
// Invoked by onClick and onHashChange
TodoApp.prototype.go = function (listId, itemId) {
    // find in history
    var hi = this.history;
    var back=0;
    while (back<hi.length && hi[hi.length-back-1].listId!==listId) {
        back++;
    }
    while (back--) {
        this.back();
    }
    if (back===hi.length) {
        this.forward(listId,itemId);
    }
    var list = this.getList();
    if ( itemId && list) { //} && list.indexOf('/TodoItem#'+itemId)!==-1 ) {
        this.selectItem(itemId);
    }
};

TodoApp.prototype.back = function () {
    this.moving = true;
    this.history.pop();
    window.history.back();
    this.moving = false;
    this.refresh();
};

TodoApp.prototype.forward = function (listId, itemId) {
    var self = this;
    var fwdList;
    if (!listId) {
        var item = this.getItem();
        listId = item.childList;
    }
    if (!listId) {
        fwdList = new TodoList();
        listId = fwdList._id;
        item.set({childList: listId});
    } else {
        fwdList = this.host.get('/TodoList#'+listId); // TODO fn+id sig
    }
    // we may need to fetch the data from the server so we use a callback, yes
    fwdList.once('.init',function(){
        if (!fwdList.length()) {
            fwdList.addObject(new TodoItem({text:'just do it'}));
        }
        itemId = itemId || fwdList.objectAt(0)._id;
        window.history.pushState
            ({},"",window.location.origin + '/' + listId + '#' + itemId);
        self.history.push({
            listId: listId,
            itemId: itemId
        });
        self.refresh();
    });
};

TodoApp.prototype.selectItem = function (itemId) {
    var list = this.getList();
    var item = this.getItem();
    if (itemId.constructor===Number) {
        var i = itemId;
        if (i<0) { i=0; }
        if (i>=list.length()) { i=list.length()-1; } // TODO .length
        itemId = i>=0 ? list.objectAt(i)._id : '';
    } if (itemId._id) {
        itemId = itemId._id;
    }
    var state = this.history[this.history.length-1];
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
        var newItem = new TodoItem();
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

module.exports = window.TodoApp = TodoApp



