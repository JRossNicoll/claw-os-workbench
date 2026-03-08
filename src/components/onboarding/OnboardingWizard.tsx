import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StepPurpose } from "./StepPurpose";
import { StepTools } from "./StepTools";
import { StepConnect } from "./StepConnect";
import { StepFirstAutomation } from "./StepFirstAutomation";
import { Sparkles } from "lucide-react";

interface OnboardingWizardProps {
  onComplete: () => void;
}

const steps = ["Purpose", "Tools", "Connect", "First Automation"];

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
    <div className="min-h-[85vh] flex flex-col items-center justify-center max-w-2xl mx-auto px-4">
      {/* Brand header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2.5 mb-10"
      >
        <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <span className="text-lg font-semibold text-foreground tracking-tight">Welcome to ClawOS</span>
      </motion.div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-14">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-400 ${
                i < currentStep
                  ? "bg-primary text-primary-foreground"
                  : i === currentStep
                  ? "bg-primary text-primary-foreground glow-sm"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-14 h-px transition-colors duration-400 ${
                  i < currentStep ? "bg-primary/60" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.35 }}
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

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-12">
        {currentStep > 0 && (
          <button
            onClick={back}
            className="px-5 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
          >
            Back
          </button>
        )}
        <button
          onClick={next}
          disabled={currentStep === 0 && !selectedPurpose}
          className="px-7 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed glow-sm"
        >
          {currentStep === steps.length - 1 ? "Launch Mission Control" : "Continue"}
        </button>
        {currentStep === 2 && (
          <button
            onClick={next}
            className="px-5 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
