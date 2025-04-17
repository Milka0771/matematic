// Конфигурация Firebase для распознавания математических выражений
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDCFddOcnKspe-kIvFv3iuvbcT-3BPZNSQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "matematic-3e5a8.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "matematic-3e5a8",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "matematic-3e5a8.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "684610258122",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:684610258122:web:60cc5acf9b2f1cde0a2033",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-YHRSGWS0ZQ"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const functions = getFunctions(app);
export const auth = getAuth(app);

// Инициализация аналитики только на стороне клиента
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

interface RecognitionResult {
  text: string;
  latex: string;
  confidence: number;
}

// Функция для загрузки изображения в Firebase Storage и вызова Cloud Function для распознавания
export const recognizeMathWithFirebase = async (image: File): Promise<RecognitionResult> => {
  try {
    // Создаем уникальное имя файла
    const timestamp = Date.now();
    const fileName = `math_images/${timestamp}_${image.name}`;
    
    // Создаем ссылку на файл в Firebase Storage
    const storageRef = ref(storage, fileName);
    
    // Загружаем файл в Firebase Storage
    await uploadBytes(storageRef, image);
    
    // Получаем URL загруженного файла
    const imageUrl = await getDownloadURL(storageRef);
    
    // Вызываем Cloud Function для распознавания формулы
    const recognizeMathFunction = httpsCallable(functions, 'recognizeMath');
    const result = await recognizeMathFunction({ imageUrl });
    
    // Преобразуем результат
    const data = result.data as RecognitionResult;
    
    return {
      text: data.text,
      latex: data.latex,
      confidence: data.confidence
    };
  } catch (error) {
    console.error('Error recognizing math with Firebase:', error);
    throw new Error(`Firebase распознавание не удалось: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Проверка наличия конфигурации Firebase
export const checkFirebaseConfig = () => {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.storageBucket) {
    console.warn('Firebase конфигурация не настроена. Используйте ручной ввод.');
    return false;
  }
  return true;
};