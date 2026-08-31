export interface WeatherData {
  name: string;
  sys: { country: string; sunrise: number; sunset: number };
  main: { temp: number; feels_like: number; humidity: number; pressure: number; temp_min: number; temp_max: number };
  weather: { main: string; description: string; icon: string }[];
  wind: { speed: number; deg: number };
  visibility: number;
  timezone: number;
}

export interface ThemeConfig {
  bg: string;
  glow: string;
  accent: string;
  particles: string[];
}

export interface ForecastEntry {
  label: string;
  temp: number;
  condition: string;
  icon: string;
  precipitation: number;
  wind: number;
}

export interface AirQualityData {
  aqi: number;
  pm2_5: number;
  pm10: number;
  no2: number;
  o3: number;
}

export interface WeatherCurrent {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  visibility: number;
  windSpeed: number;
  windDeg: number;
  description: string;
  icon: string;
  sunrise: number;
  sunset: number;
  uvIndex: number;
  rainChance: number;
  cloudCover: number;
  aqi: number;
  comfortIndex: number;
  summary: string;
  lat: number;
  lon: number;
  timezoneOffset: number;
}

export interface WeatherBundle {
  current: WeatherCurrent;
  hourly: ForecastEntry[];
  daily: ForecastEntry[];
  airQuality: AirQualityData | null;
}

export interface WeatherCurrentResponse {
  name: string;
  sys: { country: string; sunrise: number; sunset: number };
  main: { temp: number; feels_like: number; humidity: number; pressure: number };
  weather: { main: string; description: string; icon: string }[];
  wind: { speed: number; deg: number };
  visibility: number;
  clouds: { all: number };
  coord: { lat: number; lon: number };
}

export interface WeatherForecastResponse {
  city: { timezone: number };
  list: Array<{
    dt: number;
    main: { temp: number };
    weather: { description: string; icon: string }[];
    wind: { speed: number };
    pop?: number;
  }>;
}

export interface AirQualityResponse {
  list: Array<{
    main: { aqi: number };
    components: { pm2_5: number; pm10: number; no2: number; o3: number };
  }>;
}

export interface SavedLocation {
  id: number;
  name: string;
  country: string;
  addedAt: string;
}

export interface HistoryItem {
  id: number;
  name: string;
  country: string;
  temp: number;
  condition: string;
  timestamp: string;
}
