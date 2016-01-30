var assert = require('assert');
var sinon = require('sinon');

var SearchField = require('../dist/main/search_field.js').SearchField;
var TextField = require('material-ui').TextField;

var React = require('react');
var ReactTestUtils = require('react-addons-test-utils');

describe('search field test', function(){
	var spy,
		dom,
		textField;

	beforeEach(function(){
		spy = sinon.spy();
		dom = ReactTestUtils.renderIntoDocument(React.createElement(SearchField, {search : spy}));
		textField = ReactTestUtils.findRenderedComponentWithType(dom, TextField);
	});

	it('change text', function(){
		textField.props.onChange({target : {value : 'test'}});
		assert.equal(dom.state.textValue, 'test');
	});

	it('press enter key', function(){
		textField.props.onKeyPress({which : 13});
		assert(spy.called);
	});

	it('press no enter key', function(){
		textField.props.onKeyPress({which : 3});
		assert(!spy.called);
	});
});
