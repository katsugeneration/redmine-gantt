'use strict';

var fs = require('fs');

var Helper = {};

function findFile(dir, matchStr)
{
	var ret = [];

	var files = fs.readdirSync(dir);

	files.some(function(name){
		var file = dir + '/' + name;
		if(fs.statSync(file).isDirectory())
		{
			ret = ret.concat(findFile(file, matchStr));
		}
		else if(fs.statSync(file).isFile())
		{
			if (file.search(matchStr) != -1)
				ret.push(file);
		}
	});

	return ret;
}

Helper.findFile = findFile;

module.exports = Helper;
