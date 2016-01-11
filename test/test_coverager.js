'use strict';

const Module = require('module');
const fs = require('fs');
const istanbul = require('istanbul');

function Coverager()
{
	this.instrumenter = new istanbul.Instrumenter();
	this.reporter = new istanbul.Reporter();
	this.collector = new istanbul.Collector();
}

Coverager.prototype.initCoverage = function (outputdir, fileCheckFn)
{
	// data initialize
	global['__coverage__'] = {};

	// reporter setting
	this.reporter.dir = outputdir;
	this.reporter.addAll(['json', 'text']);

	// override native node func when load module.
	var _this = this;
	Module._extensions['.js'] = function (module, filename) {
		var code = fs.readFileSync(filename, 'utf8');
		if(fileCheckFn(filename))
		{
			// override to coverage code
			code = _this.instrumenter.instrumentSync(code, filename);
		}
		module._compile(code, filename);
	};
};

Coverager.prototype.writeCoverage = function()
{
	// write coverage data
	this.collector.add(global['__coverage__']);
	this.reporter.write(this.collector, true, function(){});
};

module.exports = Coverager;
