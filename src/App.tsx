import { useEffect, useState } from "react";
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { Bookmark, History, Home } from "lucide-react";
import { HomePage } from "./pages/HomePage";
import { HistoryPage } from "./pages/HistoryPage";
import { LoginPage } from "./pages/LoginPage";
import { SavedLocationsPage } from "./pages/SavedLocationsPage";
import { fetchWeatherByCity, fetchWeatherByCoordinates } from "./services/weatherService";
import { fetchMe, logoutUser, saveHistory } from "./lib/auth";
import { GlassCard } from "./components/GlassCard";
import type { ThemeConfig, WeatherBundle } from "./types";

const auroraTheme: ThemeConfig = { bg: "", glow: "", accent: "#22d3ee", particles: [] };

function AppRoutes() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme] = useState(auroraTheme);
  const [history, setHistory] = useState<string[]>([]);
  const [savedLocations, setSavedLocations] = useState<string[]>([]);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const navigate = useNavigate();

  async function fetchWeather(cityName: string) {
    if (!cityName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const bundle = await fetchWeatherByCity(cityName);
      setWeather(bundle);
      setHistory((prev) => [bundle.current.city, ...prev.filter((item) => item !== bundle.current.city)].slice(0, 8));
      setCity(bundle.current.city);
      if (localStorage.getItem('aurora-token')) {
        try {
          void saveHistory(bundle.current.city);
        } catch {
          // ignore backend sync failures
        }
      }
    } catch {
      setError("Weather data could not be loaded. Try a different city.");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    fetchWeather(city);
  }

  async function handleCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Location services are not supported by this browser.");
      return;
    }

    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const bundle = await fetchWeatherByCoordinates(coords.latitude, coords.longitude, "");
          setWeather(bundle);
          setCity(bundle.current.city);
          setHistory((prev) => [bundle.current.city, ...prev.filter((item) => item !== bundle.current.city)].slice(0, 8));
        } catch {
          setError("Weather data could not be loaded for your current location.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setError("Allow location access to check weather near you.");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  function handleKey(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") handleSearch();
  }

  function handleSaveLocation() {
    if (!weather?.current.city) return;
    setSavedLocations((prev) => (prev.includes(weather.current.city) ? prev : [...prev, weather.current.city]));
  }

  function handleSelectLocation(nextCity: string) {
    setCity(nextCity);
    navigate("/");
    fetchWeather(nextCity);
  }

  function handleClearHistory() {
    setHistory([]);
  }

  function handleRemoveSavedLocation(cityName: string) {
    setSavedLocations((prev) => prev.filter((item) => item !== cityName));
  }

  useEffect(() => {
    const saved = localStorage.getItem("weather-history");
    const pinned = localStorage.getItem("weather-saved");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
    if (pinned) {
      setSavedLocations(JSON.parse(pinned));
    }

    const token = localStorage.getItem('aurora-token');
    if (token) {
      void fetchMe()
        .then((response) => setUser(response.user))
        .catch(() => {
          logoutUser();
          setUser(null);
        });
    }

    void fetchWeather("London");
  }, []);

  useEffect(() => {
    localStorage.setItem("weather-history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("weather-saved", JSON.stringify(savedLocations));
  }, [savedLocations]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
      isActive ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
    }`;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#070a10]" style={{ fontFamily: "Outfit, sans-serif" }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "26px 26px" }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(99,102,241,0.08), transparent)" }}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center px-3 py-4 sm:px-6 sm:py-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          {!user ? (
            <div className="flex w-full justify-end">
              <Link to="/login" className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">
                Login / Register
              </Link>
            </div>
          ) : null}

          <GlassCard className="p-5 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  <span className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">Premium Weather Intelligence</span>
                </div>
                <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
                  Skypulse weather<span className="text-cyan-400">OS</span>
                </h1>
                <p className="mt-2 max-w-xl text-sm text-slate-400">
                  Beautiful forecasts, travel guidance, air quality intelligence, and elegant weather insights for the modern world.
                </p>
              </div>
              <nav className="flex gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
                <NavLink to="/" className={navLinkClass} end>
                  <Home size={16} />
                  Home
                </NavLink>
                <NavLink to="/history" className={navLinkClass}>
                  <History size={16} />
                  History
                </NavLink>
                <NavLink to="/saved" className={navLinkClass}>
                  <Bookmark size={16} />
                  Saved
                </NavLink>
              </nav>
            </div>
          </GlassCard>

          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
            <Route
              path="/"
              element={
                <HomePage
                  city={city}
                  setCity={setCity}
                  weather={weather}
                  loading={loading}
                  error={error}
                  theme={theme}
                  handleSearch={handleSearch}
                  handleKey={handleKey}
                  onCurrentLocation={handleCurrentLocation}
                  onSaveLocation={handleSaveLocation}
                  isSaved={savedLocations.includes(weather?.current.city ?? "")}
                />
              }
            />
            <Route path="/history" element={<HistoryPage history={history} onSelect={handleSelectLocation} onClear={handleClearHistory} />} />
            <Route path="/saved" element={<SavedLocationsPage savedLocations={savedLocations} onSelect={handleSelectLocation} onRemove={handleRemoveSavedLocation} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
