var http = require('http');
var fs = require('fs');
var url = require('url');
var panoramit = require('panoramit');
var path = require('path');

http.createServer(function (req, res) {
	
	var urlParts = url.parse(req.url, true);
	var query = urlParts.query;

	res.writeHead(200, {'Content-Type': 'text/plain'});

	var files = query.files;
	if (!files || !files.length) {
		res.end('No files found.\n');
		return;
	}

	if (!Array.isArray(files)) {
		files = [files];
	}
	console.log('Processing: ', files);
	process(files);

	res.end('OK\n');
}).listen(8080, '127.0.0.1');



function process(files) {

	try {
		fs.mkdirSync(__dirname + '/raw_images');
	} catch(e) {}

	function processFile() {
		console.log('Processing files, len: ', files.length);

		if (!files.length) {
			stitch();
			return;
		}

		try {
			var host = 'http://192.168.2.2:8080/photos/';
			var thisFile = host + files.shift();

			var writeToPath = __dirname + '/raw_images/' + thisFile.split('/').pop();

			console.log('Writing to: ', writeToPath)
			var writeTo = fs.createWriteStream(writeToPath);

			writeTo.on('close', function() {
  				console.log('file done');
  				processFile();
			});

			var request = http.get(thisFile, function(response) {
				response.pipe(writeTo);
			});
		} catch(e) {
			console.log('Error when processing:', e);
		}
	}

	function stitch() {
		panoramit.generate({
			inputPaths: path.join(__dirname, 'raw_images', '*.jpg'),
			tempDir: '/tmp',
			outputFile: path.join(__dirname, 'out', 'out_' + Date.now() + '.tif'),

			debug: true
		}, function (err, data) {
		    console.log(arguments);
		    deleteFolderRecursive(__dirname + '/raw_images');
		})
	}

	processFile();
}

var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};


console.log('Server running at http://127.0.0.1:8080/');
