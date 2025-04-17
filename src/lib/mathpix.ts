// Конфигурация Mathpix API для распознавания математических выражений
const MATHPIX_APP_ID = process.env.NEXT_PUBLIC_MATHPIX_APP_ID || '';
const MATHPIX_APP_KEY = process.env.NEXT_PUBLIC_MATHPIX_APP_KEY || '';

interface MathpixResult {
  text: string;
  latex: string;
  confidence: number;
}

export const recognizeMath = async (image: File | string): Promise<MathpixResult> => {
  const formData = new FormData();
  
  if (typeof image === 'string') {
    // URL или base64 изображения
    formData.append('url', image);
  } else {
    // Файл изображения
    formData.append('file', image);
  }

  formData.append('formats', 'text, latex');
  formData.append('confidence', '0.9');

  const response = await fetch('https://api.mathpix.com/v3/text', {
    method: 'POST',
    headers: {
      'app_id': MATHPIX_APP_ID,
      'app_key': MATHPIX_APP_KEY,
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Mathpix API error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    text: data.text,
    latex: data.latex,
    confidence: data.confidence
  };
};

export const checkMathpixCredentials = () => {
  if (!MATHPIX_APP_ID || !MATHPIX_APP_KEY) {
    console.warn('Mathpix API credentials not configured. Using fallback manual input.');
    return false;
  }
  return true;
};