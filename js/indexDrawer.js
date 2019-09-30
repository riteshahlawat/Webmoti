var drawer = mdc.drawer.MDCDrawer.attachTo(
  document.querySelector(".mdc-drawer")
);

// Allow drawer to open
var button = document.querySelector("button");
mdc.ripple.MDCRipple.attachTo(button);
button.addEventListener("click", function() {
  if (drawer.open) {
    drawer.open = false;
  } else {
    drawer.open = true;
  }
});

// Allow drawer to close when item in drawer is selected
const listEl = document.querySelector('.mdc-drawer .mdc-list');
listEl.addEventListener('click', (event) => {
  drawer.open = false;
});
