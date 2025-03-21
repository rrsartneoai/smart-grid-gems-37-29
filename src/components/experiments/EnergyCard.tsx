import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Battery, Cloud, Factory, Flame, Atom, Droplet, Wind, Sun } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { EUROPEAN_COUNTRIES, fetchPowerData } from "@/utils/electricityMaps";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const COLORS = {
  nuclear: "#7C3AED",
  renewable: "#10B981",
  fossil: "#EF4444",
  import: "#F59E0B",
};

interface EnergySource {
  name: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

export function EnergyCard() {
  const [selectedCountry, setSelectedCountry] = useState(EUROPEAN_COUNTRIES[0]);
  const { toast } = useToast();

  const { data: powerData, isLoading, error, refetch } = useQuery({
    queryKey: ['power-data', selectedCountry.id],
    queryFn: () => fetchPowerData(selectedCountry.lat, selectedCountry.lon),
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const handleApiKeySet = () => {
    const apiKey = prompt("Please enter your API key:");
    if (apiKey) {
      localStorage.setItem('ELECTRICITY_MAPS_API_KEY', apiKey);
      toast({
        title: "API Key Saved",
        description: "Your API key has been saved. Refreshing data...",
      });
      refetch();
    }
  };

  if (!localStorage.getItem('ELECTRICITY_MAPS_API_KEY')) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p>Please set your API key to view data.</p>
            <Button onClick={handleApiKeySet}>Set API Key</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-red-500">Error loading energy data. Please check your API key.</div>
          <Button onClick={handleApiKeySet} className="mt-4">Update API Key</Button>
        </CardContent>
      </Card>
    );
  }

  if (!powerData || isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const productionData: EnergySource[] = [
    { name: "Nuclear", value: powerData.powerProductionBreakdown.nuclear || 0, icon: Atom, color: COLORS.nuclear },
    { name: "Hydro", value: powerData.powerProductionBreakdown.hydro || 0, icon: Droplet, color: COLORS.renewable },
    { name: "Wind", value: powerData.powerProductionBreakdown.wind || 0, icon: Wind, color: COLORS.renewable },
    { name: "Solar", value: powerData.powerProductionBreakdown.solar || 0, icon: Sun, color: COLORS.renewable },
    { name: "Gas", value: powerData.powerProductionBreakdown.gas || 0, icon: Flame, color: COLORS.fossil },
    { name: "Coal", value: powerData.powerProductionBreakdown.coal || 0, icon: Factory, color: COLORS.fossil },
    { name: "Biomass", value: powerData.powerProductionBreakdown.biomass || 0, icon: Factory, color: COLORS.renewable },
    { name: "Battery", value: powerData.powerProductionBreakdown["battery discharge"] || 0, icon: Battery, color: COLORS.renewable },
  ];

  const importExportData = [
    { name: "Import", value: powerData.powerImportTotal, color: COLORS.import },
    { name: "Export", value: powerData.powerExportTotal, color: COLORS.nuclear },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Select
              value={selectedCountry.id}
              onValueChange={(value) => {
                const country = EUROPEAN_COUNTRIES.find(c => c.id === value);
                if (country) setSelectedCountry(country);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {EUROPEAN_COUNTRIES.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm font-normal">
              <span className="text-green-500">{powerData.fossilFreePercentage}% Fossil-Free</span>
              {" | "}
              <span className="text-emerald-500">{powerData.renewablePercentage}% Renewable</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Production Breakdown */}
            <div className="h-[300px]">
              <h3 className="text-sm font-medium mb-4">Production Breakdown</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {productionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as EnergySource;
                        return (
                          <div className="bg-background/95 p-2 rounded-lg border shadow-sm">
                            <div className="flex items-center gap-2">
                              <data.icon className="h-4 w-4" />
                              <span className="font-medium">{data.name}</span>
                            </div>
                            <div className="text-sm">
                              {data.value.toLocaleString()} MW
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Import/Export */}
            <div className="h-[300px]">
              <h3 className="text-sm font-medium mb-4">Import/Export Balance</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={importExportData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Energy Sources List */}
            <div className="col-span-full">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {productionData.map((source) => (
                  <div
                    key={source.name}
                    className="flex items-center gap-2 p-2 rounded-lg border bg-card"
                  >
                    <source.icon className="h-5 w-5" style={{ color: source.color }} />
                    <div>
                      <div className="text-sm font-medium">{source.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {source.value.toLocaleString()} MW
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
