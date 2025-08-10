import { useEffect, useState } from "react";

export default function WeatherPanel() {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);
      setError("");
      try {
        // Example: Open-Meteo API for current weather in Paris
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current_weather=true"
        );
        const data = await res.json();
        setWeather(data.current_weather);
      } catch {
        setError("Failed to fetch weather data.");
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
    const interval = setInterval(fetchWeather, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Live Weather (Paris)</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {weather && (
        <div>
          <div>Temperature: {weather.temperature}°C</div>
          <div>Wind: {weather.windspeed} km/h</div>
          <div>Condition: {weather.weathercode}</div>
          <div className="mt-4">
            <iframe
              title="Paris Weather Map"
              width="250"
              height="180"
              className="rounded border"
              src="https://www.openstreetmap.org/export/embed.html?bbox=2.3322%2C48.8466%2C2.3722%2C48.8666&amp;layer=mapnik"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            ></iframe>
            <div className="text-xs text-gray-500 text-center mt-1">
              Map: <a href="https://www.openstreetmap.org/#map=14/48.8566/2.3522" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
