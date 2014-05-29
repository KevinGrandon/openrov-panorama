(function (exports) {

  var fs = require('fs');
  var path = require('path');

  function Panorama(name, deps) {
	if (!(this instanceof Panorama)) {
		return new Panorama(name, deps);
	}

	// Whether or not we are currently capturing a panorama
	this.isCapturing = false;

	this.listen(deps);
	deps.globalEventLoop.on('photo-added', function (filename) {
		deps.io.sockets.emit('photo-added', filename);
		console.log('sending photo to web client');
	});
  };

  Panorama.prototype = {

	listen: function(deps) {
		deps.io.sockets.on('connection', function (socket) {
			console.log('Panorama:connection');
			socket.on('panoramastart', this.start.bind(this, deps));
			socket.on('panoramastop', this.stop.bind(this, deps));
		}.bind(this));
	},

	start: function(deps) {
		console.log('Panorama:start');
		this.isCapturing = true;

		function takePicture() {
			deps.rov.camera.snapshot(function (filename) {
				console.log('Photo taken: ' + filename);
				deps.io.sockets.emit('photo-added', '/photos/' + path.basename(filename));
			});

			this.captureTimeout = setTimeout(takePicture.bind(this), 1000);
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
		// Call this after generating to let the UI know that we are ready.
		dep.io.sockets.emit('photo-stitched', 'some filename');
	}
	};

	exports.exports = Panorama;

}(module));
