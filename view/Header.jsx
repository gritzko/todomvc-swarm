/**
 * Copyright 2013-2014 Facebook, Inc.
 * Copyright 2014 Victor Grishchenko
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

var Header = React.createClass({

    render: function() {
        // TODO list header (apart from the id)
        return (
            <header id="header">
            <h1>todos</h1>
            </header>
        );
    },

    /**
    * Event handler called within TodoTextInput.
    * Defining this here allows TodoTextInput to be used in multiple places
    * in different ways.
    * @param {string} text
    */
    _onSave: function(text) {
    }

});

module.exports = Header;
