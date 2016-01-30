var assert = require('assert');
var sinon = require('sinon');
var action = require('../dist/main/main_action.js');

var SearchField = require('../dist/main/search_field.js').SearchField;
var TextField = require('material-ui').TextField;

var React = require('react');
var ReactTestUtils = require('react-addons-test-utils');

describe('search field test', function(){
	var dom,
		textField;

	beforeEach(function(){
		dom = ReactTestUtils.renderIntoDocument(React.createElement(SearchField));
		textField = ReactTestUtils.findRenderedComponentWithType(dom, TextField);
	});

	it('change text', function(){
		textField.props.onChange({target : {value : 'test'}});
		assert.equal(dom.state.textValue, 'test');
	});

	it('press enter key', function(){
		var loadProjects = sinon.spy(action, 'loadProjects');

		textField.props.onKeyPress({which : 13});
		assert(loadProjects.called);
		loadProjects.restore();
	});

	it('press no enter key', function(){
		var loadProjects = sinon.spy(action, 'loadProjects');

		textField.props.onKeyPress({which : 3});
		assert(!loadProjects.called);
		loadProjects.restore();
	});
});
