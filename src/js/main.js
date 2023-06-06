'use strict';

import {
  initWavesurfer,
  loadAudioFile,
  audioPlayerEvents,
  toggleAudioInOutControls,
  resetAudioPlayer,
} from './audio-player.js';
import { loadJAMS } from './render-annotations.js';
import {
  fileSelectHandlers,
  dragDropHandlers,
} from './components/utilities.js';
import { variableToEstablishConnection } from './demo_files.js';

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
  // resetAudioPlayer();
  if (cleanState === true) {
    try {
      // Attach the required events for the application ONCE
      audioPlayerEvents(wavesurfer);
      cleanState = false;

      console.log('Events Ready! 👍');
    } catch (error) {
      console.error('Error in wavesurfer ready callback!');
    }

    console.log('Waveform ready! 👍');
  }
});
