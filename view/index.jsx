/**
 * @jsx React.DOM
 */

var React = require('react');
var Swarm = require('swarm');
var TodoAppView = require('./TodoAppView.jsx');

var page = React.createClass({

    render: function() {

        return (
            <html>
                <head>
                    <meta charSet="utf-8" />
                    <title>Swarm+React • TodoMVC</title>
                    <link rel="stylesheet" href="/css/base.css" />
                    <link rel="stylesheet" href="/css/add.css" />
                </head>
                <body>
                    <div id='todoapp'>
                        <TodoAppView
                            name="TodoApp"
                            UIState={this.props.UIState}/>
                    </div>
                    <span className='help'>
                        Up/Down: change item,
                        Tab: child list,
                        Esc: parent list,
                        Insert: toggle item,
                        Enter/Numpad plus: new item,
                        Numpad minus: delete item
                    </span>
                    <script src="/js/bundle.js"></script>
                    <script dangerouslySetInnerHTML={{__html: this.props.runAppJS}} />
                </body>
            </html>
        );

    }
});

module.exports = page;
