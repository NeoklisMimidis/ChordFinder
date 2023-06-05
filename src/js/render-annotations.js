'use strict';

// Created wavesurfer instance from main.js
import { wavesurfer } from './main.js';

import {
  editState,
  annotationList,
  deleteAnnotationBtn,
  resetToolbar,
} from './edit-mode.js';

import { variations, accidentals, chordColor } from './components/mappings.js';
import { createTippySingleton } from './components/tooltips.js';
import { loadFile } from './components/utilities.js';

import {
  EDIT_MODE_ENABLED_STYLE,
  EDIT_MODE_DISABLED_STYLE,
  NEW_MARKER_STYLE,
  EDITED_MARKER_STYLE,
  MARKERS_SINGLETON_PROPS,
} from './config.js';

export let jamsFile;

export function loadJAMS(input) {
  console.log('loadJams() input:', input);

  const [fileUrl, file] = loadFile(input);
  // console.log(fileUrl, file);

  let annotatedChordsAtBeatsData;

  fetch(fileUrl)
    .then(response => response.json())
    .then(jams => {
      console.log(jams);
      jamsFile = jams;

      // Reset markers,regions & controls
      wavesurfer.clearMarkers();
      wavesurfer.clearRegions();
      resetToolbar();

      createAnnotationsList(jamsFile);

      // Render first annotation
      annotatedChordsAtBeatsData = selectedAnnotationData(jamsFile);
      renderAnnotations(annotatedChordsAtBeatsData);
    })
    .catch(error => {
      // Handle the error from any part of the promise chain
      console.error(error);
      throw new Error('Failed to fetch JAMS file');
    });

  // this check is helpful to avoid some tippy bugs (hanging tooltip) when loading a new annotation
  if (wavesurfer.markers.markers[0]) {
    wavesurfer.markers.markers[0].el.singleton.disable();
  }

  console.log('Loading JAMS has been successfully completed! ✌️');

  return [annotatedChordsAtBeatsData, jamsFile];
}

export function createAnnotationsList(jamsFile) {
  // Clear the existing options
  annotationList.innerHTML = '';

  jamsFile.annotations.forEach(annotation => {
    // Extract the JAMS annotations with namespace 'chord'
    if (annotation['namespace'] === 'chord') {
      const option = document.createElement('option');

      if (annotation.annotation_metadata.data_source === 'program') {
        option.text = '(automatic analysis)';
        // tooltip is the same as annotation_tools TODO
      } else if (annotation.annotation_metadata.data_source === 'user') {
        option.text = `Edit by ${annotation.annotation_metadata.curator.name}`;
      } else if (
        annotation.annotation_metadata.data_source === 'collaborative'
      ) {
        option.text = `Edit by ${annotation.annotation_metadata.curator.name}`;
        // tooltip is the same as ??? no idea TODO
      } else {
        console.error(
          `Not a valid JAMS 'data_source' in your namespace: 'chord' annotation file!`
        );
      }
      // Finally adding the option
      annotationList.add(option);
    } else {
      console.error(
        'Sorry currently only JAMS annotation with chord namespace are supported!'
      );
    }
  });
}

// Return the annotation data of the selected annotation
export function selectedAnnotationData(jamsFile) {
  if (annotationList.selectedIndex === 0) {
    deleteAnnotationBtn.classList.add('disabled');
  } else {
    deleteAnnotationBtn.classList.remove('disabled');
  }

  const annotationData =
    jamsFile.annotations[annotationList.selectedIndex].data;

  return annotationData;
}

/*
The JAMS format for annotation data comprises a list of observations. Each observation includes: time || duration || value || confidence
  */
export function renderAnnotations(annotationData) {
  console.log('Rendering annotations ...');
  // Add regions and markers to the waveform
  annotationData.forEach((obs, i) => {
    const startTime = obs.time;
    const endTime = obs.time + obs.duration;
    const chordLabel = obs.value;

    // LABELS
    // a) Add a NON-DRAGGABLE marker for the first observation with start time: 0.0 and respective chord label, or create one NON-DRAGGABLE marker with the 'N' label.
    if (i === 0) {
      let firstMarkerLabel;
      if (startTime !== 0) {
        // This will be the second marker bcs one more will be added before after that if statement (below)
        addMarkerAtTime(startTime, chordLabel);

        firstMarkerLabel = 'N';
      } else {
        firstMarkerLabel = chordLabel;
      }
      const firstMarker = addMarkerAtTime(0.0, firstMarkerLabel, 'new', false);
    } else {
      addMarkerAtTime(startTime, chordLabel);
    }
  });
  console.log('Markers have been successfully rendered! ✌️');

  updateMarkerDisplayWithColorizedRegions(true);
}

export function addMarkerAtTime(
  time,
  label,
  markerType = 'new',
  draggable = true,
  color = 'grey',
  position = 'top',
  preventContextMenu = true
) {
  const chordParts = _getChordParts(label);

  const marker = wavesurfer.addMarker({
    time: time,
    tooltip: '', // better tooltips with tippy.js!
    label: _simplifiedLabel(chordParts),
    draggable: draggable,
    markerElement: null,
    color: color,
    position: position,
    preventContextMenu: preventContextMenu, // prevents default right clicking menu
  });

  // Rendering label as chord symbol instead of text
  const markerLabel = marker.el.querySelector('.marker-label');
  const chordTextSpan = marker.el.querySelector('.marker-label span');
  const chordSymbolSpan = document.createElement('span');
  chordSymbolSpan.title = marker.tooltip;
  chordSymbolSpan.classList.add('svg-font');
  const [symbolLabel, symbolParts] = _mapChordTextToSymbol(chordParts);
  chordSymbolSpan.innerHTML = symbolLabel;
  marker.symbolParts = symbolParts;
  markerLabel.appendChild(chordSymbolSpan);

  chordSymbolSpan.classList.add('span-chord-symbol');
  chordTextSpan.classList.add('span-chord-text');

  // this will be separate toggle button TODO
  chordTextSpan.classList.add('d-none');
  // chordSymbolSpan.classList.add('d-none');

  // Add and store mir format label as a property (for colorizing reasons)
  marker.mirLabel = label;

  const markerLine = marker.el.querySelector('div:nth-child(1)');

  // Apply marker style depending on type
  if (markerType === 'new') {
    wavesurfer.util.style(markerLine, NEW_MARKER_STYLE);
  } else if (markerType === 'edited') {
    wavesurfer.util.style(markerLine, EDITED_MARKER_STYLE);
  } else if (markerType === 'replaced') {
    wavesurfer.util.style(markerLine, EDIT_MODE_ENABLED_STYLE);
  }

  // Store tooltip as an HTML element data attribute (tippy step 1)
  const tooltipContent = _createTooltipText(marker);
  marker.el.setAttribute('data-markers-tooltip', tooltipContent);

  return marker;
}

// CAREFUL:
// this function MUST be called every time a marker is dragged, added, removed!
export function updateMarkerDisplayWithColorizedRegions(editModeStyle = false) {
  // Object containing all created markers
  const markers = wavesurfer.markers.markers;
  // console.log('markers', markers);
  let prevChord = 'N';

  // Sort markers by using marker.time information
  markers.sort((a, b) => a.time - b.time);

  // Clear previous chord regions
  wavesurfer.clearRegions();

  // Create a singleton: array of regular tippy instances(tippy step 2)
  const markersSingleton = createTippySingleton(
    '.wavesurfer-marker',
    'data-markers-tooltip',
    MARKERS_SINGLETON_PROPS
  );

  // Disable tooltips to update them without bugs
  markersSingleton.disable();

  markers.forEach(function (marker, index) {
    // Set style on marker depending on edit state
    if (editModeStyle) {
      _setStyleOnMarker(marker, prevChord, index);
    }

    _hideRepeatedSVG(marker, prevChord);

    // Calculate duration & add/update the required property for each marker.
    _addDurationToMarker(marker, index, markers);

    // Add a REGION for each wavesurfer.marker
    _colorizeChordRegion(marker);

    prevChord = marker.mirLabel;
  });

  // Re-enable tooltips
  markersSingleton.enable();

  console.log('Chord regions have been successfully colorized! ✌️');
}

function _getChordParts(chordLabel) {
  let chordParts = {
    rootNote: '',
    accidental: '',
    shorthand: '',
    bassNote: '',
  };

  // Root is always the first letter
  if (chordLabel === 'N' || chordLabel === 'X') {
    chordParts.rootNote = '';
    chordParts.shorthand = chordLabel;
  } else {
    chordParts.rootNote = chordLabel.charAt(0);
  }

  if (chordParts.shorthand !== 'N' && chordParts.shorthand !== 'X') {
    const colonIndex = chordLabel.indexOf(':');
    // Accidental is after the first letter but before column (:)
    chordParts.accidental = chordLabel.substring(1, colonIndex) || '';
    // Shorthand & Bass note is the part after column (:)
    const afterColumn = chordLabel.substring(colonIndex + 1);
    // Shorthand is the part before forward slash (/)
    chordParts.shorthand = afterColumn.split('/')[0] || '';
    // Bass note is the part after forward slash (/)
    chordParts.bassNote = afterColumn.split('/')[1] || '';
  }
  return chordParts;
}

function _createTooltipText(marker) {
  const chordParts = _getChordParts(marker.mirLabel);
  const { rootNote, accidental, shorthand, bassNote } = chordParts;

  let tooltip;
  variations.forEach(el => {
    if (el.shorthand !== shorthand) return;
    tooltip = el.description || '';
  });

  tooltip = `🎶 ${rootNote}${accidental}  ${
    shorthand === 'maj' ? '' : ' '
  }${tooltip}${bassNote !== '' ? '/' + bassNote : ''} 🎶`;

  return tooltip;
}

/** 
   * Replace the 14 shorthands used in the Tetrads vocabulary of the Audio Chord Estimation task with simpler ones according to the matching in mapping.js. 
   *
   * Tetrads vocabulary: min, maj, min7, maj7, minmaj7, 7, 
  sus2, sus4, min6, maj6, dim, aug, dim7, hdim7
   * 
   * {string  Root Accidental (# or b) : Shorthand / bass note}   * 
   * e.g. C#:maj/3
   * 
   * @returns string displayedLabel
   */

function _simplifiedLabel(chordParts) {
  const { rootNote, accidental, shorthand, bassNote } = chordParts;

  const matchingEl = variations.find(
    mappingEl => mappingEl.shorthand === shorthand
  );

  const bassNoteWithSlash = bassNote !== '' ? '/' + bassNote : '';

  const displayedLabel = `${rootNote}${accidental}${
    shorthand === 'maj' ? '' : ' '
  }${matchingEl.simplified}${bassNoteWithSlash}`;

  return displayedLabel;
}

/**
 * Map MIREX chord format to Genius Jam Tracks font symbol display
 *
 * @param {*} label
 *
 * @return formatted innerHTML for symbol display (font) based on label and the symbol parts
 */
function _mapChordTextToSymbol(chordParts) {
  const { rootNote, accidental, shorthand, bassNote } = chordParts;

  // 1)Displayed root is same as root from MIREX format
  const displayedRootNote = rootNote;

  // 2)Displayed accidental according to the font mapping
  let displayedAccidental;
  const matchingAccidental = accidentals.find(
    mappingEl => mappingEl.simplified === accidental
  );
  if (matchingAccidental) {
    displayedAccidental = matchingAccidental.encoded || '';
  }

  // 3)Displayed shorthand according to the font mapping
  let displayedShorthand;
  const matchingShorthand = variations.find(
    mappingEl => mappingEl.shorthand === shorthand
  );
  if (matchingShorthand) {
    // in the case of maj assign '' otherwise the encoded font
    displayedShorthand =
      shorthand === 'maj' ? '' : matchingShorthand.encoded || '';
  }

  // 4)Displayed bass note plus adding a forward slash in front
  const bassNoteWithSlash = bassNote !== '' ? '/' + bassNote : '';
  const displayedBassNote = `<text id="disable-font-label">${bassNoteWithSlash}</text>`;

  // ..and finally the encoded innerHTML for symbol display on top of markers
  const encodedFontSymbol = `${displayedRootNote}${displayedAccidental}${
    shorthand === 'maj' ? '' : ' '
  }${displayedShorthand}${displayedBassNote}`;

  // .. and the parts separate for other use cases
  const symbolParts = {
    root: displayedRootNote,
    accidental: displayedAccidental,
    variation: matchingShorthand.encoded,
    inversion: displayedBassNote,
  };

  return [encodedFontSymbol, symbolParts];
}

/*
 * Set style on markers depending on edit state
 *
 * This function sets the style of Wavesurfer markers based on whether edit mode is enabled, hiding repeated chord labels in normal mode, and disabling dragging in normal mode. The "None" chord label is only visible in edit mode.
 *
 */

function _setStyleOnMarker(marker, prevChord, index) {
  // a) Style marker line depending on edit state
  const markerLine = marker.el.querySelector('div:nth-child(1)');
  if (index === 0) {
    markerLine.style.width = '0px';
  } else {
    wavesurfer.util.style(
      markerLine,
      editState ? EDIT_MODE_ENABLED_STYLE : EDIT_MODE_DISABLED_STYLE
    );
  }

  // b) Enable/disable dragging of marker depending on edit state
  const markerLabel = marker.el.querySelector('.marker-label');
  if (index === 0) {
    markerLabel.style.marginLeft = '4px';
  }
  wavesurfer.util.style(markerLabel, {
    pointerEvents: editState ? '' : 'none',
  });

  // c) Hide marker-labels depending on edit mode state
  const chordTextSpan = marker.el.querySelector('.span-chord-text');
  const chordSymbolSpan = marker.el.querySelector('.span-chord-symbol');

  const chordLabel = marker.mirLabel;
  if (chordLabel === 'N') {
    // Handle the No chord 'N' case || only visible on edit
    if (editState) {
      {
        chordTextSpan.classList.remove('invisible-up');
        chordSymbolSpan.classList.remove('invisible-up');
      }
    } else {
      chordTextSpan.classList.add('invisible-up');
      chordSymbolSpan.classList.add('invisible-up');
    }
  }

  if (chordLabel === 'N') return;
  if (chordLabel === prevChord) {
    // add class ONLY if satisfying Element doesn't contain it
    if (!chordTextSpan.classList.contains('invisible-up')) {
      chordTextSpan.classList.toggle('invisible-up');
      chordSymbolSpan.classList.toggle('invisible-up');
    }

    // 1st option (display labels & tooltip on edit)
    if (editState) {
      chordTextSpan.classList.toggle('invisible-up');
      chordSymbolSpan.classList.toggle('invisible-up');
    }

    // // 2nd option (display ONLY tooltip on edit) // don't like probably remove
    // chordTextSpan.style.opacity = 0;
    // chordSymbolSpan.style.opacity = 0;
  }
}

function _hideRepeatedSVG(marker, prevChord) {
  const chordLabel = marker.mirLabel;

  const markerLabelSvg = marker.el.querySelector('.marker-label svg');
  if (chordLabel === prevChord || marker.time === 0) {
    markerLabelSvg.classList.add('hidden');
  } else {
    markerLabelSvg.classList.remove('hidden');
  }
}

function _addDurationToMarker(marker, index, markers) {
  const currentMarkerTime = marker.time;
  const nextMarkerTime =
    index === markers.length - 1 // check if it is last marker - condition
      ? wavesurfer.getDuration() // last marker case - if true
      : markers[index + 1].time; // next marker time -if false

  const duration = nextMarkerTime - currentMarkerTime;

  // round a number to three decimal places //  needs testing because sometimes it leads BUGs with less decimals
  marker.duration = Math.round(duration * 1000) / 1000;
}

function _colorizeChordRegion(marker) {
  // Add a REGION for each wavesurfer.marker
  wavesurfer.addRegion({
    start: marker.time,
    end: marker.time + marker.duration,
    data: {
      mirex_chord: marker.mirLabel,
      displayed_chord: marker.label,
    },
    // color: _getChordColor(marker.mirLabel) || 'transparent', // returns color depending on chord root note
    color: _getChordColor(marker.mirLabel) || 'rgba(255, 0, 0, 0.9)', // else(||) case useful, to find unmatched labels
    loop: false,
    drag: false,
    resize: false,
  });
}

function _getChordColor(chordLabel) {
  const { rootNote, accidental } = _getChordParts(chordLabel);
  // Get root with accidental (or 'X' , 'N' cases)
  const rootWithAccidental = rootNote + accidental || chordLabel;

  // Get color as assigned in chordColor mapping
  const matchedRootWithAccidental = Object.keys(chordColor).find(
    noteMatch => rootWithAccidental === noteMatch
  );

  return chordColor[matchedRootWithAccidental];
}
