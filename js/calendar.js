var events = null;

// Client ID and API key from the Developer Console
var CLIENT_ID =
  "1053696254964-r66l5j9ll5p8rt5gukocqo5qpseds8q0.apps.googleusercontent.com";
var API_KEY = "AIzaSyCfJk9eRLfxozjdfbv7tJv-CkpP7Wmf05g";
var events = null;

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"
];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

var authorizeButton = document.getElementById("authorize_button");
var signoutButton = document.getElementById("signout_button");
var calendarElement = document.getElementById("calendar");
var calendarWidget = document.getElementById("calendar-widget");

var calendarHeader;
var calendarHeaderViewSelectorButtons;
var calendarTodayButton;
var calendarPreviousButton;
var calendarNextButton;
var dayButton;
var weekButton;
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
/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client
    .init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    })
    .then(
      function() {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        // updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        // authorizeButton.onclick = handleAuthClick;
        handleAuthClick();
        // signoutButton.onclick = handleSignoutClick;
      },
      function(error) {
        appendPre(JSON.stringify(error, null, 2));
      }
    );
  console.log("Event initialized");
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    console.log("Signed In!!")
    // authorizeButton.style.display = "none";
    // signoutButton.style.display = "block";
    // listUpcomingEvents();
  } else {
    console.log("Not Signed In!!")
    // authorizeButton.style.display = "block";
    // signoutButton.style.display = "none";
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
// Not used here
function listUpcomingEvents() {
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
      events = response.result.items;
    });
}


