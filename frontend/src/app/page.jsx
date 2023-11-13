'use client';
import { useEffect, useRef, useState } from 'react';
import { FaCamera, FaMicrophone, FaStop } from 'react-icons/fa';

const Home = () => {
  const videoRef = useRef();
  const [prediction, setPrediction] = useState('Clasificando...');
  const [voiceRecognitionActive, setVoiceRecognitionActive] = useState(false);
  let recognitionInstance = '';

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (error) {
        console.error('Error al acceder a la cámara:', error);
      }
    };
    startCamera();
  }, []);

  const startVoiceRecognition = () => {
    const recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (recognition) {
      setVoiceRecognitionActive(true);
      recognitionInstance = new recognition();
      recognitionInstance.continuous = true;
      recognitionInstance.lang = "es-ES";
      recognitionInstance.stop();
      if (typeof recognitionInstance.start === 'function') {
        recognitionInstance.onresult = handleVoiceCommand;

        recognitionInstance.onend = () => {
          if (voiceRecognitionActive) {
            recognitionInstance.start();
          }
        };
        recognitionInstance.start();
      } else {
        alert('La función start no está disponible en este navegador.');
      }
    } else {
      alert('La funcionalidad de reconocimiento de voz no es compatible con este navegador.');
    }
  };

  const handleVoiceCommand = (event) => {
    const results = event.results;
    const lastResult = results[results.length - 1];
    const command = lastResult[0].transcript.toLowerCase().trim();
    console.log('el comando escuchado es: ', command)
      console.log(command === 'reconocer fruta' )
      if (command == 'reconocer fruta') {
        setVoiceRecognitionActive(true);
        captureImage();
      } else if (command === 'parar') {
        console.log('servicio detenido...');
        setVoiceRecognitionActive(false);
        recognitionInstance.stop();
      }
  };

  const captureImage = async () => {
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (window.innerWidth < window.innerHeight) {
      canvas.width = video.videoHeight;
      canvas.height = video.videoWidth;
      ctx.translate(canvas.width, 0);
      ctx.rotate(Math.PI / 2);
    } else {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imgBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));

    const formData = new FormData();
    formData.append('image', imgBlob, 'captured_image.jpg');

    try {
      const response = await fetch('http://localhost:3001/api/classify', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log('Clasificación:', data.prediction);
      setPrediction(data.prediction);
      speakText(`${data.prediction}`);
    } catch (error) {
      console.error('Error al enviar la imagen a la API:', error);
    }
  };

  const speakText = (text) => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Clasificación de Imágenes en Tiempo Real</h1>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className='pred-video'
      />
      <p>
      {prediction && <label className='pred-text'>Predicción: {prediction}</label>}
      </p>
      <button className="icon-button" onClick={captureImage} disabled={voiceRecognitionActive}>
        <FaCamera className="icon" size={35} />
      </button>
      <button className="icon-button" onClick={() => startVoiceRecognition()} disabled={voiceRecognitionActive}>
        <FaMicrophone className="icon" size={35} />
      </button>
      <button className="icon-button" onClick={() => setVoiceRecognitionActive(false)} disabled={!voiceRecognitionActive}>
        <FaStop className="icon" size={35} />
      </button>
    </div>
  );
};

export default Home;
