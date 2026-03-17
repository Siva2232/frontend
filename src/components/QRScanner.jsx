import { useEffect, useId, useRef } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

const normalizeScannedValue = (decodedText) => {
  const trimmedText = decodedText.trim();
  let serial = trimmedText;

  try {
    if (/^https?:/i.test(trimmedText)) {
      const url = new URL(trimmedText);
      serial =
        url.searchParams.get("serial") ||
        url.searchParams.get("serialNumber") ||
        url.pathname.split("/").filter(Boolean).at(-1) ||
        trimmedText;
    }
  } catch (error) {
    console.error("URL parsing failed", error);
  }

  return decodeURIComponent(serial)
    .replace(/^SERIAL\s*:\s*/i, "")
    .trim();
};

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const containerId = useId().replace(/:/g, "-");

  useEffect(() => {
    let html5QrCode;
    let isAttached = true;

    const config = {
      fps: 12,
      qrbox: (viewfinderWidth, viewfinderHeight) => {
        const edge = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.72);
        return { width: edge, height: edge };
      },
      aspectRatio: 1.0,
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      videoConstraints: {
        facingMode: { ideal: "environment" },
      },
    };

    const onScan = async (decodedText) => {
      if (!isAttached) return;
      const serial = normalizeScannedValue(decodedText);
      if (!serial) return;

      isAttached = false;
      
      try {
        if (html5QrCode && html5QrCode.isScanning) {
          await html5QrCode.stop();
        }
      } catch (error) {
        console.error("Error stopping scanner on scan:", error);
      } finally {
        onScanSuccess(serial);
      }
    };

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode(containerId);
        await html5QrCode.start({ facingMode: "environment" }, config, onScan);
      } catch (err) {
        console.warn("Camera start failed, retrying with all cameras:", err);
        if (!isAttached) return;
        
        try {
          const cameras = await Html5Qrcode.getCameras();
          if (cameras && cameras.length > 0 && isAttached) {
            await html5QrCode.start(cameras[0].id, config, onScan);
          } else {
            onScanError?.("No camera found or permission denied.");
          }
        } catch (fallbackErr) {
          onScanError?.("Could not start camera.");
        }
      }
    };

    startScanner();

    return () => {
      isAttached = false;
      if (html5QrCode) {
        if (html5QrCode.isScanning) {
          html5QrCode.stop().catch(err => console.error("Cleanup stop failed:", err));
        }
      }
    };
  }, [containerId, onScanSuccess, onScanError]);

  return (
    <div className="relative w-full aspect-square bg-black overflow-hidden rounded-xl">
      <div id={containerId} className="w-full h-full" />
    </div>
  );
};

export default QRScanner;
