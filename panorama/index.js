(function(exports) {

	var fs = require('fs');
	var path = require('path');
	var panoramit = require('panoramit');

	function Panorama(name, deps) {
		if (!(this instanceof Panorama)) {
			return new Panorama(name, deps);
		}

		// Whether or not we are currently capturing a panorama
		this.isCapturing = false;

		this.listen(deps);
		deps.globalEventLoop.on('photo-added', function(filename) {
			deps.io.sockets.emit('photo-added', filename);
			console.log('sending photo to web client');
		});
	}

	Panorama.prototype = {

		files: [],

		listen: function(deps) {
			deps.io.sockets.on('connection', function(socket) {
				console.log('Panorama:connection');
				socket.on('panoramastart', this.start.bind(this, deps));
				socket.on('panoramastop', this.stop.bind(this, deps));
			}.bind(this));
		},

		start: function(deps) {
			console.log('Panorama:start');
			this.isCapturing = true;

			function takePicture() {
				deps.rov.camera.snapshot(function(filename) {
					console.log('Photo taken: ' + filename);
					this.files.push(filename);
					deps.io.sockets.emit('photo-added', '/photos/' + path.basename(filename));
				}.bind(this));

				this.captureTimeout = setTimeout(takePicture.bind(this), 5000);
			}

			takePicture.call(this);
		},

		stop: function(deps) {
			console.log('Panorama:stop');
			this.isCapturing = false;
			clearTimeout(this.captureTimeout);
			this.generate(deps);
		},

		generate: function(deps) {

			panoramit.generate({
				inputPaths: this.files,
				outputFile: '/var/www/openrov/photos/out.tif',
				tempDir: '/tmp',

				debug: false // optional value in case you want to debug the individual panorama commands
			}, function(err, outputPath) {
				// Call this after generating to let the UI know that we are ready.
				deps.io.sockets.emit('photo-stitched', outputPath);
				this.files = [];
			}.bind(this));

		}
	};

	exports.exports = Panorama;

}(module));