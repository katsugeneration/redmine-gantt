
'use strict';

const async = require('async');
const dispatcher = require('flux').Dispatcher;
var _parent = new dispatcher();

var _queue = async.queue( function (payload, callback) {
	_parent.dispatch(payload);
	callback();
}, 1);

class MainDispatcher extends dispatcher {}

MainDispatcher.prototype.dispatch = function(payload)
{
	_queue.push(payload);
};

MainDispatcher.prototype.register = function(payload)
{
	_parent.register(payload);
};

module.exports = new MainDispatcher();
