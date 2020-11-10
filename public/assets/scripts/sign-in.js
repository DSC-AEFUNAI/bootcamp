const ui = new firebaseui.auth.AuthUI(firebase.auth());
const el = (sel) => document.querySelector(sel);

const signOut = () => {
  el('.signed-in__container').classList.add('element--hide');
  el('#sign-in').classList.remove('element--hide');
  el('.sign-in__spinner').classList.remove('element--hide');
  firebase.auth().signOut();
}

const reVerifyPhone = () => {
  el('.signed-in__container').classList.add('element--hide');
  el('#sign-in').classList.remove('element--hide');
  el('.sign-in__spinner').classList.remove('element--hide');
  ui.start('#sign-in', uiConfigPhone);
}

const showSignedIn = (user, type, phone = '') => {
  if (type == 0) {
    el('.signed-in__signed-in-heading').classList.remove('element--hide');
    el('.signed-in__signed-in-message').classList.remove('element--hide');
    el('.signed-in__sign-out-button').classList.remove('element--hide');
    el('.signed-in__enter-button').classList.remove('element--hide');
    el('.signed-in__verify-heading').classList.add('element--hide');
    el('.signed-in__verify-message').classList.add('element--hide');
    el('.signed-in__verify-button').classList.add('element--hide');
  } else {
    el('.signed-in__verify-heading').classList.remove('element--hide');
    el('.signed-in__verify-message').classList.remove('element--hide');
    el('.signed-in__verify-button').classList.remove('element--hide');
    el('.signed-in__signed-in-heading').classList.add('element--hide');
    el('.signed-in__signed-in-message').classList.add('element--hide');
    el('.signed-in__sign-out-button').classList.add('element--hide');
    el('.signed-in__enter-button').classList.add('element--hide');
    el('.signed-in__phone').textContent = phone;
  }
  el('.signed-in__name').textContent = user.displayName.split(' ')[0];
  el('.signed-in__email').textContent = user.email;
  el('.signed-in__container').classList.remove('element--hide');
};

const uiConfigPhone = {
  callbacks: {
    signInFailure: function(error) {
      if (error.code != 'firebaseui/anonymous-upgrade-merge-conflict') {
        return Promise.resolve();
      }
      el('#sign-in').classList.add('element--hide');
      showSignedIn(firebase.auth().currentUser, 1, error.credential.a.ea);
    },
    uiShown: () => el('.sign-in__spinner').classList.add('element--hide')
  },
  autoUpgradeAnonymousUsers: true,
  signInSuccessUrl: '/',
  signInOptions: [
    {
      provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
      recaptchaParameters: {
        type: 'image', 
        size: 'normal', 
        badge: 'bottomright'
      },
      defaultCountry: 'NG',
      whitelistedCountries: ['NG', '+234']
    }
  ],
  tosUrl: 'https://policies.google.com/terms',
  privacyPolicyUrl: 'https://policies.google.com/privacy',
  credentialHelper: firebaseui.auth.CredentialHelper.NONE
};

const uiConfigGoogle = {
  callbacks: {
    signInSuccessWithAuthResult: (authResult) => {
      if (authResult.additionalUserInfo.isNewUser || !authResult.user.phoneNumber) {
        return false;
      } else {
        return true;
      }
    },
    uiShown: () => el('.sign-in__spinner').classList.add('element--hide')
  },
  signInFlow: 'popup',
  signInSuccessUrl: '/',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID
  ],
  tosUrl: 'https://policies.google.com/terms',
  privacyPolicyUrl: 'https://policies.google.com/privacy',
  credentialHelper: firebaseui.auth.CredentialHelper.NONE
};

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    if (user.phoneNumber) {
      showSignedIn(user, 0);
    } else {
      ui.start('#sign-in', uiConfigPhone);
    }
  } else {
    ui.start('#sign-in', uiConfigGoogle);
  }
});