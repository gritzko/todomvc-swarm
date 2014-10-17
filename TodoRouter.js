"use strict";

var TodoList = require('./model/TodoList');
var TodoItem = require('./model/TodoItem');
var Swarm = require('swarm');
var Spec = Swarm.Spec;

function TodoRouter() {
    this.itemIds = null;
}

TodoRouter.prototype.buildRoute = function (path) {
    if (path.length === 0) {
        return '/';
    }
    return '/' + path[0].listId +
            '/' + path.map(function (el) {return el.itemId;}).join('/');
};

TodoRouter.prototype.addPathItem = function (listId, itemIds, path, cb) {
    // normalize 2nd argument
    if (!itemIds) {
        itemIds = [];
    } else if (itemIds.constructor===String) {
        itemIds = [itemIds];
    } else if (itemIds.constructor!==Array) {
        throw new Error('incorrect argument');
    }

    var self = this;
    self.itemIds = itemIds;

    var list = Swarm.env.localhost.get('/TodoList#' + listId);
    list.onObjectStateReady(function () {
        if (self.itemIds != itemIds) {
            // prevent parallel loading of several routes
            return;
        }
        var item;
        if (!list.length()) {
            item = new TodoItem();
            list.addObject(item);
            itemIds.length = 0;
        } else if (itemIds.length === 0) {
            item = list.objectAt(0);
        } else {
            item = list.getObject(itemIds.shift());
        }

        if (item) {
            // item found
            path.push({
                listId: listId,
                itemId: item._id
            });
            if (item.childList && itemIds.length) {
                self.addPathItem(item.childList, itemIds, path, cb);
                return;
            }
        }
        self.itemIds = null;
        cb(path);
    });
};

TodoRouter.prototype.load = function (route, cb) {
    var rootListId = null;
    var itemIds = [];
    var m;
    Spec.reQTokExt.lastIndex = 0;
    while (m = Spec.reQTokExt.exec(route)) {
        var id = m && m[2];
        if (!rootListId) {
            rootListId = id;
        } else {
            itemIds.push(id);
        }
    }
    if (!rootListId) {
        // create new list
        var list = new TodoList();
        rootListId = list._id;
        // and create new item in it
        var item = new TodoItem();
        list.addObject(item);
        itemIds.push(item._id);
    }
    this.addPathItem(rootListId, itemIds, [], cb);
};

module.exports = TodoRouter;
