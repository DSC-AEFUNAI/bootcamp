const el = (sel) => document.querySelector(sel);

const checkHasTrack = async (uid) => {
  try {
    const dbMember = await firebase.firestore().doc(`members/${uid}`).get();
    return dbMember.exists && dbMember.data().track;
  } catch (error) {
    return false;
  }
};

firebase.auth().onAuthStateChanged(async (user) => {
  if (user && user.phoneNumber && await checkHasTrack(user.uid)) {
    el('.nf__name').textContent = user.displayName.split(' ')[0];
    el('.nf__welcome').classList.remove('element--hide');
    el('.nf__message--signed-in').classList.remove('element--hide');
    el('.nf__message--signed-out').classList.add('element--hide');
    el('.nf__sign-in').classList.add('element--hide');
    el('.nf__enter-button').classList.remove('element--hide');
  } else {
    el('.nf__name').textContent = '';
    el('.nf__welcome').classList.add('element--hide');
    el('.nf__message--signed-in').classList.add('element--hide');
    el('.nf__message--signed-out').classList.remove('element--hide');
    el('.nf__sign-in').classList.remove('element--hide');
    el('.nf__enter-button').classList.add('element--hide');
  }
});