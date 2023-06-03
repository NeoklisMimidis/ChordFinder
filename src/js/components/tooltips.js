// Creating beautiful tooltips!
import tippy, { createSingleton, followCursor, animateFill } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import 'tippy.js/themes/light-border.css';
import 'tippy.js/themes/material.css';
import 'tippy.js/themes/translucent.css';
import 'tippy.js/animations/scale-subtle.css';

import 'tippy.js/dist/backdrop.css';
import 'tippy.js/animations/shift-away.css';

const leftEditControlsContent = `'Snap (beats)' ensures precise cursor placement on analyzed beat positions. In Edit mode, Snap (beats) is disabled to facilitate editing. 'Click track' generates audible beats, aiding rhythm comprehension and beat verification. While activated, beat duration is visually highlighted.`;
tippy('#left-edit-controls', {
  content: leftEditControlsContent,
  delay: [1500, 250],
  hideOnClick: false,
  theme: 'translucent',
  placement: 'left',
  arrow: true,
  interactive: true,
  animateFill: true,
  plugins: [animateFill],
});

const centerEditControlsContent =
  'The annotation list allows you to select which annotations are displayed, including the ability to create new annotations during editing. Deleting annotations is possible, except for the original (automatic analysis). Lastly, the Edit toggle enables switching to Edit mode for modifying the selected annotation';
tippy('#center-edit-controls', {
  content: centerEditControlsContent,
  delay: [1500, 250],
  hideOnClick: false,
  theme: 'translucent',
  // theme: 'light-border',
  // placement: 'right-start',
  placement: 'top',
  arrow: true,
  interactive: true,
  animateFill: true,
  plugins: [animateFill],
});

const editModeControlsContent =
  'Edit Mode Chord allows modifying the selected chord, Save Chord stores changes made, and Cancel reverts back without altering. Customize and manage your chord edits with ease.';
tippy('#edit-mode-controls', {
  content: editModeControlsContent,
  delay: [1500, 350],
  hideOnClick: false,
  theme: 'translucent',
  // theme: 'light-border',
  // placement: 'right-start',
  placement: 'top',
  arrow: true,
  interactive: true,
  animateFill: true,
  plugins: [animateFill],
});

const questionContent =
  'The waveform showcases markers, vertical lines indicating musical information such as beat timings. Each marker features a label displaying the respective chord symbol, with hidden duplicates for a cleaner display. Hover over the labels to reveal chord names. Lastly, colorized regions between markers correspond to root notes, enhancing visual recognition and differentiation';
tippy('.fa-circle-question', {
  content: questionContent,
  delay: [500, 100],
  hideOnClick: false,
  theme: 'translucent',
  placement: 'right',
  arrow: true,
  interactive: true,
  animateFill: true,
  plugins: [animateFill],
});

const infoContent =
  'In Edit mode, you gain extra functionality. Easily drag markers (representing beats and chords) to fine-tune beat timing. Right-click to remove a selected marker, or simply double-click on the waveform to add a new marker at the desired position. Take control and enhance the accuracy of the automatic analysis effortlessly.';
tippy('.fa-circle-info', {
  content: infoContent,
  delay: [500, 100],
  hideOnClick: false,
  theme: 'translucent',
  placement: 'right',
  arrow: true,
  interactive: true,
  animateFill: true,
  plugins: [animateFill],
});

const audioInputOutputControlsContent = `Open the side panel to access various actions. Import audio by selecting a file through the 'Import audio' button or by dragging and dropping it onto the waveform. Initiate a new analysis using the 'Analyze' button. Finally, download all modified annotations, including the original annotation, for the corresponding file.`;
tippy('#main-view-corner', {
  content: audioInputOutputControlsContent,
  delay: [800, 250],
  hideOnClick: false,
  theme: 'translucent',
  // theme: 'light-border',
  // placement: 'right-start',
  placement: 'bottom-end',
  arrow: true,
  interactive: true,
  animateFill: true,
  plugins: [animateFill],
});

// - Singleton utility function for the creation of multiple tooltips
/**
 * The createTippySingleton function generates a unique Tippy tooltip (singleton) instance for the provided selector, managing existing instances and creating new ones. It sets the content of each individual instance within the singleton based on an HTML attribute, and stores the singleton array in each element.
 *
 * @param {
 * selector, tooltipDataAttribute
 * }
 * @returns singleton
 */

export function createTippySingleton(selector, tooltipDataAttribute, props) {
  let singleton;

  const nodeList = document.querySelectorAll(selector);
  const element = nodeList[0];

  // Check if there are already tippy instances
  if (!element._tippy) {
    singleton = createSingleton(tippy(selector), props);
  } else {
    singleton = element.singleton;
  }

  // Destroy previous tippy instances (because setInstances doesn't)
  singleton.props.triggerTarget.forEach(el => {
    el._tippy.destroy();
  });

  // Create new tippy instances
  const newTippyInstances = tippy(selector);
  singleton.setInstances(newTippyInstances);

  // Add tooltip content & store the singleton array in each element
  singleton.props.triggerTarget.forEach(el => {
    const tooltip = el.getAttribute(tooltipDataAttribute);
    el._tippy.setContent(tooltip);
    el.singleton = singleton;
  });

  return singleton;
}
