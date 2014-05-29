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
  }

  Panorama.prototype = {

    toggleButtons: function() {
      this.startButton.toggle();
      this.stopButton.toggle();
    },

    handleStartButton: function() {
      this.isCapturing = true;
      this.cockpit.socket.emit('panoramastart');
      console.log('send panorama start request to server');
      this.toggleButtons();
    },

    handleStopButton: function() {
      this.isCapturing = false;
      this.cockpit.socket.emit('panoramacapture');
      console.log('send panorama capture request to server');
      this.toggleButtons();
    },

    handlePhotoAdded: function (filename) {
      console.log('got new photos', filename);
    }
  };

  window.Cockpit.plugins.push(Panorama);

}(window, jQuery));
