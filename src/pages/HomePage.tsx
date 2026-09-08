import { type KeyboardEvent, useMemo } from "react";
import {
  Bookmark,
  BookmarkPlus,
  Camera,
  Car,
  Cloud,
  Compass,
  Droplets,
  Eye,
  Gauge,
  MapPin,
  Mic,
  Moon,
  Navigation,
  RefreshCw,
  Sailboat,
  Shield,
  ShieldAlert,
  Sparkles,
  SunMedium,
  Thermometer,
  Wind,
} from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { MetricTile } from "../components/MetricTile";
import { PanelHeader } from "../components/PanelHeader";
import { InsightTile } from "../components/InsightTile";
import { LifestyleRow } from "../components/LifestyleRow";
import { WeatherMap } from "../components/WeatherMap";
import { AiAssistantPanel } from "../components/AiAssistantPanel";
import type { ThemeConfig, WeatherBundle } from "../types";

interface HomePageProps {
  city: string;
  setCity: (value: string) => void;
  weather: WeatherBundle | null;
  loading: boolean;
  error: string;
  theme: ThemeConfig;
  handleSearch: () => void;
  handleKey: (e: KeyboardEvent<HTMLInputElement>) => void;
  onCurrentLocation: () => void;
  onSaveLocation: () => void;
  isSaved: boolean;
}

function getAqiLabel(aqi: number): string {
  if (aqi <= 1) return "Good";
  if (aqi === 2) return "Fair";
  if (aqi === 3) return "Moderate";
  if (aqi === 4) return "Poor";
  return "Very Poor";
}

function formatTime(unix: number, timezoneOffset: number): string {
  const date = new Date((unix + timezoneOffset) * 1000);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function getWeatherEmoji(description: string): string {
  const lower = description.toLowerCase();
  if (lower.includes("rain")) return "🌧️";
  if (lower.includes("snow")) return "❄️";
  if (lower.includes("storm")) return "⛈️";
  if (lower.includes("cloud")) return "☁️";
  if (lower.includes("clear")) return "☀️";
  return "🌤️";
}

/** Rough moon phase for display purposes, based on days since a known new moon. */
function getMoonPhase(date: Date): string {
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14);
  const lunarCycle = 29.53058867;
  const daysSince = (date.getTime() - knownNewMoon) / 86400000;
  const phase = ((daysSince % lunarCycle) + lunarCycle) % lunarCycle;
  const index = Math.floor((phase / lunarCycle) * 8 + 0.5) % 8;
  return ["New moon", "Waxing crescent", "First quarter", "Waxing gibbous", "Full moon", "Waning gibbous", "Last quarter", "Waning crescent"][index];
}

export function HomePage({ city, setCity, weather, loading, error, handleSearch, handleKey, onCurrentLocation, onSaveLocation, isSaved }: HomePageProps) {
  const insights = useMemo(() => {
    if (!weather) return null;
    return {
      aiInsight: weather.current.summary,
      travel:
        weather.current.temperature > 20
          ? "The day is ideal for travel and sightseeing when layered with light protection."
          : "Cooler conditions suggest extra layers and slower outdoor pacing.",
      outdoor:
        weather.current.rainChance > 55
          ? "Rain is likely; consider indoor activities or a compact umbrella."
          : "Great conditions for recreation, running, and open-air dining.",
    };
  }, [weather]);

  const lifestyle = useMemo(() => {
    if (!weather) return null;
    const { windSpeed, rainChance, visibility, cloudCover } = weather.current;
    const driving = rainChance > 60 || windSpeed > 12 ? "Caution advised" : rainChance > 30 ? "Moderate" : "Comfortable";
    const marine = windSpeed > 10 ? "Rough" : windSpeed > 5 ? "Moderate" : "Calm";
    const photography = cloudCover < 30 && visibility > 8 ? "Excellent" : cloudCover < 70 ? "Good" : "Limited";
    return { driving, marine, photography };
  }, [weather]);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Live Search */}
        <GlassCard delay={0.02}>
          <div className="p-5 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Live Search</p>
              <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">AI-assisted weather</span>
            </div>
            <h2 className="mb-4 text-xl font-bold text-white">Plan your next moment with clarity.</h2>

            <div className="flex gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5">
                <MapPin size={16} className="text-slate-500" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyPress={handleKey}
                  placeholder="Enter city name..."
                  className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:opacity-50"
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Analyze
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onCurrentLocation}
                disabled={loading}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300 transition hover:bg-white/[0.1] hover:text-white disabled:cursor-wait disabled:opacity-60"
              >
                <Compass size={14} /> {loading ? "Finding you..." : "Current location"}
              </button>
              <button
                type="button"
                onClick={() => document.getElementById("travel-guidance")?.scrollIntoView({ behavior: "smooth", block: "center" })}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300 transition hover:bg-white/[0.1] hover:text-white"
              >
                <Navigation size={14} /> Travel guidance
              </button>
              <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300">
                <Mic size={14} /> Voice search
              </span>
            </div>

            {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
          </div>
        </GlassCard>

        {/* Now */}
        <GlassCard delay={0.05}>
          <div className="p-5 sm:p-6">
            {weather ? (
              <>
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Now</p>
                    <h2 className="mt-1 text-xl font-bold text-white">{weather.current.city}</h2>
                  </div>
                  <button
                    onClick={onSaveLocation}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/10"
                  >
                    {isSaved ? <BookmarkPlus size={16} /> : <Bookmark size={16} />}
                  </button>
                </div>

                <div className="mb-2 flex items-end gap-3">
                  <span className="text-5xl font-extrabold leading-none text-white">{weather.current.temperature}°</span>
                  <span className="mb-1 text-3xl">{getWeatherEmoji(weather.current.description)}</span>
                  <span className="mb-1.5 text-sm text-slate-400">Feels {weather.current.feelsLike}°</span>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">{weather.current.description}</p>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">{weather.current.comfortIndex}% comfort</span>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3">
                  <MetricTile icon={<Droplets size={16} />} label="Humidity" value={`${weather.current.humidity}%`} accent="#38bdf8" />
                  <MetricTile icon={<Wind size={16} />} label="Wind" value={`${weather.current.windSpeed} m/s`} accent="#818cf8" />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                  <span className="flex items-center gap-2">
                    <SunMedium size={16} className="text-amber-300" /> {formatTime(weather.current.sunrise, weather.current.timezoneOffset)}
                  </span>
                  <span className="flex items-center gap-2">
                    <Moon size={16} className="text-indigo-300" /> {formatTime(weather.current.sunset, weather.current.timezoneOffset)}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex h-full min-h-[220px] flex-col items-center justify-center text-center">
                <Sparkles size={28} className="mb-3 text-slate-500" />
                <p className="text-sm text-slate-400">Search for a city to see live conditions</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* AI Assistant */}
      <GlassCard delay={0.08}>
        <AiAssistantPanel weather={weather} />
      </GlassCard>

      {weather && insights && lifestyle && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            {/* Forecast intelligence */}
            <GlassCard delay={0.1}>
              <div className="p-5 sm:p-6">
                <PanelHeader title="Forecast intelligence" subtitle="Interpreted conditions tailored for your next move." />
                <div className="mb-5 grid grid-cols-2 gap-3">
                  <MetricTile icon={<Eye size={16} />} label="Visibility" value={`${weather.current.visibility} km`} accent="#4ade80" />
                  <MetricTile icon={<Gauge size={16} />} label="Pressure" value={`${weather.current.pressure} hPa`} accent="#fbbf24" />
                  <MetricTile icon={<SunMedium size={16} />} label="UV index" value={`${weather.current.uvIndex}`} accent="#fb923c" />
                  <MetricTile icon={<Cloud size={16} />} label="Rain chance" value={`${weather.current.rainChance}%`} accent="#38bdf8" />
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="mb-2 text-sm font-semibold text-white">Daily brief</p>
                  <p className="mb-3 text-sm text-slate-400">{weather.current.summary}</p>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-slate-300">
                    <Shield size={14} className="text-cyan-300" />
                    Air quality is currently {getAqiLabel(weather.current.aqi).toLowerCase()}.
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* What to expect */}
            <GlassCard delay={0.12}>
              <div id="travel-guidance" className="p-5 sm:p-6">
                <PanelHeader title="What to expect" subtitle="Elegant guidance for commuting, travel, and outdoor plans." />
                <div className="grid gap-3 sm:grid-cols-3">
                  <InsightTile icon={<Sparkles size={15} />} title="AI insight" description={insights.aiInsight} accent="#22d3ee" highlighted />
                  <InsightTile icon={<Navigation size={15} />} title="Travel readiness" description={insights.travel} accent="#38bdf8" />
                  <InsightTile icon={<Compass size={15} />} title="Outdoor plan" description={insights.outdoor} accent="#a78bfa" />
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="flex flex-col gap-6">
            {/* Atmospheric snapshot */}
            <GlassCard delay={0.1}>
              <div className="p-5 sm:p-6">
                <PanelHeader title="Atmospheric snapshot" subtitle="The most important numbers at a glance." />
                <div className="grid grid-cols-2 gap-3">
                  <MetricTile icon={<Thermometer size={16} />} label="Feels like" value={`${weather.current.feelsLike}°`} accent="#fb7185" />
                  <MetricTile icon={<Cloud size={16} />} label="Cloud cover" value={`${weather.current.cloudCover}%`} accent="#e2e8f0" />
                  <MetricTile icon={<ShieldAlert size={16} />} label="AQI" value={`${weather.current.aqi}`} accent="#ef4444" />
                  <MetricTile icon={<Moon size={16} />} label="Moon phase" value={getMoonPhase(new Date())} accent="#ca8a04" />
                </div>
              </div>
            </GlassCard>

            {/* Regional map */}
            <GlassCard delay={0.12}>
              <div className="p-5 sm:p-6">
                <PanelHeader title="Regional map" subtitle="Localized weather context for your current destination." />
                <WeatherMap current={weather.current} />
              </div>
            </GlassCard>

            {/* Travel & lifestyle */}
            <GlassCard delay={0.14}>
              <div className="p-5 sm:p-6">
                <PanelHeader title="Travel & lifestyle" subtitle="Suggested conditions for everyday plans." />
                <div className="flex flex-col gap-3">
                  <LifestyleRow icon={<Car size={16} />} label="Driving" status={lifestyle.driving} accent="#2dd4bf" />
                  <LifestyleRow icon={<Sailboat size={16} />} label="Marine" status={lifestyle.marine} accent="#38bdf8" />
                  <LifestyleRow icon={<Camera size={16} />} label="Photography" status={lifestyle.photography} accent="#fbbf24" />
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
