// Minimal JSX typing for the ElevenLabs Conversational AI web component.
// Docs: https://elevenlabs.io/docs/agents-platform/customization/widget

import type * as React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'agent-id'?: string;
        'signed-url'?: string;
        'server-location'?: string;
        variant?: string;
        'dynamic-variables'?: string;
        'override-language'?: string;
        'override-prompt'?: string;
        'override-first-message'?: string;
        'override-voice-id'?: string;
      };
    }
  }
}
