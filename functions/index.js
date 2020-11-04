const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

exports.createNewUser = functions.auth.user().onCreate((user) => {
  return db.doc(`users/${user.uid}`)
    .set({uid: user.uid, creationTime: user.metadata.creationTime}, {merge: true})
    .catch((error) => console.log(error));
}); 