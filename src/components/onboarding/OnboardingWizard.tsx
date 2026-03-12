import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StepPurpose } from "./StepPurpose";
import { StepEngines } from "./StepEngines";
import { StepIntegrations } from "./StepIntegrations";
import { StepFirstAutomation } from "./StepFirstAutomation";
import { Hexagon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toggleIntegration } from "@/lib/store";
import { useQueryClient } from "@tanstack/react-query";

interface OnboardingWizardProps {
  onComplete: () => void;
}

const steps = ["Purpose", "Engines", "Integrations", "Automate"];

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const [selectedEngines, setSelectedEngines] = useState<string[]>([]);
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([]);
  const [automationConfig, setAutomationConfig] = useState<{ when: string | null; run: string | null; then: string | null }>({ when: null, run: null, then: null });
  const qc = useQueryClient();

  const next = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Install selected engines in DB
      if (selectedEngines.length > 0) {
        await supabase
          .from("engines")
          .update({ installed: true })
          .in("slug", selectedEngines);
      }

      // Connect selected integrations (localStorage-based for now)
      connectedIntegrations.forEach((id) => toggleIntegration(id));

      // Create first automation if configured
      if (automationConfig.when && automationConfig.run && automationConfig.then) {
        const triggerLabels: Record<string, string> = {
          schedule: "Every 10 minutes",
          signal: "On signal",
          webhook: "On webhook",
        };
        const runLabels: Record<string, string> = {
          scanner: "Market Scanner",
          ai: "AI Assistant",
          monitor: "Website Monitor",
        };
        const thenLabels: Record<string, string> = {
          alert: "Send notification",
          store: "Save to database",
        };

        const autoName = `${runLabels[automationConfig.run] || "Custom"} Pipeline`;
        const { data: auto } = await supabase
          .from("automations")
          .insert({
            name: autoName,
            description: `${triggerLabels[automationConfig.when] || "Triggered"} → ${runLabels[automationConfig.run] || "Run"} → ${thenLabels[automationConfig.then] || "Then"}`,
            status: "active",
            trigger: triggerLabels[automationConfig.when] || "Manual",
          })
          .select()
          .single();

        if (auto) {
          await supabase.from("automation_steps").insert([
            { automation_id: auto.id, name: triggerLabels[automationConfig.when] || "Trigger", status: "pending", step_order: 0 },
            { automation_id: auto.id, name: `Run ${runLabels[automationConfig.run] || "engine"}`, status: "pending", step_order: 1 },
            { automation_id: auto.id, name: thenLabels[automationConfig.then] || "Action", status: "pending", step_order: 2 },
          ]);
        }
      }

      // Log activity
      await supabase.from("activity_events").insert({
        type: "online",
        message: "ClawOS setup completed",
        category: "System",
      });

      // Invalidate queries so pages show fresh data
      qc.invalidateQueries({ queryKey: ["engines"] });
      qc.invalidateQueries({ queryKey: ["automations"] });
      qc.invalidateQueries({ queryKey: ["activity"] });

      localStorage.setItem("clawos-onboarded", "true");
      onComplete();
    }
  };

  const back = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center max-w-lg mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="w-full">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Hexagon className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground tracking-tight">ClawOS</span>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-1.5 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i <= currentStep ? "bg-primary w-8" : "bg-muted w-4"
              }`}
            />
          ))}
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            {currentStep === 0 && <StepPurpose selected={selectedPurpose} onSelect={setSelectedPurpose} />}
            {currentStep === 1 && <StepEngines selected={selectedEngines} onToggle={(id) => setSelectedEngines((prev) => prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id])} />}
            {currentStep === 2 && <StepIntegrations connected={connectedIntegrations} onToggle={(id) => setConnectedIntegrations((prev) => prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id])} />}
            {currentStep === 3 && <StepFirstAutomation config={automationConfig} onUpdate={setAutomationConfig} />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button onClick={back} className={`text-sm text-muted-foreground hover:text-foreground transition-colors ${currentStep === 0 ? "invisible" : ""}`}>
            Back
          </button>
          <button
            onClick={next}
            disabled={currentStep === 0 && !selectedPurpose}
            className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            {currentStep === steps.length - 1 ? "Launch ClawOS" : "Continue"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
