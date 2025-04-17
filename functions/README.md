# Настройка Firebase Functions для распознавания математических формул

Этот документ содержит инструкции по настройке Firebase Functions для распознавания математических формул из изображений с использованием Google Cloud Vision API.

## Предварительные требования

1. Аккаунт Google Cloud Platform
2. Проект Firebase
3. Установленный Firebase CLI
4. Включенный биллинг в проекте Google Cloud Platform (для использования Cloud Vision API)

## Шаги по настройке

### 1. Установка Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Вход в аккаунт Firebase

```bash
firebase login
```

### 3. Инициализация Firebase Functions

```bash
firebase init functions
```

Выберите JavaScript или TypeScript в зависимости от ваших предпочтений.

### 4. Установка зависимостей

В директории functions установите необходимые зависимости:

```bash
cd functions
npm install @google-cloud/vision
```

### 5. Создание функции для распознавания математических формул

Создайте файл `index.js` (или `index.ts` для TypeScript) в директории functions со следующим содержимым:

```javascript
const functions = require('firebase-functions');
const vision = require('@google-cloud/vision');

// Создаем клиент Cloud Vision API
const client = new vision.ImageAnnotatorClient();

exports.recognizeMath = functions.https.onCall(async (data, context) => {
  try {
    // Получаем URL изображения из запроса
    const imageUrl = data.imageUrl;
    
    if (!imageUrl) {
      throw new Error('URL изображения не предоставлен');
    }
    
    // Выполняем распознавание текста
    const [textDetection] = await client.textDetection(imageUrl);
    const detections = textDetection.textAnnotations;
    
    if (!detections || detections.length === 0) {
      throw new Error('Текст не обнаружен на изображении');
    }
    
    // Получаем распознанный текст
    const text = detections[0].description;
    
    // Преобразуем текст в LaTeX (это упрощенная версия, для реальных приложений
    // может потребоваться более сложная логика преобразования)
    let latex = text;
    
    // Здесь можно добавить логику преобразования текста в LaTeX
    // Например, заменить "x^2" на "x^{2}" и т.д.
    
    return {
      text: text,
      latex: latex,
      confidence: textDetection.textAnnotations[0].confidence || 0.9
    };
  } catch (error) {
    console.error('Error recognizing math:', error);
    throw new functions.https.HttpsError('internal', `Error recognizing math: ${error.message}`);
  }
});
```

### 6. Включение Cloud Vision API

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Выберите ваш проект
3. Перейдите в "APIs & Services" > "Library"
4. Найдите "Cloud Vision API" и включите его

### 7. Развертывание функции

```bash
firebase deploy --only functions
```

## Использование

После настройки и развертывания функции, вы можете использовать ее в вашем приложении через Firebase SDK:

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const recognizeMath = httpsCallable(functions, 'recognizeMath');

// Вызов функции
const result = await recognizeMath({ imageUrl: 'https://example.com/image.jpg' });
console.log(result.data);
```

## Ограничения

- Cloud Vision API не специализируется на распознавании математических формул, поэтому точность может быть ниже, чем у специализированных сервисов, таких как Mathpix.
- Для сложных математических формул может потребоваться дополнительная обработка распознанного текста для преобразования в корректный LaTeX.
- Использование Cloud Vision API является платным, поэтому убедитесь, что у вас включен биллинг в проекте Google Cloud Platform.