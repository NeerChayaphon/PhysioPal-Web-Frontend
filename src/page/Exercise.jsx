import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import React, {useRef, useState, useEffect} from 'react';
import '@tensorflow/tfjs-backend-webgl';
import Webcam from 'react-webcam';
import {count} from '../utils/music';
import '../App.css';
import {POINTS, keypointConnections} from '../utils/data';
import {drawPoint, drawSegment} from '../utils/helper';

let skeletonColor = 'rgb(255,255,255)';

const steps = [
  {
    name: 'Lie down',
    modelClass: 'LieDown',
    model:
      'https://seniorprojectdemomodel.blob.core.windows.net/startingdemo/startingmodel.json',
  },
  {
    name: 'Raise your knee up',
    modelClass: 'RaiseYourKneeUp',
    model:
    "https://seniorprojectdemomodel.blob.core.windows.net/demomodel/demo.json",
  },
  {
    name: 'Raise your back up',
    modelClass: 'RaiseYourBackUp',
    model:
    "https://seniorprojectdemomodel.blob.core.windows.net/demomodel/demo.json",
  },
];

const StartingPositionClass = {
    LieDown: 0,
    Standing: 1,
  };
  
  const ExerciseClass = {
    RaiseYourBackUp: 0,
    RaiseYourKneeUp: 1,
    LieDown: 2
  };

let interval;
let flag = false;

function Exercise() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [startingTime, setStartingTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [poseTime, setPoseTime] = useState(0);
  const [bestPerform, setBestPerform] = useState(0);
  // const [currentPose, setCurrentPose] = useState('LieDown');
  const [isStartPose, setIsStartPose] = useState(false);
  const [haveKeyPoint, setHaveKeyPoint] = useState(true);

  const [currentPose, setCurrentPose] = useState(steps[0]);
  const [stepCount, setStepCount] = useState(0);
  const [startingPosition,setStartingPosition] = useState(true)

  useEffect(() => {
    const timeDiff = (currentTime - startingTime) / 1000;
    if (flag) {
      setPoseTime(timeDiff);
    }
    if ((currentTime - startingTime) / 1000 > bestPerform) {
      setBestPerform(timeDiff);
    }
  }, [currentTime]);

  // useEffect(() => {
  //   setCurrentTime(0);
  //   setPoseTime(0);
  //   setBestPerform(0);
  // }, [currentPose]);

  const CLASS_NO = {
    LieDown: 0,
    Standing: 1,
  };

  function get_center_point(landmarks, left_bodypart, right_bodypart) {
    let left = tf.gather(landmarks, left_bodypart, 1);
    let right = tf.gather(landmarks, right_bodypart, 1);
    const center = tf.add(tf.mul(left, 0.5), tf.mul(right, 0.5));
    return center;
  }

  function get_pose_size(landmarks, torso_size_multiplier = 2.5) {
    let hips_center = get_center_point(
      landmarks,
      POINTS.LEFT_HIP,
      POINTS.RIGHT_HIP
    );
    let shoulders_center = get_center_point(
      landmarks,
      POINTS.LEFT_SHOULDER,
      POINTS.RIGHT_SHOULDER
    );
    let torso_size = tf.norm(tf.sub(shoulders_center, hips_center));
    let pose_center_new = get_center_point(
      landmarks,
      POINTS.LEFT_HIP,
      POINTS.RIGHT_HIP
    );
    pose_center_new = tf.expandDims(pose_center_new, 1);

    pose_center_new = tf.broadcastTo(pose_center_new, [1, 17, 2]);
    // return: shape(17,2)
    let d = tf.gather(tf.sub(landmarks, pose_center_new), 0, 0);
    let max_dist = tf.max(tf.norm(d, 'euclidean', 0));

    // normalize scale
    let pose_size = tf.maximum(
      tf.mul(torso_size, torso_size_multiplier),
      max_dist
    );
    return pose_size;
  }

  function normalize_pose_landmarks(landmarks) {
    let pose_center = get_center_point(
      landmarks,
      POINTS.LEFT_HIP,
      POINTS.RIGHT_HIP
    );
    pose_center = tf.expandDims(pose_center, 1);
    pose_center = tf.broadcastTo(pose_center, [1, 17, 2]);
    landmarks = tf.sub(landmarks, pose_center);

    let pose_size = get_pose_size(landmarks);
    landmarks = tf.div(landmarks, pose_size);
    return landmarks;
  }

  function landmarks_to_embedding(landmarks) {
    // normalize landmarks 2D
    landmarks = normalize_pose_landmarks(tf.expandDims(landmarks, 0));
    let embedding = tf.reshape(landmarks, [1, 34]);
    return embedding;
  }

  const runMovenet = async () => {
    console.log(currentPose);
    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
    };
    const detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      detectorConfig
    );
    // const poseClassifier = await tf.loadLayersModel(
    //   "https://seniorprojectdemomodel.blob.core.windows.net/demomodel/demo.json"
    // );

    // ## Correct
    // const poseClassifier = await tf.loadLayersModel(
    //   "https://seniorprojectdemomodel.blob.core.windows.net/demomodel/demo.json"
    // );

    // ## Correct
    const poseClassifier = await tf.loadLayersModel(steps[stepCount].model);
    console.log(steps[stepCount].model);
    console.log(steps[stepCount].name);

    // const poseClassifier = await tf.loadLayersModel(
    //   'https://seniorprojectdemomodel.blob.core.windows.net/startingdemo/startingmodel.json'
    // );
    const countAudio = new Audio(count);
    countAudio.loop = true;
    interval = setInterval(() => {
      detectPose(detector, poseClassifier, countAudio);
    }, 100);
  };

  const detectPose = async (detector, poseClassifier, countAudio) => {
    if (
      typeof webcamRef.current !== 'undefined' &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      let notDetected = 0;
      const video = webcamRef.current.video;
      const pose = await detector.estimatePoses(video);
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      try {
        const keypoints = pose[0].keypoints;
        let input = keypoints.map((keypoint) => {
          if (keypoint.score > 0.4) {
            if (
              !(
                keypoint.name === 'left_eye' || keypoint.name === 'right_eye'
              ) &&
              haveKeyPoint
            ) {
              drawPoint(ctx, keypoint.x, keypoint.y, 4, 'rgb(255,255,255)');
              let connections = keypointConnections[keypoint.name];
              try {
                connections.forEach((connection) => {
                  let conName = connection.toUpperCase();
                  drawSegment(
                    ctx,
                    [keypoint.x, keypoint.y],
                    [
                      keypoints[POINTS[conName]].x,
                      keypoints[POINTS[conName]].y,
                    ],
                    skeletonColor
                  );
                });
              } catch (err) {}
            }
          } else {
            notDetected += 1;
          }
          return [keypoint.x, keypoint.y];
        });
        if (notDetected > 4) {
          skeletonColor = 'rgb(255,255,255)';
          return;
        }

        const classifier = () => {
          const processedInput = landmarks_to_embedding(input);
          const classification = poseClassifier.predict(processedInput);
          classification.array().then((data) => {
            // const classNo =  startingPosition ? CLASS_NO["Correct"] : CLASS_NO["RaiseYourKneeMore"];
            // const classNo = steps[stepCount].modelClass;
            const classNo =  startingPosition ? StartingPositionClass[steps[stepCount].modelClass] : ExerciseClass[steps[stepCount].modelClass];
            console.log(steps[stepCount].modelClass);
            // console.log(data[0][0]);
            // console.log(data[0][1]);
            if (data[0][classNo] > 0.9) {
              // setCurrentPose(steps[1]);
              // if (stepCount != steps.length - 1) {
              //   setStepCount(stepCount + 1);
              //   setCurrentPose(steps[stepCount + 1])
              // } else {
              //   if (!flag) {
              //     countAudio.play();
              //     setStartingTime(new Date(Date()).getTime());
              //     flag = true;
              //   }
              //   setCurrentTime(new Date(Date()).getTime());
              //   skeletonColor = 'rgb(0,255,0)';
              // }

              if (stepCount === steps.length - 1) {
                if (!flag) {
                  countAudio.play();
                  setStartingTime(new Date(Date()).getTime());
                  flag = true;
                }
                setCurrentTime(new Date(Date()).getTime());
                skeletonColor = 'rgb(0,255,0)';
              } else {
                if (stepCount == 0) {
                  setStartingPosition(false)
                }
                setCurrentPose(steps[stepCount + 1])
                clearInterval(interval)
                setStepCount(stepCount + 1)
              }


            } else {
              flag = false;
              skeletonColor = 'rgb(255,255,255)';
              countAudio.pause();
              countAudio.currentTime = 0;
            }
          });
        };
        classifier();
      } catch (err) {
        console.log(err);
      }
    }
  };

  function startYoga() {
    setIsStartPose(true);
    // runMovenet();
  }

  function stopPose() {
    setIsStartPose(false);
    clearInterval(interval);
  }

  useEffect(() => {
    if (isStartPose) {
      runMovenet();
    }
  }, [stepCount, isStartPose]);

  return (
    <div className='yoga-container'>
      <div className='performance-container'>
        <div className='pose-performance'>
          <h4>Pose Time: {poseTime} s</h4>
        </div>
        <div className='pose-performance'>
          {isStartPose && <h4>Step {stepCount+1}: {currentPose.name}</h4>}
        </div>
      </div>
      <div>
        <div className='flexclass'>
          <Webcam
            width='640px'
            height='480px'
            id='webcam'
            ref={webcamRef}
            style={{
              position: 'absolute',
              left: 120,
              top: 100,
              padding: '0px',
            }}
          />
          <canvas
            ref={canvasRef}
            id='my-canvas'
            width='640px'
            height='480px'
            style={{
              position: 'absolute',
              left: 120,
              top: 100,
              zIndex: 1,
            }}
          ></canvas>
          
        </div>
      </div>
      {!isStartPose && (
        <button onClick={startYoga} className='secondary-btn2'>
          Start Pose
        </button>
      )}
      {isStartPose && (
        <button onClick={stopPose} className='secondary-btn2'>
          Stop Pose
        </button>
      )}
    </div>
  );
}

export default Exercise;
