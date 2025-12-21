import { useRef, useState } from "react";
import EmailPage from "./EmailPage";
import StepItem from "../components/StepItem";

export default function ScanPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [image, setImage] = useState(null);
  const [stream, setStream] = useState(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [step, setStep] = useState("scan");
  const [consentAccepted, setConsentAccepted] = useState(false);

  // Processing UI
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processText, setProcessText] = useState("Cropping document…");

  // ----------------------------
  // Email page
  // ----------------------------
  if (step === "email") {
    return <EmailPage image={image} onBack={() => setStep("scan")} />;
  }

  // ----------------------------
  // Camera
  // ----------------------------
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setCameraStarted(true);
    } catch {
      alert("Camera access denied or unavailable");
    }
  };

  const captureImage = () => {
    if (!cameraStarted || !videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    setImage(canvas.toDataURL("image/jpeg", 0.9));
    stream?.getTracks().forEach((t) => t.stop());
    setCameraStarted(false);
  };

  // ----------------------------
  // Fake processing flow
  // ----------------------------
  const confirmScan = () => {
    if (!image || !consentAccepted) return;

    setProcessing(true);
    setProgress(0);
    setProcessText("Cropping document…");

    let p = 0;
    const interval = setInterval(() => {
      p += 4;
      setProgress(p);

      if (p === 30) setProcessText("Deskewing image…");
      if (p === 65) setProcessText("Enhancing clarity…");

      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setProcessing(false);
          setStep("email");
        }, 300);
      }
    }, 120);
  };

  // ----------------------------
  // Processing Screen
  // ----------------------------
  if (processing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 text-center">
          <h2 className="text-lg font-semibold mb-1">Processing Document</h2>
          <p className="text-sm text-gray-500 mb-6">{processText}</p>

          <div className="flex flex-col items-center mb-4 space-y-2">
            <StepItem
              label="Cropping"
              done={progress >= 30}
              active={progress < 30}
              color="brand"
            />

            <StepItem
              label="Deskewing"
              done={progress >= 65}
              active={progress >= 30 && progress < 65}
              color="warning"
            />

            <StepItem
              label="Enhancing"
              done={progress >= 100}
              active={progress >= 65 && progress < 100}
              color="purple"
            />
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-xs text-gray-400 mt-4">
            🔒 Secure on-device processing
          </p>
        </div>
      </div>
    );
  }

  // ----------------------------
  // Main UI
  // ----------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b text-center">
          <h1 className="text-lg font-semibold">Document Scan</h1>
        </div>

        <div className="p-5">
          {!image && (
            <>
              <button
                onClick={startCamera}
                disabled={cameraStarted}
                className={`w-full mb-4 py-3 rounded-xl font-semibold ${
                  cameraStarted
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {cameraStarted ? "Camera Active" : "Start Camera"}
              </button>

              <div className="relative rounded-xl overflow-hidden border bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover"
                />

                {!cameraStarted && (
                  <div className="absolute inset-0 flex items-center justify-center px-4">
                    <p className="text-white text-sm sm:text-base font-medium text-center bg-black/50 px-4 py-2 rounded-lg">
                      Align your document inside the frame
                    </p>
                  </div>
                )}

                <div className="absolute inset-4 border-2 border-white/80 rounded-lg pointer-events-none" />
              </div>

              <button
                onClick={captureImage}
                disabled={!cameraStarted}
                className={`w-full mt-4 py-3 rounded-xl font-semibold ${
                  cameraStarted
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow"
                    : "bg-emerald-300 cursor-not-allowed text-white"
                }`}
              >
                Capture Photo
              </button>
            </>
          )}

          {image && (
            <>
              <img
                src={image}
                alt="Preview"
                className="w-full rounded-xl border shadow mb-4"
              />

              <label className="flex gap-3 mb-5">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-blue-600"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                />
                <span className="text-xs text-gray-700">
                   I understand this document contains sensitive personal information. By sending it to the email address(es) and/or phone number I provide, I confirm the recipient information is correct and authorized. I understand that The Loss Prevention Group, Inc., dba LPG Live Scan, is not responsible for misdirected messages, unauthorized access to my email or phone, shared links, or any disclosure resulting from the recipients I choose.
                </span>
              </label>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setImage(null);
                    setConsentAccepted(false);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 py-2.5 rounded-xl"
                >
                  Retake
                </button>

                <button
                  disabled={!consentAccepted}
                  onClick={confirmScan}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-white ${
                    consentAccepted
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-300 cursor-not-allowed"
                  }`}
                >
                  Continue
                </button>
              </div>
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
}
