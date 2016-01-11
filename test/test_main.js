var app = require('app');
var BrowserWindow = require('browser-window');
var ipc = require('electron').ipcMain;
var EventEmitter = require('events');
var fs = require('fs');

var mocha = require('mocha');
var Coverager = require('./test_coverager.js');

app.on('ready', function() {
	var rendererFinished = new EventEmitter();
	var rendererFailures = 0;
	var mo = new mocha();
	var window = new BrowserWindow({width: 800, height: 600});
	window.loadURL('file://' +  __dirname +  '/index.html');
	window.webContents.openDevTools();
	window.on('closed', function(){
		process.exit(0);
	});

	ipc.on('renderer-test-result', function(event, exit_status){
		rendererFailures = exit_status;
		rendererFinished.emit('exit');
	});

	ipc.on('log', function(event, arguments){
		console.log.apply(this, arguments);
	});

	ipc.on('settings', function(event){
		var ret = '';
		try
		{
			ret = fs.readFileSync('./test/test_settings.json', 'utf8');
		}
		catch (e)
		{
			console.log(e.message);
			ret = '';
		}

		event.returnValue = ret;
	});

	var coverager = new Coverager();
	coverager.initCoverage(process.cwd() + '/coverage/store', isCheckSrcFile);

	findFile('./test/store', new RegExp('.*\.js$')).forEach(function(item){
		mo.addFile(item);
	});

	mo.ui('bdd').run(function(failures) {
		rendererFinished.on('exit', function(){
			coverager.writeCoverage();
			process.exit(rendererFailures + failures);
		});
	});
});

function isCheckSrcFile(filename)
{
	return (filename.indexOf(process.cwd() + '/dist') != -1);
}

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
