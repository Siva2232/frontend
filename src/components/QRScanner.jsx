import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

const QRScanner = ({ onScanSuccess }) => {
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    html5QrCodeRef.current = html5QrCode;
    
    const config = {
      fps: 10,
      qrbox: { width: 300, height: 300 },
      aspectRatio: 1.0,
      videoConstraints: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 },
        advanced: [{ focusMode: "continuous" }],
      },
    };

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

  const tryFocus = () => {
    const html5QrCode = html5QrCodeRef.current;
    if (!html5QrCode) return;

    const track = html5QrCode.getRunningTrack?.();
    if (!track) return;

    track
      .applyConstraints({ advanced: [{ focusMode: "continuous" }, { focusMode: "auto" }] })
      .catch(() => {
        // ignore unsupported focus constraints
      });
  };

  return (
    <div className="w-full flex justify-center">
      <div
        id="reader"
        className="w-full max-w-md overflow-hidden rounded-2xl"
        onClick={tryFocus}
        title="Tap to refocus the camera"
      />
    </div>
  );
};

export default QRScanner;