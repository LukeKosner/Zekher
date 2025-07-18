"use client";

import React from "react";
import { CheckCircle, Loader, AlertCircle, Circle } from "lucide-react";
import { type OrchestratorScenario, type StepPlan, getStepPlan } from "@/lib/utils/orchestrator";

interface OrchestratorProgressProps {
  scenario: OrchestratorScenario;
  currentStep: number;
  isComplete: boolean;
}

const OrchestratorProgress: React.FC<OrchestratorProgressProps> = ({
  scenario,
  currentStep,
  isComplete,
}) => {
  const steps = getStepPlan(scenario);

  const getStatusIcon = (stepNumber: number) => {
    if (isComplete && stepNumber <= currentStep) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (stepNumber < currentStep) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (stepNumber === currentStep) {
      return <Loader className="h-5 w-5 animate-spin text-blue-500" />;
    }
    return <Circle className="h-5 w-5 text-gray-400" />;
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Action Plan</h3>
      <ul className="space-y-2">
        {steps.map((step) => (
          <li key={step.stepNumber} className="flex items-center space-x-3">
            {getStatusIcon(step.stepNumber)}
            <div>
              <p className="font-medium">{step.stepName}</p>
              <p className="text-sm text-gray-500">{step.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrchestratorProgress;