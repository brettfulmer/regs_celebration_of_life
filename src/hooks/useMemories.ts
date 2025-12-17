// ============================================
// CUSTOM HOOK FOR MANAGING MEMORIES
// ============================================

import { useEffect, useState, useCallback } from 'react';
import type { Memory } from '../types';
import { apiGet, apiPost, apiPostFormData } from '../utils/api';

interface MemoryFormData {
  name: string;
  relationship: string;
  message: string;
  image?: File;
}

interface UseMemoriesReturn {
  memories: Memory[];
  isSubmitting: boolean;
  submitMemory: (formData: MemoryFormData) => Promise<{ success: boolean; message: string }>;
  getApprovedMemories: () => Memory[];
  refetchMemories: () => Promise<void>;
}

function toMemory(raw: any): Memory {
  return {
    id: String(raw.id),
    name: String(raw.name || 'Anonymous'),
    relationship: raw.relationship ? String(raw.relationship) : undefined,
    message: String(raw.message || ''),
    imageUrl: raw.imageUrl ? String(raw.imageUrl) : undefined,
    polaroidUrl: raw.polaroidUrl ? String(raw.polaroidUrl) : undefined,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    approved: Boolean(raw.approved),
    rotation: typeof raw.rotation === 'number' ? raw.rotation : 0
  };
}

export function useMemories(): UseMemoriesReturn {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMemories = useCallback(async () => {
    try {
      const res = await apiGet('/.netlify/functions/memories');
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data.memories) ? data.memories.map(toMemory) : [];
      setMemories(list);
    } catch (error) {
      console.error('Failed to load memories:', error);
      // Silent failure: the site still renders, and the form can still submit.
    }
  }, []);

  useEffect(() => {
    void loadMemories();
  }, [loadMemories]);

  const getApprovedMemories = useCallback(() => {
    return memories.filter(m => m.approved).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [memories]);

  const submitMemory = useCallback(async (formData: MemoryFormData): Promise<{ success: boolean; message: string }> => {
    setIsSubmitting(true);

    try {
      const hasImage = Boolean(formData.image);

      const res = hasImage
        ? await (async () => {
            const fd = new FormData();
            fd.append('name', formData.name);
            fd.append('relationship', formData.relationship);
            fd.append('message', formData.message);
            if (formData.image) fd.append('image', formData.image);

            return apiPostFormData('/.netlify/functions/memories', fd);
          })()
        : await apiPost('/.netlify/functions/memories', {
            name: formData.name,
            relationship: formData.relationship,
            message: formData.message
          });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const errorMsg = data?.error || data?.details?.message || res.statusText || 'Something went wrong';
        console.error('Memory submission failed:', {
          status: res.status,
          statusText: res.statusText,
          data
        });
        return {
          success: false,
          message: `Upload failed: ${errorMsg}`
        };
      }

      if (data?.memory) {
        const newMemory = toMemory(data.memory);
        if (newMemory.approved) {
          setMemories((prev) => [newMemory, ...prev]);
        }
      }

      return {
        success: true,
        message: String(data?.message || "Thanks for sharing. You're a legend.")
      };
    } catch (error) {
      console.error('Error submitting memory:', error);
      return {
        success: false,
        message: "Something went wrong. Please try again in a moment."
      };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    memories,
    isSubmitting,
    submitMemory,
    getApprovedMemories,
    refetchMemories: loadMemories
  };
}
