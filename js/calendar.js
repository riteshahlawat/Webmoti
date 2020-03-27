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
    authorizeButton.style.display = "none";
    signoutButton.style.display = "block";
    // listUpcomingEvents();
  } else {
    authorizeButton.style.display = "block";
    signoutButton.style.display = "none";
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
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
  calendarHeaderViewSelectorButtons = calendarHeader.querySelector(".fc-right");
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
