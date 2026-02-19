import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const QRScanner = ({ onScanSuccess }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      false
    );

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
      
      onScanSuccess(serial);
      scanner.clear().catch(error => {
        console.error("Failed to clear scanner:", error);
      });
    };

    scanner.render(onScan, (error) => {
      // Supress noisy console errors from html5-qrcode
      // console.warn(error);
    });

    return () => {
      scanner.clear().catch(error => {
        console.error("Cleanup failed:", error);
      });
    };
  }, []); // Empty dependency array to run once on mount

  return (
    <div className="w-full flex justify-center">
      <div id="reader" className="w-full max-w-md" />
    </div>
  );
};

export default QRScanner;