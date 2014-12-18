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

var React = require('react');
var Swarm = require('swarm');
var TodoItemView = require('./TodoItemView.jsx');

var MainSection = React.createClass({

    getDefaultProps: function () {
        return {
            listenEntries: true
        }
    },

    mixins: [Swarm.ReactMixin],

    render: function() {
        var todoList = this.sync;
        var selectedItem = this.props.selectedItem;
        var stats = todoList.stats();

        // This section should be hidden by default
        // and shown when there are todos.
        if (stats.entries < 1) {
            return <noscript/>;
        }

        var todos = todoList.map(function (obj, index) {
            var itemId = obj._id;
            return (
                <TodoItemView
                    key={itemId}
                    listId={todoList._id}
                    selected={selectedItem === itemId}
                    tabIndex={index}
                    app={this.props.app}
                />
            );
        }, this);

        return (
            <section className="main_section">
                <input
                    className="toggle-all"
                    type="checkbox"
                    onChange={this._onToggleCompleteAll}
                    checked={stats.left === 0 ? 'checked' : ''}>
                </input>
                <label htmlFor="toggle-all">Mark all as complete</label>

                <ul>
                    {todos}
                </ul>
            </section>
        );

    },

    /**
    * Event handler to mark all TODOs as complete
    */
    _onToggleCompleteAll: function() {
        this.sync.completeAll();
    }

});

module.exports = MainSection;
