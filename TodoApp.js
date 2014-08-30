/**
 * Copyright 2013-2014 Facebook, Inc.
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

var TodoList = require('./model/TodoList');
var TodoItem = require('./model/TodoItem');

Swarm.env.debug = true;

var TodoAppView       = require('./dist/TodoAppView');

Swarm.env.localhost = new Swarm.Host('test~1');

//var pageSpec = '/TodoList#example';
var entry = new TodoItem();
entry.set({text:'example'});
var list = new TodoList();
list.addObject(entry);


// TODO page ids (router)
// TODO server, backend
// TODO local cache

React.renderComponent(
    TodoAppView ({ spec: list.spec() }),
    document.getElementById('todoapp')
);
