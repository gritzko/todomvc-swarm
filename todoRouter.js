"use strict";

var TodoList = require('./model/TodoList');
var TodoItem = require('./model/TodoItem');
var Swarm = require('swarm');
var Spec = Swarm.Spec;

var util = {

    buildRoute: function (path) {
        if (path.length === 0) {
            return '/';
        }
        return '/' + path[0].listId +
                '/' + path.map(function (el) {return el.itemId;}).join('/');
    },

    addPathItem: function (listId, itemIds, path, cb) {

        // normalize 2nd argument
        if (!itemIds) {
            itemIds = [];
        } else if (itemIds.constructor===String) {
            itemIds = [itemIds];
        } else if (itemIds.constructor!==Array) {
            throw new Error('incorrect argument');
        }

        var list = Swarm.env.localhost.get('/TodoList#' + listId);
        list.onObjectStateReady(function () {
            var item;
            if (!list.length()) {
                item = new TodoItem();
                list.addObject(item);
                itemIds = [];
            } else if (itemIds.length === 0) {
                item = list.objectAt(0);
                itemIds = [];
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
                    util.addPathItem(item.childList, itemIds, path, cb);
                    return;
                }
            }
            cb(path);
        });
    },

    load: function (route, cb) {
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
            var list = new TodoList();
            var item = new TodoItem();
            list.addObject(item);
            util.addPathItem(list._id, [item._id], [], cb);
        } else {
            util.addPathItem(rootListId, itemIds, [], cb);
        }
    }
};

module.exports = util;
