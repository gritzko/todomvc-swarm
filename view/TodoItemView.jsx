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
                        onChange={this._onToggleComplete}
                        />
                    <input
                        className="edit"
                        onChange={this._onChange}
                        onKeyDown={this._onKeyDown}
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

    _focus: function () {
        //this.props.setFocus(this.sync.spec());
        //window.history.replaceState
        //    ({},"test",window.location.pathname+'#'+this.sync.spec());
        window.location.hash = this.sync._id;
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
        list.remove(this.sync);
    },

    _onKeyDown: function(event) {
        var uistate = this.props.UIState;
        switch (event.keyCode) {
            case 13: uistate.create();break; // enter
            case 38: uistate.up();    break;
            case 40: uistate.down();  break;
            case 9:  uistate.right(); break; // tab
            default: return true;
        }
        this.refs.text.getDOMNode().blur();
        return false;
    }

});

var ENTER_KEY_CODE = 13;

module.exports = TodoItemView;
