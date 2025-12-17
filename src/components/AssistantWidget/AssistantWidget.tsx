import { useEffect } from 'react';
import './AssistantWidget.css';

const DEFAULT_ELEVENLABS_AGENT_ID = 'agent_5401kc8awhtzfkv8hqex5wfksh32';
const ELEVENLABS_EMBED_SRC = 'https://unpkg.com/@elevenlabs/convai-widget-embed';

export function AssistantWidget() {
  const agentId = (import.meta as any)?.env?.VITE_ELEVENLABS_AGENT_ID || DEFAULT_ELEVENLABS_AGENT_ID;

  // Load the official ElevenLabs widget embed script once.
  // The widget itself is multimodal; voice is the default and users can enable text input in the agent's Widget settings.
  // Docs: https://elevenlabs.io/docs/agents-platform/customization/widget
  // Note: This requires the agent to be public with authentication disabled.
  // (See ElevenLabs docs for allowlist options.)
  //
  // We intentionally avoid building our own audio pipeline; the official widget handles it.
  //
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const existing = document.querySelector(`script[src="${ELEVENLABS_EMBED_SRC}"]`);
    if (existing) return;

    const s = document.createElement('script');
    s.src = ELEVENLABS_EMBED_SRC;
    s.async = true;
    s.type = 'text/javascript';
    document.body.appendChild(s);
  }, []);

  return (
    <elevenlabs-convai agent-id={String(agentId)}></elevenlabs-convai>
  );
}
