import { loadAudioFile } from './audio-player.js';
import { loadJAMS } from './render-annotations.js';

import audioFileURL1 from 'url:../../demo_files/test.mp3';
import annotationFile1 from 'url:../../demo_files/test.jams';

import audioFileURL2 from 'url:../../demo_files/01_-_I_Saw_Her_Standing_There.wav';
import annotationFile2 from 'url:../../demo_files/01_-_I_Saw_Her_Standing_There.jams';

import audioFileURL3 from 'url:../../demo_files/05_-_Here,_There_and_Everywhere.wav';
import annotationFile3 from 'url:../../demo_files/05_-_Here,_There_and_Everywhere.jams';

import audioFileURL4 from 'url:../../demo_files/14_-_Tomorrow_Never_Knows.wav';
import annotationFile4 from 'url:../../demo_files/14_-_Tomorrow_Never_Knows.jams';

const variableToEstablishConnection = '';
export { variableToEstablishConnection };
// /*
// create a new select element
const selectElement = document.createElement('select');

// define the filenames
const fileNames = [
  'None',
  'test.mp3',
  '01_-_I_Saw_Her_Standing_There.wav',
  '05_-_Here,_There_and_Everywhere.wav',
  '14_-_Tomorrow_Never_Knows.wav',
];

// create options
for (let i = 0; i < fileNames.length; i++) {
  const optionElement = document.createElement('option');
  optionElement.value = i;
  optionElement.text = fileNames[i];
  selectElement.appendChild(optionElement);
}

function loadFilesInOrder(audioFileURL, annotationFile) {
  new Promise((resolve, reject) => {
    try {
      loadAudioFile(audioFileURL);
      resolve();
    } catch (error) {
      reject(error);
    }
  })
    .then(() => {
      return new Promise((resolve, reject) => {
        try {
          loadJAMS(annotationFile);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    })
    .catch(error => {
      console.error('An error occurred:', error);
    });
}

// add an event listener that calls the appropriate functions when an option is selected
selectElement.addEventListener('change', event => {
  const selectedOption = event.target.value;

  const fileName = document.querySelector('#audio-file-name');
  if (selectedOption === '1') {
    loadFilesInOrder(audioFileURL1, annotationFile1);
    fileName.textContent = fileNames[1];
  } else if (selectedOption === '2') {
    loadFilesInOrder(audioFileURL2, annotationFile2);
    fileName.textContent = fileNames[2];
  } else if (selectedOption === '3') {
    loadFilesInOrder(audioFileURL3, annotationFile3);
    fileName.textContent = fileNames[3];
  } else if (selectedOption === '4') {
    loadFilesInOrder(audioFileURL4, annotationFile4);
    fileName.textContent = fileNames[4];
  } else if (selectedOption === '0') {
    // Optionally, you can handle the 'None' case differently here
    window.location.reload();
    fileName.textContent = 'No file selected';
  }
});

// append the select element to the body of the document
// document.body.appendChild(selectElement);
// */
const demoFiles = document.querySelector('#demo-files-list');
demoFiles.appendChild(selectElement);
