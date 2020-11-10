const ui = new firebaseui.auth.AuthUI(firebase.auth());
const el = (sel) => document.querySelector(sel);
const notification = el('.mdl-js-snackbar');
const chooseTrackForm = el('#choose-track');

const signOut = () => {
  el('.signed-in').classList.add('element--hide');
  el('#sign-in').classList.remove('element--hide');
  el('.sign-in__spinner').classList.remove('element--hide');
  firebase.auth().signOut();
}

const reVerifyPhone = () => {
  el('.signed-in').classList.add('element--hide');
  el('#sign-in').classList.remove('element--hide');
  el('.sign-in__spinner').classList.remove('element--hide');
  ui.start('#sign-in', uiConfigPhone);
}

const groupedSelectors = {
  signedIn: [
    '.signed-in__signed-in-message',
    '.signed-in__sign-out-button',
    '.signed-in__enter-button'
  ],
  verify: [
    '.signed-in__verify-message',
    '.signed-in__verify-button'
  ],
  track: [
    '.signed-in__track-message',
    '.signed-in__track-buttons',
    '.signed-in__submit-button'
  ]
};

const showGroup = (group) => {
  Object.keys(groupedSelectors).forEach((key) => {
    if (key === group) {
      groupedSelectors[key].forEach((sel) => el(sel).classList.remove('element--hide'));
    } else {
      groupedSelectors[key].forEach((sel) => el(sel).classList.add('element--hide'));      
    }
  });
};

const showSignedIn = (user, type, phone = '') => {
  if (type == 0) {
    showGroup('signedIn');
    el('.mdl-card__title-text').textContent = 'Signed In';
  } else if (type == 1) {
    showGroup('verify');
    el('.mdl-card__title-text').textContent = 'Phone Verify Error';
    el('.signed-in__phone').textContent = phone;
  } else {
    el('.mdl-card__title-text').textContent = 'Choose Learning Track';
    showGroup('track');
  }
  el('.signed-in__name').textContent = user.displayName.split(' ')[0];
  el('.signed-in__email').textContent = user.email;
  el('.signed-in').classList.remove('element--hide');
};


const checkHasTrack = async (uid) => {
  try {
    const dbMember = await firebase.firestore().doc(`members/${uid}`).get();
    if (dbMember.exists
        && ['frontend', 'backend', 'design', 'ml'].includes(dbMember.data().track)) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    notification.MaterialSnackbar.showSnackbar({
      message: `Error: ${error.message}`,
      actionHandler: () => window.location.reload(),
      actionText: 'Refresh',
      timeout: 5000
    });
    return false;
  }
};

chooseTrackForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const track = (Object.fromEntries(new FormData(chooseTrackForm))).track;
  const member = firebase.auth().currentUser; 
  if (member) {  
    if (member.phoneNumber) {
      try {
        const dbMemberRef = firebase.firestore().doc(`members/${member.uid}`);
        const dbMember = await dbMemberRef.get();
        if (dbMember.exists) {
          await dbMemberRef.update({track: track});
          window.location.replace(window.location.origin);
        } else {
          await dbMemberRef.set({
            uid: member.uid,
            track: track
          }, {merge: true});
          window.location.replace(window.location.origin);
        }
      } catch (error) {
        if (error.code === 'permission-denied') {
          // the user has set their track before and logically shouldn't be here,
          notification.MaterialSnackbar.showSnackbar({
            message: 'You can\'t change your track!, if you think something is wrong, contact admin',
            actionHandler: () => window.open('https://bit.ly/dscaefunaiwhatsapp', '_blank'),
            actionText: 'Contact',
            timeout: 5000
          });
        } else {          
          notification.MaterialSnackbar.showSnackbar({
            message: `Error: ${error.message}. Please retry`
          });
        }
      }
    } else {
      // this shouldn't happen, in other words, there signed in user must have 
      // a phone number for the form to be shown and submitted, however, 
      // if it happens, verifies the user's phone number
      el('.signed-in').classList.add('element--hide');
      el('#sign-in').classList.remove('element--hide');
      el('.sign-in__spinner').classList.remove('element--hide');
      ui.start('#sign-in', uiConfigPhone);
    }
  } else {
    // this shouldn't equally happen, there must be a signed in user
    // for the form to be shown and submitted, however, if it happens, 
    // sign in the user with Google
    el('.signed-in').classList.add('element--hide');
    el('#sign-in').classList.remove('element--hide');
    el('.sign-in__spinner').classList.remove('element--hide');
    ui.start('#sign-in', uiConfigGoogle);
  }
});

const checkHasTrackFromPhoneVerify = async (user) => {
  const hasTrack = await checkHasTrack(user.uid);
  if (hasTrack) {
    showSignedIn(user, 0);
  } else {
    showSignedIn(user, 2);
  }
};

const uiConfigPhone = {
  callbacks: {
    signInSuccessWithAuthResult: (authResult) => {
      checkHasTrackFromPhoneVerify(authResult.user);
      return false;
    },
    signInFailure: (error) => {
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

firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    if (user.phoneNumber) {
      const hasTrack = await checkHasTrack(user.uid);
      if (hasTrack) {
        showSignedIn(user, 0);  
      } else {
        showSignedIn(user, 2);
      }
    } else {
      ui.start('#sign-in', uiConfigPhone);
    }
  } else {
    ui.start('#sign-in', uiConfigGoogle);
  }
});