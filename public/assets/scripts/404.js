const el = (sel) => document.querySelector(sel);

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    el('.nf__name').textContent = user.displayName.split(' ')[0];
    el('.nf__welcome').classList.remove('element--hide');
    el('.nf__message--signed-in').classList.remove('element--hide');
    el('.nf__message--signed-out').classList.add('element--hide');
    el('.nf__sign-in').classList.add('element--hide');
    el('.nf__home-button').classList.remove('element--hide');
  } else {
      el('.nf__name').textContent = '';
    el('.nf__welcome').classList.add('element--hide');
    el('.nf__message--signed-in').classList.add('element--hide');
    el('.nf__message--signed-out').classList.remove('element--hide');
    el('.nf__sign-in').classList.remove('element--hide');
    el('.nf__home-button').classList.add('element--hide');
  }
});