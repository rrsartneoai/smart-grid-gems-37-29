
import { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { PowerStats } from "@/components/dashboard/PowerStats";
import { AirQualityChart } from "@/components/dashboard/AirQualityChart";
import { DeviceStatus } from "@/components/network/DeviceStatus";
import { NetworkMap } from "@/components/network/NetworkMap";
import { FailureAnalysis } from "@/components/network/FailureAnalysis";
import EnergyMap from "@/components/map/EnergyMap";
import { FileUpload } from "@/components/FileUpload";
import { Chatbot } from "@/components/Chatbot";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useCompanyStore } from "@/components/CompanySidebar";

export interface ProjectData {
  name: string;
  airQuality: {
    historical: Array<{ time: string; value: number; forecastValue?: number }>;
    current: number;
    sources: {
      coal: number;
      wind: number;
      biomass: number;
      other: number;
    };
  };
  efficiency: Array<{ name: string; value: number; forecastValue?: number }>;
  correlation: Array<{ name: string; consumption: number; efficiency: number }>;
}

export function SpacesTab() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const spacesRef = useRef<HTMLDivElement>(null);
  const { selectedCompanyId, setSelectedCompanyId } = useCompanyStore();
  const [projectData, setProjectData] = useState<ProjectData>({
    name: "Projekt Trójmiasto",
    airQuality: {
      historical: [
        { time: "Styczeń", value: 25, forecastValue: 22 },
        { time: "Luty", value: 28, forecastValue: 26 },
        { time: "Marzec", value: 32, forecastValue: 30 },
        { time: "Kwiecień", value: 22, forecastValue: 21 },
        { time: "Maj", value: 18, forecastValue: 17 },
        { time: "Czerwiec", value: 15, forecastValue: 14 }
      ],
      current: 22,
      sources: {
        coal: 30,
        wind: 25,
        biomass: 20,
        other: 25
      }
    },
    efficiency: [
      { name: "Styczeń", value: 65 },
      { name: "Luty", value: 68 },
      { name: "Marzec", value: 72 },
      { name: "Kwiecień", value: 78 },
      { name: "Maj", value: 82 },
      { name: "Czerwiec", value: 85 }
    ],
    correlation: [
      { name: "Styczeń", consumption: 120, efficiency: 65 },
      { name: "Luty", consumption: 115, efficiency: 68 },
      { name: "Marzec", consumption: 118, efficiency: 72 },
      { name: "Kwiecień", consumption: 110, efficiency: 78 },
      { name: "Maj", consumption: 105, efficiency: 82 },
      { name: "Czerwiec", consumption: 100, efficiency: 85 }
    ]
  });

  const handleExport = async (format: 'pdf' | 'jpg') => {
    if (!spacesRef.current) return;

    try {
      const canvas = await html2canvas(spacesRef.current);
      
      if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('przestrzenie-export.pdf');
        
        toast({
          title: "Eksport zakończony",
          description: "Plik PDF został pobrany",
        });
      } else {
        const link = document.createElement('a');
        link.download = 'przestrzenie-export.jpg';
        link.href = canvas.toDataURL('image/jpeg');
        link.click();
        
        toast({
          title: "Eksport zakończony",
          description: "Plik JPG został pobrany",
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Błąd eksportu",
        description: "Nie udało się wyeksportować sekcji",
        variant: "destructive",
      });
    }
  };

  // Generowanie danych dla projektu
  const generateProjectData = () => {
    const newData: ProjectData = {
      name: "Nowy Projekt " + Math.floor(Math.random() * 100),
      airQuality: {
        historical: Array.from({ length: 6 }, (_, i) => ({
          time: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec"][i],
          value: Math.floor(Math.random() * 30) + 10,
          forecastValue: Math.floor(Math.random() * 30) + 10
        })),
        current: Math.floor(Math.random() * 30) + 10,
        sources: {
          coal: Math.floor(Math.random() * 40) + 10,
          wind: Math.floor(Math.random() * 40) + 10,
          biomass: Math.floor(Math.random() * 30) + 10,
          other: Math.floor(Math.random() * 30) + 10
        }
      },
      efficiency: Array.from({ length: 6 }, (_, i) => ({
        name: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec"][i],
        value: Math.floor(Math.random() * 30) + 60
      })),
      correlation: Array.from({ length: 6 }, (_, i) => ({
        name: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec"][i],
        consumption: Math.floor(Math.random() * 50) + 90,
        efficiency: Math.floor(Math.random() * 30) + 60
      }))
    };
    
    setProjectData(newData);
    // Przekaż dane do globalnego stanu projektu
    setSelectedCompanyId(newData.name);

    toast({
      title: "Wygenerowano nowy projekt",
      description: `Utworzono projekt: ${newData.name}`,
    });
  };

  return (
    <div>
      <div className="flex justify-between gap-2 mb-4">
        <Button
          variant="default"
          onClick={generateProjectData}
          className="bg-primary text-primary-foreground"
        >
          Generuj nowy projekt
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport('jpg')}
          >
            Eksportuj do JPG
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('pdf')}
          >
            Eksportuj do PDF
          </Button>
        </div>
      </div>
      <div ref={spacesRef}>
        <DndContext collisionDetection={closestCenter}>
          <SortableContext items={[]} strategy={rectSortingStrategy}>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <PowerStats />
            </div>
          </SortableContext>
        </DndContext>

        <div className="grid gap-6 p-8">
          <AirQualityChart airQualityData={{}} />
        </div>

        <div className="grid gap-6 p-8">
          <DeviceStatus />
        </div>

        <div className="grid gap-6 p-8">
          <FailureAnalysis />
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="w-full">
            <h2 className="text-2xl font-bold mb-4">{t('Wgraj pliki')}</h2>
            <FileUpload />
          </div>
          <div className="w-full">
            <h2 className="text-2xl font-bold mb-4">{t('Asystent AI')}</h2>
            <Chatbot />
          </div>
        </div>
      </div>
    </div>
  );
}
