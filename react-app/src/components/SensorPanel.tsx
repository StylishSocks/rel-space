import { useEffect, useState } from "react";
import { ENDPOINTS } from "../utils/api";

interface SensorData {
  timestamp: string;
  temperature: number;
  pressure: number;
  stress: number;
}

const defaultSensorData: SensorData = {
  timestamp: new Date().toISOString(),
  temperature: 0,
  pressure: 0,
  stress: 0,
};

const SensorPanel: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorData>(defaultSensorData);
  const [error, setError] = useState<string | null>(null);

  // Utility function to convert Celsius to Fahrenheit
  const convertToFahrenheit = (tempC: number): number => (tempC * 9) / 5 + 32;

  const fetchSensorData = async () => {
    try {
      const response = await fetch(ENDPOINTS.sensors);
      if (!response.ok) {
        throw new Error("Failed to fetch sensor data");
      }
      const data: SensorData = await response.json();
      setSensorData(data);
      setError(null);
    } catch (err) {
      setError("Error fetching sensor data");
      // Optionally, you can keep the existing placeholder data intact
    }
  };

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIndicator = (value: number, low: number, high: number) => {
    if (value < low) return "green";
    if (value > high) return "red";
    return "yellow";
  };

  return (
    <div className="sensor-panel">
      <h2>Sensor Data</h2>
      {error && <p className="error">{error}</p>}
      <div>
        <div className="sensor-item">
          <h3>Temperature</h3>
          <p>
            {sensorData.temperature}°C /{" "}
            {convertToFahrenheit(sensorData.temperature).toFixed(1)}°F
          </p>
          <span
            className="status-indicator"
            style={{
              backgroundColor: getStatusIndicator(
                sensorData.temperature,
                0,
                50
              ),
            }}
          ></span>
        </div>
        <div className="sensor-item">
          <h3>Pressure</h3>
          <p>{sensorData.pressure} psi</p>
          <span
            className="status-indicator"
            style={{
              backgroundColor: getStatusIndicator(
                sensorData.pressure,
                200,
                300
              ),
            }}
          ></span>
        </div>
        <div className="sensor-item">
          <h3>Stress</h3>
          <p>{sensorData.stress} MPa</p>
          <span
            className="status-indicator"
            style={{
              backgroundColor: getStatusIndicator(sensorData.stress, 300, 400),
            }}
          ></span>
        </div>
        <small>
          Last updated: {new Date(sensorData.timestamp).toLocaleTimeString()}
        </small>
      </div>
    </div>
  );
};

export default SensorPanel;
