import { AnimatePresence, motion } from "framer-motion";
import { LogIn, Phone, X } from "lucide-react";
import { useState } from "react";
import { useFirebase } from "./FirebaseContext";
import { toast } from "sonner";
import { auth } from "./firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { login } = useFirebase();
  const [method, setMethod] = useState<"initial" | "phone">("initial");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);

  // You must set up ReCAPTCHA before sending SMS.
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+1${phoneNumber}`; // default US if no +
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      toast.success("SMS code sent!");
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to send code", {
        description: err instanceof Error ? err.message : "Network error",
      });
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || !confirmationResult) return;
    setLoading(true);
    try {
      await confirmationResult.confirm(verificationCode);
      toast.success("Successfully logged in!");
      onClose();
    } catch (err: unknown) {
      toast.error("Failed to verify code", {
        description: err instanceof Error ? err.message : "Network error",
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMethod("initial");
    setPhoneNumber("");
    setVerificationCode("");
    setConfirmationResult(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md"
            onClick={handleClose}
          />
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-x-3 bottom-6 z-50 max-w-md mx-auto md:bottom-auto md:top-1/2 md:-translate-y-1/2 rounded-3xl glass-dark border border-border/40 p-6 shadow-glow-magenta"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl font-black">
                Tap In <span className="text-gradient-sunset">Tonight</span>
              </h2>
              <button
                onClick={handleClose}
                className="grid h-8 w-8 place-items-center rounded-full glass hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm text-foreground/70 mb-6 font-medium">
              You need to sign in to continue grabbing the best vibes in your city.
            </p>

            {method === "initial" && (
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    await login();
                    handleClose();
                  }}
                  className="w-full flex items-center justify-center gap-3 rounded-full bg-white text-black py-3.5 px-4 font-bold active:scale-95 transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.09v2.86C3.93 20.64 7.66 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.04H2.09C1.33 8.54.91 10.22.91 12s.42 3.46 1.18 4.96l3.75-2.86z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.66 1 3.93 3.36 2.09 7.04l3.75 2.86c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </button>

                <button
                  onClick={() => setMethod("phone")}
                  className="w-full flex items-center justify-center gap-2 rounded-full glass-dark border border-border/60 py-3.5 px-4 font-bold text-foreground active:scale-95 transition-all"
                >
                  <Phone className="h-4 w-4" />
                  Continue with Phone
                </button>
              </div>
            )}

            {method === "phone" && !confirmationResult && (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-foreground/50 font-bold mb-1 block">
                    Phone Number
                  </label>
                  <div className="glass-dark border border-border/40 rounded-xl px-4 py-3">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (123) 456-7890"
                      className="bg-transparent w-full outline-none"
                      autoFocus
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || phoneNumber.length < 10}
                  className="w-full bg-gradient-sunset text-primary-foreground font-black py-3.5 rounded-full disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
                >
                  {loading ? "Sending..." : "Send Verification Code"}
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("initial")}
                  className="w-full text-center text-xs text-foreground/60 font-bold py-2 underline"
                >
                  Back
                </button>
              </form>
            )}

            {method === "phone" && confirmationResult && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-foreground/50 font-bold mb-1 block">
                    Verification Code
                  </label>
                  <div className="glass-dark border border-border/40 rounded-xl px-4 py-3">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="123456"
                      className="bg-transparent w-full outline-none font-mono tracking-[0.2em] text-center text-2xl"
                      autoFocus
                      maxLength={6}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || verificationCode.length < 6}
                  className="w-full bg-accent text-accent-foreground font-black py-3.5 rounded-full disabled:opacity-50 transition-all active:scale-95"
                >
                  {loading ? "Verifying..." : "Confirm & Sign In"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmationResult(null);
                    setVerificationCode("");
                  }}
                  className="w-full text-center text-xs text-foreground/60 font-bold py-2 underline"
                >
                  Use a different number
                </button>
              </form>
            )}

            <div id="recaptcha-container"></div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
