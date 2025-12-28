import { useState } from "react";
import { useParams } from "react-router-dom";
import logo from "../assets/logo.png";


const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function DownloadPage() {
  const { token } = useParams();

  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    if (!pin) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/download/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, pin }),
      });

      if (!res.ok) {
        const msg = await res.json();
        throw new Error(msg.detail || "Invalid PIN");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "LiveScanForm.pdf";
      a.click();

      window.URL.revokeObjectURL(url);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-6 text-center">
        <div className="mb-4 flex justify-center">
          <img
            src={logo}
            alt="The Loss Prevention Group"
            className="h-12 object-contain"
          />
        </div>
<div className="my-3 h-px bg-gray-200" />

        <h2 className="text-lg font-semibold mb-2">Secure Document Download</h2>

        <p className="text-sm text-gray-500 mb-4">
          Enter the PIN sent to your phone to download the document.
        </p>

        <input
          type="password"
          inputMode="numeric"
          placeholder="Enter PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4 text-center tracking-widest"
        />

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button
          onClick={handleDownload}
          disabled={loading || !pin}
          className={`w-full py-2 rounded-lg text-white font-semibold ${
            loading || !pin ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Verifying…" : "Download"}
        </button>

        <p className="text-[11px] text-gray-400 mt-4">
          This link is single-use and expires automatically.
        </p>
      </div>
    </div>
  );
}
