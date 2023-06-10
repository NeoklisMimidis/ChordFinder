'use strict';

// Created wavesurfer instance from audio-player.js
import { wavesurfer } from './audio-player.js';
import { jamsFile } from './render-annotations.js';

import {
  setupSnapOnBeatsEvent,
  setupClickTrackEvent,
} from './annotation-tools/left-toolbar-tools.js';

import {
  setupAnnotationListEvents,
  setupToggleEditEvent,
} from './annotation-tools/center-toolbar-tools.js';

import {
  setupEditChordEvents,
  setupSaveChordsEvent,
  setupCancelEditingEvent,
} from './annotation-tools/right-toolbar-tools.js';

import {
  setupAddBeatAndChordEvent,
  setupEditBeatTimingEvents,
  setupRemoveBeatAndChordEvent,
} from './annotation-tools/waveform-editing-tools.js';

import { downloadJAMS } from './components/utilities.js';

/* Elements */

/* UI variables/states */
let cleanStateAnnotationEvents = true; // this is used to avoid bugs that occur when a new annotation file is loaded and events are assigned again (so assigning events only on clean state).

/* Elements */
// Left controls
const toggleSnapOnBeatsBtn = document.getElementById('toggle-SnapOnBeats-btn');
const toggleClickTrackBtn = document.getElementById('toggle-clickTrack-btn');
//  Center controls
const annotationList = document.getElementById('annotation-list');
const deleteAnnotationBtn = document.querySelector('#delete-annotation-btn');
const toggleEditBtn = document.querySelector('#toggle-edit-btn');
// Right controls & related Edit Mode Controls(Editing)
const editModeTools = document.querySelector('#right-toolbar-controls');
const audioFileName = document.querySelector('#audio-file-name');
const editChordBtn = document.querySelector('#edit-chord-btn');
const saveChordsBtn = document.querySelector('#save-chords-btn');
const cancelEditingBtn = document.querySelector('#cancel-editing-btn');
//  --Chord Editor table controls--
const modalChordEditor = document.getElementById('show-chord-editor');
const chordEditor = document.getElementById('chord-editor');
const tableElements = document.querySelectorAll('#chord-editor td');
const applyBtn = document.getElementById('apply-btn');
const cancelBtn = document.getElementById('cancel-btn');

// - EVENTS
export function toolbarAndEditingRelatedEvents() {
  /* Events (for editor) */
  if (!cleanStateAnnotationEvents) return;

  // // Default browsers warning when exiting without saving
  // window.addEventListener('beforeunload', function (e) {
  //   if (saveChordsBtn.classList.contains('disabled')) return;
  //   e.returnValue = '';
  // });

  /* --------------------- */
  /* Left controls events */
  /* -------------------- */

  setupSnapOnBeatsEvent();
  setupClickTrackEvent();

  /* ---------------------- */
  /* Center controls events */
  /* ---------------------- */

  setupAnnotationListEvents();
  setupToggleEditEvent();

  /* --------------------- */
  /* Right controls events */
  /* --------------------- */

  // Annotation tools (toolbar)
  setupEditChordEvents();
  setupSaveChordsEvent();
  setupCancelEditingEvent();

  // Annotation tools (waveform)
  setupAddBeatAndChordEvent();
  setupEditBeatTimingEvents();
  setupRemoveBeatAndChordEvent();

  /* ------- */
  /* OTHERS */
  /* ------ */
  setupDownloadJamsEvent();
  setupCalculateTempoEvent();
  setupShowPrevOrNextChordLabelWhenNotIntoView();

  cleanStateAnnotationEvents = false;
  console.log('Event listeners for EDIT MODE ready! ⚡');
}

export function _disableSaveChordsAndCancelEditing() {
  annotationList.classList.remove('disabled');

  const selectedAnnotation = jamsFile.annotations[annotationList.selectedIndex];
  const currDataSource = selectedAnnotation.annotation_metadata.data_source;

  // ONLY remove IF not automatic analysis annotation
  if (currDataSource !== 'program') {
    deleteAnnotationBtn.classList.remove('disabled');
  }

  saveChordsBtn.classList.add('disabled');
  cancelEditingBtn.classList.add('disabled');

  document.querySelector('#toolbar').classList.remove('editing-on');
}

export function _disableAnnotationListAndDeleteAnnotation() {
  annotationList.classList.add('disabled');
  deleteAnnotationBtn.classList.add('disabled');

  saveChordsBtn.classList.remove('disabled');
  cancelEditingBtn.classList.remove('disabled');

  console.log(' _disableAnnotationListAndDeleteAnnotation');
  document.querySelector('#toolbar').classList.add('editing-on');
  console.log(document.querySelector('#toolbar'));
}

// - OTHERS

function setupDownloadJamsEvent() {
  document.querySelector('#download-jams-btn').addEventListener('click', () => {
    downloadJAMS(jamsFile);
  });
}

function setupCalculateTempoEvent() {
  //  Calculate tempo once in the start
  calculateTempo(wavesurfer.markers.markers[0].duration);
  // ..and now calculate beat for every region
  wavesurfer.on('region-in', region => {
    // console.log('Tempo:', 60 / (region.end - region.start));
    const beatDuration = region.end - region.start;
    calculateTempo(beatDuration);
  });
}

//  Just for now an easy to calculate tempo solution
function calculateTempo(beatDuration) {
  let tempo = 60 / beatDuration;
  tempo = Math.floor(tempo);

  // impose a lower and upper limit to the tempo
  const minTempo = 30;
  const maxTempo = 248;

  if (tempo < minTempo) {
    tempo = minTempo;
  } else if (tempo > maxTempo) {
    tempo = maxTempo;
  }

  const tempoValue = document.getElementById('tempo-value');
  tempoValue.textContent = tempo;
}

// ..ON PROGRESS SHOW PREV or NEXT CHORD if LABEL not into view! TODO
function setupShowPrevOrNextChordLabelWhenNotIntoView() {
  wavesurfer.on('region-in', region => {
    const prevChordValue = document.getElementById('prev-chord-value');
    const nextChordValue = document.getElementById('next-chord-value');

    checkMarkers(region);
    // console.log(wavesurfer.markers.markers);
    // displayedWaveformStartEndTime();
  });
}

// - TODO in progress
// This function checks if a given time range overlaps with a given visible time range
function overlapsWithVisibleRange(start, end, visibleStart, visibleEnd) {
  return start < visibleEnd && end > visibleStart;
}

function checkMarkers(region) {
  const beatDuration = region.end - region.start;

  // var currentTime = wavesurfer.getCurrentTime();
  // // Call your function to get the currently visible time range
  // const [visibleStartTime, visibleEndTime] = displayedWaveformStartEndTime();

  // get the visible width of the parent container in pixels
  const parentWidth = wavesurfer.drawer.getWidth();

  // calculate the amount of time that each pixel in the waveform represents
  const timePerPixel = wavesurfer.getDuration() / wavesurfer.drawer.width;
  const displayedDurationInSeconds = parentWidth * timePerPixel;

  if (beatDuration > displayedDurationInSeconds / 6) {
    const prevChordValue = document.getElementById('prev-chord-value');
    console.log(region, '✅');
    prevChordValue.textContent = region.data.displayed_chord;
  }
}

/*
TODO: COMMIT MESSAGE  in progress
TODO display prev or next chord when labels not shown in current displayed waveform
*/

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

  // console.log('Start time: ' + startTime);
  // console.log('End time: ' + endTime);

  return [startTime, endTime];
}
