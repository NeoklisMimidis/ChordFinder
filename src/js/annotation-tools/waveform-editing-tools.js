// Created wavesurfer instance from audio-player.js
import { wavesurfer } from '../audio-player.js';
import {
  addMarkerAtTime,
  updateMarkerDisplayWithColorizedRegions,
  delegateInstance,
} from '../render-annotations.js';

import { _disableAnnotationListAndDeleteAnnotation } from '../edit-mode.js';

import { editModeState } from './center-toolbar-tools.js';

import { EDITED_MARKER_STYLE } from '../config.js';

import { renderModalMessage } from '../components/utilities.js';

/* Elements */

//  Center controls
export const annotationList = document.getElementById('annotation-list');
export const deleteAnnotationBtn = document.querySelector(
  '#delete-annotation-btn'
);
export const toggleEditBtn = document.querySelector('#toggle-edit-btn');
// Right controls & related Edit Mode Controls(Editing)
const saveChordsBtn = document.querySelector('#save-chords-btn');
const cancelEditingBtn = document.querySelector('#cancel-editing-btn');

// - Edit mode controls
function addBeatAndChord(region) {
  console.log(`Region start: ${region.start} || Region end:${region.end}
    Current time: ${wavesurfer.getCurrentTime()}`);

  console.log(region);

  // Only add markers in the case where edit mode is activated and audio is not playing
  if (!editModeState || wavesurfer.isPlaying()) return;

  // // disable tooltips to avoid some bugs
  // region.delegateInstance[0].disable();
  // region.element.singleton.disable();

  // console.log(wavesurfer.markers.markers[0].delegateInstance[0]);
  // wavesurfer.markers.markers[0].delegateInstance[0].disable();

  console.log(delegateInstance);
  delegateInstance.disable();

  _disableAnnotationListAndDeleteAnnotation();

  const startingBeatChord = region.data['mirex_chord']; // get the chord assigned
  const currentTimePosition = wavesurfer.getCurrentTime();

  addMarkerAtTime(currentTimePosition, startingBeatChord);

  updateMarkerDisplayWithColorizedRegions();
}

function editBeat(marker) {
  if (marker.time === 0) return;
  console.log('dragged!!!', marker);

  wavesurfer.markers.markers[0].delegateInstance[0].disable();
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

  const markerTime = marker.time;
  const roundedMarkerTime = Math.round(markerTime * 100) / 100;

  const message = `You are about to delete the marker at <span class="text-warning">${roundedMarkerTime}</span> seconds<br>with label <span class="text-primary">${marker.label}</span>❗<br><br><span class="text-info">Are you sure?</span> 🤷‍♂️`;

  renderModalMessage(message)
    .then(() => {
      // User confirmed deletion
      deleteMarker(marker);
    })
    .catch(() => {
      // // User canceled deletion
    });
}

function deleteMarker(marker) {
  wavesurfer.markers.remove(marker);
  // disableAnnotationList();
  _disableAnnotationListAndDeleteAnnotation();

  // Update chord regions
  updateMarkerDisplayWithColorizedRegions();
}

// - Annotation tools (waveform)

/**
 *  {waveform double click} Add beat at position (AND chord SAME as previous chord)
 */
export function setupAddBeatAndChordEvent() {
  //
  wavesurfer.on('region-dblclick', addBeatAndChord);
}

/**
 *  {waveform marker drag} Modify beat timing
 */
export function setupEditBeatTimingEvents() {
  wavesurfer.on('marker-drag', function (marker, e) {
    editBeat(marker, e);
  }); // used for styling
  wavesurfer.on('marker-drop', editBeatTiming); // changes the beat
}

/**
 *  {waveform marker right click} Remove marker (== remove chord AND beat at position)
 */
export function setupRemoveBeatAndChordEvent() {
  wavesurfer.on('marker-contextmenu', removeBeatAndChord);
}
