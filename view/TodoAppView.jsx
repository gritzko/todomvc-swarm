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

/**
 * This component operates as a "Controller-View".  It listens for changes in
 * the TodoStore and passes the new data to its children.
 */

var React = require('react');
var Swarm = require('swarm');
var TodoListView = require('./TodoListView.jsx');


var TodoAppView = React.createClass({

    render: function() {

        var todoLists = [];
        var history = this.props.UIState;
        for(var i=0; i<history.length; i++) {
            var list = history[i];
            todoLists.push(
                <TodoListView
                    key={list.listId}
                    depth={history.length-i-1}
                    app={this.props.app}
                    UIState={list}
                />
            );
        }
        return (
            <div className="todopane">
                {todoLists}
            </div>
        );
    }

});

module.exports = TodoAppView;
