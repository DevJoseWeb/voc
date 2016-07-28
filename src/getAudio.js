'use strict';
require('babel-polyfill');

const _async_   = require('co').wrap;
const fs        = require('fs');
const path      = require('path');
const download  = require('./lib/download');
const normalize = require('./lib/normalize');
const Service   = require('./service');

function getAudioFileName(word, ext) {
  // only convert ' ' to '_' here
  return word.replace(/ /g, '_') + ext;
}

function getExistAudio (word, directory) {
  const ext = ['.mp3', '.wav'];
  for (let i = 0; i < ext.length; i++) {
    const audio = path.resolve(directory, getAudioFileName(word, ext[i]));
    try {
      fs.statSync(audio);
      return audio;
    } catch (e) {
      if (e.code !== 'ENOENT') {
        throw e;
      }
    }
  }
  return null;
}

const downloadAudio = _async_(function * (word, directory, serviceName) {
  if (serviceName in Service === false) {
    throw new Error(`Unknown Service '${serviceName}'`);
  }

  const serv = Service[serviceName];
  const url = yield serv.getUrl(word);
  const ext = serv.ext || path.extname(url);
  const audioName = getAudioFileName(word, ext);        // audio_xxx.mp3 or audio_xxx.wav
  const audioDest = path.resolve(directory, audioName); // audio destination

  yield download(url, audioDest);
  console.log(`Download '${audioName}' from ${serviceName} ...`);
  return audioDest;
});

module.exports = _async_(function * (word, directory, service) {

  // only convert '_' to ' ' here
  word = normalize(word).replace(/_/g, ' ');

  // 1. force to download audio from particular service
  if (service) {
    return yield downloadAudio(word, directory, service);
  }

  // 2-1. check audio is exist or not
  const audio = getExistAudio(word, directory);
  if (audio !== null) {
    return audio;
  }

  // 2-2. audio is not exist, search audio URL of the word
  for (const serv in Service) {

    // download by 'Dictionary' only,
    // because it can always download audio from 'TTS' successfully even the words are misspell
    if (Service[serv].type !== 'dic') {
      continue;
    }

    try {
      return yield downloadAudio(word, directory, serv);
    } catch (e) {

      // unusual error
      if (e.code !== 'ENOENT') {
        throw e;
      }
    }
  }

  // 3. audio is not found
  const err = new Error(`'${word}' is not found`);
  err.code = 'ENOENT';
  throw err;
});
