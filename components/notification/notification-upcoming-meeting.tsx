"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Mail, Phone, Instagram, FileText, Eye, ArrowLeft } from "lucide-react"
import { format, isSameDay, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { notificationService } from "@/lib/notifications/notification-service"

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

interface NotificationUpcomingMeetingProps {
  currentScreen: "list" | "detail"
  selectedMeeting: UpcomingMeeting | null
  onShowDetail: (meeting: UpcomingMeeting) => void
  onBackToList: () => void
}

export function NotificationUpcomingMeeting({ 
  currentScreen, 
  selectedMeeting, 
  onShowDetail, 
  onBackToList 
}: NotificationUpcomingMeetingProps) {
  const [meetings, setMeetings] = useState<UpcomingMeeting[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchUpcomingMeetings()
    }
  }, [user])

  const fetchUpcomingMeetings = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const data = await notificationService.getWeeklyMeetings(user.id)
      setMeetings(data)
    } catch (error) {
      console.error('Erreur lors de la récupération des meetings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewFullAgenda = () => {
    router.push('/agenda')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const groupMeetingsByDay = (meetings: UpcomingMeeting[]) => {
    const grouped: { [key: string]: UpcomingMeeting[] } = {}
    
    meetings.forEach(meeting => {
      const date = parseISO(meeting.start_datetime)
      const dayKey = format(date, 'yyyy-MM-dd')
      
      if (!grouped[dayKey]) {
        grouped[dayKey] = []
      }
      grouped[dayKey].push(meeting)
    })
    
    return grouped
  }

  const isToday = (dateString: string) => {
    return isSameDay(parseISO(dateString), new Date())
  }

  const isTomorrow = (dateString: string) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return isSameDay(parseISO(dateString), tomorrow)
  }

  const getDayLabel = (dateString: string) => {
    const date = parseISO(dateString)
    
    if (isToday(dateString)) {
      return "Aujourd'hui"
    } else if (isTomorrow(dateString)) {
      return "Demain"
    } else {
      return format(date, 'EEEE d MMMM', { locale: fr })
    }
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Écran de détails
  if (currentScreen === "detail" && selectedMeeting) {
    return (
      <div className="space-y-4">
        {/* Header avec bouton retour */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToList}
            className="h-8 px-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <h4 className="font-medium">Détails du rendez-vous</h4>
        </div>

        {/* Contenu des détails */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* Header avec avatar et nom */}
          <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-base">
                {getInitials(selectedMeeting.model_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{selectedMeeting.model_name}</h4>
              <p className="text-sm text-muted-foreground">Meeting programmé</p>
            </div>
          </div>

          {/* Date et heure */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Date et heure</span>
            </div>
            <div className="pl-6 text-sm text-muted-foreground">
              {formatDateTime(selectedMeeting.start_datetime)}
              <br />
              Fin : {format(parseISO(selectedMeeting.end_datetime), 'HH:mm', { locale: fr })}
            </div>
          </div>

          {/* Informations de contact */}
          {(selectedMeeting.model_email || selectedMeeting.model_phone || selectedMeeting.model_instagram) && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Contact</span>
              </div>
              <div className="pl-6 space-y-1">
                {selectedMeeting.model_email && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>{selectedMeeting.model_email}</span>
                  </div>
                )}
                {selectedMeeting.model_phone && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{selectedMeeting.model_phone}</span>
                  </div>
                )}
                {selectedMeeting.model_instagram && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Instagram className="h-3 w-3" />
                    <span>@{selectedMeeting.model_instagram}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {selectedMeeting.notes && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Notes</span>
              </div>
              <div className="pl-6 text-sm text-muted-foreground bg-background p-3 rounded">
                {selectedMeeting.notes}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Écran de liste (par défaut)
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Meetings de la semaine</h4>
        </div>
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (meetings.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Meetings de la semaine</h4>
        </div>
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Aucun meeting prévu cette semaine</p>
        </div>
      </div>
    )
  }

  const groupedMeetings = groupMeetingsByDay(meetings)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Meetings de la semaine</h4>
        <Badge variant="secondary" className="text-xs">
          {meetings.length}
        </Badge>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(groupedMeetings).map(([dayKey, dayMeetings]) => (
          <div key={dayKey} className="space-y-2">
            {/* En-tête du jour */}
            <div className="flex items-center space-x-2 pb-2 border-b">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h5 className="font-medium text-sm capitalize">
                {getDayLabel(dayKey)}
              </h5>
              <Badge variant="outline" className="text-xs">
                {dayMeetings.length}
              </Badge>
            </div>
            
            {/* Meetings du jour */}
            <div className="space-y-2 pl-6">
              {dayMeetings.map((meeting) => (
                <div key={meeting.id} className="p-3 bg-muted/30 rounded-lg space-y-2">
                  {/* Header avec avatar et nom */}
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(meeting.model_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h6 className="font-medium text-sm">{meeting.model_name}</h6>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(parseISO(meeting.start_datetime), 'HH:mm', { locale: fr })}
                            {' - '}
                            {format(parseISO(meeting.end_datetime), 'HH:mm', { locale: fr })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {meeting.notes && (
                    <div className="text-xs text-muted-foreground bg-background/50 p-2 rounded">
                      {meeting.notes}
                    </div>
                  )}

                  {/* Action */}
                  <div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs h-7"
                      onClick={() => onShowDetail(meeting)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Détails
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Action générale */}
      <div className="pt-2 border-t">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={handleViewFullAgenda}
        >
          Voir l'agenda complet
        </Button>
      </div>
    </div>
  )
} 