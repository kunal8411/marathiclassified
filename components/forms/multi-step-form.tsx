"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Step = { id: string; title: string };

type MultiStepFormProps = {
  steps: Step[];
  currentStep: string;
  onStepChange: (id: string) => void;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  isNextDisabled?: boolean;
  className?: string;
};

export function MultiStepForm({
  steps,
  currentStep,
  onStepChange,
  children,
  onNext,
  onBack,
  nextLabel = "Next",
  backLabel = "Back",
  isNextDisabled,
  className,
}: MultiStepFormProps) {
  const index = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className={cn("space-y-6", className)}>
      <ol className="flex flex-wrap gap-2">
        {steps.map((step, i) => (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => onStepChange(step.id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                step.id === currentStep
                  ? "bg-primary text-primary-foreground"
                  : i < index
                    ? "bg-muted text-foreground"
                    : "bg-muted/50 text-muted-foreground",
              )}
            >
              {step.title}
            </button>
          </li>
        ))}
      </ol>
      <div>{children}</div>
      <div className="flex justify-between gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={index <= 0}>
          <ChevronLeft className="size-4" />
          {backLabel}
        </Button>
        <Button type="button" onClick={onNext} disabled={isNextDisabled}>
          {nextLabel}
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
