import { useRef, useState } from "react";
import EmailPage from "./EmailPage";
import StepItem from "../components/StepItem";
import logo from "../assets/logo.png";
import TrustIndicators from "../components/TrustIndicators";
export default function ScanPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [image, setImage] = useState(null);
  const [stream, setStream] = useState(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [step, setStep] = useState("scan");
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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
  const toggleCamera = async () => {
  // STOP camera
  if (cameraStarted) {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraStarted(false);
    return;
  }

  // START camera
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
    const ctx = canvas.getContext("2d");

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    // Target portrait ratio (3:4)
    const targetRatio = 3 / 4;
    const videoRatio = videoWidth / videoHeight;

    let sx, sy, sw, sh;

    if (videoRatio > targetRatio) {
      // Video is wider → crop sides
      sh = videoHeight;
      sw = sh * targetRatio;
      sx = (videoWidth - sw) / 2;
      sy = 0;
    } else {
      // Video is taller → crop top/bottom
      sw = videoWidth;
      sh = sw / targetRatio;
      sx = 0;
      sy = (videoHeight - sh) / 2;
    }

    canvas.width = sw;
    canvas.height = sh;

    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);

    setImage(canvas.toDataURL("image/jpeg", 0.95));

    toggleCamera();

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

          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
  <div
    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-[width] duration-500 ease-out"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-start justify-center p-4 pt-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b text-center space-y-2">
          <img
            src={logo} // import logo at top
            alt="Company Logo"
            className="h-14 mx-auto object-contain"
          />
          <h1 className="text-lg font-semibold">Document Scan</h1>
          <TrustIndicators />

        </div>

        <div className="p-5">
          {!image && (
            <>
              <button
  onClick={toggleCamera}
  className={`w-full mb-4 py-3 rounded-xl font-semibold transition ${
    cameraStarted
      ? "bg-red-600 hover:bg-red-700 text-white"
      : "bg-blue-600 hover:bg-blue-700 text-white"
  }`}
>
  {cameraStarted ? "Stop Camera" : "Start Camera"}
</button>


              <div className="relative rounded-xl overflow-hidden border bg-black aspect-[3/4]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
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
              <div
                onClick={() => setShowPreview(true)}
                className="relative w-full aspect-[3/4] rounded-xl border shadow mb-4 overflow-hidden bg-black cursor-zoom-in"
              >
                <img
                  src={image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />

                {/* Tap hint */}
                <div className="
  absolute inset-0 flex items-center justify-center
  bg-black/20
  opacity-100 sm:opacity-0 sm:hover:opacity-100
  transition
">
  <span className="text-white text-sm font-semibold bg-black/60 px-3 py-1 rounded-lg">
    Tap to preview
  </span>
</div>

              </div>

              {/* CONSENT BOX */}
              
              <div className="mb-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
  <div className="flex items-start gap-3">
    
    {/* Checkbox */}
    <input
      type="checkbox"
      className="mt-1 h-4 w-4 accent-blue-600 flex-shrink-0"
      checked={consentAccepted}
      onChange={(e) => setConsentAccepted(e.target.checked)}
    />

    {/* Text */}
    <p className="text-xs text-gray-700 leading-relaxed">
      I understand this document contains sensitive personal information. By
      sending it to the email address(es) and/or phone number I provide, I
      confirm the recipient information is correct and authorized. I understand
      that The Loss Prevention Group, Inc., dba LPG Live Scan, is not responsible
      for misdirected messages, unauthorized access to my email or phone, shared
      links, or any disclosure resulting from the recipients I choose.
    </p>
  </div>
</div>


              <div className="flex gap-3">
                <button
                  onClick={() => {
if (cameraStarted) toggleCamera();
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
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-md w-full">
            {/* Close button */}
            <button
              onClick={() => setShowPreview(false)}
              className="absolute -top-3 -right-3 bg-white text-black w-9 h-9 rounded-full shadow flex items-center justify-center text-lg font-bold"
            >
              ✕
            </button>

            {/* Image */}
            <div className="rounded-xl overflow-hidden bg-black">
              <img
                src={image}
                alt="Full Preview"
                className="w-full h-auto max-h-[90vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
