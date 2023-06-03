// Wavesurfer marker lines associated styling options
export const EDIT_MODE_ENABLED_STYLE = {
  width: '2px',
  background: 'rgb(255, 255, 0)',
  opacity: 0.4,
};

export const EDIT_MODE_DISABLED_STYLE = {
  width: '0.5px',
  background: 'rgb(128, 128, 128)',
  opacity: 0.6,
};

export const NEW_MARKER_STYLE = {
  width: '2px',
  background: 'rgb(100,255,0)',
  opacity: 0.6,
};

export const EDITED_MARKER_STYLE = {
  width: '2px',
  background: 'rgb(255,0,0)',
  opacity: 0.6,
};

// Regions color while Click track activated
export const CLICK_TRACK_HIGHLIGHT_COLOR = 'rgba(231, 115, 20, 0.8)';

// Tippy tooltips styling
export const MARKERS_SINGLETON_PROPS = {
  delay: [500, 250],
  moveTransition: 'transform 0.2s ease-out',
  hideOnClick: false,
  animation: 'scale-subtle',
  theme: 'custom',
};

export const MODAL_SINGLETON_PROPS = {
  delay: [500, 350],
  moveTransition: 'transform 0.25s ease-out',
  hideOnClick: false,

  // theme: 'custom',
  // followCursor: true,
  // plugins: [followCursor],

  // animateFill: true,
  // plugins: [followCursor, animateFill],
  // trigger: 'click',
  // interactive: true,
};

// Table selection color
export const TABLE_SELECTION_COLOR = 'tomato';

export const MARKER_LABEL_SPAN_COLOR = '#c00';
