'use client';

import React, { useState } from 'react';
import MathDisplay from './MathDisplay';
import { SolutionStep } from '@/lib/solvers/MathSolver';

interface InteractiveStepsProps {
  steps: SolutionStep[];
}

/**
 * Компонент для отображения интерактивных шагов решения математической задачи
 * с возможностью раскрытия дополнительных объяснений
 */
const InteractiveSteps: React.FC<InteractiveStepsProps> = ({ steps }) => {
  // Состояние для хранения индексов развернутых шагов
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
  
  /**
   * Переключает состояние развернутости шага
   * @param index Индекс шага
   */
  const toggleExpand = (index: number) => {
    if (expandedSteps.includes(index)) {
      setExpandedSteps(expandedSteps.filter(i => i !== index));
    } else {
      setExpandedSteps([...expandedSteps, index]);
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg text-blue-700 dark:text-blue-300">Процесс решения:</h3>
      
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-blue-100 dark:border-blue-900 transition-all duration-300"
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-gray-800 dark:text-gray-200">
                {index + 1}. {step.description}
              </h4>
              {step.detailedExplanation && (
                <button
                  onClick={() => toggleExpand(index)}
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center"
                >
                  {expandedSteps.includes(index) ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      Скрыть подробности
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Подробнее
                    </>
                  )}
                </button>
              )}
            </div>
            
            <div className="my-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <MathDisplay formula={step.formula} />
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {step.explanation}
            </p>
            
            {step.detailedExplanation && expandedSteps.includes(index) && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md text-sm text-gray-700 dark:text-gray-300 border-l-4 border-blue-500 animate-fadeIn">
                {step.detailedExplanation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InteractiveSteps;