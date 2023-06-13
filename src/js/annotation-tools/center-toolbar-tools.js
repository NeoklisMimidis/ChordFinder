// Created wavesurfer instance from audio-player.js
import { wavesurfer } from '../audio-player.js';
import {
  jamsFile,
  renderAnnotations,
  selectedAnnotationData,
  updateMarkerDisplayWithColorizedRegions,
  tooltips,
} from '../render-annotations.js';

import {
  renderModalMessage,
  createToggle,
  resetToggle,
} from '../components/utilities.js';

import { toolbarStates } from '../annotation-tools.js';

/* Elements */
//  Center controls
export const annotationList = document.getElementById('annotation-list');
export const deleteAnnotationBtn = document.querySelector(
  '#delete-annotation-btn'
);
const toggleEditBtn = document.querySelector('#toggle-edit-btn');
// Right controls & related Edit Mode Controls(Editing)
const editModeTools = document.querySelector('#right-toolbar-controls');
const audioFileName = document.querySelector('#audio-file-name');

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
  let [editModeState, _, __] = createToggle('#toggle-edit-btn');
  toolbarStates.EDIT_MODE = editModeState;
  console.log(
    `Edit ${toolbarStates.EDIT_MODE ? 'enabled! Have fun 😜!' : '..disabled'} `
  );

  // zoom once in or out when entering edit mode
  wavesurfer.zoom(
    toolbarStates.EDIT_MODE
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

  // Tippy (tooltips) related functionality
  const questionIcon = document.querySelector('.fa-circle-question');
  const infoIcon = document.querySelector('.fa-circle-info');
  if (toolbarStates.EDIT_MODE) {
    editModeTools.classList.remove('pointer-events-disabled');
    questionIcon.classList.add('d-none');
    infoIcon.classList.remove('d-none');
    tooltips.regions[0].disable(); //disable region tooltips while on edit mode (markers tooltip are still there)
  } else {
    editModeTools.classList.add('pointer-events-disabled');
    questionIcon.classList.remove('d-none');
    infoIcon.classList.add('d-none');
    tooltips.regions[0].enable();
  }
}

// - 'Annotation list' and 'Edit' mode toggle switch
/**
 *  [Annotation drop down list & Delete] Change displayed annotation or delete selected
 */
export function setupAnnotationListEvents() {
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
}

/**
 *  [Edit] Grants access to Edit mode and a set of tools designed for modifying selected annotations.
 */
export function setupToggleEditEvent() {
  toggleEditBtn.addEventListener('click', toggleEdit);
}

// -
export function resetToolbar() {
  // hide preface annotation bar(help + audio file name)
  document.querySelector('.preface-annotation-bar').classList.add('d-none');

  document.querySelector('#toolbar').classList.remove('d-none');

  // enable other edit related options
  document.querySelector('#left-toolbar-controls').classList.remove('d-none');
  document.querySelector('#center-toolbar-controls').classList.remove('d-none');
  document.querySelector('#info-question').classList.remove('d-none');

  // Left controls
  resetToggle('#toggle-SnapOnBeats-btn');
  resetToggle('#toggle-clickTrack-btn');

  // Middle controls
  toolbarStates.EDIT_MODE = false; // this will affect the rendering of the new annotation with updateMarkerDisplayWithColorizedRegions()
  toolbarStates.SNAP_ON_BEATS = false;
  toolbarStates.CLICK_TRACK = false;
  console.log(toolbarStates);
  annotationList.classList.remove('disabled');
  resetToggle('#toggle-edit-btn');

  // Right controls (Edit mode controls)
  audioFileName.classList.remove('d-none');
  editModeTools.querySelectorAll('.btn-edit-mode').forEach(button => {
    button.classList.add('d-none');
    button.classList.add('disabled');
  });

  // enable download again
  document.querySelector('#download-jams-btn').classList.remove('disabled');

  // removing editing color
  document.querySelector('#toolbar').classList.remove('editing-on');

  // display bpm, prev chord, next chord
  document.querySelector('#waveform-bpm').classList.remove('d-none');

  // TODO In progress
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
