(function(exports){
	'use strict';

	const https = require('https');
	const React = require('react');
	const reactDOM = require('react-dom');
	const settings = require("../settings.json");

	var List = {
		getData: function()
		{
			var _this = this;
			var req = https.request({
				hostname : settings.host,
				path : _this.state.path,
				auth : settings.name + ":" + settings.password
			}, function(res){
				res.setEncoding('utf8');
				res.on('data', function (data){
					_this.loadData(data);
				});
			});

			req.end();
			req.on('error', function(e) {
				console.error(e);
			});
		}
	};

	exports.List = List;
})(this);
