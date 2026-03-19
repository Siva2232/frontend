import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);
let toastId = 0;
let audioCtx = null;
let audioUnlocked = false;

const unlockAudio = async () => {
  const ctx = audioCtx || getAudioContext();
  if (!ctx || audioUnlocked) return;

  try {
    await ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 440;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.02);
  } catch {
    // ignore
  } finally {
    audioUnlocked = true;
  }
};

const getAudioContext = () => {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    audioCtx = new AudioContext();

    const resumeOnInteraction = () => {
      unlockAudio();
      document.removeEventListener("pointerdown", resumeOnInteraction);
      document.removeEventListener("keydown", resumeOnInteraction);
    };

    document.addEventListener("pointerdown", resumeOnInteraction, { passive: true });
    document.addEventListener("keydown", resumeOnInteraction, { passive: true });
  }
  return audioCtx;
};

const playToastSound = async (type = "info") => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Ensure the audio context is unlocked first
  if (!audioUnlocked) {
    await unlockAudio();
  }

  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      return; // still not allowed
    }
  }

  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Set tone frequency based on toast type
    oscillator.frequency.value =
      type === "success" ? 880 : type === "error" ? 360 : 640;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.24);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.25);
  } catch {
    // Silent failure if audio playback isn't allowed
  }
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const show = useCallback((message, type = "info", duration = 4200, details = "") => {
    playToastSound(type);
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, type, details }]);
    setTimeout(() => remove(id), duration);
  }, [remove]);

  const showSuccess = useCallback((msg, details = "", duration) => show(msg, "success", duration, details), [show]);
  const showError = useCallback((msg, details = "", duration) => show(msg, "error", duration, details), [show]);
  const showInfo = useCallback((msg, details = "", duration) => show(msg, "info", duration, details), [show]);

  return (
    <ToastContext.Provider value={{ show, showSuccess, showError, showInfo }}>
      {children}

      {/* Toast container – top center, modern stack */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => remove(t.id)}
            className={`
              group pointer-events-auto
              flex items-center gap-3.5 px-5 py-4 rounded-2xl shadow-2xl shadow-black/20
              text-white font-medium text-[15px] tracking-tight leading-tight
              transform transition-all duration-500 ease-out
              animate-toast-enter
              hover:scale-[1.015] active:scale-[0.985]
              border border-white/10 backdrop-blur-sm
              ${
                t.type === "success" ? "bg-gradient-to-r from-emerald-600 to-emerald-700" :
                t.type === "error"   ? "bg-gradient-to-r from-rose-600 to-red-700" :
                "bg-gradient-to-r from-blue-600 to-indigo-700"
              }
            `}
          >
            {/* Icon with subtle background */}
            <div className="flex-shrink-0 p-2 rounded-xl bg-white/15">
              {t.type === "success" ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : t.type === "error" ? (
                <AlertCircle className="w-6 h-6" />
              ) : (
                <Info className="w-6 h-6" />
              )}
            </div>

            {/* Message */}
            <div className="flex-1 pr-2">
              <div className="font-semibold">{t.message}</div>
              {t.details && (
                <div className="text-[12px] opacity-90 mt-1 whitespace-pre-wrap">
                  {t.details}
                </div>
              )}
            </div>

            {/* Close button – subtle until hover */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                remove(t.id);
              }}
              className="opacity-60 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-white/15"
              aria-label="Close toast"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};