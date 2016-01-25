const app = require('app');
const BrowserWindow = require('browser-window');
const ipc = require('electron').ipcMain;
const EventEmitter = require('events');
const fs = require('fs');

const Mocha = require('mocha');
const Coverager = require('./test_coverager.js');
const Helper = require('./test_helper.js');

app.on('ready', function() {
	var rendererFinished = new EventEmitter();
	var rendererFailures = 0;
	var mocha = new Mocha();

	var window = new BrowserWindow({width: 800, height: 600});
	window.loadURL('file://' +  __dirname +  '/index.html');
	window.webContents.openDevTools();
	window.on('closed', function(){
		process.exit(0);
	});

	// call when end of renderer test
	ipc.on('renderer-test-result', function(event, exit_status){
		rendererFailures = exit_status;
		rendererFinished.emit('exit');
	});

	// output renderer test log
	ipc.on('log', function(event, arguments){
		console.log.apply(this, arguments);
	});

	// setting file return for action module
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

	// setup coverage instrument
	var coverager = new Coverager();
	coverager.initCoverage(process.cwd() + '/coverage/main', isCheckSrcFile);

	// list up main process test file
	Helper.findFile('./test/main', new RegExp('.*\.js$')).forEach(function(item){
		mocha.addFile(item);
	});

	mocha.checkLeaks();
	mocha.ui('bdd').run(function(failures) {
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
