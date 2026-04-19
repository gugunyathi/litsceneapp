import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MapPin, Flame, Radio, ArrowRight } from "lucide-react";

const ONBOARDING_STEPS = [
  {
    id: "welcome",
    title: "Welcome to VibeCheck",
    description:
      "Your real-time guide to the city's energy. Stop guessing and see the vibe before you go.",
    icon: Sparkles,
  },
  {
    id: "find",
    title: "Find the Hot Spots",
    description:
      "Switch to the map or feed to see where the fire is right now across different neighborhoods.",
    icon: MapPin,
  },
  {
    id: "post",
    title: "Post Your Vibes",
    description:
      "Drop a quick video to boost a spot's score, help others out, and earn 🔥 points for exclusive rewards.",
    icon: Flame,
  },
  {
    id: "live",
    title: "Catch Live Streams",
    description:
      "Spot a LIVE badge? Watch live streaming video from inside the venue before you even leave home.",
    icon: Radio,
  },
];

export function Onboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const hasSeen = localStorage.getItem("vibecheck_onboarding");
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem("vibecheck_onboarding", "true");
    setIsOpen(false);
  };

  const handleNext = () => {
    if (step < ONBOARDING_STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleComplete();
    }
  };

  if (!isOpen) return null;

  const currentStep = ONBOARDING_STEPS[step];
  const Icon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background/95 pb-12 backdrop-blur-xl transition-all">
      <div className="group flex-1 px-6 pt-[max(4rem,env(safe-area-inset-top))] flex flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center max-w-sm mx-auto"
          >
            <div className="mb-8 grid h-24 w-24 place-items-center rounded-3xl bg-gradient-sunset shadow-glow-coral">
              <Icon className="h-10 w-10 text-primary-foreground" />
            </div>

            <h2 className="mb-4 font-display text-3xl font-black tracking-tighter">
              {currentStep.title}
            </h2>

            <p className="text-foreground/70 leading-relaxed">{currentStep.description}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-6 space-y-8">
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {ONBOARDING_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-gradient-sunset" : "w-1.5 bg-foreground/20"
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col max-w-sm mx-auto w-full gap-3">
          <button
            onClick={handleNext}
            className="flex items-center justify-center gap-2 w-full rounded-full bg-foreground text-background py-4 font-display font-black uppercase tracking-widest active:scale-[0.98] transition-transform"
          >
            {step === ONBOARDING_STEPS.length - 1 ? "Get Started" : "Next"}
            {step < ONBOARDING_STEPS.length - 1 && <ArrowRight className="w-5 h-5" />}
          </button>

          <button
            onClick={handleComplete}
            className={`py-3 text-xs font-display font-bold uppercase tracking-widest text-foreground/50 transition-opacity ${step === ONBOARDING_STEPS.length - 1 ? "opacity-0 pointer-events-none" : "opacity-100 hover:text-foreground/80"}`}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
