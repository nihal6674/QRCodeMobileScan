import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScanPage from "./Pages/ScanPage";
import DownloadPage from "./Pages/DownloadPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ScanPage />} />
        <Route path="/download/:token" element={<DownloadPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
