import { useRef, useState } from "react";
import EmailPage from "./EmailPage";

export default function ScanPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [image, setImage] = useState(null);
  const [stream, setStream] = useState(null);
  const [step, setStep] = useState("scan"); // scan | email
  const [consentAccepted, setConsentAccepted] = useState(false);

  // ----------------------------
  // Step switch
  // ----------------------------
  if (step === "email") {
    return (
      <EmailPage
        image={image}
        onBack={() => setStep("scan")}
      />
    );
  }

  // ----------------------------
  // Camera logic
  // ----------------------------
  const startCamera = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    videoRef.current.srcObject = mediaStream;
    setStream(mediaStream);
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    setImage(canvas.toDataURL("image/jpeg", 0.9));
    stream.getTracks().forEach((t) => t.stop());
  };

  const confirmScan = () => {
    if (!image || !consentAccepted) return;
    setStep("email");
  };

  // ----------------------------
  // UI
  // ----------------------------
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-5">
        <h1 className="text-xl font-semibold text-center mb-4">
          Scan Your Form
        </h1>

        {!image && (
          <>
            <button
              onClick={startCamera}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium mb-3"
            >
              Tap to Scan
            </button>

            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg border mb-3"
            />

            <button
              onClick={captureImage}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium"
            >
              Capture
            </button>
          </>
        )}

        {image && (
          <>
            <img
              src={image}
              alt="Preview"
              className="w-full rounded-lg border mb-4"
            />

            {/* Consent text */}
            <div className="border rounded-lg p-3 text-sm text-gray-700 mb-4 max-h-40 overflow-y-auto">
              <p>
                I understand this document contains sensitive personal
                information. By sending it to the email address(es) and/or phone
                number I provide, I confirm the recipient information is correct
                and authorized.
              </p>
              <br />
              <p>
                I understand that The Loss Prevention Group, Inc., dba LPG Live
                Scan, is not responsible for misdirected messages, unauthorized
                access to my email or phone, shared links, or any disclosure
                resulting from the recipients I choose.
              </p>
            </div>

            <label className="flex items-start gap-3 mb-4">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
              />
              <span className="text-sm text-gray-700">
                I have read and agree to the consent terms above
              </span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setImage(null);
                  setConsentAccepted(false);
                }}
                className="flex-1 bg-gray-300 py-2 rounded-lg font-medium"
              >
                Retake
              </button>

              <button
                disabled={!consentAccepted}
                onClick={confirmScan}
                className={`flex-1 py-2 rounded-lg font-medium text-white ${
                  consentAccepted
                    ? "bg-blue-600"
                    : "bg-blue-300 cursor-not-allowed"
                }`}
              >
                Confirm
              </button>
            </div>
          </>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
