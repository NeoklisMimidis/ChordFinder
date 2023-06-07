'use strict';

// Created wavesurfer instance from main.js
import { wavesurfer } from './main.js';
import {
  jamsFile,
  addMarkerAtTime,
  renderAnnotations,
  createAnnotationsList,
  selectedAnnotationData,
  updateMarkerDisplayWithColorizedRegions,
} from './render-annotations.js';

import {
  EDITED_MARKER_STYLE,
  MARKER_LABEL_SPAN_COLOR,
  CLICK_TRACK_HIGHLIGHT_COLOR,
  TABLE_SELECTION_COLOR,
  MODAL_SINGLETON_PROPS,
} from './config.js';

import { createTippySingleton } from './components/tooltips.js';
import { variations, accidentals } from './components/mappings.js';
import {
  areObjectsEqual,
  downloadJAMS,
  createToggle,
  resetToggle,
} from './components/utilities.js';
import click from 'url:../data/click_metronome.wav';

/* Elements */
// Left controls
export const toggleSnapOnBeatsBtn = document.getElementById(
  'toggle-SnapOnBeats-btn'
);
export const toggleClickTrackBtn = document.getElementById(
  'toggle-clickTrack-btn'
);
//  Center controls
export const annotationList = document.getElementById('annotation-list');
export const deleteAnnotationBtn = document.querySelector(
  '#delete-annotation-btn'
);
export const toggleEditBtn = document.querySelector('#toggle-edit-btn');
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

/* UI variables/states */
let clickBuffer; // Store into a variable the fetched click sound for repeated usage
let lastSelectedMarker;
let isWebAudioInitialized = false;
let audioContext, primaryGainControl;
export let editState = false; // true of false edit state(toggle Edit)
export let snapOnBeatsState = false;
export let clickTrackState = false;
export let isModalActive = false; // useful to disable some events while modal active

let userInteractedWithWaveform = false;
let cleanStateAnnotationEvents = true;

let chord = {
  current: {
    root: '',
    accidental: '',
    variation: '',
  },
  new: {
    root: '',
    accidental: '',
    variation: '',
  },
};

// - EVENTS
export function toolbarAndEditingRelatedEvents(wavesurfer) {
  console.log('edit mode events triggered 💪💪');

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

  //  --- Snap (beats)! ---
  toggleSnapOnBeatsBtn.addEventListener('click', () => {
    // Create toggle functionality for Snap (beats) button
    [snapOnBeatsState] = createToggle('#toggle-SnapOnBeats-btn');
  });

  // 2nd part [Snap on beats!]  - region
  wavesurfer.on('region-click', (region, event) => {
    triggerSnapOnBeats(region.start, event);
  });

  //  --- Click track! ---
  // initialize web audio api for click track (not actually an event)
  [audioContext, primaryGainControl] = _initWebAudio();
  console.log('🚀:', audioContext, '🚀:', primaryGainControl);

  toggleClickTrackBtn.addEventListener('click', () => {
    // Create toggle functionality for Click Track button
    [clickTrackState] = createToggle('#toggle-clickTrack-btn');
  });

  //  This event is used to avoid buggy click sounds when user interacts in any way with the waveform (click, skip forwards/backwards, timeline etc)
  wavesurfer.on('interaction', () => {
    console.log('interaction');
    userInteractedWithWaveform = true;
  });

  let prevColor;
  wavesurfer.on('region-in', region => {
    if (!clickTrackState) return;
    // highlight every beat
    prevColor = region.color;
    region.update((region.color = CLICK_TRACK_HIGHLIGHT_COLOR));

    if (!userInteractedWithWaveform) clickTrack();
    userInteractedWithWaveform = false;
  });
  // revert back to default color when leaving a region
  wavesurfer.on('region-out', region => {
    if (prevColor) {
      region.update((region.color = prevColor));
    }
  });

  // CAREFUL! onpause also triggers on waveform seek (so now when on activate clickTrackState it also colorizes )
  wavesurfer.on('pause', () => {
    // Only in the case where annotations exist
    if (wavesurfer.markers.markers[0] && clickTrackState) {
      updateMarkerDisplayWithColorizedRegions();
    }
  });

  /* ---------------------- */
  /* Center controls events */
  /* ---------------------- */
  // On annotationList change, Clear previous & render the new selected annotation
  annotationList.addEventListener('change', () => {
    wavesurfer.clearMarkers();
    wavesurfer.clearRegions();
    console.log(jamsFile);
    renderAnnotations(selectedAnnotationData(jamsFile));
  });
  deleteAnnotationBtn.addEventListener('click', () => {
    deleteAnnotation();
  });
  toggleEditBtn.addEventListener('click', toggleEdit.bind(editChordBtn));

  /* --------------------- */
  /* Right controls events */
  /* --------------------- */
  // edit chord click (modify selected chord)
  wavesurfer.on(
    'marker-click',
    // Edit selected chord onPressingEditChordButton (enables button)
    _enableEditChordButtonFunction.bind(editChordBtn)
  );
  editChordBtn.addEventListener('click', showChordEditor);
  saveChordsBtn.addEventListener('click', () => {
    saveChords();
  });
  cancelEditingBtn.addEventListener('click', () => {
    cancelEditingChords();
  });

  /*  on ..Editing events */
  // Add beat onDoubleClick (AND chord SAME as previous chord)
  wavesurfer.on('region-dblclick', addBeatAndChord);

  // Edit beat onDrag -- only for styling || marker-drop change the beat
  // wavesurfer.on('marker-drag', editBeat);
  wavesurfer.on('marker-drag', function (marker, e) {
    editBeat(marker, e);
  });
  wavesurfer.on('marker-drop', editBeatTiming);

  // Remove marker onRightClick (== remove chord AND beat at position)
  wavesurfer.on('marker-contextmenu', removeBeatAndChord);

  // do something when the slider is moved
  wavesurfer.on('seek', progress => {
    // console.log('Slider moved to: ' + progress);

    // disable Edit chord button & remove color from selected marker
    editChordBtn.classList.add('disabled');
    if (lastSelectedMarker !== undefined) {
      _setMarkerSpanColor(lastSelectedMarker, lastSelectedMarker, '');
    }
  });

  /* ------------------- */
  /* Chord Editor Modal */
  /* ------------------ */
  // This is not actually an event! It assigns the tooltips in the table
  createTooltipsChordEditor();

  chordEditor.addEventListener('click', event => {
    // Proceed if click is on el with class Root, Accidental or Variation
    if (event.target.tagName !== 'TD' && event.target.tagName !== 'TEXT') {
      return;
    }

    // A loop to find the closest element with a class
    let closestElementWithClass = event.target;
    while (
      closestElementWithClass &&
      closestElementWithClass.className === ''
    ) {
      closestElementWithClass = closestElementWithClass.parentElement;
    }
    const selection = closestElementWithClass;
    const component = closestElementWithClass.className;

    select(selection, component);
    editChord();
  });

  // cancel click
  cancelBtn.addEventListener('click', () => {
    editChord(true);
    closeModal(true);
  });

  // apply click
  applyBtn.addEventListener('click', () => {
    // disableAnnotationList();
    _disableAnnotationListAndDeleteAnnotation();
    closeModal();
  });

  // AUDIO I/O download button
  document
    .querySelector('#download-chords-btn')
    .addEventListener('click', () => {
      downloadJAMS(jamsFile);
    });

  //  Calculate tempo once in the start
  calculateTempo(wavesurfer.markers.markers[0].duration);
  // ..and now calculate beat for every region
  wavesurfer.on('region-in', region => {
    // console.log('Tempo:', 60 / (region.end - region.start));
    const beatDuration = region.end - region.start;
    calculateTempo(beatDuration);
  });

  // let
  wavesurfer.on('region-in', region => {
    const prevChordValue = document.getElementById('prev-chord-value');
    const nextChordValue = document.getElementById('next-chord-value');

    checkMarkers(region);
    // console.log(wavesurfer.markers.markers);
    // displayedWaveformStartEndTime();

    // prevChordValue.textContent = '1';
    // nextChordValue.textContent = '2';
  });

  cleanStateAnnotationEvents = false;
  console.log('Event listeners for EDIT MODE ready! ⚡');
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

  // Assuming printWaveformTimes sets global variables startTime and endTime
  // var visibleStartTime = startTime;
  // var visibleEndTime = endTime;

  // for (var marker of wavesurfer.markers.markers) {
  //   var markerEndTime = marker.time + marker.duration;
  //   var isActive = marker.time <= currentTime && markerEndTime >= currentTime;
  //   var isVisible = overlapsWithVisibleRange(
  //     marker.time,
  //     markerEndTime,
  //     visibleStartTime,
  //     visibleEndTime
  //   );
  //   // console.log('isActive', isActive);
  //   // console.log('isVisible', isVisible);
  //   if (isActive && !isVisible) {
  //     console.log('✅ Marker is active but not visible: ', marker);
  //   }
  // }
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

//////
export function resetToolbar() {
  // hide preface annotation help
  document.querySelector('.preface-annotation-help').classList.add('d-none');

  // enable other edit related options
  document.querySelector('#left-toolbar-controls').classList.remove('d-none');
  document.querySelector('#center-toolbar-controls').classList.remove('d-none');
  document.querySelector('#info-question').classList.remove('d-none');

  // Left controls
  resetToggle('#toggle-SnapOnBeats-btn');
  resetToggle('#toggle-clickTrack-btn');

  // Middle controls
  editState = false; // this will affect the rendering of the new annotation with updateMarkerDisplayWithColorizedRegions()
  annotationList.classList.remove('disabled');
  resetToggle('#toggle-edit-btn');

  // Right controls (Edit mode controls)
  audioFileName.classList.remove('d-none');
  editModeTools.querySelectorAll('.btn-edit-mode').forEach(button => {
    button.classList.add('d-none');
    button.classList.add('disabled');
  });

  // enable download again
  document.querySelector('#download-chords-btn').classList.remove('disabled');

  // removing editing color
  document.querySelector('#toolbar').classList.remove('editing-on');

  // display bpm, prev chord, next chord
  document.querySelector('#waveform-bpm').classList.remove('d-none');

  // -TODO in progress
  // document.querySelector('#waveform-prev-chord').classList.remove('d-none');
  // document.querySelector('#waveform-next-chord').classList.remove('d-none');

  // Tippy (tooltips) related functionality reset BUG why it doesnt remove?
  editModeTools.classList.add('pointer-events-disabled');
  const questionIcon = document.querySelector('.fa-circle-question');
  const infoIcon = document.querySelector('.fa-circle-info');
  questionIcon.classList.remove('d-none');
  infoIcon.classList.add('d-none');

  console.log('resetToolbar is complete 😁');
}

// - Center controls
function deleteAnnotation() {
  const message = `You are about to delete <span class="text-danger">${annotationList.value}.</span><br><br><span class="text-info">Are you sure?</span> 🤷‍♂️`;

  renderModalMessage(message)
    .then(() => {
      // User confirmed
      wavesurfer.clearMarkers();
      //  Remove annotation from JAMS file
      jamsFile.annotations.splice(annotationList.selectedIndex, 1);
      // Removes selected annotation from annotationList drop-down list
      annotationList.remove(annotationList.selectedIndex);
      // Render the annotation (by default first drop-down list option)
      renderAnnotations(selectedAnnotationData(jamsFile));
    })
    .catch(() => {
      // User canceled
    });
}

function toggleEdit() {
  // Create toggle functionality for edit button
  const [state, _, __] = createToggle('#toggle-edit-btn');
  editState = state;
  console.log(`Edit ${editState ? 'enabled! Have fun 😜!' : '..disabled'} `);

  // zoom once in or out when entering edit mode
  wavesurfer.zoom(
    editState
      ? wavesurfer.params.minPxPerSec * 2
      : wavesurfer.params.minPxPerSec / 2
  );

  if (wavesurfer.getCurrentTime() === wavesurfer.getDuration()) {
    // this fixes a buggy situation that cursor stats at max audio duration and Edit toggle is pressed
    wavesurfer.seekTo(0);
  } else {
    const progress = wavesurfer.getCurrentTime() / wavesurfer.getDuration();
    wavesurfer.seekAndCenter(progress);
  }

  // Edit mode controls  #buttons: Edit chords || Save chords || Cancel
  audioFileName.classList.toggle('d-none');
  editModeTools.querySelectorAll('.btn-edit-mode').forEach(button => {
    button.classList.toggle('d-none');
  });

  updateMarkerDisplayWithColorizedRegions(true);

  const questionIcon = document.querySelector('.fa-circle-question');
  const infoIcon = document.querySelector('.fa-circle-info');
  // Tippy (tooltips) related functionality
  if (editState) {
    editModeTools.classList.remove('pointer-events-disabled');
    questionIcon.classList.add('d-none');
    infoIcon.classList.remove('d-none');
  } else {
    editModeTools.classList.add('pointer-events-disabled');
    questionIcon.classList.remove('d-none');
    infoIcon.classList.add('d-none');
  }
}

// - Edit mode controls
function addBeatAndChord(e) {
  console.log(`Region start: ${e.start} || Region end:${e.end}
  Current time: ${wavesurfer.getCurrentTime()}`);

  // Only add markers in the case where edit mode is activated and audio is not playing
  if (!editState || wavesurfer.isPlaying()) return;

  _disableAnnotationListAndDeleteAnnotation();

  const startingBeatChord = e.data['mirex_chord']; // get the chord assigned
  const currentTimePosition = wavesurfer.getCurrentTime();

  addMarkerAtTime(currentTimePosition, startingBeatChord);

  updateMarkerDisplayWithColorizedRegions();
}

function editBeat(marker) {
  if (marker.time === 0) return;
  console.log('dragged!!!', marker);

  marker.el.singleton.disable();

  _disableAnnotationListAndDeleteAnnotation();

  // add color to edited marker line
  const markerLine = marker.el.querySelector('div:nth-child(1)');
  wavesurfer.util.style(markerLine, EDITED_MARKER_STYLE);
}

function editBeatTiming(marker) {
  console.log('dropped!!!');
  //store marker properties to re-create the marker later
  const markerTime = marker.time;
  const markerLabel = marker.mirLabel;
  wavesurfer.markers.remove(marker);

  addMarkerAtTime(markerTime, markerLabel, 'edited');

  updateMarkerDisplayWithColorizedRegions();
}

function removeBeatAndChord(marker) {
  // do nothing on the first marker
  if (marker.time === 0) return;
  console.log('remove??', marker);

  // disable tooltips to avoid some bugs
  marker.el.singleton.disable();

  const markerTime = marker.time;
  const roundedMarkerTime = Math.round(markerTime * 100) / 100;

  const message = `You are about to delete the marker at <span class="text-warning">${roundedMarkerTime}</span> seconds<br>with label <span class="text-primary">${marker.label}</span>❗<br><br><span class="text-info">Are you sure?</span> 🤷‍♂️`;

  renderModalMessage(message)
    .then(() => {
      // User confirmed deletion
      deleteMarker(marker);
    })
    .catch(() => {
      // User canceled deletion
      marker.el.singleton.enable();
    });
}

function deleteMarker(marker) {
  wavesurfer.markers.remove(marker);
  // disableAnnotationList();
  _disableAnnotationListAndDeleteAnnotation();

  // Update chord regions
  updateMarkerDisplayWithColorizedRegions();

  // Enable tooltip after a small delay to avoid some bugs
  setTimeout(() => {
    marker.el.singleton.enable();
  }, 100);
}

function editChord(cancel = false) {
  // revertChord: is the marker that is now being edited
  const revertChord = _mapChordSymbolToText(chord.current);

  // selectedChord returns the label in marker.mirLabel format
  const selectedChord = _mapChordSymbolToText(chord.new);

  // remove the selected marker because ...
  const lastSelectedMarkerTime = lastSelectedMarker.time;
  wavesurfer.markers.remove(lastSelectedMarker);

  // ... a later one will replace him with:
  // selectedChord or on Cancel revertChord
  const label = cancel ? revertChord : selectedChord;

  // all markers draggable EXCEPT first marker (at time 0.0)
  const draggable = lastSelectedMarkerTime === 0.0 ? false : true;

  const newSelectedMarker = addMarkerAtTime(
    lastSelectedMarkerTime,
    label,
    'replaced',
    draggable
  );

  // Colorizing again the span (label element)
  _setMarkerSpanColor(
    newSelectedMarker,
    lastSelectedMarker,
    MARKER_LABEL_SPAN_COLOR
  );

  // Update lastSelectedMarker with the new one
  lastSelectedMarker = newSelectedMarker;

  // Probably here the following needs to be called!
  updateMarkerDisplayWithColorizedRegions();
}

function saveChords() {
  let message;
  let index = annotationList.selectedIndex;

  const selectedAnnotation = jamsFile.annotations[index];
  const currDataSource = selectedAnnotation.annotation_metadata.data_source;

  // Disable replace button on first (show original) annotation
  const replacePromptBtn = document.getElementById('replacePrompt');
  if (currDataSource === 'program') {
    message = `Do you want to <span class="text-success">save</span> <span class="text-warning">${annotationList.value}</span> as a separate annotation? 🤷‍♂️`;
    replacePromptBtn.classList.add('d-none');
  } else {
    replacePromptBtn.classList.remove('d-none');
    message = `Do you want to <span class="text-primary">replace</span> the existing annotation<br><span class="text-warning">${annotationList.value}</span> or <span class="text-success">save</span> it as a separate annotation? 🤷‍♂️`;
  }

  renderModalPrompt(message, jamsFile)
    .then(choice => {
      const newAnnotation = _createNewAnnotation();

      console.log(newAnnotation);
      if (choice === 'replace') {
        // Replace existing annotation
        wavesurfer.clearMarkers();
        jamsFile.annotations[index] = newAnnotation;
        renderAnnotations(selectedAnnotationData(jamsFile));
      } else if (choice === 'save') {
        // Save as separate annotation
        jamsFile.annotations.push(newAnnotation);
        index = annotationList.length;
      }
      _disableSaveChordsAndCancelEditing();

      // In the annotation list include information about modification date! TODO
      createAnnotationsList(jamsFile);
      annotationList.selectedIndex = index;

      // reset delete button if any new annotation was created
      deleteAnnotationBtn.classList.remove('disabled');
    })
    .catch(() => {
      // User canceled
      console.log('catch renderModalPrompt executed (User canceled)');
    });
}

function cancelEditingChords() {
  const message = `You are about to cancel editing.<br> Any unsaved changes will be <span class="text-warning">discarded.</span> <br><br><span class="text-info">Are you sure?</span> 🤷‍♂️`;

  console.log('before modal render!');
  renderModalMessage(message)
    .then(() => {
      // User confirmed
      wavesurfer.clearMarkers();
      renderAnnotations(selectedAnnotationData(jamsFile));
      console.log('cancel editing after render');
      _disableSaveChordsAndCancelEditing();
      console.log('cancel editing after disable');
    })
    .catch(() => {
      // User canceled
      console.log('catch cancel ');
    });
}

function _createNewAnnotation() {
  const [annotatorName, annotationDataSource, annotationDescription] =
    _extractModalPromptFields();

  const selectedOption = annotationList.options[annotationList.selectedIndex];
  selectedOption.setAttribute('data-annotation-name', annotatorName);
  selectedOption.setAttribute('data-annotation-source', annotationDataSource);
  selectedOption.setAttribute(
    'data-annotation-description',
    annotationDescription
  );

  const newAnnotation = {
    annotation_metadata: {
      curator: {
        name: `${annotatorName}`,
        email: '',
      },
      annotator: {},
      version: '',
      corpus: '',
      annotation_tools: `ChordFinder`,
      annotation_rules: '',
      validation: '',
      data_source: `${annotationDataSource}`,
    },
    namespace: 'chord',
    data: '',
    sandbox: {
      description: `${annotationDescription}`,
    },
    time: 0,
    duration: null,
  };

  // Create the annotations.data
  let annotationsData = [];
  wavesurfer.markers.markers.forEach(marker => {
    const obs = {
      time: marker.time,
      duration: marker.duration,
      value: marker.mirLabel,
      confidence: null,
    };
    annotationsData.push(obs);
  });

  // Assign annotationsData value to the newAnnotation obj
  newAnnotation.data = annotationsData;

  return newAnnotation;
}

function _extractModalPromptFields() {
  const annotatorNameInput = document.getElementById('annotatorName');
  const annotationDataSourceInput = document.getElementById(
    'annotationDataSource'
  );
  const annotationDescriptionInput = document.getElementById(
    'annotationDescription'
  );

  const annotationDataSource = annotationDataSourceInput.value;
  const annotationDescription = annotationDescriptionInput.innerHTML;
  // ..setting some default values in cases of blank text input forms
  const annotatorName =
    annotatorNameInput.value !== '' ? annotatorNameInput.value : 'Anonymous';

  return [annotatorName, annotationDataSource, annotationDescription];
}

function _disableAnnotationListAndDeleteAnnotation() {
  annotationList.classList.add('disabled');
  deleteAnnotationBtn.classList.add('disabled');

  saveChordsBtn.classList.remove('disabled');
  cancelEditingBtn.classList.remove('disabled');

  console.log('123213 _disableAnnotationListAndDeleteAnnotation');
  document.querySelector('#toolbar').classList.add('editing-on');
  console.log(document.querySelector('#toolbar'));
}

function _disableSaveChordsAndCancelEditing() {
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

function _enableEditChordButtonFunction(selMarker) {
  console.log('selected marker:', selMarker);
  //  NOTE: marker-click event only trigger on span element click!

  // Color selected marker ONLY
  _setMarkerSpanColor(selMarker, lastSelectedMarker, MARKER_LABEL_SPAN_COLOR);

  lastSelectedMarker = selMarker;

  // Enable the editChordBtn
  this.classList.remove('disabled');
}

function _setMarkerSpanColor(selMarker, lastSelectedMarker, color) {
  const textSpan = selMarker.el.querySelector('.span-chord-text');
  const symbolSpan = selMarker.el.querySelector('.span-chord-symbol');

  textSpan.style.color = color;
  symbolSpan.style.color = color;

  if (lastSelectedMarker !== undefined) {
    if (selMarker !== lastSelectedMarker) {
      const lastTextSpan =
        lastSelectedMarker.el.querySelector('.span-chord-text');
      const lastSymbolSpan =
        lastSelectedMarker.el.querySelector('.span-chord-symbol');
      textSpan.style.color = color;
      symbolSpan.style.color = color;
      lastTextSpan.style.color = '';
      lastSymbolSpan.style.color = '';
    }
  } else {
    // first case scenario
    textSpan.style.color = color;
    symbolSpan.style.color = color;
  }
}

// - Modal Chord Editor
function showChordEditor() {
  // Set the flag to indicate that the modal is active
  isModalActive = true;

  console.log(lastSelectedMarker.symbolParts);
  chord.current.root = lastSelectedMarker.symbolParts.root;
  chord.current.accidental = lastSelectedMarker.symbolParts.accidental;
  chord.current.variation = lastSelectedMarker.symbolParts.variation;

  // Open chord editor indicating the last selected chord
  _colorizeTableSelections(chord.current);

  modalChordEditor.style.display = 'block';
  applyBtn.style.visibility = 'hidden';
}

function select(selection, component) {
  console.log('selected table element:', selection);
  console.log('last selected marker:', lastSelectedMarker);

  _updateChordVariable(selection, component);
  _colorizeTableSelections(chord.new);

  // Show Apply button if the current chord is different from the new one
  if (!areObjectsEqual(chord.new, chord.current)) {
    applyBtn.style.visibility = 'visible';
  } else {
    applyBtn.style.visibility = 'hidden';
  }
}

function closeModal() {
  modalChordEditor.style.display = 'none';
  isModalActive = false;
}

import tippy, { createSingleton, followCursor, animateFill } from 'tippy.js';
function createTooltipsChordEditor() {
  // Assigning a tooltip according to mapping (tippy step 1)
  tableElements.forEach(element => {
    let tooltip;

    const foundVariation = variations.find(variation => {
      if (variation.encoded === element.innerHTML.trim()) {
        return true;
      } else if (variation.encoded === element.textContent.trim()) {
        return true;
      }
    });

    if (foundVariation) {
      tooltip = foundVariation.description;
      // Use matchedDescription where needed
    } else {
      // Handle the case when no variation is found
      // console.log(`Not a matching variation found for ${element.innerHTML}`);
      tooltip = element.getAttribute('data-modal-tooltip');
    }

    // Add tippy ONLY if not already defined in HTML (1)
    if (!element.hasAttribute('data-modal-tooltip')) {
      element.setAttribute('data-modal-tooltip', tooltip);
    }
  });

  // Create a singleton: array of regular tippy instances (tippy step 2)
  const modalSingleton = createTippySingleton(
    '#chord-editor td',
    'data-modal-tooltip',
    MODAL_SINGLETON_PROPS
  );
}

/**
 * Colorizes table elements based on matching values from the `chordParts` object.
 * If an element's `innerHTML` matches any of the non-empty values in `chord.new.root`, `chord.new.accidental`, or `chord.new.variation`, the element is colored (according to config.js TABLE_SELECTION_COLOR).
 * Otherwise, the color of the element is reset to an empty string.
 */
function _colorizeTableSelections(chordParts) {
  tableElements.forEach(element => {
    const matchingChordPart = Object.values(chordParts).find(chordPart => {
      return chordPart !== '' && element.innerHTML.trim() === chordPart;
    });

    if (matchingChordPart) {
      element.style.color = TABLE_SELECTION_COLOR;
    } else {
      element.style.color = ''; // Reset color if no match is found
    }
  });
}

function _updateChordVariable(selection, component) {
  // Selected text in inner HTML format
  const selectedHTMLtext = selection.innerHTML.trim();

  // Checking conditions on trimmed like text with innerText & replace
  const selectedText = selection.innerText;
  const trimmedVariation = chord.new.variation.replace(/<[^>]+>/g, '');
  console.log('selectedText', selectedText);

  // Condition to uncheck all other cases except 'N.C.' & '??'
  if (selectedText === '??' || selectedText === 'N.C.') {
    chord.new.root = '';
    chord.new.accidental = '';
    chord.new.variation = selectedHTMLtext;
  } else {
    // Condition to uncheck N.C. or ?? when not selected
    if (trimmedVariation === '??' || trimmedVariation === 'N.C.') {
      chord.new.variation = '';
    } else {
      chord.new.variation = chord.new.variation;
    }
    // Otherwise assigning selections component
    chord.new[component] = selectedHTMLtext;
    // those 2 cases handles errors after '??' 'N.C.' for required fields
    chord.new.root = chord.new.root === '' ? 'C' : chord.new.root;
    chord.new.variation =
      chord.new.variation === '' ? '(M)' : chord.new.variation;
  }
}

function _mapChordSymbolToText(encodedChord) {
  let foundRootNote;
  let foundAccidental;

  // 1) Find shorthand according to the font mapping
  let foundShorthand;
  const matchingShorthand = variations.find(mappingEl => {
    return mappingEl.encoded === encodedChord.variation;
  });
  if (matchingShorthand) {
    // in the case of maj assign '' otherwise the encoded font
    foundShorthand = matchingShorthand.shorthand || '';
  }

  let column = ':';
  if (foundShorthand === 'N' || foundShorthand === 'X') {
    foundRootNote = '';
    foundAccidental = '';
    column = '';
  } else {
    // 1) Displayed root is same as root from MIREX format
    foundRootNote = encodedChord.root;

    // 2)Displayed accidental according to the font mapping
    foundAccidental;
    const matchingAccidental = accidentals.find(
      mappingEl => mappingEl.encoded === encodedChord.accidental
    );
    if (matchingAccidental) {
      foundAccidental = matchingAccidental.simplified || '';
    }
  }
  const mirLabel = `${foundRootNote}${foundAccidental}${column}${foundShorthand}`;

  return mirLabel;
}

export function renderModalMessage(message) {
  return new Promise((resolve, reject) => {
    // Set the flag to indicate that the modal is active
    isModalActive = true;

    const confirmationModal = document.getElementById('confirmationModal');
    const modalMessage = document.getElementById('modalMessage');
    modalMessage.innerHTML = message;

    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const cancelDeleteBtn = document.getElementById('cancelDelete');

    confirmDeleteBtn.addEventListener('click', function () {
      resolve(); // Resolve the promise
      confirmationModal.classList.remove('show');
      confirmationModal.style.display = 'none';
      isModalActive = false;
    });

    cancelDeleteBtn.addEventListener('click', function () {
      reject(); // Reject the promise
      confirmationModal.classList.remove('show');
      confirmationModal.style.display = 'none';
      isModalActive = false;
    });

    // Display the modal after attaching the event listeners
    confirmationModal.classList.add('show');
    confirmationModal.style.display = 'block';
  });
}

function renderModalPrompt(message, jamsFile) {
  return new Promise((resolve, reject) => {
    // Set the flag to indicate that the modal is active
    isModalActive = true;

    const modalPrompt = document.getElementById('modalPrompt');
    const modalPromptMessage = modalPrompt.querySelector('#modalPromptMessage');
    modalPromptMessage.innerHTML = message;

    modalPrompt.classList.add('show');
    modalPrompt.style.display = 'block';

    const savePromptBtn = document.getElementById('savePrompt');
    const replacePromptBtn = document.getElementById('replacePrompt');
    const closeModalBtn = document.querySelector('.modal-header .close');

    _updateModalPromptForms(jamsFile);

    savePromptBtn.addEventListener('click', function () {
      resolve('save'); // Resolve the promise with the value 'save'
      modalPrompt.classList.remove('show');
      modalPrompt.style.display = 'none';
      isModalActive = false;
    });

    replacePromptBtn.addEventListener('click', function () {
      resolve('replace'); // Resolve the promise with the value 'replace'
      modalPrompt.classList.remove('show');
      modalPrompt.style.display = 'none';
      isModalActive = false;
    });

    closeModalBtn.addEventListener('click', function () {
      reject(); // Reject the promise
      modalPrompt.classList.remove('show');
      modalPrompt.style.display = 'none';
      isModalActive = false;
    });
  });
}

function _updateModalPromptForms(jamsFile) {
  // Updating form fields with respective
  const annotatorNameInput = document.getElementById('annotatorName');
  const annotationDataSourceInput = document.getElementById(
    'annotationDataSource'
  );
  const annotationDescriptionInput = document.getElementById(
    'annotationDescription'
  );
  const annotationList = document.getElementById('annotation-list');

  // Currently selected/ displayed JAMS annotation
  const selected = jamsFile.annotations[annotationList.selectedIndex];

  annotatorNameInput.value = selected.annotation_metadata.curator.name;

  let dataSourceListSelected;
  if (selected.annotation_metadata.data_source === 'program') {
    dataSourceListSelected = 'user';
  } else {
    dataSourceListSelected = selected.annotation_metadata.data_source;
  }
  annotationDataSourceInput.value = dataSourceListSelected;

  annotationDescriptionInput.innerHTML = selected.sandbox.description;

  // check whether annotationDescriptionInput is empty or not
  if (annotationDescriptionInput.textContent.trim() === '') {
    annotationDescriptionInput.classList.add('placeholder-text');
  } else {
    annotationDescriptionInput.classList.remove('placeholder-text');
  }
}

// -  Snap Beats & Click Track

/**
 *
 * Snap on beats: snap cursor to beat position (=== region.start or marker.time)
 * (bcs of el. positioning "z-index" the effect needs to be triggered in 2 parts)
 *
 *  1st part - region (this is triggered inside toolbarAndEditingRelatedEvents())
 *  2nd part - marker (this is triggered inside updateMarkerDisplayWithColorizedRegions())
 *   *
 */
function triggerSnapOnBeats(startTime, event) {
  if (snapOnBeatsState) {
    event.stopPropagation();
    if (editState && wavesurfer.isPlaying()) {
      wavesurfer.seekTo(startTime / wavesurfer.getDuration());
    } else if (!editState) {
      wavesurfer.seekTo(startTime / wavesurfer.getDuration());
    } else {
      console.warn(
        'Snap on beats, is disabled on Edit Mode while audio is paused ⚠️ Enjoy editing!'
      );
    }
  }
}

// this is a special case event that needs to be assigned every time the list of markers change so it is called inside the updateMarkerDisplayWithColorizedRegions
export function addMarkerEventSnapOnBeats(marker) {
  if (marker.el.clickHandler) {
    marker.el.removeEventListener('click', marker.el.clickHandler);
  }

  // Define the new click handler
  marker.el.clickHandler = event => {
    console.log('Snap on beats marker click event occurred ⚠️');
    triggerSnapOnBeats(marker.time, event);
  };

  // Add the new click handler
  marker.el.addEventListener('click', marker.el.clickHandler);
}

function clickTrack() {
  if (!isWebAudioInitialized) {
    [audioContext, primaryGainControl] = _initWebAudio();
    console.log('🚀:', audioContext, '🚀:', primaryGainControl);
  }

  _clickSound(audioContext, primaryGainControl);
}

function _initWebAudio() {
  isWebAudioInitialized = true;

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
