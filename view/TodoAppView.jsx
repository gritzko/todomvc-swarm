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

var Header = require('./Header');
var MainSection = require('./MainSection');
var Footer = require('./Footer');


var TodoAppView = React.createClass({

    mixins: [Swarm.ReactMixin],

    render: function() {
        return (
            <div>
                <Header spec={this.props.spec}/>
                <MainSection
                    spec={this.props.spec}
                    setFocus={this.setFocus}
                    focused={this.props.focused}
                    />
                <Footer spec={this.props.spec} />
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

module.exports = TodoAppView;
