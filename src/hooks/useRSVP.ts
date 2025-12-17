// ============================================
// CUSTOM HOOK FOR RSVP
// ============================================

import { useState, useCallback } from 'react';
import { apiPost } from '../utils/api';

interface RSVPFormData {
  name: string;
  email: string;
  phone: string;
  guests: string;
}

interface UseRSVPReturn {
  isSubmitting: boolean;
  submitRSVP: (formData: RSVPFormData) => Promise<{ success: boolean; message: string }>;
}

export function useRSVP(): UseRSVPReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitRSVP = useCallback(async (formData: RSVPFormData): Promise<{ success: boolean; message: string }> => {
    setIsSubmitting(true);

    try {
      const response = await apiPost('/.netlify/functions/rsvp', formData);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Failed to submit RSVP. Please try again.'
        };
      }

      return {
        success: true,
        message: data.message || 'Thank you for your RSVP!'
      };

    } catch (error) {
      console.error('RSVP submission error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    isSubmitting,
    submitRSVP
  };
}
