import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

const QRScanner = ({ onScanSuccess }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    const config = { fps: 10, qrbox: 250 };
    
    // Start scanning with strict back-camera constraint
    html5QrCode.start(
      { facingMode: { exact: "environment" } },
      config,
      (decodedText) => {
        const trimmedText = decodedText.trim();
        console.log("Scanned text:", trimmedText);
        
        try {
          if (trimmedText.startsWith("http")) {
            const url = new URL(trimmedText);
            const serial = url.searchParams.get("serial");
            
            if (serial) {
              const currentParams = new URLSearchParams(window.location.search);
              if (currentParams.get("serial") === serial && window.location.pathname.includes("register-warranty")) {
                console.log("Already on register-warranty with this serial");
                return;
              }
              window.location.href = trimmedText;
              return;
            }
          }
        } catch (e) {
          console.error("URL parsing failed", e);
        }

        const serial = trimmedText.replace("SERIAL:", "");
        onScanSuccess(serial);
        
        // Stop and clear after success
        html5QrCode.stop().catch(err => console.error("Error stopping scanner", err));
      },
      (errorMessage) => {
        // Suppress noise
      }
    ).catch((err) => {
      console.error("Unable to start scanning", err);
      // Fallback if 'exact' is too strict for some browsers
      html5QrCode.start({ facingMode: "environment" }, config, (text) => onScanSuccess(text.trim()));
    });

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Cleanup failed", err));
      }
    };
  }, []);

  return (
    <div className="w-full flex justify-center">
      <div id="reader" className="w-full max-w-md overflow-hidden rounded-xl" />
      <style>{`
        #reader__dashboard, #reader__camera_selection {
          display: none !important;
        }
        #reader video {
          border-radius: 12px;
          object-fit: cover;
        }
      `}</style>
    </div>
  );
};

export default QRScanner;