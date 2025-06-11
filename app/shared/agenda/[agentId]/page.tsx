"use client";

import { useState, useEffect } from 'react';
import { SharedHeader } from "@/components/layout/shared-header";
import { PublicCalendar } from "@/components/agenda/public/public-calendar";
import { MyAppointmentBanner } from "@/components/agenda/public/my-appointment-banner";

export default function SharedAgendaPage({ params }: { params: Promise<{ agentId: string }> }) {
  const [agentId, setAgentId] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Récupérer l'agentId de manière asynchrone
  useEffect(() => {
    params.then(({ agentId }) => {
      setAgentId(agentId);
    });
  }, [params]);

  const handleAppointmentUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!agentId) {
    return <div>Chargement...</div>;
  }
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <SharedHeader />
          </div>
          
          {/* Bannière de rendez-vous utilisateur */}
          <MyAppointmentBanner agentId={agentId} key={`banner-${refreshKey}`} />
          
          {/* Calendrier public */}
          <PublicCalendar 
            agentId={agentId} 
            key={`calendar-${refreshKey}`}
            onAppointmentSuccess={handleAppointmentUpdate}
          />
        </div>
      </div>
    </div>
  );
} 