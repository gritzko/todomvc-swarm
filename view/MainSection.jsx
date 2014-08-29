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
var TodoItem = require('./TodoItem');

var MainSection = React.createClass({

    mixins: [Swarm.ReactMixin],


    statics: {
        modelType: "TodoList" //function () { return TodoList; }
    },


    render: function() {

        var stats = this.sync.stats();

        // This section should be hidden by default
        // and shown when there are todos.
        if (stats.entries < 1) {
            return <noscript/>;
        }

        var objects = this.sync.objects;
        var todos = [];
        for(var spec in objects) {
            console.log('pushing',spec);
            todos.push( <TodoItem spec={spec}/> );
        }

        
        return (
            <section id="main">
                <input
                    id="toggle-all"
                    type="checkbox"
                    onChange={this._onToggleCompleteAll}
                    checked={this.props.areAllComplete ? 'checked' : ''}>
                </input>
                <label htmlFor="toggle-all">Mark all as complete</label>

                <ul id="todo-list">
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
