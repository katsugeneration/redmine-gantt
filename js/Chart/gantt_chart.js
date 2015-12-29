(function(exports){
	'use strict';

	const React = require('react');
	const reactDOM = require('react-dom');
	const d3 = require('d3');

	exports.GanttChart = React.createClass({
		propTypes : {
			data : React.PropTypes.arrayOf(React.PropTypes.instanceOf(GanttData)).isRequired,
			style : React.PropTypes.object
		},
		getDefaulProps : function()
		{
			return {
				data : [],
				style : {}
			};
		},
		componentWillReciveProps : function(nextPorps)
		{
			console.log('recieve props');
		},
		shouldComponentUpdate : function(nextProps, nextState)
		{
			var data = nextProps.data.map(function(item, index){ return item.length; });

			var width = 420,
				barHeight = 24;

			var x = d3.scale.linear()
				.domain([0, d3.max(data)])
				.range([0, width]);

			var chart = d3.select(reactDOM.findDOMNode(this)).select("svg")
				.attr("width", width)
				.attr("height", barHeight * data.length);

			var bar = chart.selectAll("g")
				.data(data)
				.enter().append("g")
				.attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

			bar.append("rect")
				.attr("width", x)
				.attr("height", barHeight - 1);

			bar.append("text")
				.attr("x", function(d) { return x(d) - 3; })
				.attr("y", barHeight / 2)
				.attr("dy", ".35em")
				.text(function(d) { return d; });

			return true;
		},
		componentDidMount : function()
		{
			var data = this.props.data.map(function(item, index){ return item.length; });

			var width = 420,
				barHeight = 20;

			var x = d3.scale.linear()
				.domain([0, d3.max(data)])
				.range([0, width]);

			var chart = d3.select(reactDOM.findDOMNode(this)).select("svg")
				.attr("width", width)
				.attr("height", barHeight * data.length);

			var bar = chart.selectAll("g")
				.data(data)
				.enter().append("g")
				.attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

			bar.append("rect")
				.attr("width", x)
				.attr("height", barHeight - 1);

			bar.append("text")
				.attr("x", function(d) { return x(d) - 3; })
				.attr("y", barHeight / 2)
				.attr("dy", ".35em")
				.text(function(d) { return d; });
		},
		render : function()
		{
			return(
				<div style={this.props.style}><svg></svg></div>
			);
		}
	});

	function GanttData()
	{
		this.length = 0;
	};

	exports.GanttData = GanttData;
})(this);
