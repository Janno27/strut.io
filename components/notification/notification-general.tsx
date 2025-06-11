"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Mail, Phone, Instagram, FileText, Check } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { notificationService } from "@/lib/notifications/notification-service"

interface Appointment {
  id: string
  model_name: string
  model_email: string | null
  model_phone: string | null
  model_instagram: string | null
  notes: string | null
  created_at: string
  start_datetime: string
  end_datetime: string
  agent_slots: {
    id: string
    agent_id: string
  }
}

interface NotificationGeneralProps {
  onNotificationValidated?: (appointmentId: string) => void
}

export function NotificationGeneral({ onNotificationValidated }: NotificationGeneralProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissingIds, setDismissingIds] = useState<Set<string>>(new Set())
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchNewAppointments()
    }
  }, [user])

  const fetchNewAppointments = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const data = await notificationService.getUnviewedNotifications(user.id)
      setAppointments(data)
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = (appointmentId: string) => {
    // Ajouter l'ID à la liste des éléments en cours de suppression
    setDismissingIds(prev => new Set(prev).add(appointmentId))
    
    // Notifier le parent que la notification a été validée avec l'ID
    onNotificationValidated?.(appointmentId)
    
    // Après l'animation, supprimer l'élément de la liste
    setTimeout(() => {
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId))
      setDismissingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(appointmentId)
        return newSet
      })
    }, 300) // Durée de l'animation
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Nouvelles demandes</h4>
        </div>
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Nouvelles demandes</h4>
        </div>
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Aucune nouvelle demande</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Nouvelles demandes</h4>
        <Badge variant="secondary" className="text-xs">
          {appointments.length}
        </Badge>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {appointments.map((appointment) => (
          <div 
            key={appointment.id} 
            className={`p-3 border rounded-lg space-y-3 transition-all duration-300 ${
              dismissingIds.has(appointment.id) 
                ? 'opacity-0 transform scale-95 -translate-x-2' 
                : 'opacity-100 transform scale-100 translate-x-0'
            }`}
          >
            {/* Header avec avatar et nom */}
            <div className="flex items-start space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="text-sm">
                  {getInitials(appointment.model_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-sm truncate">
                    {appointment.model_name}
                  </h5>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(appointment.created_at), { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </span>
                </div>
                
                {/* Informations de contact */}
                <div className="space-y-1 mt-2">
                  {appointment.model_email && (
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{appointment.model_email}</span>
                    </div>
                  )}
                  {appointment.model_phone && (
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{appointment.model_phone}</span>
                    </div>
                  )}
                  {appointment.model_instagram && (
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Instagram className="h-3 w-3" />
                      <span>@{appointment.model_instagram}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Date et heure */}
            <div className="flex items-center space-x-2 text-sm bg-muted/50 p-2 rounded">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {formatDateTime(appointment.start_datetime)}
              </span>
              <span className="text-muted-foreground">-</span>
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {new Date(appointment.end_datetime).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            {/* Notes */}
            {appointment.notes && (
              <div className="flex items-start space-x-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-muted-foreground text-xs">{appointment.notes}</p>
              </div>
            )}

            {/* Action */}
            <div className="pt-2">
              <Button 
                size="sm" 
                variant="default" 
                className="w-full"
                onClick={() => handleValidate(appointment.id)}
                disabled={dismissingIds.has(appointment.id)}
              >
                <Check className="h-4 w-4 mr-2" />
                Valider
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 