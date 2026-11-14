// Live Bengaluru wind from Open-Meteo (public API, no key, CORS-enabled), fetched straight from the browser.
const URL = 'https://api.open-meteo.com/v1/forecast?latitude=12.9716&longitude=77.5946&current=wind_speed_10m,wind_direction_10m,wind_gusts_10m&wind_speed_unit=ms&timezone=Asia%2FKolkata'

export async function getWind() {
  try {
    const r = await fetch(URL, { signal: AbortSignal.timeout(6000) })
    if (!r.ok) throw new Error(r.status)
    const c = (await r.json()).current
    return { speed: c.wind_speed_10m, direction: c.wind_direction_10m, gust: c.wind_gusts_10m, time: c.time, source: 'Open-Meteo · Bengaluru, 10 m', live: true }
  } catch {
    return { speed: 3, direction: null, gust: null, time: null, source: 'Live data unavailable · using 3 m/s', live: false }
  }
}
