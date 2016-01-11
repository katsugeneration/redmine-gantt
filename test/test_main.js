const app = require('app');
const BrowserWindow = require('browser-window');
const ipc = require('electron').ipcMain;
const EventEmitter = require('events');
const fs = require('fs');

const mocha = require('mocha');
const Coverager = require('./test_coverager.js');
const Helper = require('./test_helper.js');

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

	Helper.findFile('./test/store', new RegExp('.*\.js$')).forEach(function(item){
		mo.addFile(item);
	});

	mo.ui('bdd').run(function(failures) {
		coverager.writeCoverage();
		rendererFinished.on('exit', function(){
			Coverager.totalCoverage(process.cwd() + '/coverage', process.cwd() + '/coverage');
			process.exit(rendererFailures + failures);
		});
	});
});

function isCheckSrcFile(filename)
{
	return (filename.indexOf(process.cwd() + '/dist') != -1);
}
