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
          `Абстрактное синтаксическое дерево: ${node.toString()}`,
          `Результат: ${math.format(calculationResult)}`,
          `Тип результата: ${math.typeOf(calculationResult)}`
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
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Математический помощник</h2>
      
      <div className="mb-4">
        <label className="block mb-2 font-medium">Загрузите изображение формулы:</label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded mb-2"
          disabled={isProcessing}
        >
          {isProcessing ? 'Обработка...' : 'Выбрать изображение'}
        </button>
        
        <div className="text-center text-sm text-gray-500 mb-4">или</div>
        
        <label className="block mb-2 font-medium">Введите выражение вручную:</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Например: 2+2*3 или 3^2"
        />
      </div>

      <button
        onClick={calculate}
        disabled={!input || isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mb-4 disabled:opacity-50"
      >
        Решить по шагам
      </button>

      <div className="mb-4 min-h-20 border rounded p-4 bg-gray-50 dark:bg-gray-700">
        <MathDisplay formula={input || '\\text{Введите выражение или загрузите изображение}'} />
      </div>

      {steps.length > 0 && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
          <h3 className="font-bold mb-2">Процесс решения:</h3>
          <ul className="list-decimal pl-5 space-y-2">
            {steps.map((step, i) => (
              <li key={i} className="text-sm">{step}</li>
            ))}
          </ul>
          
          {result && (
            <>
              <h3 className="font-bold mt-4 mb-2">Итоговый результат:</h3>
              <MathDisplay formula={`${input} = ${result}`} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MathAssistant;