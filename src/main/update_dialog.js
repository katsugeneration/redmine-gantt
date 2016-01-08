'use strict';

const React = require('react');
const Modal = require('react-modal');


var UpdateDialog = React.createClass({
	propTypes : {
		isOpen : React.PropTypes.bool.isRequired
	},
	getDefaulProps : function()
	{
		return {
			isOpen : true
		}
	},
	getInitialState : function()
	{
		return {
			opacity : 1,
			isIncreased : false,
		};
	},
	componentDidMount : function()
	{
		this._startAnimation();
	},
	render : function()
	{
		var style =
		{
			"content" : {
				"height" : 20,
			}
		}
		return (
			<Modal isOpen={this.props.isOpen} style={style}>
          		<span key="updating" style={{"opacity" : this.state.opacity	}}>Updateing...</span>
			</Modal>
		);
	},
	_startAnimation : function()
	{
		var opacity = this.state.opacity;
		var isIncreased = this.state.isIncreased;

		var nextOpacity = (isIncreased) ? opacity + 0.1 : opacity - 0.1;
		if (nextOpacity <= 0) isIncreased = true;
		else if(nextOpacity >= 1) isIncreased = false;

		setTimeout(function(self){
			self.setState({opacity : nextOpacity, isIncreased : isIncreased});
			self._startAnimation();
		}, 100, this);
	}
});

module.exports = UpdateDialog;
