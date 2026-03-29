import { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";

function LivenessScanner({ uploadedIdFile, onVerificationSuccess ,onVerificationFailed,isUpdating}) {
  const webcamRef = useRef(null);
  const wsRef = useRef(null);
  const [serverMessage, setServerMessage] = useState("Converting ID Photo...");
  const [isVisible, setIsVisible] = useState(true);
  const isUpdatingRef = useRef(isUpdating);
  

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  useEffect(() => {
    let streamInterval;

    const startPipeline = async () => {
      try {
        const idPhotoBase64 = await fileToBase64(uploadedIdFile);
        // sends connection request to  websocket open at port 8000and endpoint liveness
        wsRef.current = new WebSocket("ws://localhost:8000/ws/liveness");

        // .onopen means when websocket accepts connection request 
        wsRef.current.onopen = () => {
          setServerMessage("Connection open. Sending ID for verification...");
          
          wsRef.current.send(
            JSON.stringify({
              type: "init",
              id_photo: idPhotoBase64,
              not_registering: isUpdatingRef.current
            }),
          );
         
          
        };

        wsRef.current.onmessage = (event) => {
          const response = JSON.parse(event.data);
          setServerMessage(response.message);

          if (response.status === "processing" && !streamInterval) {
            streamInterval = setInterval(() => {
              if (
                webcamRef.current &&
                wsRef.current.readyState === WebSocket.OPEN
              ) {
                const livePhotoBase64 = webcamRef.current.getScreenshot();
                if (livePhotoBase64) {
                  wsRef.current.send(
                    JSON.stringify({
                      type: "frame",
                      live_photo: livePhotoBase64,
                    }),
                  );
                }
              }
            }, 200);
          }

          if (response.status === "success") {
            clearInterval(streamInterval);
            wsRef.current.close();
            onVerificationSuccess(response.descriptor);
            
          }

         
          if (response.status === "failed") {
            clearInterval(streamInterval);
            wsRef.current.close();
            setIsVisible(false);
            alert(response.message);
            onVerificationFailed();
          }
          
        };
      } catch (error) {
        console.error("Failed to start scanner:", error);

        setServerMessage("Failed to initialize scanner.");
      }
    };

    if (uploadedIdFile) {
      startPipeline();
    }

    return () => {
      if (streamInterval) clearInterval(streamInterval);
      if (wsRef.current) wsRef.current.close();
    };
  }, [uploadedIdFile, onVerificationSuccess,onVerificationFailed]);

  const handleCancel = () => {
    if (wsRef.current) wsRef.current.close();
    onVerificationFailed();
    setIsVisible(false); 
  };

  if (!isVisible){
    return null
  }

  return (
    <div className="liveness-container">
      <h3>Status: {serverMessage}</h3>

      <div>
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored={true}
          screenshotFormat="image/jpeg"
          videoConstraints={{ width: 500, height: 450, facingMode: "user" }}
        />
        <button onClick={handleCancel}> Cancel </button>
      </div>
    </div>
  );
}

export default LivenessScanner;
