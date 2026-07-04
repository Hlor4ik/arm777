# Armenian Learn — Telegram Mini App

Приложение для изучения армянского языка (восточный и лорийский диалекты, транскрипция).

## Структура

- `app/` — React + Vite + TypeScript (Mini App)
- `data/` — словарь (~2540 слов), алфавит
- `scripts/` — генерация, валидация, сборка данных
- `разработка/` — дизайн и спецификация

## Локальная разработка

```bash
npm install --prefix app
npm run build
npm run dev
```

Откройте `http://localhost:5173` (Telegram SDK работает частично в браузере).

## Деплой на Vercel

1. Создайте репозиторий на GitHub и запушьте проект.
2. [vercel.com](https://vercel.com) → **Add New Project** → Import repo.
3. Настройки сборки:
   - **Root Directory:** оставьте корень репозитория
   - **Build Command:** `npm run build`
   - **Output Directory:** `app/dist`
   - **Install Command:** `npm install --prefix app`
4. Deploy → получите URL вида `https://your-project.vercel.app`

Файл [`vercel.json`](vercel.json) настроен для SPA routing.

## Telegram Bot (BotFather)

1. `/newbot` — создайте бота, сохраните token локально (не коммитьте).
2. Bot Settings → **Menu Button** → Configure menu button → Web App.
3. URL: ваш Vercel URL (`https://your-project.vercel.app`).
4. Откройте бота в Telegram → кнопка меню запустит Mini App.

## Данные

```bash
npm run generate   # пересоздать словарь
npm run validate   # проверить JSON
npm run build      # скопировать data → app/public/data и собрать
```

## Функции v1

- 4 вкладки: Режимы, Папки, Прогресс, Настройки
- 15 тем, 2540 слов, алфавит (38 букв)
- 12 режимов обучения + экзамены
- Язык перевода RU/EN, диалект восточный/лорийский
- Прогресс: localStorage + Telegram CloudStorage
- Без TTS/STT
