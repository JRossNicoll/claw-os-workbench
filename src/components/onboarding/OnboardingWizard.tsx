import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StepPurpose } from "./StepPurpose";
import { StepTools } from "./StepTools";
import { StepConnect } from "./StepConnect";
import { StepFirstAutomation } from "./StepFirstAutomation";
import { Hexagon } from "lucide-react";

interface OnboardingWizardProps {
  onComplete: () => void;
}

const steps = ["Purpose", "Engines", "Connect", "Automate"];

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const back = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center max-w-xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex items-center gap-2 mb-12"
      >
        <Hexagon className="w-5 h-5 text-primary" strokeWidth={2.5} />
        <span className="text-base font-semibold text-foreground tracking-tight">Set up ClawOS</span>
      </motion.div>

      {/* Progress — minimal dots */}
      <div className="flex items-center gap-3 mb-16">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${
              i <= currentStep ? "bg-primary w-8" : "bg-border w-4"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          {currentStep === 0 && (
            <StepPurpose selected={selectedPurpose} onSelect={setSelectedPurpose} />
          )}
          {currentStep === 1 && (
            <StepTools selected={selectedTools} onToggle={(id) =>
              setSelectedTools((prev) =>
                prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
              )
            } />
          )}
          {currentStep === 2 && <StepConnect />}
          {currentStep === 3 && <StepFirstAutomation />}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-3 mt-14">
        {currentStep > 0 && (
          <button
            onClick={back}
            className="px-4 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Back
          </button>
        )}
        <button
          onClick={next}
          disabled={currentStep === 0 && !selectedPurpose}
          className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {currentStep === steps.length - 1 ? "Launch" : "Continue"}
        </button>
        {currentStep === 2 && (
          <button
            onClick={next}
            className="px-4 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
