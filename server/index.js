import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import { simpleCache } from './cache.js';
import { computeNowcast } from './nowcast.js';
import { llmChat } from './llm-client.js';

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

const OPENWEATHER_KEY = process.env.OPENWEATHER_KEY;
const OPENAI_KEY = process.env.OPENAI_KEY; // consumed inside llm-client.js

if (!OPENAI_KEY) {
  console.warn('WARNING: OPENAI_KEY is not set. The /api/assistant endpoint will return an error until it is configured in .env');
}

const cache = simpleCache();

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'ai-weather-backend', openaiConfigured: Boolean(OPENAI_KEY) });
});

/**
 * The real, working AI assistant.
 *
 * The frontend already fetches current + forecast + air quality data for the
 * user's chosen city (free-tier OpenWeather endpoints, see src/services/weatherService.ts)
 * and sends that bundle along with the conversation. This endpoint just has
 * to turn that into a grounded system prompt and forward the conversation to
 * the LLM - no paid One Call subscription required.
 */
app.post('/api/assistant', async (req, res) => {
  try {
    const { weather, messages } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages (non-empty array) is required' });
    }
    if (!OPENAI_KEY) {
      return res.status(503).json({ error: 'OPENAI_KEY is not configured on the server. Add it to your .env file.' });
    }

    const trimmedMessages = messages
      .filter((m) => m && typeof m.content === 'string' && m.content.trim())
      .slice(-12) // keep the request small and cheap
      .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content.trim() }));

    if (trimmedMessages.length === 0) {
      return res.status(400).json({ error: 'No valid messages provided' });
    }

    const systemPrompt = buildSystemPrompt(weather);

    const ai = await llmChat([{ role: 'system', content: systemPrompt }, ...trimmedMessages]);

    res.json({ reply: ai?.content?.trim() || "I couldn't come up with an answer for that - try rephrasing the question." });
  } catch (err) {
    console.error('Assistant error:', err);
    res.status(500).json({ error: String(err?.message || err) });
  }
});

function buildSystemPrompt(weather) {
  const base = [
    'You are the in-app weather assistant for a weather dashboard.',
    'Answer briefly (2-4 sentences unless asked for detail), in plain language, and give concrete, practical advice (clothing, travel, umbrella, sun protection, etc.) when relevant.',
    "If the question is unrelated to weather, gently steer back to what you can help with.",
  ];

  if (weather?.current) {
    const c = weather.current;
    const upcoming = Array.isArray(weather.hourly)
      ? weather.hourly.slice(0, 6).map((h) => `${h.label}: ${h.temp}°C, ${h.condition}, ${h.precipitation}% precip`).join(' | ')
      : '';
    const daily = Array.isArray(weather.daily)
      ? weather.daily.slice(0, 5).map((d) => `${d.label}: ${d.temp}°C, ${d.condition}`).join(' | ')
      : '';

    base.push(
      'Current conditions you must ground your answer in:',
      `Location: ${c.city}, ${c.country}`,
      `Now: ${c.temperature}°C (feels like ${c.feelsLike}°C), ${c.description}, humidity ${c.humidity}%, wind ${c.windSpeed} m/s, rain chance ${c.rainChance}%, UV index ${c.uvIndex}, cloud cover ${c.cloudCover}%.`,
      upcoming ? `Next hours: ${upcoming}` : '',
      daily ? `Next days: ${daily}` : ''
    );
  } else {
    base.push('No location has been searched yet - if the user asks about conditions, ask them to search a city first.');
  }

  return base.filter(Boolean).join('\n');
}

// ---- Optional endpoints below require an OpenWeather "One Call" subscription ----
// They are kept for reference but are not called by the current frontend.

async function fetchOneCall(lat, lon) {
  if (!OPENWEATHER_KEY) throw new Error('OPENWEATHER_KEY is not set');
  const key = `onecall:${lat}:${lon}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=daily,alerts&appid=${OPENWEATHER_KEY}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`OpenWeather error ${resp.status}`);
  const json = await resp.json();
  cache.set(key, json, 5 * 60);
  return json;
}

app.get('/api/nowcast', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });
    const weather = await fetchOneCall(lat, lon);
    res.json({ nowcast: computeNowcast(weather) });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/alerts', async (req, res) => {
  try {
    const { lat, lon, rainWithinHours } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });
    const weather = await fetchOneCall(lat, lon);

    const hours = parseInt(rainWithinHours || '3', 10);
    const hourly = weather.hourly || [];
    let rainInHours = null;
    for (let i = 0; i < Math.min(hourly.length, hours); i++) {
      const h = hourly[i];
      const pop = h.pop || 0;
      const hasRain = (h.rain && Object.values(h.rain).some((v) => v > 0)) || pop >= 0.5;
      if (hasRain) {
        rainInHours = i;
        break;
      }
    }

    const alerts = [];
    if (rainInHours !== null) {
      alerts.push({ type: 'rain', message: `Rain expected within ${rainInHours} hours`, in: rainInHours });
    }
    res.json({ alerts });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`AI weather assistant server running on port ${PORT}`));
