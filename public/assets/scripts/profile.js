const signOut = () => firebase.auth().signOut();

const checkHasTrack = async (uid) => {
  try {
    const dbMember = await firebase.firestore().doc(`members/${uid}`).get();
    return dbMember.exists && dbMember.data().track;
  } catch (error) {
    return false;
  }
};

firebase.auth().onAuthStateChanged(async (user) => {
  if (!user || !user.phoneNumber || !await checkHasTrack(user.uid)) {
    window.location.replace(window.location.origin + '/sign-in.html');
  } 
});