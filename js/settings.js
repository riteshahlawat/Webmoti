
var setStudentTimeInput = document.getElementById("set-student-input");
var teacherChangeEmailInput = document.getElementById(
  "teacher-change-email-input"
);
var teacherChangeRetypeInput = document.getElementById(
  "teacher-retype-email-input"
);
var teacherEmailError = document.getElementById("teacher-change-email-error");
var teacherRetypeEmailError = document.getElementById(
  "teacher-change-retype-email-error"
);
var setStudentError = document.getElementById("set-student-error");

var settingsEmailTab = document.getElementById("settings-email-tab");
var settingsTimeTab = document.getElementById("settings-teacher-tab");
var settingsNotifTab = document.getElementById("settings-notif-tab");
var currentSettingsTab = "email";

// Settings tabs
var settingsTimeBody = document.getElementById("teacher-settings-body");
var settingsEmailBody = document.getElementById("email-settings-body");
var settingsNotifBody = document.getElementById("notifications-settings-body");

var setStudentSaveButton = document.getElementById(
  "set-student-time-save-button"
);

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


