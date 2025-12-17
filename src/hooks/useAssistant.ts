// ============================================
// CUSTOM HOOK FOR AI ASSISTANT
// ============================================

import { useState, useCallback } from 'react';
import type { AssistantMessage } from '../types';
import { assistantConfig } from '../data/demoData';
import { apiPost } from '../utils/api';

interface UseAssistantReturn {
  messages: AssistantMessage[];
  isOpen: boolean;
  isLoading: boolean;
  toggleOpen: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

export function useAssistant(): UseAssistantReturn {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: assistantConfig.welcomeMessage,
      timestamp: new Date()
    }
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await apiPost('/.netlify/functions/assistant', {
        messages: [...messages, userMessage].map(m => ({
          role: m.role,
          content: m.content
        }))
      });

      const data = await response.json().catch(() => null);

      const responseContent = response.ok
        ? String(data?.message || assistantConfig.fallbackMessage)
        : assistantConfig.fallbackMessage;

      const assistantMessage: AssistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: AssistantMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm having a bit of trouble right now. Please try again in a moment, or check the FAQ section for common questions.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: assistantConfig.welcomeMessage,
        timestamp: new Date()
      }
    ]);
  }, []);

  return {
    messages,
    isOpen,
    isLoading,
    toggleOpen,
    sendMessage,
    clearMessages
  };
}
