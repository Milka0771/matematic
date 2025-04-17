# Визуальный помощник по математике

Веб-приложение, помогающее школьникам 10-16 лет понимать математику через пошаговые визуализированные решения.

## Возможности

- Распознавание математических выражений из изображений
- Пошаговые решения с объяснениями
- Визуализация математических концепций
- Поддержка различных математических операций

## Технологии

- Next.js (TypeScript)
- Tailwind CSS
- MathJax для отображения формул
- Mathpix API или Firebase для распознавания формул

## Распознавание математических формул

Приложение поддерживает два способа распознавания математических формул из изображений:

### 1. Mathpix API

Для использования Mathpix API необходимо:
1. Зарегистрироваться на [Mathpix](https://mathpix.com/)
2. Получить API ключи (app_id и app_key)
3. Добавить их в файл `.env.local`

### 2. Firebase + Google Cloud Vision API

Альтернативно, можно использовать Firebase и Google Cloud Vision API:
1. Создать проект Firebase
2. Настроить Firebase Functions с Google Cloud Vision API
3. Добавить конфигурацию Firebase в файл `.env.local`

Подробные инструкции по настройке Firebase Functions находятся в директории [functions/README.md](./functions/README.md).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
