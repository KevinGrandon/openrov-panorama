(function (exports, $, undefined) {

	function Panorama(cockpit) {

		// Store a reference to the cockpit object
		this.cockpit = cockpit;

		// Whether or not we are currently capturing a panorama
		this.isCapturing = false;

		$('#buttonPanel').append('<button id="panorama-start" class="btn">Start Panorama</button>');
		$('#buttonPanel').append('<button id="panorama-stop" class="btn">Capture Panorama</button>');

		this.startButton = $('#panorama-start');
		this.stopButton = $('#panorama-stop').toggle();

		// Element Listeners
		this.startButton.click(this.handleStartButton.bind(this));
		this.stopButton.click(this.handleStopButton.bind(this));

		// Socket Listeners
		this.cockpit.socket.on('photo-added', this.handlePhotoAdded.bind(this));
		this.cockpit.socket.on('photo-stitched', this.handlePhotoStitched.bind(this));
	}

	Panorama.prototype = {

		files: [],

		toggleButtons: function() {
			this.startButton.toggle();
			this.stopButton.toggle();
		},

		handleStartButton: function() {
			this.isCapturing = true;
			console.log('send panorama start request to server');
			this.toggleButtons();

			function takePicture() {
				this.cockpit.socket.emit('panoramasnapshot');
				this.takePictureTimeout = setTimeout(takePicture.bind(this), 5000);
			}

			takePicture.call(this);
		},

		handleStopButton: function() {
			this.isCapturing = false;
			clearTimeout(this.takePictureTimeout);
			this.cockpit.socket.emit('panoramacapture');
			console.log('send panorama capture request to server');
			this.toggleButtons();

			var url = 'http://localhost:8080/?files=' + this.files.join('&files=')
			var xhr = new XMLHttpRequest();
			xhr.onload = function(o) {
				console.log('GOT LOAD', o.responseText);
			};

			xhr.open('GET', url, true);
			xhr.send();

			this.files = [];
		},

		handlePhotoAdded: function(filename) {
			console.log('received photo-added message ', filename);
			this.files.push(filename);
		},

		handlePhotoStitched: function(filename) {
			console.log('received photo-stitched message', filename);
		}
	};

	window.Cockpit.plugins.push(Panorama);

}(window, jQuery));
