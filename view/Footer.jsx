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
var TodoItem = require('../model/TodoItem');

var Footer = React.createClass({

    getDefaultProps: function () {
        return {
            listenEntries: true
        };
    },

    mixins: [Swarm.ReactMixin],

    /**
    * @return {object}
    */
    render: function() {
        var todoList = this.sync;
        var stats = todoList.stats();

        if (stats.entries === 0) {
            return <noscript />;
        }

        var itemsLeftPhrase = stats.left === 1 ? ' item ' : ' items ';
        itemsLeftPhrase += 'left';

        // Undefined and thus not rendered if no completed items are left.
        var clearCompletedButton;
        if (stats.completed > 0) {
            // some todoitems marked as completed
            // show "clear completed" button
            clearCompletedButton = (
                <button
                    className="clear-completed"
                    onClick={this._onClearCompletedClick}
                >
                    Clear completed ({stats.completed})
                </button>
            );
        }
        // TODO: show the entry's metadata

        return (
            <footer className="footer">
                <span cl="todo-count">
                    <strong>{stats.left}</strong> {itemsLeftPhrase}
                </span>
                {clearCompletedButton}
            </footer>
        );
    },

    /**
    * Event handler to delete all completed TODOs
    */
    _onClearCompletedClick: function() {
        var todoList = this.sync;
        todoList.removeCompleted();
        if (todoList.length() === 0) {
            todoList.addObject(new TodoItem()); // TODO create default
        }
    }

});

module.exports = Footer;
