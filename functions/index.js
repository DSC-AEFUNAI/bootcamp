const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

exports.createNewMember = functions.auth.user().onCreate((member) => {
  return db.doc(`members/${member.uid}`)
    .set({uid: member.uid, creationTime: member.metadata.creationTime}, {merge: true})
    .catch((error) => console.log(error));
});

exports.deleteMember = functions.auth.user().onDelete((member) => {
  return db.doc(`members/${member.uid}`).delete()
    .catch((error) => console.log(error));
});  