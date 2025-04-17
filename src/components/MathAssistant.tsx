'use client';
import React, { useState, useRef } from 'react';
import MathDisplay from './MathDisplay';
import { recognizeMath, checkMathpixCredentials } from '@/lib/mathpix';
import * as math from 'mathjs';

const MathAssistant = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [steps, setSteps] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsProcessing(true);
    
    try {
      const mathpixAvailable = checkMathpixCredentials();
      if (!mathpixAvailable) {
        throw new Error('Mathpix API не настроен. Используйте ручной ввод.');
      }

      const recognition = await recognizeMath(e.target.files[0]);
      if (recognition.confidence < 0.7) {
        throw new Error('Низкая точность распознавания. Попробуйте другое изображение.');
      }

      setInput(recognition.latex);
      setSteps([`Распознано выражение: ${recognition.text}`]);
    } catch (error) {
      setSteps([`Ошибка распознавания: ${error instanceof Error ? error.message : String(error)}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  const calculate = async () => {
    try {
        const node = math.parse(input);
        const calculationResult = math.evaluate(input);
        
        setResult(math.format(calculationResult));
        
        setSteps(prev => [
          ...prev,
          `Вычисление: ${input}`,
          `Структура выражения: ${node.toString()}`,
          `Результат: ${math.format(calculationResult)}`,
          `Тип результата: ${typeof calculationResult === 'number' ? 'число' : math.typeOf(calculationResult)}`
        ]);

        // Добавляем визуализацию для простых уравнений
        if (input.includes('=')) {
          const [left, right] = input.split('=');
          setSteps(prev => [
            ...prev,
            `Шаг решения уравнения:`,
            `1. ${left} = ${right}`,
            `2. ${left} - ${right} = 0`,
            `3. Решение относительно переменной`
          ]);
        }
      } catch (error) {
        setResult('Ошибка вычисления');
        setSteps(prev => [...prev, `Ошибка: ${error instanceof Error ? error.message : String(error)}`]);
      }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-lg border border-blue-100 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-700 dark:text-blue-300">Математический помощник</h2>
      
      <div className="mb-4">
        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Загрузите изображение формулы:</label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors duration-200 shadow-sm mb-2"
          disabled={isProcessing}
        >
          {isProcessing ? 'Обработка...' : 'Выбрать изображение'}
        </button>
        
        <div className="text-center text-sm text-gray-500 mb-4">или</div>
        
        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Введите выражение вручную:</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-2 border border-blue-200 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700 focus:outline-none"
          placeholder="Например: 2+2*3 или 3^2"
        />
      </div>

      <div className="mb-2 grid grid-cols-3 gap-2">
        <button
          onClick={() => setInput(prev => prev + '1')}
          className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          1
        </button>
        <button
          onClick={() => setInput(prev => prev + '2')}
          className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          2
        </button>
        <button
          onClick={() => setInput(prev => prev + '3')}
          className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          3
        </button>
        <button
          onClick={() => setInput(prev => prev + '4')}
          className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          4
        </button>
        <button
          onClick={() => setInput(prev => prev + '5')}
          className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          5
        </button>
        <button
          onClick={() => setInput(prev => prev + '6')}
          className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          6
        </button>
        <button
          onClick={() => setInput(prev => prev + '7')}
          className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          7
        </button>
        <button
          onClick={() => setInput(prev => prev + '8')}
          className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          8
        </button>
        <button
          onClick={() => setInput(prev => prev + '9')}
          className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          9
        </button>
        <button
          onClick={() => setInput(prev => prev + '0')}
          className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow col-span-2"
        >
          0
        </button>
        <button
          onClick={() => setInput(prev => prev + '.')}
          className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          .
        </button>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-2">
        <button
          onClick={() => setInput(prev => prev + '+')}
          className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800 dark:hover:bg-indigo-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          +
        </button>
        <button
          onClick={() => setInput(prev => prev + '-')}
          className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800 dark:hover:bg-indigo-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          −
        </button>
        <button
          onClick={() => setInput(prev => prev + '*')}
          className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800 dark:hover:bg-indigo-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          ×
        </button>
        <button
          onClick={() => setInput(prev => prev + '/')}
          className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800 dark:hover:bg-indigo-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          ÷
        </button>
        <button
          onClick={() => setInput(prev => prev + '^')}
          className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800 dark:hover:bg-indigo-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          x<sup>y</sup>
        </button>
        <button
          onClick={() => setInput(prev => prev + '(')}
          className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800 dark:hover:bg-indigo-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          (
        </button>
        <button
          onClick={() => setInput(prev => prev + ')')}
          className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800 dark:hover:bg-indigo-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          )
        </button>
        <button
          onClick={() => setInput(prev => prev + '=')}
          className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800 dark:hover:bg-indigo-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          =
        </button>
        <button
          onClick={() => setInput(prev => prev + 'sqrt(')}
          className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800 dark:hover:bg-indigo-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          √
        </button>
        <button
          onClick={() => setInput(prev => prev + 'sin(')}
          className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800 dark:hover:bg-indigo-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          sin
        </button>
        <button
          onClick={() => setInput(prev => prev + 'cos(')}
          className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800 dark:hover:bg-indigo-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          cos
        </button>
        <button
          onClick={() => {
            setInput('');
            setResult('');
            setSteps([]);
          }}
          className="bg-red-200 hover:bg-red-300 dark:bg-red-700 dark:hover:bg-red-600 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          C
        </button>
      </div>

      <button
        onClick={calculate}
        disabled={!input || isProcessing}
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-4 rounded-md mb-4 disabled:opacity-50 font-medium shadow-md hover:shadow-lg transition-all duration-200"
      >
        Решить по шагам
      </button>

      <div className="mb-4 min-h-20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-inner">
        <MathDisplay formula={input || '\\text{Введите выражение или загрузите изображение}'} />
      </div>

      {steps.length > 0 && (
        <div className="mt-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900 rounded-lg shadow-md border border-blue-100 dark:border-gray-700">
          <h3 className="font-bold mb-3 text-blue-700 dark:text-blue-300 text-lg">Процесс решения:</h3>
          <ul className="list-decimal pl-5 space-y-3">
            {steps.map((step, i) => (
              <li key={i} className="text-gray-700 dark:text-gray-300">{step}</li>
            ))}
          </ul>
          
          {result && (
            <>
              <h3 className="font-bold mt-5 mb-3 text-blue-700 dark:text-blue-300 text-lg">Итоговый результат:</h3>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
                <MathDisplay formula={`${input} = ${result}`} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MathAssistant;