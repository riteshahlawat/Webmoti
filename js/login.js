// Unique firebase config object
var firebaseConfig = {
  apiKey: "AIzaSyA51GCqxDw7AuvfNmCcWjbGLtClJNFaUxE",
  authDomain: "webmotia.firebaseapp.com",
  databaseURL: "https://webmotia.firebaseio.com",
  projectId: "webmotia",
  storageBucket: "webmotia.appspot.com",
  messagingSenderId: "606747164317",
  appId: "1:606747164317:web:952c390708ccb09d",
  scopes: [ 
    "email",
    "profile",
    "https://www.googleapis.com/auth/calendar.events"
  ],
  discoveryDocs: [
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"
  ],
  clientId: "1053696254964-r66l5j9ll5p8rt5gukocqo5qpseds8q0.apps.googleusercontent.com"
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
      // Firebase ID used later
      var id = firebase.auth().currentUser.uid;
      db.collection("Users")
        .doc(authResult.user.email)
        .get()
        .then(doc => {
          // If User already exists, redirect
          if (doc.exists) {
            window.location.replace("index.html");
              
          } else {
            // If not, then store new User information with default variables
            // and then redirect
            db.collection("Users")
              .doc(authResult.user.email)
              .set({
                email: authResult.user.email,
                teacherEmail: "testemail@gmail.ca",
                displayName: authResult.user.displayName,
                uid: id,
                photoURL: authResult.user.photoURL,
                isTeacher: "False",
                studentTime: "30",
                beforeClassStartNotification: "False",
                beforeClassEndNotification: "False",
                notificationFrequency: 2,
                notificationRange: 10,
                vibrate: "True",
                sound: "True"
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
    {
      provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      scopes: firebaseConfig.scopes
    }
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
