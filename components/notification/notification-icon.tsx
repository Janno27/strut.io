"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { NotificationGeneral } from "./notification-general"
import { NotificationUpcomingMeeting } from "./notification-upcoming-meeting"
import { notificationService } from "@/lib/notifications/notification-service"
import { useAuth } from "@/lib/auth/auth-provider"

interface UpcomingMeeting {
  id: string
  model_name: string
  model_email: string | null
  model_phone: string | null
  model_instagram: string | null
  start_datetime: string
  end_datetime: string
  notes: string | null
  agent_slots: {
    id: string
    agent_id: string
  }
}

export function NotificationIcon() {
  const [isOpen, setIsOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const [activeTab, setActiveTab] = useState("general")
  const [currentScreen, setCurrentScreen] = useState<"list" | "detail">("list")
  const [selectedMeeting, setSelectedMeeting] = useState<UpcomingMeeting | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchNotificationCount()
    }
  }, [user])

  const fetchNotificationCount = async () => {
    if (!user?.id) return
    
    try {
      const count = await notificationService.countUnviewedNotifications(user.id)
      setNotificationCount(count)
    } catch (error) {
      console.error('Erreur lors du comptage des notifications:', error)
    }
  }

  const handleNotificationValidated = async (appointmentId: string) => {
    try {
      // Marquer la notification comme vue en base
      const success = await notificationService.markNotificationAsViewed(appointmentId)
      
      if (success) {
        // Réduire le compteur seulement si la mise à jour a réussi
        setNotificationCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Erreur lors de la validation de la notification:', error)
    }
  }

  const handleShowMeetingDetail = (meeting: UpcomingMeeting) => {
    setSelectedMeeting(meeting)
    setCurrentScreen("detail")
  }

  const handleBackToList = () => {
    setCurrentScreen("list")
    setSelectedMeeting(null)
  }

  // Reset screen when tab changes or popover closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentScreen("list")
      setSelectedMeeting(null)
    }
  }, [isOpen])

  useEffect(() => {
    setCurrentScreen("list")
    setSelectedMeeting(null)
  }, [activeTab])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title="Notifications"
        >
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general" className="text-xs">
              Demandes
              {notificationCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[16px] h-4 flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="meetings" className="text-xs">
              Meetings
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            <TabsContent value="general" className="mt-0">
              <NotificationGeneral onNotificationValidated={handleNotificationValidated} />
            </TabsContent>
            
            <TabsContent value="meetings" className="mt-0">
              <NotificationUpcomingMeeting 
                currentScreen={currentScreen}
                selectedMeeting={selectedMeeting}
                onShowDetail={handleShowMeetingDetail}
                onBackToList={handleBackToList}
              />
            </TabsContent>
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
} 