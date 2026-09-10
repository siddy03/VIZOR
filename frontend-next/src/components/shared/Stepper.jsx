'use client';

import React from 'react';
import './stepper.css';

export function Stepper({ steps = [], currentStep = 0, allowFreeNavigation = false, onStepChange }) {
  const onStepClick = (index) => {
    if (allowFreeNavigation || index < currentStep) {
      onStepChange?.(index);
    }
  };

  return (
    <div className="stepper-host vizor-stepper-root">
      <div className="vizor-stepper">
        <div className="p-step-list" role="list" aria-label="Progress steps">
          {steps.map((step, i) => {
            const clickable = allowFreeNavigation || i < currentStep;
            const labelHtml = step.label.replace(' & ', ' &amp;<br/>');
            return (
              <React.Fragment key={`${step.label}-${i}`}>
                <div className="p-step">
                  <div
                    className={`stepper-step${clickable ? ' clickable' : ''}`}
                    role={clickable ? 'button' : 'listitem'}
                    tabIndex={clickable ? 0 : undefined}
                    aria-current={currentStep === i ? 'step' : undefined}
                    aria-disabled={!clickable && currentStep !== i ? 'true' : undefined}
                    aria-label={`Step ${i + 1} of ${steps.length}: ${step.label}${
                      currentStep === i ? ' (current)' : currentStep > i ? ' (completed)' : ''
                    }`}
                    onClick={() => onStepClick(i)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onStepClick(i);
                      if (e.key === ' ') {
                        onStepClick(i);
                        e.preventDefault();
                      }
                    }}
                  >
                    <div
                      className={`step-dot${currentStep === i ? ' active' : ''}${currentStep > i ? ' completed' : ''}`}
                      aria-hidden="true"
                    >
                      {currentStep > i && <i className="pi pi-check check-icon" aria-hidden="true"></i>}
                    </div>
                    <span
                      className={`step-text${currentStep === i ? ' active' : ''}${currentStep > i ? ' completed' : ''}`}
                      dangerouslySetInnerHTML={{ __html: labelHtml }}
                    />
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className={`p-stepper-separator${i < currentStep ? ' p-stepper-separator-active' : ''}`}></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
