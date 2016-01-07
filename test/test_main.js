var app = require('app');
var BrowserWindow = require('browser-window');
var ipc = require('electron').ipcMain;
var EventEmitter = require('events');
var fs = require('fs');

var mocha = require('mocha');

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
		console.log(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
	});

	ipc.on('settings', function(event ,arg){
		try
		{
			ret = fs.readFileSync('./test/test_settings.json', 'utf8');
		}
		catch (e)
		{
			console.log(e.message);
			ret = "";
		}

		event.returnValue = ret;
	});

	mo.addFile("./test/store_test.js");

    mo.ui('bdd').run(function(failures) {
        rendererFinished.on('exit', function(){
			process.exit(rendererFailures + failures);
		});
    });
});
