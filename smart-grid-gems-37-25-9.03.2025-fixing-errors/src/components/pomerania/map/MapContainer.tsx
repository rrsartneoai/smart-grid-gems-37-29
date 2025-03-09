import { useEffect, useState, useCallback } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SensorData } from '../types/sensors';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

type AirQualitySource = 'AQICN' | 'GIOS' | 'Airly';

interface HistoricalData {
  timestamp: string;
  values: {
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
    humidity: number;
    pressure: number;
    temperature: number;
    wind: number;
  };
  min?: number;
  max?: number;
}

interface AirQualityData {
  id: string;
  stationName: string;
  region: string;
  coordinates: [number, number];
  measurements: {
    aqi: number;
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
    humidity: number;
    pressure: number;
    temperature: number;
    wind: number;
    timestamp: string;
    source: AirQualitySource;
  };
  history: HistoricalData[];
}

// Funkcja pomocnicza do kolorowania markerów
const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return '#00E400';
  if (aqi <= 100) return '#FFFF00';
  if (aqi <= 150) return '#FF7E00';
  if (aqi <= 200) return '#FF0000';
  if (aqi <= 300) return '#8F3F97';
  return '#7E0023';
};

export function MapContainer() {
  const [stations, setStations] = useState<AirQualityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000;
  const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

  const fetchHistoricalData = useCallback(async (stationId: string, token: string) => {
    try {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));
      const response = await fetch(
        `https://api.waqi.info/feed/${stationId}/history/?token=${token}&start=${threeDaysAgo.toISOString()}&end=${now.toISOString()}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'ok' && Array.isArray(data.data)) {
        return data.data.map((item: any) => ({
          timestamp: item.time.iso,
          values: {
            pm25: item.iaqi.pm25?.v || 0,
            pm10: item.iaqi.pm10?.v || 0,
            o3: item.iaqi.o3?.v || 0,
            no2: item.iaqi.no2?.v || 0,
            so2: item.iaqi.so2?.v || 0,
            co: item.iaqi.co?.v || 0,
            humidity: item.iaqi.h?.v || 0,
            pressure: item.iaqi.p?.v || 0,
            temperature: item.iaqi.t?.v || 0,
            wind: item.iaqi.w?.v || 0
          }
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return [];
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (retryCount >= MAX_RETRIES) {
      setError('Maximum retry attempts reached. Please try again later.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const AQICN_TOKEN = import.meta.env.VITE_AQICN_TOKEN || '5a1271b20fbbb9c972814a7b8d31512e061e83e6';
      const stations = [
        { id: '@2677', name: 'Gdańsk-Jasień' },
        { id: '@2685', name: 'Gdańsk-Stogi' },
        { id: '@2684', name: 'Gdańsk-Wrzeszcz' },
        { id: '@2683', name: 'Gdańsk-Śródmieście' },
        { id: '@2682', name: 'Gdańsk-Nowy Port' },
        { id: '@2687', name: 'Gdynia-Pogórze' },
        { id: '@2686', name: 'Gdynia-Śródmieście' },
        { id: '@2688', name: 'Sopot' },
        { id: '@2679', name: 'Gdańsk Nowy Port' }
      ];

      const stationData = await Promise.all(
        stations.map(async (station) => {
          try {
            const response = await fetch(
              `https://api.waqi.info/feed/${station.id}/?token=${AQICN_TOKEN}`
            );

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.status === 'ok' && data.data) {
              const history = await fetchHistoricalData(station.id, AQICN_TOKEN);
              return {
                id: `aqicn-${data.data.idx}`,
                stationName: station.name,
                region: 'Gdańsk',
                coordinates: data.data.city.geo,
                measurements: {
                  aqi: data.data.aqi,
                  pm25: data.data.iaqi.pm25?.v || 0,
                  pm10: data.data.iaqi.pm10?.v || 0,
                  o3: data.data.iaqi.o3?.v || 0,
                  no2: data.data.iaqi.no2?.v || 0,
                  so2: data.data.iaqi.so2?.v || 0,
                  co: data.data.iaqi.co?.v || 0,
                  humidity: data.data.iaqi.h?.v || 0,
                  pressure: data.data.iaqi.p?.v || 0,
                  temperature: data.data.iaqi.t?.v || 0,
                  wind: data.data.iaqi.w?.v || 0,
                  timestamp: data.data.time.iso,
                },
                history,
                source: 'AQICN'
              };
=======
                id: `aqicn-${data.data.idx}`,
                stationName: station.name,
                region: 'Gdańsk',
                coordinates: data.data.city.geo,
                measurements: {
                  aqi: data.data.aqi,
                  pm25: data.data.iaqi.pm25?.v || 0,
                  pm10: data.data.iaqi.pm10?.v || 0,
                  o3: data.data.iaqi.o3?.v || 0,
                  no2: data.data.iaqi.no2?.v || 0,
                  so2: data.data.iaqi.so2?.v || 0,
                  co: data.data.iaqi.co?.v || 0,
                  humidity: data.data.iaqi.h?.v || 0,
                  pressure: data.data.iaqi.p?.v || 0,
                  temperature: data.data.iaqi.t?.v || 0,
                  wind: data.data.iaqi.w?.v || 0,
                  timestamp: data.data.time.iso,
                },
                history,
                source: 'AQICN'
              };
=======
                id: `aqicn-${data.data.idx}`,
                stationName: station.name,
                region: 'Gdańsk',
                coordinates: data.data.city.geo,
                measurements: {
                  aqi: data.data.aqi,
                  pm25: data.data.iaqi.pm25?.v || 0,
                  pm10: data.data.iaqi.pm10?.v || 0,
                  o3: data.data.iaqi.o3?.v || 0,
                  no2: data.data.iaqi.no2?.v || 0,
                  so2: data.data.iaqi.so2?.v || 0,
                  co: data.data.iaqi.co?.v || 0,
                  humidity: data.data.iaqi.h?.v || 0,
                  pressure: data.data.iaqi.p?.v || 0,
                  temperature: data.data.iaqi.t?.v || 0,
                  wind: data.data.iaqi.w?.v || 0,
                  timestamp: data.data.time.iso,
                },
                source: 'AQICN',
                history
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching data for station ${station.name}:`, error);
            return null;
          }
        })
      );

      const validStations = stationData.filter((station): station is AirQualityData => station !== null);
      
      if (validStations.length === 0) {
        throw new Error('No valid station data received');
      }

      setStations(validStations);
      setError(null);
      setLastUpdate(new Date());
      setRetryCount(0);
    } catch (err) {
      console.error('Error fetching air quality data:', err);
      setRetryCount(prev => prev + 1);
      
      if (retryCount < MAX_RETRIES) {
        setTimeout(fetchData, RETRY_DELAY);
      } else {
        setError('Failed to load air quality data. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [retryCount, fetchHistoricalData]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="h-[600px] w-full flex flex-col items-center justify-center gap-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <Spinner className="w-8 h-8" />
        <p className="text-muted-foreground">Ładowanie danych o jakości powietrza...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Błąd</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden">
      <LeafletMapContainer
        center={[54.372158, 18.638306]}
        zoom={11}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <TileLayer
          url="https://tiles.aqicn.org/tiles/usepa-aqi/{z}/{x}/{y}.png"
          attribution='Air Quality Tiles &copy; <a href="https://waqi.info">WAQI.info</a>'
          opacity={0.6}
        />
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={station.coordinates}
            icon={L.divIcon({
              className: 'custom-marker',
              html: `
                <div style="
                  background-color: ${getAQIColor(station.measurements.aqi)};
                  width: 30px;
                  height: 30px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: bold;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ">
                  ${station.measurements.aqi}
                </div>
              `
            })}
          >
            <Popup>

              <div className="font-['Montserrat'] p-4">
                <h3 className="font-bold text-xl mb-4">{station.stationName}</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold mb-2">Aktualne pomiary</h4>
                    <div className="space-y-2">
                      <p>AQI: <span className="font-bold">{station.measurements.aqi}</span></p>
                      <p>PM2.5: <span className="font-bold">{station.measurements.pm25}</span> µg/m³ 
                        <span className="text-sm text-gray-500 ml-2">(min: {Math.min(...station.history.map(h => h.values.pm25))}, 
                        max: {Math.max(...station.history.map(h => h.values.pm25))})</span></p>
                      <p>PM10: <span className="font-bold">{station.measurements.pm10}</span> µg/m³
                        <span className="text-sm text-gray-500 ml-2">(min: {Math.min(...station.history.map(h => h.values.pm10))}, 
                        max: {Math.max(...station.history.map(h => h.values.pm10))})</span></p>
                      <p>O₃: <span className="font-bold">{station.measurements.o3}</span> µg/m³
                        <span className="text-sm text-gray-500 ml-2">(min: {Math.min(...station.history.map(h => h.values.o3))}, 
                        max: {Math.max(...station.history.map(h => h.values.o3))})</span></p>
                      <p>NO₂: <span className="font-bold">{station.measurements.no2}</span> µg/m³
                        <span className="text-sm text-gray-500 ml-2">(min: {Math.min(...station.history.map(h => h.values.no2))}, 
                        max: {Math.max(...station.history.map(h => h.values.no2))})</span></p>
                      <p>SO₂: <span className="font-bold">{station.measurements.so2}</span> µg/m³
                        <span className="text-sm text-gray-500 ml-2">(min: {Math.min(...station.history.map(h => h.values.so2))}, 
                        max: {Math.max(...station.history.map(h => h.values.so2))})</span></p>
                      <p>CO: <span className="font-bold">{station.measurements.co}</span> mg/m³
                        <span className="text-sm text-gray-500 ml-2">(min: {Math.min(...station.history.map(h => h.values.co))}, 
                        max: {Math.max(...station.history.map(h => h.values.co))})</span></p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Warunki pogodowe</h4>
                    <div className="space-y-2">
                      <p>Temperatura: <span className="font-bold">{station.measurements.temperature}°C</span>
                        <span className="text-sm text-gray-500 ml-2">(min: {Math.min(...station.history.map(h => h.values.temperature))}, 
                        max: {Math.max(...station.history.map(h => h.values.temperature))})</span></p>
                      <p>Wilgotność: <span className="font-bold">{station.measurements.humidity}%</span>
                        <span className="text-sm text-gray-500 ml-2">(min: {Math.min(...station.history.map(h => h.values.humidity))}, 
                        max: {Math.max(...station.history.map(h => h.values.humidity))})</span></p>
                      <p>Ciśnienie: <span className="font-bold">{station.measurements.pressure}</span> hPa
                        <span className="text-sm text-gray-500 ml-2">(min: {Math.min(...station.history.map(h => h.values.pressure))}, 
                        max: {Math.max(...station.history.map(h => h.values.pressure))})</span></p>
                      <p>Wiatr: <span className="font-bold">{station.measurements.wind}</span> m/s
                        <span className="text-sm text-gray-500 ml-2">(min: {Math.min(...station.history.map(h => h.values.wind))}, 
                        max: {Math.max(...station.history.map(h => h.values.wind))})</span></p>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Historia pomiarów (ostatnie 3 dni)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left">Czas</th>
                          <th>PM2.5</th>
                          <th>PM10</th>
                          <th>O₃</th>
                          <th>NO₂</th>
                          <th>SO₂</th>
                          <th>CO</th>
                          <th>Temp.</th>
                          <th>Wilg.</th>
                          <th>Ciśn.</th>
                          <th>Wiatr</th>
                        </tr>
                      </thead>
                      <tbody>
                        {station.history.map((record, index) => (
                          <tr key={index} className="border-t hover:bg-gray-50">
                            <td>{new Date(record.timestamp).toLocaleString('pl-PL', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit'
                            })}</td>
                            <td className="text-center" style={{ 
                              backgroundColor: getAQIColor(record.values.pm25 * 2),
                              color: record.values.pm25 * 2 > 150 ? 'white' : 'black'
                            }}>{record.values.pm25}</td>
                            <td className="text-center" style={{ 
                              backgroundColor: getAQIColor(record.values.pm10),
                              color: record.values.pm10 > 150 ? 'white' : 'black'
                            }}>{record.values.pm10}</td>
                            <td className="text-center">{record.values.o3}</td>
                            <td className="text-center">{record.values.no2}</td>
                            <td className="text-center">{record.values.so2}</td>
                            <td className="text-center">{record.values.co}</td>
                            <td className="text-center">{record.values.temperature}°C</td>
                            <td className="text-center">{record.values.humidity}%</td>
                            <td className="text-center">{record.values.pressure}</td>
                            <td className="text-center">{record.values.wind}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Last update: {new Date(station.measurements.timestamp).toLocaleString()}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </LeafletMapContainer>
    </div>
  );
}

export default MapContainer;

export const fetchAirlyData = async (): Promise<SensorData[]> => {
  const AIRLY_API_KEY = import.meta.env.VITE_AIRLY_API_KEY;
  if (!AIRLY_API_KEY) return [];
  
  try {
    const response = await fetch(
      'https://airapi.airly.eu/v2/installations/nearest?lat=54.372158&lng=18.638306&maxDistanceKM=30&maxResults=100',
      {
        headers: { 'apikey': AIRLY_API_KEY }
      }
    );
    const installations = await response.json();
    
    const allStations: SensorData[] = [];
    
    for (const installation of installations) {
      try {
        const measurementsResponse = await fetch(
          `https://airapi.airly.eu/v2/measurements/installation?installationId=${installation.id}`,
          {
            headers: { 'apikey': AIRLY_API_KEY }
          }
        );
        const measurements = await measurementsResponse.json();
        
        allStations.push({
          id: `airly-${installation.id}`,
          stationName: installation.address?.description || 'Stacja Airly',
          region: installation.address?.city || 'Unknown',
          lat: installation.location?.latitude || 0,
          lng: installation.location?.longitude || 0,
          pm25: measurements?.current?.values?.find((v: { name: string; value: number }) => 
            v.name.toUpperCase() === 'PM25')?.value ?? 0,
          pm10: measurements?.current?.values?.find((v: { name: string; value: number }) => 
            v.name.toUpperCase() === 'PM10')?.value ?? 0,
          timestamp: measurements?.current?.tillDateTime || new Date().toISOString(),
          additionalData: {
            aqi: measurements?.current?.indexes?.[0]?.value ?? 0,
            temperature: measurements?.current?.values?.find((v: { name: string; value: number }) => 
              v.name.toUpperCase() === 'TEMPERATURE')?.value ?? null,
            humidity: measurements?.current?.values?.find((v: { name: string; value: number }) => 
              v.name.toUpperCase() === 'HUMIDITY')?.value ?? null,
            source: 'Airly' as AirQualitySource
          }
        });
      } catch (error) {
        console.error(`Error fetching Airly measurements:`, error);
      }
    }
    
    return allStations;
  } catch (error) {
    console.error('Error fetching Airly installations:', error);
    return [];
  }
};

export const fetchGIOSData = async (): Promise<SensorData[]> => {
  try {
    const response = await fetch('https://api.gios.gov.pl/pjp-api/rest/station/findAll');
    const stations = await response.json();
    
    const trojmiastoStations = stations.filter((station: any) =>
      station.city.name.includes('Gdańsk') ||
      station.city.name.includes('Gdynia') ||
      station.city.name.includes('Sopot')
    );
    
    const processedStations: SensorData[] = [];
    
    for (const station of trojmiastoStations) {
      try {
        const sensorResponse = await fetch(
          `https://api.gios.gov.pl/pjp-api/rest/data/getData/${station.id}`
        );
        const sensorData = await sensorResponse.json();
        
        // Get the most recent valid measurements
        const getLatestValidValue = (values: any[]) => {
          if (!Array.isArray(values)) return 0;
          const validValues = values.filter(v => v && v.value !== null && !isNaN(v.value));
          return validValues.length > 0 ? validValues[0].value : 0;
        };

        // Calculate AQI based on PM2.5 and PM10 values (simplified calculation)
        const calculateAQI = (pm25: number, pm10: number) => {
          const pm25Index = (pm25 * 100) / 25; // 25 µg/m³ is the WHO guideline
          const pm10Index = (pm10 * 100) / 50; // 50 µg/m³ is the WHO guideline
          return Math.max(pm25Index, pm10Index);
        };

        const pm25Value = getLatestValidValue(sensorData.values);
        const pm10Value = getLatestValidValue(sensorData.values);
        const timestamp = sensorData.values[0]?.date || new Date().toISOString();
        
        processedStations.push({
          id: `gios-${station.id}`,
          stationName: station.stationName,
          region: station.city.name,
          lat: parseFloat(station.gegrLat),
          lng: parseFloat(station.gegrLon),
          pm25: pm25Value,
          pm10: pm10Value,
          timestamp: timestamp,
          additionalData: {
            aqi: calculateAQI(pm25Value, pm10Value),
            source: 'GIOS' as AirQualitySource
          }
        });
      } catch (error) {
        console.error(`Error fetching GIOŚ sensor data for station ${station.stationName}:`, error);
      }
    }
    
    return processedStations;
  } catch (error) {
    console.error('Error fetching GIOŚ stations:', error);
    return [];
  }
};

export const fetchAQICNData = async (): Promise<SensorData[]> => {
  const AQICN_TOKEN = '5a1271b20fbbb9c972814a7b8d31512e061e83e6';
  const stations = [
    { id: '@237496', name: 'Gdańsk Wrzeszcz' },
    { id: '@62983', name: 'Gdynia' },
    { id: '@63286', name: 'Sopot' }
  ];
  
  try {
    const processedData: SensorData[] = [];
    
    for (const station of stations) {
      try {
        const response = await fetch(`https://api.waqi.info/feed/${station.id}/?token=${AQICN_TOKEN}`);
        const data = await response.json();
        
        if (data.status === 'ok') {
          processedData.push({
            id: `aqicn-${data.data.idx}`,
            stationName: station.name,
            region: station.name.split(' ')[0],
            lat: data.data.city.geo[0],
            lng: data.data.city.geo[1],
            pm25: data.data.iaqi.pm25?.v || 0,
            pm10: data.data.iaqi.pm10?.v || 0,
            timestamp: data.data.time.iso,
            additionalData: {
              aqi: data.data.aqi,
              temperature: data.data.iaqi.t?.v,
              humidity: data.data.iaqi.h?.v
            }
          });
        }
      } catch (error) {
        console.error(`Error fetching AQICN data for station ${station.name}:`, error);
      }
    }
    
    return processedData;
  } catch (error) {
    console.error('Error in AQICN data fetching:', error);
    return [];
  }
};
