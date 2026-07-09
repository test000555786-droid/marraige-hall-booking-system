import { create } from 'zustand'
import type { DbNotification } from '@/types/database'

// ============================================================
// Types
// ============================================================

interface NotificationState {
  notifications: DbNotification[]
  unreadCount: number
  isLoading: boolean
  lastFetchedAt: string | null
}

interface NotificationActions {
  setNotifications: (notifications: DbNotification[]) => void
  addNotification: (notification: DbNotification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  setIsLoading: (v: boolean) => void
  reset: () => void
}

// ============================================================
// Store
// ============================================================

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  lastFetchedAt: null,
}

export const useNotificationStore = create<NotificationState & NotificationActions>()(
  (set, get) => ({
    ...initialState,

    setNotifications: (notifications) =>
      set({
        notifications,
        unreadCount: notifications.filter((n) => !n.is_read).length,
        lastFetchedAt: new Date().toISOString(),
      }),

    addNotification: (notification) =>
      set((state) => {
        // Prevent duplicates
        const exists = state.notifications.some((n) => n.id === notification.id)
        if (exists) return state

        const updated = [notification, ...state.notifications]
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.is_read).length,
        }
      }),

    markAsRead: (id) =>
      set((state) => {
        const updated = state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        )
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.is_read).length,
        }
      }),

    markAllAsRead: () =>
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      })),

    removeNotification: (id) =>
      set((state) => {
        const updated = state.notifications.filter((n) => n.id !== id)
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.is_read).length,
        }
      }),

    setIsLoading: (v) => set({ isLoading: v }),

    reset: () => set(initialState),
  })
)

// ============================================================
// Selectors
// ============================================================

export const selectUnreadCount = (state: NotificationState) => state.unreadCount
export const selectRecentNotifications = (state: NotificationState) =>
  state.notifications.slice(0, 10)
