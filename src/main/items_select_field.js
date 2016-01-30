'use strict';

const React = require('react');

const SelectField = require('material-ui').SelectField;
const MenuItem = require('material-ui').MenuItem;

module.exports = React.createClass({
	propTypes : {
		items : React.PropTypes.instanceOf(Map).isRequired,
		selectedValue : React.PropTypes.any.isRequired,
		onValueChanged : React.PropTypes.func.isRequired
	},
	getDefaulProps : function()
	{
		return {
			items : new Map(),
			selectedValue : -1,
			onValueChanged : function(){}
		};
	},
	render : function(){
		var menuItems = [];
		menuItems.push( <MenuItem key={-1} value={-1} primaryText={'None'} />  );

		this.props.items.forEach(function(value, key){
			menuItems.push( <MenuItem key={key} value={key} primaryText={value.name} /> );
		});

		return (
			<SelectField value={this.props.selectedValue} onChange={this.props.onValueChanged} style={{width :200, paddingRight:10}}>
				{menuItems}
			</SelectField>
		);
	}
});
