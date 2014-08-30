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
var ReactPropTypes = React.PropTypes;

var cx = require('react/lib/cx');

var TodoItemView = React.createClass({

    mixins: [ Swarm.ReactMixin ],

    render: function() {

        var todo = this.sync;

        // List items should get the class 'editing' when editing
        // and 'completed' when marked as completed.
        // Note that 'completed' is a classification while 'complete' is a state.
        // This differentiation between classification and state becomes important
        // in the naming of view actions toggleComplete() vs. destroyCompleted().
        return (
            <li
                className={cx({
                    'completed': todo.complete
                })}
                key={todo.id}>

                <div className="view">
                    <input
                        className="toggle"
                        type="checkbox"
                        checked={todo.completed}
                        onChange={this._onToggleComplete}
                        />
                    <input
                        className="edit"
                        onChange={this._onChange}
                        onKeyUp={this._onKeyUp}
                        value={todo.text}
                        />
                    <button className="destroy" onClick={this._onDestroyClick} />
                </div>

            </li>
        );
    },

    _onToggleComplete: function() {
        this.sync.complete(this.sync.completed);
    },

    _onChange: function(event) {
        var text = event.target.value;
        this.sync.set({text:text});
    },

    _onDestroyClick: function() {
        var list = Swarm.env.localhost.get(this.props.listSpec);
        list.removeObject(this.sync);
    },

    _onKeyUp: function(event) {
        if (event.keyCode === ENTER_KEY_CODE) {
            var listSpec = this.props.listSpec;
            var list = Swarm.get(listSpec);
            var newItem = new TodoItem({text:'new'});
            list.addObject(newItem);
            // TODO focus()
        }
    }

});

var ENTER_KEY_CODE = 13;

module.exports = TodoItemView;
