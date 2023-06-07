'use strict';

import WaveSurfer from 'wavesurfer.js';

import cursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js';
import regionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
import timelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js';
import markersPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.markers.min.js';
import minimapPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.minimap.min.js';

// Created wavesurfer instance from main.js
import { wavesurfer } from './main.js';
import { renderModalMessage, isModalActive } from './edit-mode.js';
import { loadFile } from './components/utilities.js';

/* Elements */
const waveform = document.querySelector('#waveform');
const zoomInBtn = document.querySelector('#zoom-in-btn');
const zoomOutBtn = document.querySelector('#zoom-out-btn');

const rewindBtn = document.querySelector('#rewind-btn');
const playPauseBtn = document.querySelector('#play-pause-btn');
const playBtn = document.querySelector('#play-pause-btn .fa-play');
const pauseBtn = document.querySelector('#play-pause-btn .fa-pause');
const repeatBtn = document.querySelector('#repeat-btn');

const muteUnmuteBtn = document.querySelector('#mute-unmute-btn');
const muteBtn = document.querySelector('#mute-unmute-btn .fa-volume-xmark');
const unmuteBtn = document.querySelector('#mute-unmute-btn .fa-volume-high');
const volumeSlider = document.querySelector('.volume-slider');

let fileName = 'Unknown'; // store prev filename on every import
const minPxPerSec = 152;
let prevVolumeSliderValue = 0.5;
let repeatEnable = false;

export function toggleAudioInOutControls() {
  const audioSidebarText = document.getElementById('audio-sidebar-text');
  const audioSidebarControls = document.getElementById(
    'audio-sidebar-controls'
  );

  audioSidebarText.addEventListener('click', e => {
    audioSidebarControls.classList.toggle('shown');
    audioSidebarText.classList.toggle('shown');
  });
}

export function initWavesurfer() {
  const wavesurfer = WaveSurfer.create({
    container: '#waveform', // html element
    waveColor: '#337ab9', // '#1F51FF',
    progressColor: 'rgba(244, 180, 38, 0.85)',
    scrollParent: true,
    minPxPerSec: minPxPerSec,
    autoCenter: true,
    autoCenterRate: 1,
    partialRender: true,
    cursorWidth: 2,
    barWidth: 2,
    // cursorColor: '#9e7215',
    // hideScrollbar: true,

    plugins: [
      cursorPlugin.create({
        showTime: true,
        opacity: 1,
        customShowTimeStyle: {
          backgroundColor: '#1996',
          color: '#fff',
          padding: '2px',
          'font-size': '10px',
        },
      }),
      regionsPlugin.create(),
      markersPlugin.create(),
      timelinePlugin.create({
        container: '#wavetimeline',
        formatTimeCallback: formatTimeCallback,
        timeInterval: timeInterval,
        primaryLabelInterval: primaryLabelInterval,
        secondaryLabelInterval: secondaryLabelInterval,
        primaryColor: 'rgb(128, 128, 128)',
        primaryFontColor: 'rgb(128, 128, 128)',
        secondaryFontColor: 'black',
      }),
      minimapPlugin.create({
        height: 30,
        waveColor: '#777',
        progressColor: '#999',
        cursorColor: '#999',
      }),
    ],
  });

  return wavesurfer;
}

export function loadAudioFile(input) {
  // Configure elements initial state (while loading)
  _initElementsState();
  console.log(input);
  if (input === undefined) return;

  // check saved state depending on existing attributes
  const saveChordsBtn = document.querySelector('#save-chords-btn');
  let saveState = saveChordsBtn.classList.contains('disabled');

  const [fileUrl, file] = loadFile(input);
  console.log(file);

  if (file && !saveState) {
    const message = `You are about to import: <br> <span class="text-primary">${file.name}</span>.<br> Any unsaved changes on<br><span class="text-primary">${fileName}</span> will be <span class="text-warning">discarded.</span> <br><br><span class="text-info">Are you sure?</span> 🤷‍♂️`;
    // fileName = file.name;

    renderModalMessage(message)
      .then(() => {
        // User confirmed
        // Load file
        wavesurfer.load(fileUrl);
        resetAudioPlayer();
      })
      .catch(() => {
        // User canceled
      });
  } else {
    // Load file
    wavesurfer.load(fileUrl);
    resetAudioPlayer();
  }

  if (file !== undefined) {
    fileName = file.name;
  }
  document.querySelector('#audio-file-name').textContent = fileName.trim();
}

export function audioPlayerEvents(wavesurfer) {
  /* Events (for audio player) */

  // Zoom in/out events
  zoomInBtn.addEventListener('click', zoomIn);
  zoomOutBtn.addEventListener('click', zoomOut);

  // play, pause & rewind functionalities
  rewindBtn.addEventListener('click', rewind);
  playPauseBtn.addEventListener('click', playPause);
  repeatBtn.addEventListener('click', repeat);

  //  toggle on/off mute
  muteUnmuteBtn.addEventListener('click', muteUnmute);

  // play/pause with space button if playback started
  document.addEventListener('keydown', keyboardPlayerEvents);

  // on finish change PLAY button
  wavesurfer.on('finish', () => {
    console.log('finished!');

    if (repeatEnable) {
      wavesurfer.seekTo(0);
      wavesurfer.play();
      console.log('Play again bcs repeat is on ! 😁');
    } else {
      playBtn.classList.remove('d-none');
      pauseBtn.classList.add('d-none');
    }

    // // if mode is scrolling then TODO
    // wavesurfer.params.autoCenter = true;
  });

  // change volume with a slider
  // volumeSlider.addEventListener('input', setVolumeWithSlider);
  volumeSlider.addEventListener('input', e =>
    setVolumeWithSlider(e.target.value)
  );

  // TODO there will be option switching between those 2 modes
  // ***1st mode with scrolling***
  // Starts with autoCenter. Disabling when clicking/moving scrollbar.
  waveform.addEventListener('mousedown', function () {
    wavesurfer.params.autoCenter = false;
  });

  waveform.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });

  // Re-enable autoCenter when user interacts with waveform or minimap
  wavesurfer.on('interaction', function () {
    wavesurfer.params.autoCenter = true;
  });

  //  ***2nd mode with pageTurnPlayback*** (not complete yet!)
  // // FIXME/TODO moving the slider? not disables PlaybackPageTurn || also not yet count zoom possibilities
  // wavesurfer.on('audioprocess', currentTime => {
  //   pageTurnPlayback(currentTime);
  // });

  console.log('Event listeners for AUDIO PLAYER ready! ⚡');
}

export function resetAudioPlayer() {
  // hide audio importing description
  document.querySelector('.preface-audio-help').classList.add('d-none');
  document.querySelector('.preface-annotation-help').classList.remove('d-none');

  // enable analyze button
  document.querySelector('#analyze-chords-btn').classList.remove('disabled');
  document.querySelector('#toolbar').classList.remove('d-none');

  // Left controls
  zoomInBtn.classList.remove('disabled');
  zoomOutBtn.classList.remove('disabled');
  // also go back to default zoom level (+ with a gimmick)
  // this is a gimmick trick that is used to avoid the problem with the waveform not rendering if user imports the same audio file wavesurfer.load()
  wavesurfer.zoom(minPxPerSec + 1);
  setTimeout(() => {
    // and a small timeout for rendering reasons
    wavesurfer.zoom(minPxPerSec - 1);
  }, 5);

  // Center controls
  rewindBtn.classList.remove('disabled');

  playPauseBtn.classList.remove('disabled');
  playBtn.classList.remove('d-none');
  pauseBtn.classList.add('d-none');

  repeatBtn.classList.remove('disabled');
  repeatBtn.classList.remove('repeat-enabled');
  repeatEnable = false;

  muteUnmuteBtn.classList.remove('disabled');
  muteBtn.classList.add('d-none');
  unmuteBtn.classList.remove('d-none');

  // Right controls
  volumeSlider.value = 0.5;
  wavesurfer.setVolume(0.5);
  volumeSlider.classList.remove('disabled');

  console.log('resetAudioPlayer is complete 😁');
}

function zoomIn() {
  wavesurfer.zoom(wavesurfer.params.minPxPerSec * 2);
  zoomOutBtn.classList.remove('disabled');

  if (wavesurfer.params.minPxPerSec >= 600) {
    zoomInBtn.classList.add('disabled');
  }
}

function zoomOut() {
  wavesurfer.zoom(wavesurfer.params.minPxPerSec / 2);
  zoomInBtn.classList.remove('disabled');
  if (wavesurfer.params.minPxPerSec <= 50) {
    zoomOutBtn.classList.add('disabled');
  }
}

function rewind() {
  playBtn.classList.remove('d-none');
  pauseBtn.classList.add('d-none');
  wavesurfer.stop();
  wavesurfer.seekAndCenter(0);
}

function playPause() {
  playBtn.classList.toggle('d-none');
  pauseBtn.classList.toggle('d-none');

  if (wavesurfer.isPlaying()) {
    wavesurfer.pause();
  } else {
    wavesurfer.play();
  }
}

function repeat() {
  const repeatIcon = document.querySelector('.fa-repeat');

  // if not already enabled then  enable it
  if (repeatEnable) {
    repeatEnable = false;
    // repeatBtn.style.color = '';
    repeatBtn.classList.remove('repeat-enabled');
    repeatIcon._tippy.setContent('Enable repeat (r)');
  } else {
    repeatEnable = true;
    // repeatBtn.style.color = 'Teal';
    repeatBtn.classList.add('repeat-enabled');
    repeatIcon._tippy.setContent('Disable repeat (r)');
  }
}

function muteUnmute() {
  const muted = muteBtn.classList.contains('d-none');
  if (muted) {
    volumeSlider.value = 0;
    muteBtn.classList.remove('d-none');
    unmuteBtn.classList.add('d-none');
    wavesurfer.setVolume(0);
  } else {
    if (prevVolumeSliderValue === 0) {
      // ..do nothing
    } else {
      volumeSlider.value = prevVolumeSliderValue;
      muteBtn.classList.add('d-none');
      unmuteBtn.classList.remove('d-none');
      wavesurfer.setVolume(prevVolumeSliderValue);
    }
  }
}

function setVolumeWithSlider(volumeValue) {
  volumeValue = parseFloat(volumeValue);

  prevVolumeSliderValue = volumeValue;
  if (volumeValue === 0) {
    muteBtn.classList.remove('d-none');
    unmuteBtn.classList.add('d-none');
  } else {
    muteBtn.classList.add('d-none');
    unmuteBtn.classList.remove('d-none');
  }
  wavesurfer.setVolume(volumeValue);
}

function keyboardPlayerEvents(event) {
  if (isModalActive) return; // If the modal is active, don't execute the event listener
  const key = event.code;
  if (key === 'Space') {
    event.preventDefault();
    playPause(wavesurfer);
  } else if (key === 'KeyM') {
    event.preventDefault();
    muteUnmute(wavesurfer);
  } else if (key === 'Digit0' || key === 'Numpad0') {
    event.preventDefault();
    rewind(wavesurfer);
  } else if (key === 'ArrowUp') {
    if (prevVolumeSliderValue === 1) return;
    event.preventDefault();
    const newVolumeSliderValue = parseFloat(
      (prevVolumeSliderValue + 0.05).toFixed(2)
    );
    setVolumeWithSlider(newVolumeSliderValue);
    volumeSlider.value = newVolumeSliderValue;
  } else if (key === 'ArrowDown') {
    if (prevVolumeSliderValue === 0) return;
    event.preventDefault();
    const newVolumeSliderValue = parseFloat(
      (prevVolumeSliderValue - 0.05).toFixed(2)
    );
    setVolumeWithSlider(newVolumeSliderValue);
    volumeSlider.value = newVolumeSliderValue;
  } else if (key === 'ArrowRight') {
    event.preventDefault();
    if (wavesurfer.getCurrentTime() < wavesurfer.getDuration() - 5) {
      wavesurfer.skipForward(5);
    } else {
      wavesurfer.pause();
      wavesurfer.seekTo(1);
    }
  } else if (key === 'ArrowLeft') {
    event.preventDefault();
    wavesurfer.skipBackward(5);
  } else if (key === 'Equal' || key === 'NumpadAdd') {
    zoomIn();
  } else if (key === 'Minus' || key === 'NumpadSubtract') {
    zoomOut();
  } else if (key === 'KeyR') {
    repeat();
  } else {
    //TODO remove just now for testing
    // calcParams();
    // displayedWaveformStartEndTime();
  }
}

function displayedWaveformStartEndTime() {
  // get the current horizontal scroll offset in pixels
  const scrollWidthStart = wavesurfer.drawer.getScrollX();

  // get the visible width of the parent container in pixels
  const parentWidth = wavesurfer.drawer.getWidth();

  // calculate the horizontal scroll offset at the end of the visible area
  const scrollWidthEnd = scrollWidthStart + parentWidth;

  // calculate the amount of time that each pixel in the waveform represents
  const timePerPixel = wavesurfer.getDuration() / wavesurfer.drawer.width;

  // calculate the start and end times of the audio portion currently displayed in the view
  const startTime = timePerPixel * scrollWidthStart;
  const endTime = timePerPixel * scrollWidthEnd;

  console.log('Start time: ' + startTime);
  console.log('End time: ' + endTime);

  return [startTime, endTime];
}

function bringToFrontWavesurferCursor() {
  // cursor line
  const cursor = document.querySelector('#waveform > wave > wave');
  cursor.style.zIndex = 6;
  // cursor duration text
  const cursorCurrentTimeText = document.querySelector(
    '#waveform > wave > showtitle'
  );
  cursorCurrentTimeText.style.zIndex = 6;
}

function _initElementsState() {
  // destroy previous tippy singleton instance
  if (wavesurfer.markers.markers[0]) {
    wavesurfer.markers.markers[0].el.singleton.destroy();
  }

  // show preface audio help instructions
  document.querySelector('.preface-audio-help').classList.remove('d-none');

  // Reset markers,regions & waveform
  wavesurfer.clearMarkers();
  wavesurfer.clearRegions();
  wavesurfer.empty();

  // Edit options controls
  document.querySelector('#toolbar').classList.add('d-none');
  document.querySelector('#left-toolbar-controls').classList.add('d-none');
  document.querySelector('#center-toolbar-controls').classList.add('d-none');
  const editModeTools = document.querySelector('#right-toolbar-controls');
  editModeTools.querySelectorAll('.btn-edit-mode').forEach(button => {
    button.classList.add('d-none');
  });
  const audioFileName = document.querySelector('#audio-file-name');
  audioFileName.classList.remove('d-none');
  audioFileName.classList.add('pointer-events-disabled');
  // removing editing color
  document.querySelector('#toolbar').classList.remove('editing-on');

  document.querySelector('#info-question').classList.add('d-none');

  // Audio I/O
  document.querySelector('#analyze-chords-btn').classList.add('disabled');
  document.querySelector('#download-chords-btn').classList.add('disabled');

  // Left controls player
  zoomInBtn.classList.add('disabled');
  zoomOutBtn.classList.add('disabled');

  // Center controls player
  rewindBtn.classList.add('disabled');
  playPauseBtn.classList.add('disabled');
  muteUnmuteBtn.classList.add('disabled');
  repeatBtn.classList.add('disabled');

  // Right controls player
  volumeSlider.classList.add('disabled');

  // hide bpm, prev chord, next chord
  document.querySelector('#waveform-bpm').classList.add('d-none');
  document.querySelector('#waveform-prev-chord').classList.add('d-none');
  document.querySelector('#waveform-next-chord').classList.add('d-none');

  console.log('_initElementsState is complete 😁');
}

/**
 * Formats time in minutes and seconds with variable precision
 *
 * e.g. 169 seconds will become 2:49 (2min & 49seconds)
 */
function formatTimeCallback(seconds, pxPerSec) {
  seconds = Number(seconds);
  const minutes = Math.floor(seconds / 60);

  // calculate the remainder of the division
  seconds %= 60;
  // Convert seconds to decimal format
  seconds /= 100;

  let secondsStr;
  if (pxPerSec > 300) {
    secondsStr = seconds.toFixed(3);

    // formatSecondsWithThreeDecimals (e.g.0.550 => 0.55 ||0.500 =>0.50  || 0.525 => 0.52:5)
    secondsStr = _formatSecondsWithThreeDecimals(secondsStr);
  } else {
    secondsStr = seconds.toFixed(2);
  }
  const decimalPart = secondsStr.split('.')[1];

  return `${minutes}:${decimalPart}`;
}

function _formatSecondsWithThreeDecimals(number) {
  const numberString = number.toString();
  const lastNumber = numberString.charAt(numberString.length - 1);

  if (lastNumber === '0') {
    return numberString.slice(0, -1);
  } else {
    const formattedNumber = numberString.slice(0, -1) + ':' + lastNumber;
    return formattedNumber;
  }
}

/**
 * Determines the time interval based on the pixels per second value
 */
function timeInterval(pxPerSec) {
  if (pxPerSec >= 300) {
    return 0.1;
  } else if (pxPerSec >= 50) {
    return 0.5;
  } else {
    return 1;
  }
}

/**
 *Determines the primary label interval based on the pixels per second value.
 */
function primaryLabelInterval(pxPerSec) {
  if (pxPerSec >= 600) {
    return Math.floor(0.1 / timeInterval(pxPerSec));
  } else if (pxPerSec >= 300) {
    return Math.floor(0.5 / timeInterval(pxPerSec));
  } else if (pxPerSec >= 150) {
    return Math.floor(2 / timeInterval(pxPerSec));
  }
}

/**
 * Determines the secondary label interval based on the pixels per second value.
 */
function secondaryLabelInterval(pxPerSec) {
  return Math.floor(1 / timeInterval(pxPerSec));
}
// - In progress functions TODO FIXME TODO
function pageTurnPlayback(currentTime) {
  // autoCenter MUST be off ALWAYS for this function
  // the view can only be  centered & immediate because seekAndCenter
  // for more options implement other custom seekAndCenter function

  wavesurfer.params.autoCenter = false; // re-place it later with condition when switching modes

  // 'turn page' every 1/4 of the displayed (parentWidth) width
  const pageTurnThreshold = parentWidth / 4;

  const progress = currentTime / totalAudioDuration;
  const px = nominalWidth * progress;

  // const currentPosition = (parentWidth / nominalWidth) * progress;
  const currentPosition = parentWidth * px;

  if (currentPosition > parentWidth * pageTurnPosition) {
    // instead of updating the positions at the end create a function that 1. calculates all of them together (so even if you move the slider in a previous location it still works) 2. calculate new positions if moving the slider forwards TODO
    // update pageTurnPosition ---> needs improvement FIXME
    pageTurnPosition += pageTurnThreshold;
    console.log(pageTurnPosition);

    // wavesurfer.params.autoCenter = true;
    wavesurfer.seekAndCenter(progress);
  }
}

function calcParams() {
  let waveformElement = document.getElementById('waveform');
  let style = window.getComputedStyle(waveformElement);
  let width = parseInt(style.width, 10);
  console.log(width);

  let totalAudioDuration = wavesurfer.getDuration();

  // nominalWidth is the total width in pixes of the reference audio
  let nominalWidth = Math.round(
    totalAudioDuration *
      wavesurfer.params.minPxPerSec *
      wavesurfer.params.pixelRatio
  );

  // Parent width can be interpreted as the actual displayed width in pixels
  let parentWidth = wavesurfer.drawer.getWidth();

  // console.log('totalAudioDurationInSeconds:', totalAudioDuration);
  // console.log('nominalWidthInPixels:', nominalWidth);
  // console.log('parentWidthInPixels:', parentWidth);

  let pageTurnPosition = parentWidth * (3 / 4);
  // console.log(pageTurnPosition);

  console.log(`totalAudioDuration:${totalAudioDuration},
  nominalWidth:${nominalWidth},
  parentWidth:${parentWidth},
  wavesurfer.drawer.width:${wavesurfer.drawer.width},
  ---------------------`);
  console.log(wavesurfer);
  console.log('  ---------------------');
  console.log(wavesurfer.drawer);
}
