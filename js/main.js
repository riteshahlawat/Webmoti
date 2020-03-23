var mainUser;
// Firebase configuration
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
var db = firebase.firestore();

var loggedInElements = document.getElementById("logged-in-elements");
var uid;
var userStatusDatabaseRef;
var isOfflineForDatabase;
var isOnlineForDatabase;
var userStatusFirestoreRef;
// Check if user is authenticated
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    // Fetch the current user's ID from Firebase Authentication.
    uid = firebase.auth().currentUser.uid;
    var isOfflineForDatabase = {
      state: "offline",
      last_changed: firebase.database.ServerValue.TIMESTAMP
    };

    var isOnlineForDatabase = {
      state: "online",
      last_changed: firebase.database.ServerValue.TIMESTAMP
    };
    // Create a reference to this user's specific status node.
    // This is where we will store data about being online/offline.
    userStatusDatabaseRef = firebase.database().ref("/status/" + uid);
    console.log("Logged in", user);
    // Automatically log into firebase database once logged in to show "online" status
    firebase
      .database()
      .ref(".info/connected")
      .on("value", snapshot => {
        if (snapshot.val() == false) {
          return;
        }

        userStatusDatabaseRef
          .onDisconnect()
          .set(isOfflineForDatabase)
          .then(() => {
            userStatusDatabaseRef.set(isOnlineForDatabase);
          });
      });
      // retrieve logged in user data, only then display data
      db.collection("Users")
      .doc(user.email)
      .get()
      .then(doc => {
        if (doc.exists) {
          let data = doc.data();
          // display elements
          loggedInElements.style.display = "block";
          // run all logged in functions
          loggedIn(data);
        } else {
          // makes it so that you cannot use application without logging in first
          console.log("No Such Document");
          loggedInElements.style.display = "none";
          window.location.replace("login.html");
        }
      })
      .catch(err => {
        console.log("Error getting document: ", err);
      });
  } else {
    // Redirect user to login
    loggedInElements.style.display = "none";
    window.location.replace("login.html");
  }
});
/**
 * Function to logout user
 */
function logOut() {
  firebase.auth().signOut();
  // gapi.auth2.getAuthInstance().signOut();
}

/**
 * Function that runs once data is retrieved (user exists and is logged in)
 * @param {object} initialUser object that holds all user data
 */
function loggedIn(initialUser) {
  var user = initialUser;
  //Initialize Socket.io
  var socket = io("http://localhost:3000", { reconnectionAttempts: 3 });

  //Initializing the variables
  var teacherUser;
  var email = user.email;
  const constraints = { audio: true, video: true };
  var targetIcon = document.getElementById("targetIcon");
  var targetUsername = document.getElementById("targetUsername");
  var targetUsernameLabel = document.getElementById("targetUsernameLabel");
  var username = document.getElementById("username");
  var usernameLabel = document.getElementById("usernameLabel");
  var roleRadio = document.getElementById("roleRadio");
  var remoteVideo = document.getElementById("remoteVideo");
  var localVideo = document.getElementById("localVideo");
  var hangupButton = document.getElementById("hangup");
  var callButton = document.getElementById("call");
  var drawerLogoutButton = document.getElementById("drawer-logout-button");

  // MDC drawer setup
  var drawer = mdc.drawer.MDCDrawer.attachTo(
    document.querySelector(".mdc-drawer")
  );
  var drawerList = new mdc.list.MDCList(document.getElementById("drawer-list"));
  // header setup
  var drawerHeaderName = document.getElementById("drawer-header-name");
  var drawerHeaderEmail = document.getElementById("drawer-header-email");
  var drawerSettingsButton = document.getElementById("drawer-settings-button");
  var drawerHomeButton = document.getElementById("drawer-home-button");
  const targetUsernameTextInput = new mdc.textField.MDCTextField(
    document.querySelector("#targetUsernameTextInput")
  );
  const usernameTextInput = new mdc.textField.MDCTextField(
    document.querySelector("#usernameTextInput")
  );
  // Allow drawer to open
  var drawerOpenButton = document.getElementById("drawer-open-button");

  // settgings modal
  var settingsModal = document.getElementById("settings-modal");
  var settingsSpan = document.getElementsByClassName("close")[0];
  const teacherChangeEmailTextInput = new mdc.textField.MDCTextField(
    document.querySelector("#teacher-input-text-field")
  );
  var setStudentTimeTextInput = new mdc.textField.MDCTextField(
    document.getElementById("set-student-time-input-text-fields")
  );

  var teacherInputTextField = document.getElementById(
    "teacher-input-text-field"
  );
  var teacherChangeEmailLabel = document.getElementById(
    "teacher-input-label-field"
  );
  var teacherChangeEmailInput = document.getElementById(
    "teacher-change-email-input"
  );
  var saveTeacherEmailButton = document.getElementById(
    "edit-teacher-email-button"
  );
  var editSaveTeacherEmailSpan = new mdc.ripple.MDCRipple(
    document.getElementById("edit-teacher-email-span")
  );
  var teacherEmailChangeNotch = document.getElementById(
    "teacher-change-email-notch"
  );
  var teacherEmailChangeWidth = document.getElementById(
    "teacher-change-email-width"
  );
  const teacherChangeEmailSnackbar = new mdc.snackbar.MDCSnackbar(
    document.getElementById("change-teacher-email-snackback")
  );
  var undoTeacherEmailChangeButton = document.getElementById(
    "undo-change-teacher-email-button"
  );
  const teacherRetypeEmailInput = new mdc.textField.MDCTextField(
    document.querySelector("#teacher-input-retype-text-field")
  );
  var teacherRetypeEmailInputWorkable = document.getElementById(
    "teacher-input-retype-text-field"
  );
  var teacherChangeRetypeInput = document.getElementById(
    "teacher-retype-email-input"
  );
  const teacherChangeEmailDifferentSnackbar = new mdc.snackbar.MDCSnackbar(
    document.getElementById("teacher-email-change-different-snackbar")
  );
  const teacherImproperChangeEmailSnackbar = new mdc.snackbar.MDCSnackbar(
    document.getElementById("improper-teacher-change-email-snackbar")
  );

  var teacherEmailError = document.getElementById("teacher-change-email-error");

  var teacherRetypeEmailError = document.getElementById(
    "teacher-change-retype-email-error"
  );

  // Notifications settings
  var beforeStartCheckbox = document.getElementById("before-start-checkbox");
  var beforeEndCheckbox = document.getElementById("before-end-checkbox");

  var setNotifRangeInputFields = new mdc.textField.MDCTextField(
    document.getElementById("set-notification-range-input-fields")
  );
  var setNotifFrequencyInputFields = new mdc.textField.MDCTextField(
    document.getElementById("set-notification-frequency-input-fields")
  );

  var setNotifRangeInput = document.getElementById("set-notification-range");
  var setNotifFrequencyInput = document.getElementById(
    "set-notification-frequency"
  );

  var saveNotifSettingsButton = document.getElementById(
    "notification-setting-save-button"
  );

  // Profile photos
  var userProfilePhoto = document.getElementById("user-photo-div");
  var teacherProfilePhoto = document.getElementById("teacher-photo-div");

  var userProfileState = document.getElementById("user-photo-state");
  var teacherProfileState = document.getElementById("teacher-photo-state");

  // Settings tabs
  var settingsTimeBody = document.getElementById("teacher-settings-body");
  var settingsEmailBody = document.getElementById("email-settings-body");
  var settingsNotifBody = document.getElementById(
    "notifications-settings-body"
  );

  var settingsEmailTab = document.getElementById("settings-email-tab");
  var settingsTimeTab = document.getElementById("settings-teacher-tab");
  var settingsNotifTab = document.getElementById("settings-notif-tab");

  var setStudentTimeInput = document.getElementById("set-student-input");
  var setStudentSaveButton = document.getElementById(
    "set-student-time-save-button"
  );
  var setStudentError = document.getElementById("set-student-error");

  // Calendar
  var calendarWidget = document.getElementById("calendar-widget");
  var calendarElement = document.getElementById("calendar");
  var calendarModal = document.getElementById("calendar-modal");
  var calendar;
  var calendarHeader;
  var calendarHeaderViewSelectorButtons;
  var calendarTodayButton;
  var calendarPreviousButton;
  var calendarNextButton;
  var dayButton;
  var weekButton;
  var events = null;
  // object representing google's color ids and respective colors
  var calendarColors = {
    1: "#7986cb",
    2: "#33b679",
    3: "#8e24aa",
    4: "#e67c73",
    5: "#f6c026",
    6: "#f5511d",
    7: "#039be5",
    8: "#616161",
    9: "#3f51b5",
    10: "#0b8043",
    11: "#d60000"
  };
  // Variables
  var previousTeacherEmail;
  var previousTeacherProfilePicture;
  var previousTeacherUser;
  var teacherState = null;
  var teacherStateLastChanged = null;
  // Socket IO variables
  var localStream = null;
  var pc = null;
  var isCaller = true;
  var isStudent = true;
  var mediaDetails;
  // Visual timer variables
  var coolDown = false;
  var minuteTimer;
  var minuteTimerAct = false;
  var urgentQuestion = false;
  var Bell = new Audio("../audio/bell.mp3");
  var teacherUserDatabaseRef;
  var onSettingsPage = false;
  var onCalendarPage = false;
  var targetUsernameLabelMainText;
  var targetUsernameLabelSelectedText;
  var currentSettingsTab = "email";
  
  // Initialize functions and variables 
  initialize();

  
  targetUsername.addEventListener("click", clearBox);
  /**
   * Clears target text input box allowing you to type 
   * a temporary target to call
   */
  function clearBox() {
    targetUsername.value = "";
  }

  /**
   * Function called each time a connection state changes for WebRTC protocol
   * @param {object} event RTC change event
   */
  function logConnectionStates(event) {
    console.log("Connection state changed to: " + pc.connectionState);
    if (pc.connectionState == "connected") {
      hangupButton.classList.remove("disabled");
      callButton.classList.add("disabled");
    }
    if (
      pc.connectionState == "failed" ||
      pc.connectionState == "disconnected"
    ) {
      hangup();
    }
  }

  /**
   * Function that is called each time a signaling state changes for WebRTC protocol 
   * @param {object} event RTC signal event
   */
  function logSignalingStates(event) {
    console.log("Signaling state changed to: " + pc.signalingState);
    if (pc.signalingState == "stable") {
      // Initialize video call related keyboard listener
      keyboardListener();
      zoom();
    }
  }

  //Adding an event listener to send our SDP info to the server
  callButton.addEventListener("click", call);
  function call() {
    createPeerConnection();
    mediaDetails = getMedia(pc);
  }

  // Set logout button to logout
  drawerLogoutButton.addEventListener("click", logOut);

  // Set hangup button to end the call and reset RTC variables
  hangupButton.addEventListener("click", hangup);
  function hangup() {
    console.log("Hanging up");
    if (pc) {
      pc.ontrack = null;
      pc.onremovetrack = null;
      pc.onremovestream = null;
      pc.onicecandidate = null;
      pc.oniceconnectionstatechange = null;
      pc.onsignalingstatechange = null;
      pc.onicegatheringstatechange = null;
      pc.onnegotiationneeded = null;

      if (remoteVideo.srcObject) {
        remoteVideo.srcObject.getTracks().forEach(track => track.stop());
      }

      if (localVideo.srcObject) {
        localVideo.srcObject.getTracks().forEach(track => track.stop());
      }

      pc.close();
      pc = null;
    }

    remoteVideo.removeAttribute("src");
    remoteVideo.removeAttribute("srcObject");
    localVideo.removeAttribute("src");
    remoteVideo.removeAttribute("srcObject");

    hangupButton.classList.add("disabled");
    callButton.classList.remove("disabled");
  }

  /**
   * Function to create a new RTC connection
   */
  function createPeerConnection() {
    //Declaring iceServers and creating a new PeerConnection
    const config = {
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302"
        },
        {
          urls: ["turn: app.webmoti.org:443"],
          username: "webmoti",
          credential: "webmoti_test"
        }
      ]
    };
    pc = new RTCPeerConnection(config);
    pc.onnegotiationneeded = offer;
    pc.onicecandidate = sendIce;
    pc.ontrack = handleTrackEvent;
    pc.onconnectionstatechange = logConnectionStates;
    pc.onsignalingstatechange = logSignalingStates;
  }
  
  /**
   * Function to get the media from the browser
   * @param {object} pc RTC variable
   */
  function getMedia(pc) {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function(stream) {
        /* use the stream */
        localStream = stream;
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
        document.getElementById("localVideo").srcObject = localStream;
      })
      .catch(function(err) {
        /* handle the error */
        console.log("failed to add Webcam" + err);
      });

    console.log("Got the Webcam/Media from the browser");
  }

  /**
   * Creating a new offer and then set the local description of the RTCPeerConnection pc
   */
  function offer() {

    pc.createOffer()
      .then(function(offer) {
        console.log("Offer created!");
        return pc.setLocalDescription(offer);
      })
      .then(function() {
        console.log(
          "Placing the offer in the database under " +
            targetUsername.value +
            " username"
        );
        sendToServer(
          targetUsername.value,
          username.value,
          "video-offer",
          JSON.stringify(pc.localDescription)
        );
      });
  }
  /**
   * Function to store log of connections to database
   * @param {String} username 
   * @param {String} targetUsername 
   * @param {String} type 
   * @param {object} sdp 
   */
  function sendToServer(username, targetUsername, type, sdp) {
    const data = {
      username: username,
      targetUsername: targetUsername,
      type: type,
      sdp: sdp
    };

    console.log(
      "Sending data from " +
        username +
        " to " +
        targetUsername +
        " with type " +
        type
    );

    db.collection("SDP")
      .doc(username)
      .set(data)
      .then(function() {
        console.log("Document written ");
      })
      .catch(function(error) {
        console.error("Error adding document: ", error);
      });
  }
  /**
   * Function to send keystrokes to target user
   * @param {String} str 
   */
  function sendToPeer(str) {
    sendToServer(targetUsername.value, username.value, "peer-data", str);
  }

  /**
   * Function to send ICE
   * @param {object} ice 
   */
  function sendIce(ice) {
    if (ice.candidate) {
      sendToServer(
        targetUsername.value,
        username.value,
        "ice-candidate",
        JSON.stringify(ice.candidate)
      );
      console.log("Sent new ICE candidate " + JSON.stringify(ice.candidate));
    }
  }
  /**
   * Function to receive ICE
   * @param {object} ice 
   */
  function receiveIce(ice) {
    console.log("Received new ICE Candidate: " + ice);
    var cand = new RTCIceCandidate(JSON.parse(ice));
    pc.addIceCandidate(cand).catch(function(e) {
      console.log(e);
    });
  }

  /**
   * Accessibilities keydowns regarding saving settings
   * or calling/ending call using only keyboard
   */
  document.addEventListener("keydown", event => {
    let keyName = event.key;
    // Enter pressed
    if (keyName == "Enter") {
      // Either in settings page or in main page
      if (onSettingsPage) {
        // In setting page
        // Decides which tab/save button to click/go to
        if (document.activeElement == settingsTimeTab) {
          if (settingsEmailBody.style.display == "flex") {
            saveTeacherEmailButton.click();
          } else {
            settingsTimeTab.click();
          }
        } else if (document.activeElement == settingsEmailTab) {
          if (settingsTimeBody.style.display == "flex") {
            setStudentSaveButton.click();
          } else {
            settingsEmailTab.click();
          }
        } else if (document.activeElement == settingsNotifTab) {
          settingsNotifTab.click();
        }
      } else {
        // In main page
        // Determines whether hanging up call calling, or navigating to side menu
        if (document.activeElement == drawerLogoutButton) {
          drawerLogoutButton.click();
        } else if (document.activeElement == drawerSettingsButton) {
          drawerSettingsButton.click();
        } else if (document.activeElement == callButton) {
          callButton.click();
        } else if (document.activeElement == hangupButton) {
          hangupButton.click();
        }
      }
    } else if (keyName == "Escape") {
      // If escaped pressed, exit out of pop up (settings or calendar for now)
      if (onSettingsPage) {
        settingsModal.click();
      } else if (onCalendarPage) {
        calendarModal.style.display = "none";
        onCalendarPage = false;
      }
    }
  });

  /**
   * Function that sends messages to target user
   * using database
   */
  function keyboardListener() {
    console.log("Adding the keyboard event listener");
    document.addEventListener(
      "keydown",
      event => {
        if (
          document.activeElement == document.getElementsByTagName("BODY")[0]
        ) {
          const keyName = event.key;
          // camera controls
          switch (keyName) {
            case "q":
              sendToPeer(keyName);
              sendToPeer("");
              break;
            case "w":
              zoomIn();
              break;
            case "a":
              sendToPeer(keyName);
              sendToPeer("");
              break;
            case "s":
              zoomOut();
              break;
            case "d":
              sendToPeer(keyName);
              sendToPeer("");
              break;
            case "r":
              resetZoom();
              break;
            case "Enter":
              /**
               * Visual timer for hand display to teacher
               * functions as follows:
               * - Display hand (to teacher) and bell
               * - Start cooldown of 30 seconds
               * - If User presses enter again within this timeframe of 30 seconds, it shows the visual timer
               * - Once timer is reset, then allow user to raise ahnd again
               */
              if (coolDown) {
                document.getElementsByClassName(
                  "timer-group"
                )[0].style.display = "block";
                document
                  .getElementsByClassName("hand")[0]
                  .classList.add("spin1");

                if (!minuteTimerAct) {
                  minuteTimerAct = true;
                  onTimer();
                }
              }
              if (!coolDown) {
                if (!urgentQuestion) {
                  sendToPeer(keyName);
                  sendToPeer("");
                }
                if (urgentQuestion) {
                  sendToPeer("urgentQ");
                  sendToPeer("");
                }
                coolDown = true;
              }
              
              setTimeout(urgentCooldown, 60000);
              urgentQuestion = true;
              break;
            default:
            // code block
          }
        }
      },
      false
    );
  }

  
  /**
   * Display email settings when email tab is clicked
   */
  settingsEmailTab.addEventListener("click", () => {
    if (currentSettingsTab != "email") {
      currentSettingsTab = "email";
      settingsTimeTab.classList.remove("settings-tab-selected");
      settingsNotifTab.classList.remove("settings-tab-selected");
      settingsEmailTab.classList.add("settings-tab-selected");

      settingsEmailBody.style.display = "flex";
      settingsTimeBody.style.display = "none";
      settingsNotifBody.style.display = "none";
    }
  });
  /**
   * Display time settings when time tab is clicked
   */
  settingsTimeTab.addEventListener("click", () => {
    if (currentSettingsTab != "teacher") {
      currentSettingsTab = "teacher";
      settingsTimeTab.classList.add("settings-tab-selected");
      settingsNotifTab.classList.remove("settings-tab-selected");
      settingsEmailTab.classList.remove("settings-tab-selected");

      settingsEmailBody.style.display = "none";
      settingsNotifBody.style.display = "none";
      settingsTimeBody.style.display = "flex";
    }
  });
  /**
   * Display notification settings when notification tab is clicked
   */
  settingsNotifTab.addEventListener("click", () => {
    if (currentSettingsTab != "notification") {
      currentSettingsTab = "notification";
      settingsNotifTab.classList.add("settings-tab-selected");
      settingsTimeTab.classList.remove("settings-tab-selected");
      settingsEmailTab.classList.remove("settings-tab-selected");

      settingsEmailBody.style.display = "none";
      settingsTimeBody.style.display = "none";
      settingsNotifBody.style.display = "flex";
    }
  });

  /**
   * Function to save notification settings once clicked
   */
  saveNotifSettingsButton.addEventListener("click", () => {
    let freqVal = setNotifFrequencyInput.value;
    let rangeVal = setNotifRangeInput.value;
    // If input in correct range
    if (freqVal >= 1 && freqVal <= 5 && rangeVal >= 1 && rangeVal <= 15) {
      // Valid, now update documents and local variables 
      let startNotif = beforeStartCheckbox.checked;
      let endNotif = beforeEndCheckbox.checked;
      let startUpload = "False";
      let endUpload = "False";
      if (startNotif) startUpload = "True";
      if (endNotif) endUpload = "True";
      db.collection("Users")
        .doc(user.email)
        .set({
          displayName: user.displayName,
          email: user.email,
          teacherEmail: teacherChangeEmailInput.value,
          uid: uid,
          photoURL: user.photoURL,
          isTeacher: user.isTeacher,
          studentTime: user.studentTime,
          beforeClassStartNotification: startUpload,
          beforeClassEndNotification: endUpload,
          notificationFrequency: freqVal,
          notificationRange: rangeVal
        })
        .then(function() {
          user.beforeClassEndNotification = startUpload;
          user.beforeClassEndNotification = endUpload;
          user.notificationFrequency = freqVal;
          user.notificationRange = rangeVal;
        })
        .catch(function(error) {
          console.error("Error changing email: ", error);
        });
    }
  });
  /**
   * Function to save new hand raise wait time
   * Hard part is to save both our side and update target side in real time
   */
  setStudentSaveButton.addEventListener("click", () => {
    if (setStudentTimeInput.value >= 10 && setStudentTimeInput.value <= 60) {
      // Update document for target
      db.collection("Users")
        .doc(teacherUser.email)
        .set({
          displayName: teacherUser.displayName,
          email: teacherUser.email,
          teacherEmail: teacherUser.teacherEmail,
          uid: teacherUser.uid,
          photoURL: teacherUser.photoURL,
          isTeacher: teacherUser.isTeacher,
          studentTime: setStudentTimeInput.value,
          beforeClassStartNotification:
            teacherUser.beforeClassStartNotification,
          beforeClassEndNotification: teacherUser.beforeClassEndNotification,
          notificationFrequency: teacherUser.notificationFrequency,
          notificationRange: teacherUser.notificationRange
        })
        .then(function() {
          // Once successfully saved, update our side and exit out of settings
          teacherUser.studentTime = setStudentTimeInput.value;
          document.querySelectorAll(".hand-span").forEach(element => {
            element.style.animationDuration = setStudentTimeInput.value + "s";
          });
          document.querySelector(".minute").style.animationDuration =
            setStudentTimeInput.value + "s";
          settingsModal.click();
        })
        .catch(function(error) {
          console.error("Error changing email: ", error);
        });
    }
  });
  /**
   * Function that shows dynamically an error message 
   * if correct input not in range
   */
  setStudentTimeInput.addEventListener("keyup", () => {
    if (setStudentTimeInput.value < 10 || setStudentTimeInput.value > 60) {
      setStudentError.innerHTML = "Please enter a value between 10-60";
    } else {
      setStudentError.innerHTML = "";
    }
  });
  
  /**
   * Function to display calendar
   */
  calendarWidget.addEventListener("click", () => {
    calendarModal.style.display = "flex";
    onCalendarPage = true;
    calendar.render();
    postCalendarLoad();
  });
  
  /**
   * Function that is called after every calender render to 
   * render our own custom stuff to customize calendar
   */
  function postCalendarLoad() {
    // If event object not previously loaded, then load once
    if (events == null) {
      gapi.client.calendar.events
        .list({
          calendarId: "primary",
          timeMin: new Date("04 September 2019 00:00 UTC").toISOString(),
          showDeleted: false,
          singleEvents: true,
          maxResults: 250,
          orderBy: "startTime"
        })
        .then(function(response) {
          // for each event gathered, upload to our calendar 
          events = response.result.items;
          for (let i = 0; i < events.length; i++) {
            // Not all day events, need to process an all day event differently
            if (events[i].start.dateTime) {
              // Temp color, retrieve the color from the reference id to color object
              let tempColor = calendarColors[events[i].colorId];
              if (tempColor == null) {
                tempColor = calendarColors[1];
              }
              // Add event
              calendar.addEvent({
                title: events[i].summary,
                allDay: false,
                start: events[i].start.dateTime,
                end: events[i].end.dateTime,
                backgroundColor: tempColor
              });
            } else {
              // All day events
              // Temp color
              let tempColor = calendarColors[events[i].colorId];
              if (tempColor == null) {
                tempColor = calendarColors[1];
              }
              calendar.addEvent({
                title: events[i].summary,
                allDay: true,
                start: events[i].start.date,
                end: events[i].end.date,
                backgroundColor: tempColor
              });
            }
          }
        });
    }
    // initialize calendar elements and how they are to be displayed
    calendarHeader = calendarElement.childNodes[0];
    calendarHeaderViewSelectorButtons = calendarHeader.querySelector(
      ".fc-right"
    );
    dayButton = calendarHeaderViewSelectorButtons.querySelector(
      ".fc-timeGridDay-button"
    );
    weekButton = calendarHeaderViewSelectorButtons.querySelector(
      ".fc-timeGridWeek-button"
    );
    calendarTodayButton = calendarHeader.querySelector(".fc-today-button");
    calendarPreviousButton = calendarHeader.querySelector(".fc-prev-button");
    calendarNextButton = calendarHeader.querySelector(".fc-next-button");

    // Customization
    dayButton.innerHTML =
      '<i class="material-icons calendar-icon">today</i>' + "<p>Day</p>";
    dayButton.classList.add("calendar-button-theme");

    weekButton.innerHTML =
      '<i class="material-icons calendar-icon">view_week</i>' + "<p>Week</p>";
    weekButton.classList.add("calendar-button-theme");

    calendarTodayButton.innerHTML =
      '<i class="material-icons calendar-icon">calendar_today</i>' +
      "<p>Today</p>";
    calendarTodayButton.classList.add("calendar-button-theme");

    calendarNextButton.classList.add("calendar-button-theme");

    calendarPreviousButton.classList.add("calendar-button-theme");
  }

  /**
   * Function that initializes functions and variables
   */
  function initialize() {
    // Calendar init and render
    calendar = new FullCalendar.Calendar(calendarElement, {
      plugins: ["timeGrid"],
      defaultView: "timeGridDay",
      nowIndicator: true,
      weekends: false,
      header: {
        left: "prev,next, today",
        center: "title",
        right: "timeGridDay, timeGridWeek"
      }
    });

    calendar.render();
    // Usernames init
    username.value = email;
    let teacherEmail = user.teacherEmail;
    // Timer init
    minuteTimer = user.studentTime;
    document.querySelectorAll(".hand-span").forEach(element => {
      element.style.animationDuration = user.studentTime.toString(10) + "s";
    });
    document.querySelector(".minute").style.animationDuration =
      user.studentTime.toString(10) + "s";
    // Snapshot of the data allows us to call the function whenever our data is changed
    // Currently used to automatically adjust timer when changed by the target
    db.collection("Users")
      .doc(user.email)
      .onSnapshot(doc => {
        let data = doc.data();
        // Check if timer is changed
        if (user.studentTime != data.studentTime) {
          // Adjust
          user.studentTime = data.studentTime;
          minuteTimer = user.studentTime;
          document.querySelectorAll(".hand-span").forEach(element => {
            element.style.animationDuration =
              user.studentTime.toString(10) + "s";
          });
          document.querySelector(".minute").style.animationDuration =
            user.studentTime.toString(10) + "s";
        }
      });
    // get target's photo
    targetUsername.value = teacherEmail;
    usernameLabel.innerHTML = user.displayName;
    userProfilePhoto.style.backgroundImage = "url('" + user.photoURL + "')";
    userProfileState.style.backgroundColor = "#47bf39";
    // Notif
    if (user.beforeClassStartNotification == "True")
      beforeStartCheckbox.checked = true;
    if (user.beforeClassEndNotification == "True")
      beforeEndCheckbox.checked = true;
    setNotifRangeInput.value = user.notificationRange;
    setNotifFrequencyInput.value = user.notificationFrequency;
    // Target Label Set
    if (user.isTeacher == "False") {
      targetUsernameLabelMainText = "Home Classroom";
      targetUsernameLabelSelectedText = "Other Classroom";

      setStudentSaveButton.disabled = false;
      setStudentTimeInput.disabled = false;
    } else if (user.isTeacher == "True") {
      targetUsernameLabelMainText = "Student Email";
      targetUsernameLabelSelectedText = "Other Email";
    } else {
      targetUsernameLabelMainText = "N/A";
      targetUsernameLabelSelectedText = "N/A";
    }
    targetUsernameLabel.innerHTML = targetUsernameLabelMainText;
    // Store target (teacher) data locally
    db.collection("Users")
      .doc(user.teacherEmail)
      .get()
      .then(doc => {
        if (doc.exists) {
          teacherUser = doc.data();
          // Snapshot to update online status visually once changed in the database
          teacherUserDatabaseRef = firebase
            .database()
            .ref("/status/" + teacherUser.uid)
            .on("value", snapshot => {
              if (snapshot) {
                let tempData = snapshot.val();
                teacherState = tempData.state;
                teacherStateLastChanged = tempData.last_changed;
                // Set teacher profile photo
                teacherProfilePhoto.style.backgroundImage =
                  "url('" + teacherUser.photoURL + "')";

                if (teacherState == "offline") {
                  teacherProfileState.style.backgroundColor = "transparent";
                } else {
                  teacherProfileState.style.backgroundColor = "#47bf39";
                }
              } else {
                teacherProfileState.style.backgroundColor = "transparent";
              }
            });
        } else {
          // Undefined
          console.log("No Such Document");
        }
      })
      .catch(err => {
        console.log("Error getting document: ", err);
      });
    
    /**
     * Function that is called when user is typing to change target email
     */
    teacherChangeEmailInput.addEventListener("keyup", () => {
      // Things to display:
      // - whether a proper email format
      // - whether the target email and target retype email match
      var regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (regexEmail.test(teacherChangeEmailInput.value.toLowerCase())) {
        if (teacherChangeEmailInput.value == teacherChangeRetypeInput.value) {
          // Same email and proper format
          teacherEmailError.innerHTML = "";
          teacherRetypeEmailError.innerHTML = "";
        } else {
          // Different emails proper format
          teacherEmailError.innerHTML = "Emails not matching";
        }
      } else {
        // Improper email format and not same
        teacherEmailError.innerHTML = "Email not proper format";
      }
    });
    
    /**
     * Same as above but for the retype email
     */
    teacherChangeRetypeInput.addEventListener("keyup", () => {
      var regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (regexEmail.test(teacherChangeRetypeInput.value.toLowerCase())) {
        if (teacherChangeEmailInput.value == teacherChangeRetypeInput.value) {
          // Same email and proper format
          teacherEmailError.innerHTML = "";
          teacherRetypeEmailError.innerHTML = "";
        } else {
          // Different emails proper format
          teacherRetypeEmailError.innerHTML = "Emails not matching";
        }
      } else {
        // Improper email format
        teacherRetypeEmailError.innerHTML = "Email not proper format";
      }
    });
    /* --------------------------------------------- */
    /* ------------MATERIAL DESIGN INIT--------------*/
    /* --------------------------------------------- */

    // open modal to see settins for user
    drawerSettingsButton.addEventListener("click", event => {
      // makes so that settings is not a transitionable drawer button
      // it is in a timeout because of conflict css transitions which solves
      //the problem
      setTimeout(() => {
        onSettingsPage = true;
        saveTeacherEmailButton.style.display = "none";
        teacherRetypeEmailInputWorkable.style.display = "none";
        teacherRetypeEmailError.style.display = "none";
        drawerList.selectedIndex = 0;
        drawerSettingsButton.classList.remove("mdc-list-item--activated");
        drawerHomeButton.classList.add("mdc-list-item--activated");
        settingsModal.style.display = "flex";
        // Initial teacher email change input setup
        teacherChangeEmailInput.value = user.teacherEmail;
        teacherChangeEmailLabel.innerHTML = "Target Email";
        teacherEmailChangeNotch.classList.add("mdc-notched-outline--notched");
        teacherChangeEmailLabel.classList.add(
          "mdc-floating-label--float-above"
        );
        teacherEmailChangeWidth.style.width = "77.5px";
        previousTeacherEmail = targetUsername.value;
        // Set tab index's
        drawerOpenButton.tabIndex = "-1";
        targetUsername.tabIndex = "-1";
        callButton.tabIndex = "-1";
        hangupButton.tabIndex = "-1";

        settingsEmailTab.tabIndex = "5";
        settingsTimeTab.tabInded = "6";
      }, 5);
    });

    drawerHeaderName.innerHTML = user.displayName;
    drawerHeaderEmail.innerHTML = user.email;

    mdc.ripple.MDCRipple.attachTo(drawerOpenButton);
    
    /**
     * Function to open the drawer once clicked
     */
    drawerOpenButton.addEventListener("click", function() {
      if (drawer.open) {
        drawer.open = false;
      } else {
        drawer.open = true;
        drawerHomeButton.tabIndex = "0";
      }
    });

    // Allow drawer to close when item in drawer is selected
    const listEl = document.querySelector(".mdc-drawer .mdc-list");
    listEl.addEventListener("click", event => {
      drawer.open = false;
    });
    
    // Function to open settings menu
    settingsSpan.addEventListener("click", () => {
      settingsModal.click();
    });

    /**
     * Function that runs when an object was clicked
     */
    window.addEventListener("click", event => {
      // Load settings menu
      if (event.target == settingsModal) {
        // Notif
        if (user.beforeClassStartNotification == "True")
          beforeStartCheckbox.checked = true;
        if (user.beforeClassEndNotification == "True")
          beforeEndCheckbox.checked = true;
        setNotifRangeInput.value = user.notificationRange;
        setNotifFrequencyInput.value = user.notificationFrequency;
        // Set tab index's
        drawerOpenButton.tabIndex = "1";
        targetUsername.tabIndex = "2";
        callButton.tabIndex = "3";
        hangupButton.tabIndex = "4";

        settingsEmailTab.tabIndex = "-1";
        settingsTimeTab.tabIndex = "-1";

        teacherEmailError.innerHTML = "";
        teacherRetypeEmailError.innerHTML = "";
        setStudentError.innerHTML = "";

        onSettingsPage = false;
        settingsModal.style.display = "none";
        // Reset teacher email editing
        teacherChangeEmailInput.value = user.teacherEmail;
        teacherChangeEmailLabel.innerHTML = "";
        // Remove notch, floating property, and reset width
        teacherEmailChangeNotch.classList.remove(
          "mdc-notched-outline--notched"
        );
        teacherChangeEmailLabel.classList.remove(
          "mdc-floating-label--float-above"
        );
        teacherChangeRetypeInput.value = "";
      }
      if (event.target == calendarModal) {
        // Close calendar if clicked outside the calendar while it is open
        calendarModal.style.display = "none";
        onCalendarPage = false;
      }
      // Target username
      if (event.target == targetUsername) {
        targetUsernameLabel.innerHTML = targetUsernameLabelSelectedText;
      }
      if (event.target != targetUsername) {
        if (targetUsernameTextInput.value == "") {
          targetUsernameTextInput.value = user.teacherEmail;
          targetUsernameLabel.innerHTML = targetUsernameLabelMainText;
        } else if (targetUsernameTextInput.value == user.teacherEmail) {
          targetUsernameLabel.innerHTML = targetUsernameLabelMainText;
        }
      }
    });
    
    /**
     * Function that undo's the changing of the teacher's email
     */
    undoTeacherEmailChangeButton.addEventListener("click", () => {
      console.log(previousTeacherEmail);
      db.collection("Users")
        .doc(user.email)
        .set({
          displayName: user.displayName,
          email: user.email,
          teacherEmail: previousTeacherEmail,
          uid: uid,
          photoURL: user.photoURL,
          isTeacher: user.isTeacher,
          studentTime: user.studentTime,
          beforeClassStartNotification: user.beforeClassStartNotification,
          beforeClassEndNotification: user.beforeClassEndNotification,
          notificationFrequency: user.notificationFrequency,
          notificationRange: user.notificationRange
        })
        .then(function() {
          teacherUser = previousTeacherUser;
          teacherProfilePhoto.style.backgroundImage = previousTeacherProfilePicture;
          teacherChangeEmailLabel.innerHTML = "Target Email";
          user.teacherEmail = previousTeacherEmail;
          targetUsername.value = previousTeacherEmail;
          teacherChangeEmailSnackbar.close();
          teacherUserDatabaseRef = firebase
            .database()
            .ref("/status/" + teacherUser.uid)
            .on("value", snapshot => {
              let tempData = snapshot.val();
              teacherState = tempData.state;
              teacherStateLastChanged = tempData.last_changed;
              // Set teacher profile photo
              teacherProfilePhoto.style.backgroundImage =
                "url('" + teacherUser.photoURL + "')";

              if (teacherState == "offline") {
                teacherProfileState.style.backgroundColor = "transparent";
              } else {
                teacherProfileState.style.backgroundColor = "#47bf39";
              }
            });
          console.log("Undid Change");
        })
        .catch(function(error) {
          console.error("Error changing email: ", error);
        });
    });

    /**
     * Function to dynamically clear the target input if clicked
     * and if nothing is inputted, to change it back to the previously
     * saved target email
     */
    var tempEmailInput = "";
    teacherChangeEmailInput.addEventListener("click", () => {
      teacherChangeEmailInputClick();
    });
    teacherChangeEmailInput.addEventListener("focus", () => {
      teacherChangeEmailInputClick();
    });
    function teacherChangeEmailInputClick() {
      if (teacherChangeEmailInput.value == user.teacherEmail) {
        teacherChangeEmailInput.value = "";
      }
      teacherRetypeEmailInputWorkable.style.display = "flex";
      saveTeacherEmailButton.style.display = "block";
      teacherRetypeEmailError.style.display = "block";
      tempEmailInput = teacherChangeEmailInput.value;

      teacherChangeEmailLabel.innerHTML = "Target Email";
    }

    /**
     * Function that is called when saving the change of the 
     * target email address
     */
    saveTeacherEmailButton.addEventListener(
      "click",
      () => {
        
        // Check if email address and retype email address are both valid
        // addresses and are the same
        if (teacherChangeRetypeInput.value == teacherChangeEmailInput.value) {
          // Same email
          var regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if (regexEmail.test(teacherChangeRetypeInput.value.toLowerCase())) {
            // valid email format, upload database and local variables
            console.log("Uploading email:", teacherChangeEmailInput.value);
            db.collection("Users")
              .doc(user.email)
              .set({
                displayName: user.displayName,
                email: user.email,
                teacherEmail: teacherChangeEmailInput.value,
                uid: uid,
                photoURL: user.photoURL,
                isTeacher: user.isTeacher,
                studentTime: user.studentTime,
                beforeClassStartNotification: user.beforeClassStartNotification,
                beforeClassEndNotification: user.beforeClassEndNotification,
                notificationFrequency: user.notificationFrequency,
                notificationRange: user.notificationRange
              })
              .then(function() {
                // Get new teacher profile photo
                db.collection("Users")
                  .doc(teacherChangeEmailInput.value)
                  .get()
                  .then(doc => {
                    previousTeacherProfilePicture =
                      teacherProfilePhoto.style.backgroundImage;
                    if (doc.exists) {
                      previousTeacherUser = teacherUser;
                      teacherUser = doc.data();
                      teacherProfilePhoto.style.backgroundImage =
                        "url('" + teacherUser.photoURL + "')";
                      teacherUserDatabaseRef = firebase
                        .database()
                        .ref("/status/" + teacherUser.uid)
                        .on("value", snapshot => {
                          // Snapshot for updating newly changed teacher online/offline status
                          if (snapshot) {
                            // once added snapshot, change local variables and profile photo
                            let tempData = snapshot.val();
                            teacherState = tempData.state;
                            teacherStateLastChanged = tempData.last_changed;
                            // Set teacher profile photo
                            teacherProfilePhoto.style.backgroundImage =
                              "url('" + teacherUser.photoURL + "')";

                            if (teacherState == "offline") {
                              teacherProfileState.style.backgroundColor =
                                "transparent";
                            } else {
                              teacherProfileState.style.backgroundColor =
                                "#47bf39";
                            }
                          } else {
                            teacherProfileState.style.backgroundColor =
                              "transparent";
                          }
                        });
                    } else {
                      // Undefined
                      console.log("No Such Document");
                      teacherProfilePhoto.style.backgroundImage = `url("https://www.cmcaindia.org/wp-content/uploads/2015/11/default-profile-picture-gmail-2.png")`;
                    }
                  })
                  .catch(err => {
                    console.log("Error getting document: ", err);
                  });
                // Exit out of settings
                teacherChangeEmailLabel.innerHTML = "Target Email";
                user.teacherEmail = teacherChangeEmailInput.value;
                targetUsername.value = teacherChangeEmailInput.value;
                settingsModal.click();
                teacherChangeEmailSnackbar.open();
                console.log(user);
                console.log("Email Changed!!!");
              })
              .catch(function(error) {
                console.error("Error changing email: ", error);
              });
          } else {
            // Not valid email format
            // teacherImproperChangeEmailSnackbar.open();
          }
        } else {
          // teacherChangeEmailDifferentSnackbar.open();
        }
      }
      // teacherChangeEmailInput.value = "";
    );

    /* --------------------------------------------- */
    /* --------------------------------------------- */
    /* --------------------------------------------- */
    // Initial registration with server
    console.log("Identifying self with server: " + username.value);
    sendToServer(
      username.value,
      targetUsername.value,
      "initial-registration",
      ""
    );
    listenSelf();

    socket.on("connect", () => {
      console.log("Found Node Server, setting self as classroom");
      targetIcon.style.display = "none";
      targetUsername.hidden = true;
      callButton.style.display = "none";
      isStudent = false;
    });
  }

  /**
   * Function to answer a WebRTC call
   * @param {object} call 
   */
  function answer(call) {
    createPeerConnection();

    console.log(
      "Answering a call from: " +
        call.data().targetUsername +
        " with description " +
        call.data().sdp
    );
    console.log(JSON.parse(call.data().sdp));
    var desc = new RTCSessionDescription(JSON.parse(call.data().sdp));
    pc.setRemoteDescription(desc)
      .then(function() {
        return navigator.mediaDevices.getUserMedia(constraints);
      })
      .then(function(stream) {
        localStream = stream;
        document.getElementById("localVideo").srcObject = localStream;
        localStream
          .getTracks()
          .forEach(track => pc.addTrack(track, localStream));
      })
      .then(function() {
        return pc.createAnswer();
      })
      .then(function(answer) {
        return pc.setLocalDescription(answer);
      })
      .then(function() {
        sendToServer(
          targetUsername.value,
          username.value,
          "video-answer",
          JSON.stringify(pc.localDescription)
        );
      })
      .catch();
  }

  /**
   * Function that listens for changes within the target user
   */
  function listenTarget() {
    const target = targetUsername.value;
    // Setting up a listener for changes in targetUsername values in the database
    console.log("Fetching records matching username: " + target);
    db.collection("SDP")
      .doc(target)
      .onSnapshot(
        function(doc) {
          var user = doc.data().username;
          var targetUser = doc.data().targetUsername;
          var type = doc.data().type;
          var sdp = doc.data().sdp;

          if (type == "initial-registration") {
            console.log("Found caller username " + user);
            targetUsername.value = user;
          }
        },
        function(error) {
          console.log(error);
        }
      );
  }
  
  /**
   * Function to handle incoming data to move the camera
   * @param {String} peerData 
   */
  function handlePeerData(peerData) {
    console.log(peerData);

    switch (peerData) {
      case "w":
        zoomIn(1);
        break;
      case "a":
        //add motor left
        socket.emit("left");
        break;
      case "s":
        zoomOut(1);
        break;
      case "d":
        //add motor right
        socket.emit("right");
        break;
      case "q":
        socket.emit("stop");
        break;
      case "Enter":
        waveHand();
        break;
      case "urgentQ":
        urgentHand();
        break;
      default:
      // code block
    }
  }
  // Hand functions

  /**
   * Function to wave hand
   */
  function waveHand() {
    document.getElementById("hand").style.display = "block";
    document.getElementById("hand").classList.add("handAnimation0");
    setTimeout(function() {
      document.getElementById("hand").style.display = "none";
    }, 5000);
  }
  /**
   * Function to wave hand urgently
   */
  function urgentHand() {
    document.getElementById("hand").style.display = "block";
    document.getElementById("hand").classList.add("handAnimation1");
    Bell.play();
    setTimeout(function() {
      document.getElementById("hand").style.display = "none";
    }, 5000);
  }
  /**
   * Function to stop the cooldown
   */
  function finishCooldown() {
    coolDown = false;
    document.getElementsByClassName("timer-group")[0].style.display = "none";
  }
  /**
   * Function to stop the urgent cooldown
   */
  function urgentCooldown() {
    urgentQuestion = false;
  }
  /**
   * Function that is ran every second to display the passage
   * of time visually
   */
  function onTimer() {
    if (minuteTimerAct) {
      document.getElementById("timerText").innerHTML =
        "Try Again In " + minuteTimer.toString();

      minuteTimer--;
      if (minuteTimer < 0) {
        minuteTimer = user.studentTime;
        minuteTimerAct = false;
        coolDown = false;
        document.getElementsByClassName("timer-group")[0].style.display =
          "none";
      } else {
        setTimeout(onTimer, 1000);
      }
    }
  }

  /**
   * Function that listens to changes in our database for RTC connections
   */
  function listenSelf() {
    console.log("Listening for changes in the entry matching our username ");
    db.collection("SDP")
      .doc(username.value)
      .onSnapshot(
        function(doc) {
          if (doc.exists) {
            console.log("Received data: ", doc.data());

            var user = doc.data().username;
            var targetUser = doc.data().targetUsername;
            var type = doc.data().type;
            var sdp = doc.data().sdp;

            if (type == "initial-registration") {
              console.log("Found a registration for our user " + user);
            }
            if (type == "video-offer") {
              console.log(
                "Received video offer from remote peer " + targetUser
              );
              console.log("Setting our targetUsername to " + targetUser);
              targetUsername.value = targetUser;
              listenTarget();
              answer(doc);
            } else if (type == "ice-candidate") {
              console.log("Received ICE candidate from user " + targetUser);
              receiveIce(sdp);
            } else if (type == "video-answer") {
              console.log("Received video-answer");
              var desc = new RTCSessionDescription(JSON.parse(sdp));
              pc.setRemoteDescription(desc).catch(function(e) {
                console.log(e);
              });
            } else if (type == "peer-data") {
              console.log("Received communication from peer: " + targetUser);
              handlePeerData(sdp);
            }
          }
        },
        function(error) {
          console.log(error);
        }
      );
  }
  /**
   * Function to handle a video in a signalling state
   * @param {object} event 
   */
  function handleTrackEvent(event) {
    console.log(
      "Attaching remote video in signalling state: " +
        pc.signalingState +
        " and connection state: " +
        pc.connectionState
    );
    console.log(
      "Stream active status is: " +
        event.streams[0].active +
        " track readystate is: " +
        event.track.readyState +
        "track kind is: " +
        event.track.kind +
        " track is remote: " +
        event.track.remote
    );
    document.getElementById("remoteVideo").srcObject = event.streams[0];
  }
}
