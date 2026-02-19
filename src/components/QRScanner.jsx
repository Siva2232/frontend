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
      
      try {
        // If it's a URL, extract the serial parameter
        if (trimmedText.startsWith("http")) {
          const url = new URL(trimmedText);
          const serial = url.searchParams.get("serial");
          
          if (serial) {
            // Check if we are already on a page with this serial to avoid loops
            const currentParams = new URLSearchParams(window.location.search);
            if (currentParams.get("serial") === serial && window.location.pathname.includes("customer-home")) {
              console.log("Already on customer-home with this serial");
              return;
            }

            // Redirect to the customer home page provided in the QR
            window.location.href = trimmedText;
            return;
          }
        }
      } catch (e) {
        console.error("URL parsing failed", e);
      }

      // Fallback for old/simple formats or non-URL serials
      const serial = trimmedText.replace("SERIAL:", "");
      
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