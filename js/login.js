var firebaseConfig = {
  apiKey: "AIzaSyA51GCqxDw7AuvfNmCcWjbGLtClJNFaUxE",
  authDomain: "webmotia.firebaseapp.com",
  databaseURL: "https://webmotia.firebaseio.com",
  projectId: "webmotia",
  storageBucket: "webmotia.appspot.com",
  messagingSenderId: "606747164317",
  appId: "1:606747164317:web:952c390708ccb09d"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firestore
var db = firebase.firestore();

// Login UI
// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());

var uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
      // User successfully signed in.
      // Return type determines whether we continue the redirect automatically
      // or whether we leave that to developer to handle.
      db.collection("Users")
        .doc(authResult.user.email)
        .get()
        .then(doc => {
          if (doc.exists) {
            let data = doc.data();
            let teacherEmail = data.teacherEmail;
            db.collection("Users")
              .doc(authResult.user.email)
              .set({
                email: authResult.user.email,
                teacherEmail: teacherEmail,
                displayName: authResult.user.displayName
              })
              .then(function() {
                window.location.replace("index.html");
              })
              .catch(function(error) {
                console.error("Error adding document: ", error);
              });
          }
        })
        .catch(err => {
          console.log(err);
        });

      return false;
    },
    uiShown: function() {
      // The widget is rendered.
      // Hide the loader.
      document.getElementById("loader").style.display = "none";
    }
  },
  // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
  signInFlow: "popup",
  signInSuccessUrl: "index.html",
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID
    // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    // firebase.auth.GithubAuthProvider.PROVIDER_ID,
    // firebase.auth.EmailAuthProvider.PROVIDER_ID,
    // firebase.auth.PhoneAuthProvider.PROVIDER_ID
  ],
  // Terms of service url.
  tosUrl: "index.html",
  // Privacy policy url.
  privacyPolicyUrl: "index.html"
};

// The start method will wait until the DOM is loaded.
ui.start("#firebaseui-auth-container", uiConfig);