import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  BookingStep1Data,
  BookingStep2Data,
  BookingStep3Data,
  BookingStep4Data,
  DbVenue,
  PricingBreakdown,
  EventType,
  PaymentMethod,
} from '@/types/database'

// ============================================================
// Types
// ============================================================

export type BookingStep = 1 | 2 | 3 | 4

interface BookingState {
  step: BookingStep
  step1: Partial<BookingStep1Data>
  step2: Partial<BookingStep2Data>
  step3: Partial<BookingStep3Data>
  step4: Partial<BookingStep4Data>
  selectedVenue: DbVenue | null
  pricingBreakdown: PricingBreakdown | null
  isSubmitting: boolean
  submissionError: string | null
  confirmedBookingRef: string | null
}

interface BookingActions {
  // Navigation
  setStep: (step: BookingStep) => void
  nextStep: () => void
  prevStep: () => void

  // Step data setters
  setStep1: (data: Partial<BookingStep1Data>) => void
  setStep2: (data: Partial<BookingStep2Data>) => void
  setStep3: (data: Partial<BookingStep3Data>) => void
  setStep4: (data: Partial<BookingStep4Data>) => void

  // Venue + pricing
  setSelectedVenue: (venue: DbVenue | null) => void
  setPricingBreakdown: (breakdown: PricingBreakdown | null) => void

  // Submission
  setIsSubmitting: (v: boolean) => void
  setSubmissionError: (error: string | null) => void
  setConfirmedBookingRef: (ref: string | null) => void

  // Reset
  resetBooking: () => void
}

// ============================================================
// Initial state
// ============================================================

const initialState: BookingState = {
  step: 1,
  step1: {},
  step2: {},
  step3: {},
  step4: {},
  selectedVenue: null,
  pricingBreakdown: null,
  isSubmitting: false,
  submissionError: null,
  confirmedBookingRef: null,
}

// ============================================================
// Store
// Persisted in sessionStorage so mid-payment session loss is recoverable
// ============================================================

export const useBookingStore = create<BookingState & BookingActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ step }),

      nextStep: () => {
        const current = get().step
        if (current < 4) set({ step: (current + 1) as BookingStep })
      },

      prevStep: () => {
        const current = get().step
        if (current > 1) set({ step: (current - 1) as BookingStep })
      },

      setStep1: (data) =>
        set((state) => ({ step1: { ...state.step1, ...data } })),

      setStep2: (data) =>
        set((state) => ({ step2: { ...state.step2, ...data } })),

      setStep3: (data) =>
        set((state) => ({ step3: { ...state.step3, ...data } })),

      setStep4: (data) =>
        set((state) => ({ step4: { ...state.step4, ...data } })),

      setSelectedVenue: (venue) => set({ selectedVenue: venue }),

      setPricingBreakdown: (breakdown) => set({ pricingBreakdown: breakdown }),

      setIsSubmitting: (v) => set({ isSubmitting: v }),

      setSubmissionError: (error) => set({ submissionError: error }),

      setConfirmedBookingRef: (ref) => set({ confirmedBookingRef: ref }),

      resetBooking: () => set({ ...initialState }),
    }),
    {
      name: 'mh-booking-state',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        step: state.step,
        step1: state.step1,
        step2: state.step2,
        step3: state.step3,
        step4: state.step4,
        selectedVenue: state.selectedVenue,
        pricingBreakdown: state.pricingBreakdown,
      }),
    }
  )
)

// ============================================================
// Selectors
// ============================================================

export const selectIsStep1Complete = (state: BookingState) =>
  Boolean(state.step1.venueId && state.step1.eventDate)

export const selectIsStep2Complete = (state: BookingState) =>
  Boolean(
    state.step2.customerName &&
    state.step2.customerPhone &&
    state.step2.customerEmail &&
    state.step2.eventType &&
    state.step2.guestCount
  )

export const selectIsStep3Complete = (state: BookingState) =>
  Boolean(state.step3.agreed)
