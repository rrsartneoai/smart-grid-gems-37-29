import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Label,
} from "recharts";

interface AirQualityTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    dataKey: string;
  }>;
  label?: string;
}

interface AirQualityChartProps {
  airQualityData: any;
}

const pollutantLabels: Record<string, string> = {
  pm2_5: "PM2.5",
  pm10: "PM10",
  o3: "Ozon",
  no2: "Dwutlenek azotu",
  so2: "Dwutlenek siarki",
  co: "Tlenek węgla",
};

const AirQualityTooltip = ({ active, payload, label }: AirQualityTooltipProps) => {
  if (!active || !payload) return null;

  return (
    <div className="bg-background/95 border rounded-lg p-3 shadow-lg">
      <p className="font-medium mb-2">{`Czas: ${label}`}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{pollutantLabels[entry.dataKey]}:</span>
          <span className="font-medium">
            {entry.value} µg/m³
          </span>
        </div>
      ))}
    </div>
  );
};

export function AirQualityChart({ airQualityData }: AirQualityChartProps) {
  const formattedData = airQualityData?.iaqi
    ? [
        {
          name: new Date().toLocaleTimeString(),
          pm2_5: airQualityData.iaqi.pm25?.v,
          pm10: airQualityData.iaqi.pm10?.v,
          o3: airQualityData.iaqi.o3?.v,
          no2: airQualityData.iaqi.no2?.v,
        },
      ]
    : [];

  return (
    <Card className="col-span-4 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">
            Monitorowanie jakości powietrza w czasie rzeczywistym
          </h3>
          <p className="text-sm text-muted-foreground">
            Aktualne parametry jakości powietrza
          </p>
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="name"
              height={60}
              tick={{ fontSize: 12 }}
              tickMargin={30}
              angle={-45}
              textAnchor="end"
            >
              <Label value="Czas" position="bottom" offset={40} />
            </XAxis>
            <YAxis
              tick={{ fontSize: 12 }}
              tickMargin={10}
              width={80}
            >
              <Label
                value="Stężenie (µg/m³)"
                angle={-90}
                position="left"
                offset={0}
              />
            </YAxis>
            <Tooltip content={<AirQualityTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{
                paddingTop: "20px",
                borderTop: "1px solid var(--border)",
              }}
            />
            <Line
              type="monotone"
              dataKey="pm2_5"
              name="PM2.5"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="pm10"
              name="PM10"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="o3"
              name="Ozon"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="no2"
              name="NO₂"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
