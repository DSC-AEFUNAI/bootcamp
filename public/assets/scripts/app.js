const signOut = () => firebase.auth().signOut();

firebase.auth().onAuthStateChanged((user) => {
  if (!user || !user.phoneNumber) {
    window.location.replace(window.location.origin + '/sign-in.html');
  }
});