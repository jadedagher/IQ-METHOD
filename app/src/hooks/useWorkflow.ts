'use client';

import { useState, useCallback } from 'react';
import type { StepInfo, WorkflowType } from '@/types';
import { SUB_WORKFLOW_STEPS } from '@/types';

export function useWorkflow(workflow: WorkflowType) {
  const [subWorkflow, setSubWorkflow] = useState<string | null>(null);
  const [steps, setSteps] = useState<StepInfo[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const onWorkflowChange = useCallback((sub: string) => {
    setSubWorkflow(sub);
    setSteps(SUB_WORKFLOW_STEPS[sub] || []);
    setCurrentStepIndex(0);
    setCompletedSteps([]);
  }, []);

  const onStepChange = useCallback((stepFile: string) => {
    const stepId = stepFile.replace('.md', '');
    const currentSteps = steps.length > 0 ? steps : SUB_WORKFLOW_STEPS[subWorkflow || ''] || [];

    const idx = currentSteps.findIndex(s => s.id === stepId);
    if (idx >= 0) {
      const newCompleted = currentSteps.slice(0, idx).map(s => s.id);
      setCompletedSteps(newCompleted);
      setCurrentStepIndex(idx);
      // Ensure steps are set if they weren't already
      if (steps.length === 0 && currentSteps.length > 0) {
        setSteps(currentSteps);
      }
    }
  }, [steps, subWorkflow]);

  const currentStep: StepInfo | null = steps.length > 0 ? steps[currentStepIndex] : null;

  return {
    subWorkflow,
    steps,
    currentStep,
    currentStepIndex,
    completedSteps,
    onStepChange,
    onWorkflowChange,
  };
}
