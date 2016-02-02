(function(exports){
	'use strict';

	const React = require('react');
	const ExtendsDate = require('../Extends/extend_date.js').ExtendsDate;

	const DEFAULT_BARCHART_COLOR = '#9e9e9e';

	var dragType = 'None';
	var dragPos = 0;
	var dragIndex = -1;

	exports.GanttChart = React.createClass({
		propTypes : {
			height : React.PropTypes.number.isRequired,
			width : React.PropTypes.number.isRequired,
			type : React.PropTypes.oneOf(['Date', 'Week']).isRequired,
			data : React.PropTypes.array.isRequired,
			updateIssueDate : React.PropTypes.func,
			updateEnd : React.PropTypes.func,
			style : React.PropTypes.object
		},
		getDefaulProps : function()
		{
			return {
				height : 0,
				width : 0,
				type : 'Date',
				updateIssueDate : () => {},
				updateEnd : () => {},
				style : {}
			};
		},
		getInitialState: function()
		{
			return {
				startDate : new ExtendsDate(),
				dueDate : new ExtendsDate()
			};
		},
		componentWillReceiveProps : function(nextProps)
		{
			var startDate = new ExtendsDate(8640000000000000); // chart start date
			var dueDate = new ExtendsDate(Number.MIN_VALUE); // chart end date

			nextProps.data.some(function(data){
				// update chart date
				if (data.startDate != 'Invalid Date' && startDate > data.startDate) startDate = data.startDate;
				if (data.dueDate != 'Invalid Date' && dueDate < data.dueDate) dueDate = data.dueDate;
			});

			if (dueDate < startDate) dueDate = new ExtendsDate(undefined);
			this.setState({startDate : startDate, dueDate : dueDate });
		},
		render : function()
		{
			var startDate = new ExtendsDate(this.state.startDate.toString());
			var dueDate = new ExtendsDate(this.state.dueDate.toString());

			if (dueDate == 'Invalid Date') return(<div style={this.props.style}></div>);

			// start Sunday in start date's week
			startDate.addDate(-startDate.getDay());

			// end Saturday in due date's week
			dueDate.addDate((13 - dueDate.getDay()) % 7);

			var chartWidth = (new ExtendsDate(dueDate.getTime() - startDate.getTime()).getTotalDate() + 1) * this.props.width + 5;
			var barcharts = this.props.data.map(function(item, index){
				var length = (item.startDate == 'Invalid Date' || item.dueDate == 'Invalid Date') ? 0 : new ExtendsDate(item.dueDate.getTime() - item.startDate.getTime()).getTotalDate() + 1;
				var start = (item.startDate == 'Invalid Date') ? 0 : new ExtendsDate(item.startDate.getTime() - startDate.getTime()).getTotalDate();
				return ( <BarChart key={item.key} startPos={start * this.props.width} barHeight={(start * length == 0) ? 0 : this.props.height} barWidth={length * this.props.width} onDragStart={this._onDragStart} index={index + 2} color={item.color}/> );
			}, this);

			return(
				<div style={this.props.style}>
				<svg width={chartWidth} height={this.props.height * (this.props.data.length + 2)} onMouseMove={this._onMouseMove} onMouseUp={this._onMouseUp}>
				<CalendarGrid {...this.props} startDate={startDate} dueDate={dueDate} length={this.props.data.length}></CalendarGrid>
				{barcharts}
				</svg>
				</div>
			);
		},
		_onDragStart : function(index, pos, type)
		{
			dragIndex = index;
			dragPos = pos;
			dragType = type;
			document.body.style.cursor = type == 'Left' ? 'w-resize' : 'e-resize';
		},
		_onDragEnd : function()
		{
			var data = this.props.data[dragIndex - 2];
			var issue = data.obj;

			dragIndex = -1;
			dragPos = 0;
			dragType = 'None';
			issue.startDate = data.startDate.toRedmineFormatString();
			issue.dueDate = data.dueDate.toRedmineFormatString();
			document.body.style.cursor = 'default';

			this.props.updateEnd(issue.id, issue, issue.projectId);
		},
		_onMouseMove : function(e)
		{
			if (dragType == 'None') return;

			var diff;
			var item = this.props.data[dragIndex - 2];
			if (dragType == 'Left')
			{
				diff = dragPos - e.clientX;
				if (Math.abs(diff) < this.props.width) return;

				dragPos = e.clientX;
				this.props.updateIssueDate(item.key, Math.floor(-diff / this.props.width), 'start');
			}
			else if (dragType == 'Right')
			{
				diff = e.clientX - dragPos;
				if (Math.abs(diff) < this.props.width) return;

				dragPos = e.clientX;
				this.props.updateIssueDate(item.key, Math.floor(diff / this.props.width), 'due');
			}
		},
		_onMouseUp : function()
		{
			if (dragType == 'None') return;
			this._onDragEnd();
		}
	});

	var MonthBar = React.createClass({
		propTypes : {
			height : React.PropTypes.number.isRequired,
			width : React.PropTypes.number.isRequired,
			startDate : React.PropTypes.instanceOf(ExtendsDate).isRequired,
			dueDate : React.PropTypes.instanceOf(ExtendsDate).isRequired
		},
		getDefaulProps : function()
		{
			return {
				height : 0,
				width : 0,
				startDate : new ExtendsDate(),
				dueDate : new ExtendsDate()
			};
		},
		render : function()
		{
			var monthBlock = [];
			var monthStartDate = this.props.startDate;

			while(this.props.dueDate > monthStartDate)
			{
				var nextMonthStartDate = new ExtendsDate(monthStartDate.toString());
				nextMonthStartDate.setMonth(monthStartDate.getMonth() + 1, 1);
				if (this.props.dueDate <= nextMonthStartDate)
				{
					nextMonthStartDate = new ExtendsDate(this.props.dueDate.toString());
					nextMonthStartDate.setDate(nextMonthStartDate.getDate() + 1);
				}

				var start =	new ExtendsDate(monthStartDate.getTime() - this.props.startDate.getTime()).getTotalDate();
				var interval = new ExtendsDate(nextMonthStartDate.getTime() - monthStartDate.getTime()).getTotalDate();
				monthBlock.push(<rect key={'rect-' + monthStartDate} x={this.props.width * start} width={this.props.width * interval} height={this.props.height} fill='white' stroke='black'></rect>);
				monthBlock.push(<text key={'text-' + monthStartDate} x={this.props.width * (start + interval / 2)} y={this.props.height - 5} textAnchor='middle' fill='black'>{monthStartDate.getMonth() + 1}</text>);
				monthStartDate = nextMonthStartDate;
			}

			return(
				<g>{monthBlock}</g>
			);
		}
	});

	var BarChart = React.createClass({
		propTypes : {
			barHeight : React.PropTypes.number.isRequired,
			barWidth : React.PropTypes.number.isRequired,
			startPos : React.PropTypes.number.isRequired,
			onDragStart : React.PropTypes.func.isRequired,
			color : React.PropTypes.string,
			index : React.PropTypes.number.isRequired
		},
		getInitialState: function(){
			return {
				edgeWidth : 3
			};
		},
		getDefaulProps : function()
		{
			return {
				barHeight : 0,
				barWidth : 0,
				color : DEFAULT_BARCHART_COLOR,
				index : 0
			};
		},
		render :function()
		{
			return(
				<g transform={'translate(0,' + this.props.index * this.props.barHeight + ')'}>
					<rect x={this.props.startPos} width={this.props.barWidth} height={this.props.barHeight} fill={this.props.color}></rect>
					<rect className='Left' x={this.props.startPos} width={this.state.edgeWidth} height={this.props.barHeight} fill={this.props.color} style={{cursor : 'w-resize'}} onMouseDown={this._onMouseDown}/>
					<rect className='Right' x={this.props.startPos + this.props.barWidth - this.state.edgeWidth} width={this.state.edgeWidth} height={this.props.barHeight} fill={this.props.color} style={{cursor : 'e-resize'}} onMouseDown={this._onMouseDown}/>
				</g>
			);
		},
		_onMouseDown : function(e)
		{
			this.props.onDragStart(this.props.index, e.clientX, e.target.className.baseVal);
		}
	});

	var CalendarGrid = React.createClass({
		propTypes : {
			height : React.PropTypes.number.isRequired,
			width : React.PropTypes.number.isRequired,
			startDate : React.PropTypes.instanceOf(ExtendsDate).isRequired,
			dueDate : React.PropTypes.instanceOf(ExtendsDate).isRequired,
			type : React.PropTypes.oneOf(['Date', 'Week']).isRequired,
			length : React.PropTypes.number.isRequired
		},
		getDefaulProps : function()
		{
			return {
				height : 0,
				width : 0,
				startDate : new ExtendsDate(),
				dueDate : new ExtendsDate(),
				type : 'Date',
				length : 0
			};
		},
		render : function()
		{
			var rowList = [];

			for(var i = -1; i <this.props.length; i++)
			{
				rowList.push(<CalendarGridRow {...this.props} key={i} index={i + 2} ></CalendarGridRow>);
			}

			return(
				<g>
				<MonthBar {...this.props}></MonthBar>
				<g>{rowList}</g>
				</g>
			);
		}
	});

	var CalendarGridRow = React.createClass({
		propTypes : {
			height : React.PropTypes.number.isRequired,
			width : React.PropTypes.number.isRequired,
			startDate : React.PropTypes.instanceOf(ExtendsDate).isRequired,
			dueDate : React.PropTypes.instanceOf(ExtendsDate).isRequired,
			type : React.PropTypes.oneOf(['Date', 'Week']).isRequired,
			index : React.PropTypes.number.isRequired
		},
		getDefaulProps : function()
		{
			return {
				height : 0,
				width : 0,
				startDate : new ExtendsDate(),
				dueDate : new ExtendsDate(),
				type : 'Week',
				index : 0
			};
		},
		render : function()
		{
			var interval = 0;
			var width = 0;
			if (this.props.type == 'Date')
			{
				interval = new ExtendsDate(this.props.dueDate.getTime() - this.props.startDate.getTime()).getTotalDate() + 1;
				width = this.props.width;
			}
			else
			{
				interval = new ExtendsDate(this.props.dueDate.getTime() - this.props.startDate.getTime()).getTotalWeek();
				width = this.props.width * 7;
			}

			var dateBlock = [];

			for(var i = 0; i < interval ; i++)
			{
				var date = new ExtendsDate(this.props.startDate.toString());

				if (this.props.type == 'Date')
				{
					date.setTime(this.props.startDate.getTime() + i * 24 * 60 * 60 * 1000);
					dateBlock.push(<rect key={this.props.index + '-' + date} x={width * i} width={width} height={this.props.height} fill='white' stroke='black'></rect>);
					if (this.props.index == 1)
						dateBlock.push(<text key={'text-' + date} x={width * (i + 1/2)} y={this.props.height - 5} textAnchor='middle' fill='black'>{date.getDate()}</text>);
				}
				else
				{
					date.setTime(this.props.startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
					dateBlock.push(<rect key={this.props.index + '-' + date} x={width * i} width={width} height={this.props.height} fill='white' stroke='black'></rect>);
					if (this.props.index == 1)
						dateBlock.push(<text key={'text-' + date} x={width * (i + 1/2)} y={this.props.height - 5} textAnchor='middle' fill='black'>{date.getWeek()}</text>);
				}
			}

			return(
				<g transform={'translate(0,' + this.props.index * this.props.height + ')'}>
					{dateBlock}
				</g>
			);
		}
	});
})(this);
