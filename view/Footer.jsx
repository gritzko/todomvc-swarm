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
var ReactPropTypes = React.PropTypes;

var Footer = React.createClass({

    // TODO stats events
    mixins: [ Swarm.ReactMixin ], 

    componentDidMount: function () {
        var self = this;
        this.sync.onObjects(function(){
            self.forceUpdate();
        });
    },

    /**
    * @return {object}
    */
    render: function() {

        var list = this.sync;
        var stats = list.stats();


        if (stats.entries === 0) {
            return <noscript />;
        }

        var itemsLeftPhrase = stats.left === 1 ? ' item ' : ' items ';
        itemsLeftPhrase += 'left';

        // Undefined and thus not rendered if no completed items are left.
        var clearCompletedButton;
        if (stats.left===0) {
            clearCompletedButton =
                <button
                    id="clear-completed"
                    onClick={this._onClearCompletedClick}>
                    Clear completed ({stats.completed})
                </button>;
        }

        return (
            <footer id="footer">
                <span id="todo-count">
                    <strong>
                        {stats.left}
                    </strong>
                    {itemsLeftPhrase}
                </span>
                {clearCompletedButton}
            </footer>
        );
    },

    /**
    * Event handler to delete all completed TODOs
    */
    _onClearCompletedClick: function() {
        this.sync.destroyCompleted();
    }

});

module.exports = Footer;
