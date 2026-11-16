// Time of day + live weather (Open-Meteo: free, public, no API key).
// The location is deliberately city-level (Porto), not the home address.
const PLACE = { name: 'Porto', lat: 41.15, lon: -8.61 };
const API = 'https://api.open-meteo.com/v1/forecast'
  + `?latitude=${PLACE.lat}&longitude=${PLACE.lon}`
  + '&current=temperature_2m,weather_code,cloud_cover,wind_speed_10m'
  + '&daily=sunrise,sunset&timezone=auto&forecast_days=1';
const CACHE = 'casa-pixel:weather';

// WMO weather codes -> [label, kind, intensity]
const CODES = {
  0: ['Céu limpo', 'clear', 0], 1: ['Pouco nublado', 'clear', 0], 2: ['Parcialmente nublado', 'cloudy', 0],
  3: ['Nublado', 'cloudy', 0], 45: ['Nevoeiro', 'fog', 0], 48: ['Nevoeiro', 'fog', 0],
  51: ['Chuvisco', 'rain', 0.3], 53: ['Chuvisco', 'rain', 0.35], 55: ['Chuvisco', 'rain', 0.4],
  56: ['Chuvisco gelado', 'rain', 0.35], 57: ['Chuvisco gelado', 'rain', 0.4],
  61: ['Chuva fraca', 'rain', 0.5], 63: ['Chuva', 'rain', 0.75], 65: ['Chuva forte', 'rain', 1],
  66: ['Chuva gelada', 'rain', 0.6], 67: ['Chuva gelada', 'rain', 0.9],
  71: ['Neve fraca', 'snow', 0.5], 73: ['Neve', 'snow', 0.75], 75: ['Neve forte', 'snow', 1], 77: ['Neve', 'snow', 0.5],
  80: ['Aguaceiros fracos', 'rain', 0.5], 81: ['Aguaceiros', 'rain', 0.75], 82: ['Aguaceiros fortes', 'rain', 1],
  85: ['Neve', 'snow', 0.6], 86: ['Neve forte', 'snow', 1],
  95: ['Trovoada', 'storm', 1], 96: ['Trovoada', 'storm', 1], 99: ['Trovoada', 'storm', 1],
};

const minutes = iso => { const [h, m] = iso.split('T')[1].split(':').map(Number); return h * 60 + m; };

export const weather = {
  ok: false, place: PLACE.name, temp: null, label: 'Sem dados do tempo',
  kind: 'clear', intensity: 0, cloud: 0.1, wind: 0,
  sunrise: 7 * 60 + 15, sunset: 17 * 60 + 30,
};

function apply(d) {
  const [label, kind, intensity] = CODES[d.current.weather_code] || ['—', 'clear', 0];
  Object.assign(weather, {
    ok: true, label, kind, intensity,
    temp: Math.round(d.current.temperature_2m),
    cloud: d.current.cloud_cover / 100,
    wind: d.current.wind_speed_10m,
    sunrise: minutes(d.daily.sunrise[0]), sunset: minutes(d.daily.sunset[0]),
  });
}

export async function refreshWeather() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const d = await res.json();
    apply(d);
    try { localStorage.setItem(CACHE, JSON.stringify(d)); } catch { /* ignore */ }
  } catch {
    // offline or API down: fall back to the last good answer, if any
    try { const d = JSON.parse(localStorage.getItem(CACHE)); if (d) apply(d); } catch { /* ignore */ }
  }
  return weather;
}

const clamp = v => Math.max(0, Math.min(1, v));
const FIXED_TIME = { morning: 10 * 60, afternoon: 15 * 60, night: 23 * 60 };
const FIXED_SKY = {
  clear: ['clear', 0, 0.05], cloudy: ['cloudy', 0, 0.9], rain: ['rain', 0.8, 0.95],
  storm: ['storm', 1, 1], snow: ['snow', 0.8, 0.95], fog: ['fog', 0, 0.9],
};

// override.time: auto | morning | afternoon | sunset | night
// override.sky:  auto | clear | cloudy | rain | storm | snow | fog
export function currentEnv(override = {}) {
  const now = new Date();
  let m = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  if (override.time === 'sunset') m = weather.sunset - 5;
  else if (FIXED_TIME[override.time] != null) m = FIXED_TIME[override.time];

  const TW = 50; // minutes of twilight
  const day = clamp(Math.min((m - (weather.sunrise - TW / 2)) / TW, ((weather.sunset + TW / 2) - m) / TW));
  const golden = Math.max(clamp(1 - Math.abs(m - weather.sunset) / 50), 0.6 * clamp(1 - Math.abs(m - weather.sunrise) / 40));

  let { kind, intensity, cloud } = weather;
  if (FIXED_SKY[override.sky]) [kind, intensity, cloud] = FIXED_SKY[override.sky];
  if (kind !== 'clear' && kind !== 'cloudy') cloud = Math.max(cloud, 0.85);

  return { day, golden, kind, intensity, cloud, wind: weather.wind, temp: weather.temp };
}
