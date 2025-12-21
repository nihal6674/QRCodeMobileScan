import { useState } from "react";

export default function EmailPage({ image, onBack }) {
  const [primaryEmail, setPrimaryEmail] = useState("");
  const [extraEmails, setExtraEmails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!primaryEmail || !image) return;

    setLoading(true);

    try {
      const emails = [
        primaryEmail,
        ...extraEmails
          .split(",")
          .map(e => e.trim())
          .filter(Boolean),
      ];

      // Convert base64 image to Blob
      const res = await fetch(image);
      const blob = await res.blob();

      const formData = new FormData();
      formData.append("file", blob, "scan.jpg");
      formData.append("consent", "true");
      formData.append("emails", emails.join(","));

      const response = await fetch("http://127.0.0.1:8000/api/scan", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      console.log("Success:", data);

      alert("Email sent successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-center mb-4">
          Send Your Form
        </h2>

        <input
          type="email"
          placeholder="Primary email"
          value={primaryEmail}
          onChange={(e) => setPrimaryEmail(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />

        <input
          type="text"
          placeholder="Additional emails (comma separated)"
          value={extraEmails}
          onChange={(e) => setExtraEmails(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-6"
        />

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 bg-gray-300 py-2 rounded-lg"
          >
            Back
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
          >
            {loading ? "Sending..." : "Send Email"}
          </button>
        </div>
      </div>
    </div>
  );
}
