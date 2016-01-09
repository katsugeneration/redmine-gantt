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
		console.log.apply(this, arguments);
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

	findFile("./test/store", "/*\.js$/").forEach(function(item){
		console.log(item);
		mo.addFile(item);
	});

	mo.ui('bdd').run(function(failures) {
		rendererFinished.on('exit', function(){
			process.exit(rendererFailures + failures);
		});
	});
});

function findFile(dir, matchStr)
{
	var ret = [];

	var files = fs.readdirSync(dir);

	files.some(function(file){
		var file = dir + "/" + file;
		if(fs.statSync(file).isDirectory())
		{
			ret = ret.concat(findFile(file, matchStr));
		}
		else if(fs.statSync(file).isFile())
		{
			if (file.match(matchStr));
			ret.push(file);
		}
	});

	return ret;
}
