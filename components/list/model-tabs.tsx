"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ModelTabsProps {
  femaleContent: React.ReactNode
  maleContent: React.ReactNode
  onChangeTab?: (tab: string) => void
}

export function ModelTabs({ femaleContent, maleContent, onChangeTab }: ModelTabsProps) {
  const handleTabChange = (tab: string) => {
    if (onChangeTab) {
      onChangeTab(tab);
    }
  };

  return (
    <Tabs defaultValue="femme" className="w-full" onValueChange={handleTabChange}>
      <div className="flex justify-center mb-6">
        <TabsList>
          <TabsTrigger value="femme">Femme</TabsTrigger>
          <TabsTrigger value="homme">Homme</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="femme">
        {femaleContent}
      </TabsContent>
      <TabsContent value="homme">
        {maleContent}
      </TabsContent>
    </Tabs>
  )
} 