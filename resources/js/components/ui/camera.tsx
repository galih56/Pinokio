import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "./button";
import { CameraIcon, SwitchCameraIcon } from "lucide-react";
import Webcam from "react-webcam";

type CameraType = {
  label?: string;
  outputFormat?: "base64" | "file"; // New prop to toggle output format
  rules?: Array<string>;
  withRetake?: boolean;
  onTake?: (data: any) => void;
  error?: boolean;
  errorMessage?: string;
};

const FACING_MODE_USER = "user";
const FACING_MODE_ENVIRONMENT = "environment";

export const Camera: React.FC<CameraType> = ({
  label,
  outputFormat = "file",
  onTake,
  error,
  errorMessage,
  withRetake = true,
}) => {
  const [cameraOn, setCameraOn] = useState(false); // To toggle between preview and camera
  const [photo, setPhoto] = useState<string>(""); // State to store Base64 string
  const [videoConstraints, setVideoConstraints] = useState({
    facingMode: FACING_MODE_ENVIRONMENT,
  });
  const [cameraCount, setCameraCount] = useState(0); // State to track the number of available cameras
  const webcamRef = useRef<any>(null);

  useEffect(() => {
    const checkCameras = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === "videoinput");
      setCameraCount(videoDevices.length); // Set the number of video input devices (cameras)
    };

    checkCameras();
  }, []);

  const takePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();

    setCameraOn(false); // Switch to preview mode
    if (imageSrc) {
      if (outputFormat === "file") {
        // Convert Base64 to Blob and then File
        const file = base64ToFile(imageSrc, "photo.png");
        setPhoto(URL.createObjectURL(file)); // Update preview with the Blob URL
        onTake?.(file); // Return the file object
      } else {
        setPhoto(imageSrc); // Store Base64 string in state
        onTake?.(imageSrc); // Return Base64 string
      }
    }
  };

  const clearPhoto = () => {
    setPhoto(""); // Clear the photo and return to webcam
    setCameraOn(false);
  };

  const handleSwitch = useCallback(() => {
    setVideoConstraints((prevConstraints) => ({
      ...prevConstraints,
      facingMode:
        prevConstraints.facingMode === FACING_MODE_USER
          ? FACING_MODE_ENVIRONMENT
          : FACING_MODE_USER,
    }));
  }, []);

  const base64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  return (
    <div className="flex flex-col cursor-pointer items-center bg-gray-100 rounded-3xl border border-dashed p-4">
      {photo && !cameraOn && (
          <img src={photo} alt="Captured" className="rounded mt-6 my-2" />
      )}

      {/* Only show "Take a photo" label if no photo has been taken and webcam is not previewing */}
      {!cameraOn ? (
        <Button
          onClick={() => setCameraOn(true)}
          className="flex m-2 cursor-pointer"
          variant={"link"}
          type="button"
        >
          <div className="w-max relative">
            <CameraIcon />
          </div>
          <div className="relative content-center">
            <span className="block text-base font-semibold relative">
              {photo ? "Retake photo" : label ?? "Take a photo"}
            </span>
          </div>
        </Button>
      ) : (
        <>
          <Webcam
            screenshotFormat="image/png"
            ref={webcamRef}
            videoConstraints={videoConstraints}
          />
          <div className="mt-8 w-full flex">
            <Button variant={'info'} className="flex-1 mx-1" onClick={takePhoto} type="button">
              Capture
            </Button>

            {/* Show "Switch Camera" button only if more than one camera is available */}
            {cameraCount > 1 && (
              <Button
                className="flex-1 mx-1"
                onClick={handleSwitch}
                variant="info"
                type="button"
              >
                <SwitchCameraIcon size={"18px"} />
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};
