import { createClient } from "@/lib/supabase/client"

export class NotificationService {
  private supabase = createClient()

  /**
   * Marquer une notification comme vue
   */
  async markNotificationAsViewed(appointmentId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.rpc('mark_notification_as_viewed', {
        appointment_id: appointmentId
      })

      if (error) {
        console.error('Erreur lors du marquage de la notification comme vue:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Erreur:', error)
      return false
    }
  }

  /**
   * Récupérer les notifications non vues (nouvelles demandes)
   */
  async getUnviewedNotifications(agentId: string) {
    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .select(`
          *,
          agent_slots!inner (
            id,
            agent_id
          )
        `)
        .eq('agent_slots.agent_id', agentId)
        .is('notification_viewed_at', null)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Erreur lors de la récupération des notifications:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erreur:', error)
      return []
    }
  }

  /**
   * Compter les notifications non vues
   */
  async countUnviewedNotifications(agentId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .select(`
          id,
          agent_slots!inner (
            agent_id
          )
        `)
        .eq('agent_slots.agent_id', agentId)
        .is('notification_viewed_at', null)

      if (error) {
        console.error('Erreur lors du comptage des notifications:', error)
        return 0
      }

      return data?.length || 0
    } catch (error) {
      console.error('Erreur:', error)
      return 0
    }
  }

  /**
   * Récupérer les meetings de la semaine
   */
  async getWeeklyMeetings(agentId: string) {
    try {
      const now = new Date()
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay() + 1) // Lundi
      weekStart.setHours(0, 0, 0, 0)
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6) // Dimanche
      weekEnd.setHours(23, 59, 59, 999)

      const { data, error } = await this.supabase
        .from('appointments')
        .select(`
          *,
          agent_slots!inner (
            id,
            agent_id
          )
        `)
        .eq('agent_slots.agent_id', agentId)
        .gte('start_datetime', weekStart.toISOString())
        .lte('start_datetime', weekEnd.toISOString())
        .order('start_datetime', { ascending: true })

      if (error) {
        console.error('Erreur lors de la récupération des meetings:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erreur:', error)
      return []
    }
  }
}

// Instance singleton
export const notificationService = new NotificationService() 