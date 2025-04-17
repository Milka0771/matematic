import { createWorker } from 'tesseract.js';

interface RecognitionResult {
  text: string;
  latex: string;
  confidence: number;
}

// Функция для преобразования обычного текста в LaTeX
const textToLatex = (text: string): string => {
  // Базовые замены для преобразования текста в LaTeX
  let latex = text
    // Дроби
    .replace(/(\d+)\s*\/\s*(\d+)/g, '\\frac{$1}{$2}')
    // Степени
    .replace(/(\w+)\^(\d+)/g, '$1^{$2}')
    // Корни
    .replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}')
    // Тригонометрические функции
    .replace(/sin\(/g, '\\sin(')
    .replace(/cos\(/g, '\\cos(')
    .replace(/tan\(/g, '\\tan(')
    // Логарифмы
    .replace(/log\(/g, '\\log(')
    .replace(/ln\(/g, '\\ln(')
    // Бесконечность
    .replace(/infinity/gi, '\\infty')
    // Греческие буквы
    .replace(/alpha/gi, '\\alpha')
    .replace(/beta/gi, '\\beta')
    .replace(/gamma/gi, '\\gamma')
    .replace(/delta/gi, '\\delta')
    .replace(/epsilon/gi, '\\epsilon')
    .replace(/zeta/gi, '\\zeta')
    .replace(/eta/gi, '\\eta')
    .replace(/theta/gi, '\\theta')
    .replace(/iota/gi, '\\iota')
    .replace(/kappa/gi, '\\kappa')
    .replace(/lambda/gi, '\\lambda')
    .replace(/mu/gi, '\\mu')
    .replace(/nu/gi, '\\nu')
    .replace(/xi/gi, '\\xi')
    .replace(/omicron/gi, '\\omicron')
    .replace(/pi/gi, '\\pi')
    .replace(/rho/gi, '\\rho')
    .replace(/sigma/gi, '\\sigma')
    .replace(/tau/gi, '\\tau')
    .replace(/upsilon/gi, '\\upsilon')
    .replace(/phi/gi, '\\phi')
    .replace(/chi/gi, '\\chi')
    .replace(/psi/gi, '\\psi')
    .replace(/omega/gi, '\\omega');

  return latex;
};

// Функция для распознавания математических формул с помощью Tesseract OCR
export const recognizeMathWithTesseract = async (image: File): Promise<RecognitionResult> => {
  try {
    // Создаем воркер Tesseract
    const worker = await createWorker('rus+eng');
    
    // Загружаем изображение
    const imageUrl = URL.createObjectURL(image);
    
    // Распознаем текст
    const { data } = await worker.recognize(imageUrl);
    
    // Освобождаем URL объекта
    URL.revokeObjectURL(imageUrl);
    
    // Преобразуем распознанный текст в LaTeX
    const latex = textToLatex(data.text);
    
    // Завершаем работу воркера
    await worker.terminate();
    
    return {
      text: data.text,
      latex: latex,
      confidence: data.confidence / 100 // Нормализуем уверенность к диапазону 0-1
    };
  } catch (error) {
    console.error('Error recognizing math with Tesseract:', error);
    throw new Error(`Tesseract распознавание не удалось: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Проверка доступности Tesseract
export const checkTesseractAvailability = (): boolean => {
  // Tesseract.js работает в браузере, поэтому проверяем, что мы на клиенте
  return typeof window !== 'undefined';
};