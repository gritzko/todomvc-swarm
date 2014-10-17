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

var Header = require('./Header.jsx');
var MainSection = require('./MainSection.jsx');
var Footer = require('./Footer.jsx');


var TodoListView = React.createClass({

    mixins: [Swarm.ReactMixin],

    statics: {
        modelType: "TodoList"
    },

    render: function() {
        var app = this.props.app;
        var spec = this.sync.spec();
        var classes = "todo-list";
        if (this.props.depth === app.path.length - 1) {
            classes += ' top';
        }
        return (
            <div className={classes}>
                <Header />
                <MainSection
                    spec={spec}
                    selectedItem={this.props.selectedItem}
                    app={app}
                    />
                <Footer spec={spec} listenEntries={true} />
            </div>
        );
    },


    setFocus: function (spec) {
        if (spec && spec._id) {
            spec = spec.spec();
        }
        spec = new Swarm.Spec(spec,'#');
        if (spec.pattern()!=='/#') {
            throw new Error('invalid spec');
        }
        if (document.activeElement) {
            document.activeElement.blur();
        }
        this.setProps({focused:spec.toString()});
    }


});

module.exports = TodoListView;
