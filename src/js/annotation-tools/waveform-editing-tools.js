// Created wavesurfer instance from audio-player.js
import { wavesurfer } from '../audio-player.js';
import {
  addMarkerAtTime,
  updateMarkerDisplayWithColorizedRegions,
  tooltips,
} from '../render-annotations.js';

import {
  _disableAnnotationListAndDeleteAnnotation,
  toolbarStates,
} from '../annotation-tools.js';

import { EDITED_MARKER_STYLE } from '../config.js';

import { renderModalMessage } from '../components/utilities.js';

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

// - Functions for editing annotation with waveform interaction events
function addBeatAndChord(region) {
  console.log(`Region start: ${region.start} || Region end:${region.end}
    Current time: ${wavesurfer.getCurrentTime()}`);

  // Only add markers in the case where edit mode is activated and audio is not playing
  if (!toolbarStates.EDIT_MODE || wavesurfer.isPlaying()) return;

  _disableAnnotationListAndDeleteAnnotation();

  const startingBeatChord = region.data['mirex_chord']; // get the chord assigned
  const currentTimePosition = wavesurfer.getCurrentTime();

  addMarkerAtTime(currentTimePosition, startingBeatChord);

  updateMarkerDisplayWithColorizedRegions();
}

function editBeat(marker) {
  if (marker.time === 0) return;
  console.log('dragged!!!', marker);

  // disable tooltips to avoid some bugs
  tooltips.markersSingleton.disable();

  _disableAnnotationListAndDeleteAnnotation();

  // add color to edited marker line
  const markerLine = marker.elLine;
  wavesurfer.util.style(markerLine, EDITED_MARKER_STYLE);
}

function editBeatTiming(marker) {
  console.log('dropped!!!');

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
  tooltips.markersSingleton.disable();

  const markerTime = marker.time;
  const roundedMarkerTime = Math.round(markerTime * 100) / 100;

  const message = `You are about to delete the marker at <span class="text-warning">${roundedMarkerTime}</span> seconds<br>with label <span class="text-primary">${marker.label}</span>❗<br><br><span class="text-info">Are you sure?</span> 🤷‍♂️`;

  renderModalMessage(message)
    .then(() => {
      // User confirmed deletion

      wavesurfer.markers.remove(marker);
      _disableAnnotationListAndDeleteAnnotation();

      updateMarkerDisplayWithColorizedRegions();
    })
    .catch(() => {
      // User canceled deletion
      // enable tooltips here (don't need to call updateMarkerDisplayWithColorizedRegions which also enables them -- avoid unnecessary calculations)
      tooltips.markersSingleton.enable();
    });
}
