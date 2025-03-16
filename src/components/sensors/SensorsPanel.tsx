
import React, { useState } from 'react';
import { motion } from "framer-motion";
import { SensorCard } from './SensorCard';
import { sensorsData } from './SensorsData';
import { SensorData } from './types/SensorDataTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertsConfig } from './AlertsConfig';
import { ComparisonChart } from './ComparisonChart';
import { HistoricalChart } from './HistoricalChart';
import { DataComparison } from './DataComparison';
import { ExportData } from './ExportData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { fetchAQICNData } from '@/api/airQuality';

interface SensorCardProps {
  sensor: SensorData;
  isSelected: boolean;
  onClick: () => void;
}

interface HistoricalChartProps {
  sensor: SensorData;
}

interface DataComparisonProps {
  sensors: SensorData[];
}

interface ExportDataProps {
  sensors: SensorData[];
  city: string;
}

export function SensorsPanel() {
  const [selectedCity, setSelectedCity] = useState('gdansk');
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);
  const [view, setView] = useState('cards');
  
  // Use the selectedCity to determine which data to show
  const cityData = sensorsData[selectedCity as keyof typeof sensorsData];
  
  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    setSelectedSensor(null); // Reset selected sensor when changing city
  };
  
  const handleSensorSelect = (sensor: SensorData) => {
    setSelectedSensor(sensor);
  };
  
  const handleViewChange = (newView: string) => {
    setView(newView);
  };
  
  // This query fetches real-time data from API
  const { data: realTimeData, isLoading, error } = useQuery({
    queryKey: ['sensors', selectedCity],
    queryFn: () => {
      console.log('Fetching real-time data for', selectedCity);
      return fetchAQICNData();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      onError: (err: Error) => {
        console.error('Error fetching sensor data:', err);
      }
    }
  });
  
  // We'll continue using the static data for now but show a note that real data is loading
  const displayData = cityData ? cityData.sensors : [];
  
  const cities = Object.keys(sensorsData).map(key => {
    const cityName = sensorsData[key as keyof typeof sensorsData].name;
    return cityName;
  });
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle>Czujniki jakości powietrza</CardTitle>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleViewChange('cards')}
              className={`px-3 py-1 text-sm rounded ${view === 'cards' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground'}`}
            >
              Karty
            </button>
            <button
              onClick={() => handleViewChange('comparison')}
              className={`px-3 py-1 text-sm rounded ${view === 'comparison' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground'}`}
            >
              Porównanie
            </button>
            <button
              onClick={() => handleViewChange('historical')}
              className={`px-3 py-1 text-sm rounded ${view === 'historical' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground'}`}
            >
              Historia
            </button>
            <button
              onClick={() => handleViewChange('map')}
              className={`px-3 py-1 text-sm rounded ${view === 'map' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground'}`}
            >
              Mapa
            </button>
          </div>
        </div>
        
        <div className="mt-4">
          <Tabs value={selectedCity} onValueChange={handleCityChange} className="w-full">
            <TabsList className="inline-flex min-w-full lg:w-full p-1">
              {Object.keys(sensorsData).map((cityId) => (
                <TabsTrigger 
                  key={cityId} 
                  value={cityId} 
                  className="relative flex-1 px-3 py-1.5 text-sm whitespace-nowrap"
                >
                  {sensorsData[cityId as keyof typeof sensorsData].name}
                  {selectedCity === cityId && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      layoutId="activeTab"
                    />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        {isLoading && (
          <div className="text-sm text-muted-foreground">
            Ładowanie aktualnych danych z czujników...
          </div>
        )}
        
        {error && (
          <div className="text-sm text-destructive">
            Wystąpił błąd podczas ładowania danych. Wyświetlam dane archiwalne.
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {view === 'cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayData.map((sensor, index) => (
              <SensorCard 
                key={index} 
                sensor={sensor} 
                isSelected={selectedSensor?.name === sensor.name}
                onClick={() => handleSensorSelect(sensor)} 
              />
            ))}
          </div>
        )}
        
        {view === 'comparison' && <DataComparison sensors={displayData} />}
        
        {view === 'historical' && (
          selectedSensor ? (
            <HistoricalChart sensor={selectedSensor} />
          ) : (
            <div className="text-center p-10 text-muted-foreground">
              Wybierz czujnik, aby zobaczyć dane historyczne
            </div>
          )
        )}
        
        {view === 'map' && (
          <div className="flex flex-col gap-4">
            <div className="h-[500px] bg-muted rounded flex items-center justify-center">
              Mapa czujników jakości powietrza zostanie tutaj wyświetlona
            </div>
          </div>
        )}
        
        <div className="mt-6 flex flex-wrap gap-4">
          <AlertsConfig />
          <ExportData sensors={displayData} city={selectedCity} />
        </div>
      </CardContent>
    </Card>
  );
}
