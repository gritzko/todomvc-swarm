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

    getInitialState: function () {
        return {
            scrollInited: false
        };
    },

    componentWillUpdate: function () {
        var node = this.getDOMNode();
        this.shouldScroll = node.scrollLeft + node.offsetWidth === node.scrollWidth;
    },

    componentDidUpdate: function (prevProps, prevState) {
        if (this.shouldScroll || !prevState.scrollInited) {
            var node = this.getDOMNode();
            node.scrollLeft = node.scrollWidth;
        }
    },

    componentDidMount: function () {
        this.setState({scrollInited: true});
    },

    render: function() {

        var lists = this.props.app.path.map(function (pathEntry, index) {
            return (
                <TodoListView
                    key={pathEntry.listId}
                    selectedItem={pathEntry.itemId}
                    depth={index}
                    app={this.props.app}
                />
            );
        }, this);

        return (
            <div className="todopane">
                {lists}
            </div>
        );
    }

});

module.exports = TodoAppView;
