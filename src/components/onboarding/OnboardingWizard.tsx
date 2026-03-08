import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StepPurpose } from "./StepPurpose";
import { StepEngines } from "./StepEngines";
import { StepIntegrations } from "./StepIntegrations";
import { StepFirstAutomation } from "./StepFirstAutomation";
import { Hexagon } from "lucide-react";

interface OnboardingWizardProps {
  onComplete: () => void;
}

const steps = ["Purpose", "Engines", "Integrations", "Automate"];

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const [selectedEngines, setSelectedEngines] = useState<string[]>([]);

  const next = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    else onComplete();
  };

  const back = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center max-w-lg mx-auto px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="flex items-center gap-2 mb-10">
        <Hexagon className="w-5 h-5 text-primary" strokeWidth={2.5} />
        <span className="text-sm font-semibold text-foreground tracking-tight">Set up ClawOS</span>
      </motion.div>

      <div className="flex items-center gap-2.5 mb-14">
        {steps.map((_, i) => (
          <div key={i} className={`h-0.5 rounded-full transition-all duration-500 ${i <= currentStep ? "bg-primary w-8" : "bg-border w-4"}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentStep} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="w-full">
          {currentStep === 0 && <StepPurpose selected={selectedPurpose} onSelect={setSelectedPurpose} />}
          {currentStep === 1 && <StepEngines selected={selectedEngines} onToggle={(id) => setSelectedEngines((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id])} />}
          {currentStep === 2 && <StepIntegrations />}
          {currentStep === 3 && <StepFirstAutomation />}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-2.5 mt-12">
        {currentStep > 0 && (
          <button onClick={back} className="px-4 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">Back</button>
        )}
        <button onClick={next} disabled={currentStep === 0 && !selectedPurpose} className="px-5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          {currentStep === steps.length - 1 ? "Launch" : "Continue"}
        </button>
        {currentStep === 2 && (
          <button onClick={next} className="px-4 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">Skip</button>
        )}
      </div>
    </div>
  );
}
