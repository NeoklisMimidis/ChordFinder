'use strict';

import {
  initWavesurfer,
  loadAudioFile,
  audioPlayerEvents,
  toggleAudioInOutControls,
  resetAudioPlayer,
} from './audio-player.js';
import { loadJAMS } from './render-annotations.js';
import { editModeEvents } from './edit-mode.js';
import {
  fileSelectHandlers,
  dragDropHandlers,
} from './components/utilities.js';

// // Disable PARCEL Hot Module Reloading bcs it is buggy with Wavesurfer
if (module.hot) {
  module.hot.dispose(() => {
    window.location.reload();
  });
}

// - MAIN APPLICATION

// // Init Wavesurfer (create wavesurfer instance) // //
export let wavesurfer = initWavesurfer();

// Init Sidebar (toggle) AUDIO I/O functionality
toggleAudioInOutControls();

// Handlers about selection or dragging the appropriate files for app initialization
dragDropHandlers('#waveform', loadAudioFile, 'drag-over');
fileSelectHandlers('#import-audio-btn', loadAudioFile);
fileSelectHandlers('#analyze-chords-btn', loadJAMS, '.jams');

// catching wavesurfer errors
wavesurfer.on('error', function (error) {
  console.warn('Wavesurfer ☠️:', error);
});

let cleanState = true;
// Only execute the following on first load!
wavesurfer.on('ready', function () {
  resetAudioPlayer();
  if (cleanState === true) {
    try {
      // Attach the required events for the application
      editModeEvents(wavesurfer);
      audioPlayerEvents(wavesurfer);
      cleanState = false;

      console.log('Events Ready! 👍');
    } catch (error) {
      console.error('Error in wavesurfer ready callback!');
    }

    console.log('Waveform ready! 👍');
  }
});

// - Start application with Testing files loaded to avoid each time importing them by selecting them
// Local files (Parcel 2 loading local files requires url: in front)
// import audioFileURL from 'url:../../demo_files/01_-_I_Saw_Her_Standing_There.wav';
// import annotationFile from 'url:../../demo_files/01_-_I_Saw_Her_Standing_There.jams';

import audioFileURL from 'url:../../demo_files/test.mp3';
import annotationFile from 'url:../../demo_files/test.jams';

// loadAudioFile(audioFileURL);
// loadJAMS(annotationFile);
