'use strict';

require('dotenv').config({ silent: true });
const config = require('../config');
const firebase = require('firebase');
firebase.initializeApp({
  serviceAccount: config.firebase.serviceAccount,
  databaseURL: config.firebase.databaseURL
});

const root = firebase.database().ref();
const ref = root.child('teams');

const teams = [
  {code: 'avengers', name: 'Avengers', avatar: 'http://lorempixel.com/400/400/'},
  {code: 'justice-league', name: 'Justice League', avatar: 'http://lorempixel.com/400/400/'},
  {code: 'suicide-squad', name: 'Suicide Squad', avatar: 'http://lorempixel.com/400/400/'},
  {code: 'x-men', name: 'X-men', avatar: 'http://lorempixel.com/400/400/'}
];

ref.remove()
  .then( () => {
    const actions = teams.map( team => ref.child(team.code).set(team));
    return Promise.all(actions);
  })
  .then( () => {
    console.log('done');
    process.exit();
  });
