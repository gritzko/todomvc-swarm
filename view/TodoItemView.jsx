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

var cx = require('react/lib/cx');

var TodoItemView = React.createClass({

    mixins: [ Swarm.ReactMixin ],

    statics: {
        modelType: "TodoItem"
    },

    render: function() {

        var todo = this.sync;

        var bookmark = <noscript/>;
        var tab = this.props.app.isTouch
                    ? <span
                        className={todo.childList==="" ? "tab" : "tab child-list"}
                        onTouchEnd={this._onTabTouch}
                        onClick={this._onTabTouch}
                        >⇢</span>
                    : <noscript/>;

        if (todo.childList) {
            bookmark = <span className="bookmark"> </span>; //&#8594;
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
                    'selected': this.props.selected
                })}
                key={todo._id}>

                <div className="view">
                    <input
                        className="toggle"
                        type="checkbox"
                        checked={todo.completed}
                        onChange={this._onToggle}
                        />
                    <input
                        id={todo._id}
                        className="edit"
                        onChange={this._onChange}
                        onClick={this._focus}
                        value={todo.text}
                        ref="text"
                        tabIndex={this.props.tabIndex}
                        />
                    <button
                      className="destroy"
                      onClick={this._onDestroyClick}
                      onTouchEnd={this._onDestroyClick}
                      />
                    {bookmark}
                    {tab}
                </div>

            </li>
        );
    },

    _focus: function () {
        var app = this.props.app;
        app.go(this.props.listId, this.sync._id);
    },

    _onToggle: function () {
        this.sync.toggle();
    },

    _onChange: function(event) {
        var edit = event.target;
        var text = edit.value;
        var pos = edit.selectionStart;
        // save it, send it to everybody
        this.sync.set({text:text});
        // a bit ugly, but React may wreck cursor pos
        this.forceUpdate(function(){
            edit.selectionStart = edit.selectionEnd = pos;
        });
    },

    _onDestroyClick: function() {
        if (this.sync.childList !== ""){
            if (confirm("Sure?")) {
                app.delete(this.props.listId, this.sync._id);
            }
        } else {
            app.delete(this.props.listId, this.sync._id);
        }
    },

    _onTabTouch: function(){
        app.forward();
    }

});

module.exports = TodoItemView;
