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
  const html5QrCodeRef = useRef(null);
  const hasScannedRef = useRef(false);
  const scannerId = useId().replace(/:/g, "-");

  useEffect(() => {
    const html5QrCode = new Html5Qrcode(scannerId);
    html5QrCodeRef.current = html5QrCode;

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
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    };

    const onScan = (decodedText) => {
      if (hasScannedRef.current) {
        return;
      }

      const serial = normalizeScannedValue(decodedText);
      if (!serial) {
        return;
      }

      hasScannedRef.current = true;
      html5QrCode
        .stop()
        .then(() => {
          onScanSuccess(serial);
        })
        .catch((error) => {
          console.error("Error stopping scanner", error);
          onScanSuccess(serial);
        });
    };

    const startScanner = async () => {
      try {
        await html5QrCode.start({ facingMode: "environment" }, config, onScan);
      } catch (primaryError) {
        console.error("Scanner start error:", primaryError);

        try {
          const cameras = await Html5Qrcode.getCameras();
          const fallbackCamera = cameras.find((camera) =>
            /back|rear|environment/i.test(camera.label)
          ) || cameras[0];

          if (!fallbackCamera) {
            throw new Error("No camera devices found");
          }

          await html5QrCode.start(fallbackCamera.id, config, onScan);
        } catch (fallbackError) {
          console.error("Fallback scanner start error:", fallbackError);
          hasScannedRef.current = false;
          onScanError?.("Unable to start the camera. Please allow camera access and try again.");
        }
      }
    };

    startScanner();

    return () => {
      hasScannedRef.current = false;

      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch((error) => console.error("Cleanup error:", error));
      }

      html5QrCode.clear().catch(() => {});
    };
  }, [onScanError, onScanSuccess, scannerId]);

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
        id={scannerId}
        className="w-full max-w-md overflow-hidden rounded-2xl"
        onClick={tryFocus}
        title="Tap to refocus the camera"
      />
    </div>
  );
};

export default QRScanner;