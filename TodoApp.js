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

var TodoList = require('./model/TodoList');
var TodoItem = require('./model/TodoItem');

Swarm.env.debug = true;

var TodoAppView = require('./view/TodoAppView.jsx');

function TodoApp (ssnid, listId) {
    this.path = [];
    this.ssnid = ssnid;
    this.loading = true;

    this.initSwarm();
    this.installListeners();
    this.parseUri();
}

TodoApp.prototype.initSwarm = function () {
    //this.storage = null;
    this.storage = new Swarm.SharedWebStorage('webst',{persistent:true});
    this.wsServerUri = 'ws://'+window.location.host;
    this.host = Swarm.env.localhost = new Swarm.Host(this.ssnid,'',this.storage);
    this.host.connect(this.wsServerUri, {delay: 50});
};

TodoApp.prototype.parseUri = function () {
    var path = window.location.pathname + window.location.hash;
    var rootListId = null;
    var itemIds = [];
    var m;
    Spec.reQTokExt.lastIndex = 0;
    while (m = Spec.reQTokExt.exec(path)) {
        var id = m && m[2];
        if (!rootListId) {
            rootListId = id;
        } else {
            itemIds.push(id);
        }
    }
    if (!rootListId) {
        var list = new TodoList();
        var item = new TodoItem();
        list.addObject(item);
        this.forward(list._id, [item._id]);
    } else {
        this.forward(rootListId, itemIds);
    }
};

TodoApp.prototype.installListeners = function () {
    var self = this;
    document.addEventListener('keydown', function (ev) {
        if (self.loading) return;

        switch (ev.keyCode) {
            case 9:  self.forward();break; // tab
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

TodoApp.prototype.buildLocationPath = function () {
    var res = [];
    for (var i = 0, l = this.path.length; i < l; i++) {
        var state = this.path[i];
        if (i === 0) {
            res.push('/' + state.listId);
        }
        res.push('/' + state.itemId);
    }
    return res.join('');
};

TodoApp.prototype.refresh = function () {
    // rerender DOM
    React.renderComponent(
        TodoAppView ({
            key: 'root',
            app: this,
            UIState: this.path
        }),
        document.getElementById('todoapp')
    );
    // recover focus
    var item = this.getItem();
    var edit = document.getElementById(item._id);
    if (edit) {
        edit.focus();
        // TODO scroll into view
    }
    // set URI
    var locationPath = this.buildLocationPath();
    window.history.replaceState({},"",window.location.origin + locationPath);
};

// Suddenly jump to some entry in some list.
// Invoked by onClick and onHashChange
TodoApp.prototype.go = function (listId, itemId) {
    if (this.loading) return;

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

TodoApp.prototype.forward = function (listId, itemIds) {
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
    var oldPath = window.location.pathname + window.location.hash;
    this.loading = true;
    // we may need to fetch the data from the server so we use a callback, yes
    fwdList.onObjectStateReady(function () {
        if (window.location.pathname + window.location.hash != oldPath) {
            console.log('route changed');
            self.path = [];
            self.parseUri();
            return; // the user has likely navigated away while the data was loading
        }
        if (!fwdList.length()) {
            fwdList.addObject(new TodoItem({text:'just do it'}));
        }
        if (!itemIds) {
            itemIds = [fwdList.objectAt(0)._id];
        } else if ('string' === typeof itemIds) {
            itemIds = [itemIds];
        }

        var itemId = itemIds.shift();
        self.path.push({
            listId: listId,
            itemId: itemId
        });
        if (itemIds.length) {
            item = fwdList.getObject(itemId);
            self.forward(item.childList, itemIds);
            return;
        }
        self.loading = false;
        self.refresh();
        // TODO max delay
    });
};

TodoApp.prototype.selectItem = function (itemId) {
    if (this.loading) return;

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
    if (this.loading) return;

    var list = this.getList();
    var item = this.getItem();
    var i = list.indexOf(item);
    if (i>0) {
        this.selectItem(i-1);
    }
};

TodoApp.prototype.down = function () {
    if (this.loading) return;

    var list = this.getList();
    var item = this.getItem();
    var i = list.indexOf(item);
    if (i+1<list.length()) {
        this.selectItem(i+1);
    }
};

TodoApp.prototype.toggle = function () {
    if (this.loading) return;

    var item = this.getItem();
    if (item) {
        item.set({completed:!item.completed});
    }
};

TodoApp.prototype.create = function () {
    if (this.loading) return;

    var item = this.getItem();
    var list = this.getList();
    if (list && item) {
        var newItem = new TodoItem({text:''});
        list.insertAfter(newItem, item);
        this.selectItem(newItem);
    }
};

TodoApp.prototype.delete = function (listId, itemId) {
    if (this.loading) return;

    var list = this.getList(listId);
    var item = this.getItem(itemId);
    var pos = list.indexOf(item);
    if (list && item && pos!==-1) {
        list.remove(item);
        this.selectItem(pos);
    }
};

module.exports = window.TodoApp = TodoApp;
