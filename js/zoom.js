

//SW Zoom
var zoomLevel = null;
var zoomProp = null;
var v = null;

  function zoom(){
  console.log("Software Zoom attached");
  /* predefine zoom and rotate */
  zoomLevel = 1;
  zoomProp='transform';
  /* Position video */
  v.style.left = 0;
  v.style.top = 0;
}
function zoomIn()
{
  console.log("Zooming in to zoomLevel: "+ zoomLevel);
zoomLevel = zoomLevel + 1;
remoteVideo.style[zoomProp]='scale('+zoomLevel+')';
console.log(zoomProp);
}
function zoomOut()
{
  console.log("Zooming out to zoomLevel: "+ zoomLevel);
  if(zoomLevel > 1){
  zoomLevel = zoomLevel - 1;
  }
 remoteVideo.style[zoomProp]='scale('+zoomLevel+')';

}
function resetZoom()
{
  zoomLevel = 1;
  remoteVideo.style[zoomProp]='scale('+zoomLevel+')';
}



//HW Zoom
var zoomMin = null;
var zoomMax = null;
var zoomStep = null;
var zoomValue = null;
var track = null;

function initZoom(mediaStream)
{
  console.log("Attaching zoom!");
  track = mediaStream.getVideoTracks()[0];
  const capabilities = track.getCapabilities();
  const settings = track.getSettings();

  // Check whether zoom is supported or not.
  if (!('zoom' in capabilities)) {
    return Promise.reject('Zoom is not supported by ' + track.label);
  }

  // Map zoom to a slider element.
  zoomMin = capabilities.zoom.min;
  zoomMax = capabilities.zoom.max;
  zoomStep = capabilities.zoom.step;
  zoomValue = settings.zoom;

}
function hwZoomIn(steps)
{
  var zoomCalc = zoomValue +(zoomStep*steps);
  track.applyConstraints({advanced: [ {zoom: zoomCalc} ]}).catch(error => {console.log(error)});
}
function hwZoomOut(steps)
{
  var zoomCalc = zoomValue - (zoomStep*steps);
  track.applyConstraints({advanced: [ {zoom: zoomCalc} ]}).catch(error => {console.log(error)});
}

