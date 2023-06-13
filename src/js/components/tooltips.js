// Creating beautiful tooltips!
import tippy, {
  createSingleton,
  delegate,
  followCursor,
  getReferenceClientRect,
  animateFill,
  inlinePositioning,
  sticky,
} from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import 'tippy.js/themes/light-border.css';
import 'tippy.js/themes/material.css';
import 'tippy.js/themes/translucent.css';
import 'tippy.js/animations/scale-subtle.css';

import 'tippy.js/dist/backdrop.css';
import 'tippy.js/animations/shift-away.css';

import { variations } from './mappings.js';

//  Set some default props for all instances
tippy.setDefaultProps({
  allowHTML: true,
  // delay: [1500, 250], // TODO FIX
  hideOnClick: false,
  // animateFill removes arrow BUG
  // animateFill: true,
  // plugins: [animateFill],
  onShow: function (instance) {
    // Get the tooltip element
    const tooltip = instance.popper.querySelector('.tippy-content');
    // Apply text selection behavior to the tooltip content
    tooltip.style.userSelect = 'text';
    tooltip.style.textAlign = 'justify';
  },
});

// - Toolbar tooltips
const leftToolbarControls = `<strong>Snap(beats)</strong> ensures precise cursor placement on analyzed beat positions. In <span class="text-warning">Edit mode</span>, Snap (beats) is disabled when audio pauses, to facilitate editing.<br><strong>Click track</strong> generates audible beats, aiding rhythm comprehension and beat verification. While activated, beat duration is visually highlighted.`;
tippy('#left-toolbar-controls', {
  content: leftToolbarControls,
  theme: 'translucent',
  placement: 'left-end',
  maxWidth: '400px',
  interactive: true,
});

const centerToolbarControls = `The <strong>annotation list</strong> allows you to select which annotations are displayed, including the ability to create new annotations during <span style="font-style: italic; text-decoration: underline;">editing</span>. Deletion of annotations is possible through the <strong>delete</strong> , except for the original (automatic analysis).<br><strong>Edit</strong>  grants access to <span class="text-warning">Edit mode</span> and a set of tools designed for modifying selected annotations.`;

tippy('#center-toolbar-controls', {
  content: centerToolbarControls,
  theme: 'translucent',
  // theme: 'light-border',
  // placement: 'right-start',
  placement: 'top',
  arrow: true,
  maxWidth: '450px',
  interactive: true,
});

const rightToolbarControls = `<strong>Edit chord</strong> allows modifying the selected chord.<br><strong>Save chords</strong> stores changes made  either as separate or replaced annotation (except original annotation)<br><strong>Cancel</strong> reverts back without altering.<br><span style="font-style: italic;">Customize and manage your chord edits with ease.</span>`;
tippy('#right-toolbar-controls', {
  content: rightToolbarControls,
  theme: 'translucent',
  // theme: 'light-border',
  // placement: 'right-start',
  placement: 'top-end',
  maxWidth: '400px',
  interactive: true,
});

const questionContent =
  'The <strong>waveform</strong> showcases <span style="text-decoration: underline;">markers</span>, vertical lines indicating musical information such as <span style="font-style: italic; text-decoration: underline;">beat timings</span>. Each marker features a label displaying the respective <span style="font-style: italic; text-decoration: underline;">chord symbol</span>, with hidden duplicates for a cleaner display. Colorized regions between markers correspond to root notes, enhancing visual recognition and differentiation.<br><span style="font-style: italic;">Hover on a region to reveal the complete chord name.</span>';
tippy('.fa-circle-question', {
  content: questionContent,
  delay: [500, 100],
  maxWidth: '350px',
  offset: [50, 10],
  theme: 'translucent',
  placement: 'right-end',
  interactive: true,
});

const infoContent =
  'In <span class="text-warning">Edit mode</span>, you gain extra functionality. Easily <span style="font-weight: bold; text-decoration: underline;">drag</span> markers (representing beats and chords) to fine-tune beat timing. <br><span style="font-weight: bold; text-decoration: underline;">Right-click</span> to remove the selected marker, or simply <span style="font-weight: bold; text-decoration: underline;">double-click</span> on the waveform to add a new marker at the desired position.<br>You can hover on a label to reveal additional metrics.<br><span style="font-style: italic;">Take control and enhance the accuracy of the automatic analysis effortlessly.</span>';
tippy('.fa-circle-info', {
  content: infoContent,
  delay: [500, 100],
  theme: 'translucent',
  placement: 'right-end',
  interactive: true,
});

// - Audio player tooltips
// Zoom in/out
tippy('.fa-magnifying-glass-plus', {
  content: 'Zoom in (+)',
  delay: [0, 0],
  // theme: 'translucent',
  placement: 'top',
  arrow: false,
  offset: [0, 21],
  onShow: function (instance) {
    const tooltip = instance.popper.querySelector('.tippy-content');
    tooltip.style.fontSize = '12px';
  },
});
tippy('.fa-magnifying-glass-minus', {
  content: 'Zoom out (-)',
  delay: [0, 0],
  // theme: 'translucent',
  placement: 'top',
  arrow: false,
  offset: [0, 21],
  onShow: function (instance) {
    const tooltip = instance.popper.querySelector('.tippy-content');
    tooltip.style.fontSize = '12px';
  },
});

// Stop || Play/Pause || Mute/Unmute
tippy('.fa-backward-step', {
  content: 'Stop (0)',
  delay: [0, 0],
  // theme: 'translucent',
  placement: 'top',
  arrow: false,
  offset: [0, 30],
  onShow: function (instance) {
    const tooltip = instance.popper.querySelector('.tippy-content');
    tooltip.style.fontSize = '12px';
  },
});
tippy('.fa-play', {
  content: 'Play (space)',
  delay: [0, 0],
  // theme: 'translucent',
  placement: 'top',
  arrow: false,
  offset: [0, 30],
  onShow: function (instance) {
    const tooltip = instance.popper.querySelector('.tippy-content');
    tooltip.style.fontSize = '12px';
  },
});
tippy('.fa-pause', {
  content: 'Pause (space)',
  delay: [0, 0],
  // theme: 'translucent',
  placement: 'top',
  arrow: false,
  offset: [0, 30],
  onShow: function (instance) {
    const tooltip = instance.popper.querySelector('.tippy-content');
    tooltip.style.fontSize = '12px';
  },
});
tippy('.fa-backward', {
  content: 'Backwards 5s (←)',
  delay: [0, 0],
  // theme: 'translucent',
  placement: 'top',
  arrow: false,
  offset: [0, 30],
  onShow: function (instance) {
    const tooltip = instance.popper.querySelector('.tippy-content');
    tooltip.style.fontSize = '12px';
  },
});
tippy('.fa-forward', {
  content: 'Forward 5s (→)',
  delay: [0, 0],
  // theme: 'translucent',
  placement: 'top',
  arrow: false,
  offset: [0, 30],
  onShow: function (instance) {
    const tooltip = instance.popper.querySelector('.tippy-content');
    tooltip.style.fontSize = '12px';
  },
});

tippy('.fa-volume-high', {
  content: 'Mute (m)',
  delay: [0, 0],
  // theme: 'translucent',
  placement: 'top',
  arrow: false,
  offset: [0, 30],
  onShow: function (instance) {
    const tooltip = instance.popper.querySelector('.tippy-content');
    tooltip.style.fontSize = '12px';
  },
});
tippy('.fa-volume-xmark', {
  content: 'Unmute (m)',
  delay: [0, 0],
  // theme: 'translucent',
  placement: 'top',
  arrow: false,
  offset: [0, 30],
  onShow: function (instance) {
    const tooltip = instance.popper.querySelector('.tippy-content');
    tooltip.style.fontSize = '12px';
  },
});

tippy('.fa-circle', {
  content: 'Enable recording (r)',
  delay: [0, 0],
  // theme: 'translucent',
  placement: 'top',
  arrow: false,
  offset: [0, 30],
  onShow: function (instance) {
    const tooltip = instance.popper.querySelector('.tippy-content');
    tooltip.style.fontSize = '12px';
  },
});

tippy('.fa-repeat', {
  content: 'Enable loop (l)',
  delay: [0, 0],
  // theme: 'translucent',
  placement: 'top',
  arrow: false,
  offset: [0, 30],
  onShow: function (instance) {
    const tooltip = instance.popper.querySelector('.tippy-content');
    tooltip.style.fontSize = '12px';
  },
});

// Volume slider
tippy('.volume-slider', {
  content: 'Volume (↑) (↓)',
  delay: [0, 0],
  // theme: 'translucent',
  placement: 'top',
  arrow: false,
  offset: [0, 30],
  onShow: function (instance) {
    const tooltip = instance.popper.querySelector('.tippy-content');
    tooltip.style.fontSize = '12px';
  },
});

// - Sidebar (Audio I/O Controls)
const audioSidebarText = `<span style="font-style: italic;">Open the side panel to access various actions.</span><br><strong>Import Audio:</strong> Select a file from your computer or effortlessly <strong>drag and drop</strong> it into the designated space on the left.<br><strong>Analyze</strong>: Initiate a new analysis from the server or select an annotation file (JAMS) from your computer.<br><strong>Download:</strong> Retrieve all modified annotations, including the original annotation, for the corresponding file.`;
tippy('#audio-sidebar-text', {
  content: audioSidebarText,
  delay: [400, 100],
  placement: 'bottom',
  followCursor: 'horizontal',
  plugins: [followCursor],
  interactive: true,
  // for some reason some default params don't work on this one so re-apply
  onShow: function (instance) {
    // Get the tooltip element
    const tooltip = instance.popper.querySelector('.tippy-content');
    // Apply text selection behavior to the tooltip content
    tooltip.style.userSelect = 'text';
    tooltip.style.textAlign = 'justify';
    tooltip.style.fontFamily = 'Verdana, Manrope, Great Vibes, sans-serif';
  },
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
    el.singleton = singleton; // Storing the Tippy.js singleton instance to every element part of the singleton.
  });

  return singleton;
}

function createTooltipsChordEditor() {
  const tableElements = document.querySelectorAll('#chord-editor td');
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

// - Singletons styling

const MODAL_SINGLETON_PROPS = {
  delay: [500, 350],
  moveTransition: 'transform 0.25s ease-out',
  hideOnClick: false,
};

/* Chord Editor Modal related events: */
createTooltipsChordEditor(); // (This is not actually an event! It assigns the tooltips in the table)

// Tippy tooltips styling
export const MARKERS_SINGLETON_PROPS = {
  delay: [500, 100],
  moveTransition: 'transform 0.2s ease-out',
  hideOnClick: false,
  placement: 'left-start',
  arrow: false,
  offset: [0, -5],
  animation: 'scale-subtle',
  theme: 'custom',
  onShow: function (instance) {
    // Get the tooltip element
    const tooltip = instance.popper.querySelector('.tippy-content');
    // Apply text selection behavior to the tooltip content
    tooltip.style.userSelect = 'none';
  },
};

// NOTE markers singleton is initialized (or updated) in render-annotations every time a new marker is created

// - Delegate instances styling
// export const MARKERS_DELEGATE_PROPS = {
//   placement: 'right-start',
//   maxWidth: '180px',
//   animation: 'scale-subtle',
//   content: reference => reference.getAttribute('data-tooltip'),
//   arrow: false,
//   delay: [150, 0],
//   duration: [100, 0],
// };

export const REGIONS_DELEGATE_PROPS = {
  placement: 'top',
  animation: 'none',
  delay: [0, 0],
  duration: [0, 0],
  followCursor: 'horizontal',
  plugins: [followCursor],
};

export function initDelegateInstance(parentEl, targetEl, props) {
  const delegateInstance = delegate(parentEl, {
    target: targetEl,
    content: reference => reference.getAttribute('data-tooltip'),
    theme: 'custom',
    hideOnClick: false,
    moveTransition: 0,
    allowHTML: true,
    onShow: function (instance) {
      // Get the tooltip element
      const tooltip = instance.popper.querySelector('.tippy-content');
      // Apply text selection behavior to the tooltip content
      tooltip.style.userSelect = 'text';
      tooltip.style.textAlign = '';
    },
    ...props,
  });

  return delegateInstance;
}
