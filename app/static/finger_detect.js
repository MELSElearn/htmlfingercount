const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
videoElement.setAttribute('autoplay', '');
videoElement.setAttribute('muted', '');
videoElement.setAttribute('playsinline', '');
const fingers =[];

const canvasElement2 = document.getElementById("output_canvas2");
const canvasCtx2 = canvasElement2.getContext('2d');

var video = document.querySelector("#input_video");

const fingerpoint = [8, 12, 16, 20];
var fingerscount;

function getxy(a)
{
    let mx,my
    let myJSON = JSON.stringify(a);
	let myJSON2 = JSON.parse(myJSON);
	mx = parseInt(myJSON2.x*canvasElement.width);
	my = parseInt(myJSON2.y*canvasElement.height);
    return [mx, my];
}

function onResults(results) {
  fingerscount = 0;
  var cx,cy;	
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
  if (results.multiHandLandmarks) {
      
    for (const landmarks of results.multiHandLandmarks) {
        //check thumb position
        let cpos = getxy(landmarks[17]);
        let cpos2 = getxy(landmarks[2]);

        let tpos = getxy(landmarks[4]);
        let tpos2 = getxy(landmarks[3]);
        if (cpos[0]< cpos2[0])
        {
            //left hand
            if (tpos2[0]< tpos[0])
            {
                fingerscount = fingerscount + 1;
            }
        }else
        {
            //right hand
            if (tpos2[0]> tpos[0])
            {
                fingerscount = fingerscount + 1;
            }
        }

        for (let i = 0; i < fingerpoint.length; i++) {
            let pos = getxy(landmarks[fingerpoint[i]]);
            let pos2 = getxy(landmarks[fingerpoint[i]-2]);
            cx = pos[0];
            cy = pos[1];
            if (pos2[1]> pos[1])
            {   
                fingerscount = fingerscount + 1;
            }
        }
        

      
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
                     {color: '#00FF00', lineWidth: 5});
      drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 2});
    }
  }

  canvasCtx.font = "20px Arial";
  canvasCtx.fillText("Finger Count=" + fingerscount, 10, 20);
}

function onResults2(results) {
  canvasCtx2.save();
  canvasCtx2.translate(canvasElement2.width, 0);
  canvasCtx2.scale(-1, 1);
  canvasCtx2.clearRect(0, 0, canvasElement2.width, canvasElement2.height);
  canvasCtx2.drawImage(
      results.image, 0, 0, canvasElement2.width, canvasElement2.height);
  canvasCtx2.restore();
}

const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.8,
  minTrackingConfidence: 0.8
});
hands.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    //await hands.send({image: videoElement});
    //flip the video content and load into output_canvas2 before process to detect finger
    onResults2({image: videoElement});
    //use the flipped image in output_canvas2 to detect finger
    await hands.send({image: canvasElement2});
  },
  width: 480,
  height: 480
});
camera.start();

