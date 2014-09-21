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

    statics: {
        modelType: "TodoItem"
    },

    restoreFocus: function () {
        var focused = (this.props.focused||'').toString();
        if (focused && focused==this.sync.spec()) {
            this.refs.text.getDOMNode().focus();
        }
    },

    componentDidUpdate: function () {
        this.restoreFocus();
    },
    componentDidMount: function () {
        this.restoreFocus();
    },

    render: function() {

        var todo = this.sync;
        var uistate = this.props.UIState;

        var bookmark = <noscript/>;
        if (todo.childList) {
            bookmark = <span className="bookmark">&#8594;</span>;
        }


        // List items should get the class 'editing' when editing
        // and 'completed' when marked as completed.
        // Note that 'completed' is a classification while 'complete' is a state.
        // This differentiation between classification and state becomes important
        // in the naming of view actions toggleComplete() vs. destroyCompleted().
        return (
            <li
                className={cx({
                    'completed': todo.completed,
                    'selected': this.sync._id===uistate.itemId
                })}
                key={todo.id}>

                <div className="view">
                    <input
                        className="toggle"
                        type="checkbox"
                        checked={todo.completed}
                        onChange={this._onToggle}
                        />
                    <input
                        id={this.sync._id}
                        className="edit"
                        onChange={this._onChange}
                        onClick={this._focus}
                        value={todo.text}
                        ref="text"
                        tabIndex={this.props.tabindex}
                        />
                    <button className="destroy" onClick={this._onDestroyClick} />
                    {bookmark}
                </div>

            </li>
        );
    },

    _onToggle: function () {
        this.sync.toggle();
    },

    _onChange: function(event) {
        var text = event.target.value;
        this.sync.set({text:text});
    },

    _onDestroyClick: function() {
        app.delete(this.props.UIState.listId, this.sync._id);
    }

});

var ENTER_KEY_CODE = 13;

module.exports = TodoItemView;
