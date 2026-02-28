'use client';

import type { StepInfo } from '@/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface WorkflowSidebarProps {
  steps: StepInfo[];
  currentStepIndex: number;
  completedSteps: string[];
  subWorkflow: string | null;
  agentName: string;
}

export function WorkflowSidebar({ steps, currentStepIndex, completedSteps, subWorkflow, agentName }: WorkflowSidebarProps) {
  const { t } = useLanguage();

  return (
    <div className="w-64 shrink-0 border-r border-gray-800 bg-gray-950 p-4">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
        {t('sidebar.title')}
      </h2>

      {!subWorkflow ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 text-2xl text-gray-600">
            {agentName === 'Mary' ? 'BA' : 'PM'}
          </div>
          <p className="text-sm text-gray-500">
            {t('sidebar.waitingWorkflow', { agent: agentName })}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-3 rounded-md bg-gray-900 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              {subWorkflow.replace(/-/g, ' ')}
            </p>
          </div>
          <ol className="space-y-2">
            {steps.map((step, idx) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = idx === currentStepIndex;

              return (
                <li key={step.id} className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {isCompleted ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : isCurrent ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-emerald-500 text-xs font-bold text-emerald-400">
                        {idx + 1}
                      </div>
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-700 text-xs text-gray-500">
                        {idx + 1}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      isCurrent ? 'text-emerald-400' : isCompleted ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-gray-600">{step.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}
