import { wavesurfer } from '../audio-player.js';
import { createToggle } from '../components/utilities.js';
import { editModeState } from './center-toolbar-tools.js';
import click from 'url:../../data/click_metronome.wav';

import { CLICK_TRACK_HIGHLIGHT_COLOR } from '../config.js';

// Left controls
export const toggleSnapOnBeatsBtn = document.getElementById(
  'toggle-SnapOnBeats-btn'
);
export const toggleClickTrackBtn = document.getElementById(
  'toggle-clickTrack-btn'
);

let snapOnBeatsState = false;
let clickTrackState = false;
let currentRegion;
let userInteractedWithWaveform = false;
let isWebAudioInitialized = false;
let clickBuffer; // Store into a variable the fetched click sound for repeated usage
let [audioContext, primaryGainControl] = _initWebAudio();

// -  Snap Beats & Click Track

/**
 *
 * [Snap (beats)]: snap cursor to beat position (=== region.start)
 *
 */
// TODO
// 1) reset functionality on every resetToolbar.. not only the displayed button
export function setupSnapOnBeatsEvent() {
  toggleSnapOnBeatsBtn.addEventListener('click', () => {
    [snapOnBeatsState] = createToggle('#toggle-SnapOnBeats-btn');
  });

  wavesurfer.on('region-click', (region, event) => {
    snapOnBeats(region.start, event);
    if (currentRegion && clickTrackState) {
      currentRegion.element.classList.remove('region-highlight');
      region.element.classList.add('region-highlight');
    }
    currentRegion = region; // this is used for click track highligh region
  });
}

/**
 *
 * [Click Track]: create a click sound on every beat (===beat duration or respective region)
 *
 */
export function setupClickTrackEvent() {
  console.log('🚀:', audioContext, '🚀:', primaryGainControl);

  toggleClickTrackBtn.addEventListener('click', () => {
    // Create toggle functionality for Click Track button
    [clickTrackState] = createToggle('#toggle-clickTrack-btn');

    if (!currentRegion) {
      currentRegion = wavesurfer.regions.list[0];
    }
    if (clickTrackState) {
      currentRegion.element.classList.add('region-highlight');
    } else {
      // Clear any remaining highlight region in any way (don't use currentRegion.classList.remove('region-highlight') because it doesn't cover all the cases
      Object.values(wavesurfer.regions.list).forEach(region => {
        region.element.classList.remove('region-highlight');
      });
    }
  });

  //  This event is used to avoid buggy click sounds when user interacts in any way with the waveform (click, skip forwards/backwards, timeline etc)
  wavesurfer.on('interaction', () => {
    userInteractedWithWaveform = true;
  });

  wavesurfer.on('region-in', region => {
    if (clickTrackState) {
      currentRegion.element.classList.remove('region-highlight');
      region.element.classList.add('region-highlight');
    }
    currentRegion = region;

    if (!userInteractedWithWaveform) clickTrack();
    userInteractedWithWaveform = false;
  });
  // revert back to default color when leaving a region
  wavesurfer.on('region-out', region => {
    region.element.classList.remove('region-highlight');
  });

  // CAREFUL! onpause also triggers on waveform seek (so now when on activate clickTrackState it also colorizes )
  wavesurfer.on('pause', () => {
    // Only in the case where annotations exist
    if (wavesurfer.markers.markers[0] && clickTrackState) {
    }
  });
}

function snapOnBeats(startTime, event) {
  if (snapOnBeatsState) {
    if ((editModeState && wavesurfer.isPlaying()) || !editModeState) {
      event.stopPropagation(); // CAREFUL! stop propagation on in those 2 cases of snap cursor
      wavesurfer.seekTo(startTime / wavesurfer.getDuration());
      if (clickTrackState) clickTrack(); // also add a click sound if click track is activated
    } else {
      // CAREFUL! DON'T STOP propagation HERE
      console.warn(
        'Snap on beats, is disabled on Edit Mode while audio is paused ⚠️ Enjoy editing!'
      );
    }
  }
}

function clickTrack() {
  // In case of destroyed audio context
  if (!isWebAudioInitialized) {
    [audioContext, primaryGainControl] = _initWebAudio();
    console.log('🚀:', audioContext, '🚀:', primaryGainControl);
  }

  _clickSound(audioContext, primaryGainControl);
}

function _initWebAudio() {
  isWebAudioInitialized = true;

  // console.log('_initWebAudio');
  const audioContext = new AudioContext();
  const primaryGainControl = audioContext.createGain();
  primaryGainControl.gain.value = 1;
  primaryGainControl.connect(audioContext.destination);

  return [audioContext, primaryGainControl];
}

async function _clickSound(audioContext, primaryGainControl) {
  if (!clickBuffer) {
    await fetchClickSound(audioContext);
  }

  const clickSource = audioContext.createBufferSource();
  clickSource.buffer = clickBuffer;

  const clickGain = audioContext.createGain();
  clickGain.gain.value = 1;

  clickSource.connect(clickGain);
  clickGain.connect(primaryGainControl);

  clickSource.start();
}

async function fetchClickSound(audioContext) {
  const response = await fetch(click);
  const arrayBuffer = await response.arrayBuffer();
  clickBuffer = await decodeAudioData(audioContext, arrayBuffer);
  console.log(clickBuffer);
}

function decodeAudioData(audioContext, arrayBuffer) {
  return new Promise((resolve, reject) => {
    audioContext.decodeAudioData(arrayBuffer, resolve, reject);
  });
}
