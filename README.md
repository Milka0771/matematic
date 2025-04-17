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

### Tesseract OCR (бесплатный сервис)

Приложение использует Tesseract OCR - бесплатную библиотеку с открытым исходным кодом для распознавания текста:
1. Не требует регистрации или API ключей
2. Работает полностью на стороне клиента (в браузере)
3. Поддерживает распознавание текста на русском и английском языках
4. Обеспечивает конфиденциальность (изображения не покидают устройство пользователя)

Tesseract OCR не требует дополнительной настройки и готов к использованию сразу после запуска приложения.

Подробная информация о Tesseract OCR:
- [Общая информация, преимущества и ограничения](./docs/tesseract-info.md)
- [Инструкция по использованию](./docs/tesseract-usage.md)
- [Подробный отчет о внесенных изменениях в проект](./docs/project-changes-report.md)

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
