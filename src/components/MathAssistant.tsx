'use client';
import React, { useState, useRef } from 'react';
import MathDisplay from './MathDisplay';
import { recognizeMath, checkMathpixCredentials } from '@/lib/mathpix';
import { recognizeMathWithFirebase, checkFirebaseConfig } from '@/lib/firebase';
import { recognizeMathWithTesseract, checkTesseractAvailability } from '@/lib/tesseract';
import * as math from 'mathjs';

const MathAssistant = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [steps, setSteps] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognitionService, setRecognitionService] = useState<'mathpix' | 'firebase' | 'tesseract'>('mathpix');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Вспомогательная функция для обновления ввода и очистки результатов
  const updateInput = (newValue: string) => {
    setInput(newValue);
    if (result) {
      setResult('');
      setSteps([]);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsProcessing(true);
    
    try {
      let recognition;
      
      if (recognitionService === 'mathpix') {
        const mathpixAvailable = checkMathpixCredentials();
        if (!mathpixAvailable) {
          throw new Error('Mathpix API не настроен. Пожалуйста, укажите ваши учетные данные в файле .env.local или выберите другой сервис.');
        }
        recognition = await recognizeMath(e.target.files[0]);
      } else if (recognitionService === 'firebase') {
        const firebaseAvailable = checkFirebaseConfig();
        if (!firebaseAvailable) {
          throw new Error('Firebase не настроен. Пожалуйста, укажите конфигурацию Firebase в файле .env.local или выберите другой сервис.');
        }
        recognition = await recognizeMathWithFirebase(e.target.files[0]);
      } else {
        // Tesseract OCR
        const tesseractAvailable = checkTesseractAvailability();
        if (!tesseractAvailable) {
          throw new Error('Tesseract недоступен в вашем браузере. Пожалуйста, выберите другой сервис.');
        }
        recognition = await recognizeMathWithTesseract(e.target.files[0]);
      }
      
      if (recognition.confidence < 0.5) {
        throw new Error('Низкая точность распознавания. Попробуйте другое изображение или другой сервис распознавания.');
      }

      updateInput(recognition.latex);
      setSteps([`Распознано выражение: ${recognition.text}`]);
    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : String(error);
      
      // Более понятные сообщения об ошибках
      if (errorMessage.includes('Mathpix API error')) {
        errorMessage = 'Ошибка при обращении к Mathpix API. Проверьте ваши учетные данные в файле .env.local и подключение к интернету.';
      } else if (errorMessage.includes('Firebase')) {
        errorMessage = 'Ошибка при обращении к Firebase. Проверьте вашу конфигурацию Firebase в файле .env.local и подключение к интернету.';
      } else if (errorMessage.includes('Tesseract')) {
        errorMessage = 'Ошибка при распознавании с помощью Tesseract. Попробуйте другое изображение или другой сервис распознавания.';
      }
      
      setSteps([`Ошибка распознавания: ${errorMessage}`]);
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
        <div className="flex justify-between items-center mb-2">
          <label className="font-medium text-gray-700 dark:text-gray-300">Загрузите изображение формулы:</label>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Сервис:</span>
            <select
              value={recognitionService}
              onChange={(e) => setRecognitionService(e.target.value as 'mathpix' | 'firebase' | 'tesseract')}
              className="text-sm p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            >
              <option value="mathpix">Mathpix (платный)</option>
              <option value="firebase">Firebase (платный)</option>
              <option value="tesseract">Tesseract (бесплатный)</option>
            </select>
          </div>
        </div>
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
          onChange={(e) => updateInput(e.target.value)}
          className="w-full p-2 border border-blue-200 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700 focus:outline-none"
          placeholder="Например: 2+2*3 или 3^2"
        />
      </div>

      <div className="mb-2 grid grid-cols-3 gap-2">
        <button
          onClick={() => updateInput(input + '1')}
          className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          1
        </button>
        <button
          onClick={() => updateInput(input + '2')}
          className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          2
        </button>
        <button
          onClick={() => updateInput(input + '3')}
          className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          3
        </button>
        <button
          onClick={() => updateInput(input + '4')}
          className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          4
        </button>
        <button
          onClick={() => updateInput(input + '5')}
          className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          5
        </button>
        <button
          onClick={() => updateInput(input + '6')}
          className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          6
        </button>
        <button
          onClick={() => updateInput(input + '7')}
          className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          7
        </button>
        <button
          onClick={() => updateInput(input + '8')}
          className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          8
        </button>
        <button
          onClick={() => updateInput(input + '9')}
          className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          9
        </button>
        <button
          onClick={() => updateInput(input + '0')}
          className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow col-span-2"
        >
          0
        </button>
        <button
          onClick={() => updateInput(input + '.')}
          className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          .
        </button>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-2">
        <button
          onClick={() => updateInput(input + '+')}
          className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800 dark:hover:bg-indigo-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          +
        </button>
        <button
          onClick={() => updateInput(input + '-')}
          className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800 dark:hover:bg-indigo-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          −
        </button>
        <button
          onClick={() => updateInput(input + '*')}
          className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800 dark:hover:bg-indigo-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          ×
        </button>
        <button
          onClick={() => updateInput(input + '/')}
          className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800 dark:hover:bg-indigo-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          ÷
        </button>
        <button
          onClick={() => updateInput(input + '^')}
          className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800 dark:hover:bg-indigo-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          x<sup>y</sup>
        </button>
        <button
          onClick={() => updateInput(input + '(')}
          className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800 dark:hover:bg-indigo-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          (
        </button>
        <button
          onClick={() => updateInput(input + ')')}
          className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800 dark:hover:bg-indigo-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          )
        </button>
        <button
          onClick={() => updateInput(input + '=')}
          className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800 dark:hover:bg-indigo-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          =
        </button>
        <button
          onClick={() => updateInput(input.slice(0, -1))}
          className="bg-amber-100 hover:bg-amber-200 dark:bg-amber-800 dark:hover:bg-amber-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          ⌫
        </button>
        <button
          onClick={() => updateInput(input + 'sqrt(')}
          className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800 dark:hover:bg-indigo-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          √
        </button>
        <button
          onClick={() => updateInput(input + 'sin(')}
          className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800 dark:hover:bg-indigo-700 text-center py-3 rounded-md font-medium text-gray-800 dark:text-white shadow-sm transition-all duration-200 hover:shadow"
        >
          sin
        </button>
        <button
          onClick={() => updateInput(input + 'cos(')}
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