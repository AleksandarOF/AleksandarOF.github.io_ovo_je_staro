function getVideoStream(type) {
  if (!navigator.mediaDevices && !navigator.getUserMedia && !navigator.webkitGetUserMedia &&
    !navigator.mozGetUserMedia && !navigator.msGetUserMedia) {
    alert('User Media API not supported.');
    return;
  }

  var constraints = {};
  constraints[type] = true;

  getUserMedia(constraints)
    .then(function (stream) {
      var mediaControl = document.querySelector(type);

      if ('srcObject' in mediaControl) {
        mediaControl.srcObject = stream;
      } else if (navigator.mozGetUserMedia) {
        mediaControl.mozSrcObject = stream;
      } else {
        mediaControl.src = (window.URL || window.webkitURL).createObjectURL(stream);
      }

      mediaControl.play();
    })
    .catch(function (err) {
      alert('Error: ' + err);
    });
}

function getUserMedia(options, successCallback, failureCallback) {
  var api = navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia;
  if (api) {
    return api.bind(navigator)(options, successCallback, failureCallback);
  }
}

var theStream;
var theRecorder;
var recordedChunks = [];

function startRecording() {
  if (!navigator.getUserMedia && !navigator.webkitGetUserMedia &&
    !navigator.mozGetUserMedia && !navigator.msGetUserMedia) {
    alert('User Media API not supported.');
    return;
  }

  var constraints = {
    video: true
  };

  getUserMedia(constraints, function (stream) {
    var mediaControl = document.querySelector('video');

    if ('srcObject' in mediaControl) {
      mediaControl.srcObject = stream;
    } else if (navigator.mozGetUserMedia) {
      mediaControl.mozSrcObject = stream;
    } else {
      mediaControl.src = (window.URL || window.webkitURL).createObjectURL(stream);
    }

    theStream = stream;
    try {
      recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    } catch (e) {
      console.error('Exception while creating MediaRecorder: ' + e);
      return;
    }
    theRecorder = recorder;
    console.log('MediaRecorder created');
    recorder.ondataavailable = recorderOnDataAvailable;
    recorder.start(100);
  }, function (err) {
    alert('Error: ' + err);
  });
}

function recorderOnDataAvailable(event) {
  if (event.data.size == 0) return;
  recordedChunks.push(event.data);
}

function download() {
  console.log('Saving data');
  theRecorder.stop();
  theStream.getTracks()[0].stop();

  var blob = new Blob(recordedChunks, { type: "video/webm" });
  var url = (window.URL || window.webkitURL).createObjectURL(blob);
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = url;
  a.download = 'test.webm';
  a.click();

  // setTimeout() here is needed for Firefox.
  setTimeout(function () {
    (window.URL || window.webkitURL).revokeObjectURL(url);
  }, 100);
}

// Restlicher Code bleibt unverändert

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/serviceWorker.js').then(function (registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function (err) {
      // registration failed 😦
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
