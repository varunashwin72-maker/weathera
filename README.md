# Weather Forecast App

A modern, real-time weather dashboard built with React, TypeScript, and Tailwind CSS.

## Features

- 🌡️ Real-time weather data from OpenWeatherMap API
- 🤖 **Real AI assistant** embedded on the home page, grounded in the live forecast — not a canned response
- 🎨 Aurora Weather OS design: dark, elegant panels with a live regional map, forecast intelligence, and travel/lifestyle guidance
- 📍 Search weather for any city worldwide
- 📊 Display of temperature, humidity, wind speed, pressure, and visibility
- 🌅 Sunrise and sunset times
- 📱 Fully responsive design

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **three.js / React Three Fiber** - 3D sky view
- **Express + OpenAI** - AI assistant backend (see `docs/AI_FEATURES.md`)
- **Lucide React** - Beautiful icon library

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn installed

### Installation

1. Clone the repository
```bash
git clone https://github.com/varunashwin72-maker/weather.git
cd weather
```

2. Install dependencies
```bash
npm install
```

3. (Optional but recommended) Set up the AI assistant — see `docs/AI_FEATURES.md` for the two-minute setup. Without it, everything else (including the 3D sky view) still works; only the chat widget needs `OPENAI_KEY`.

4. Start the app
```bash
npm run dev        # frontend only
npm run dev:all    # frontend + AI assistant backend together
```

The app will open at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Build for Production

```bash
npm run build
```

The optimized production files will be in the `dist` folder.

## Deployment

The app can be deployed to any static hosting service:

- **Vercel** (recommended)
  ```bash
  npm install -g vercel
  vercel
  ```

- **Netlify**
  - Connect your GitHub repo to Netlify
  - Set build command: `npm run build`
  - Set publish directory: `dist`

- **GitHub Pages**
  - Update `vite.config.ts` with base path if needed
  - Run `npm run build`
  - Deploy the `dist` folder

## API

This app uses the [OpenWeatherMap API](https://openweathermap.org/api) for weather data.

Currently uses a free API key. For production, consider using environment variables to secure the API key.

## Project Structure

```
weather/
├── src/
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # React entry point
│   └── index.css         # Global styles
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite config
├── tailwind.config.js    # Tailwind config
└── postcss.config.js     # PostCSS config
```

## License

MIT
