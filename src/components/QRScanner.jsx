import { useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

const QRScanner = ({ onScanSuccess }) => {
  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    const onScan = (decodedText) => {
      const trimmedText = decodedText.trim();
      console.log("Scanned text:", trimmedText);
      
      let serial = trimmedText;

      try {
        // If it's a URL, extract the serial parameter
        if (trimmedText.startsWith("http")) {
          const url = new URL(trimmedText);
          const serialParam = url.searchParams.get("serial");
          
          if (serialParam) {
            serial = serialParam;
          }
        }
      } catch (e) {
        console.error("URL parsing failed", e);
      }

      // Clean up serial if it has prefix
      serial = serial.replace("SERIAL:", "");
      
      html5QrCode.stop().then(() => {
        onScanSuccess(serial);
      }).catch(err => {
        console.error("Error stopping scanner", err);
        onScanSuccess(serial);
      });
    };

    // Start with back camera by default
    html5QrCode.start(
      { facingMode: "environment" }, 
      config, 
      onScan
    ).catch((err) => {
      console.error("Scanner start error:", err);
    });

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error("Cleanup error:", err));
      }
    };
  }, []); // Empty dependency array to run once on mount

  return (
    <div className="w-full flex justify-center">
      <div id="reader" className="w-full max-w-md overflow-hidden rounded-2xl" />
    </div>
  );
};

export default QRScanner;