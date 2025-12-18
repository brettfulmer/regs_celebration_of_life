import { useEffect, useMemo, useRef, useState } from 'react';
import { useMemories } from '../../hooks/useMemories';
import type { Memory } from '../../types';
import './MemoriesSection.css';

function formatDate(d: Date) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(d);
  } catch {
    return '';
  }
}

function snippet(text: string, max = 72) {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trim()}…`;
}

function PolaroidCard({ memory, index, onOpen }: { memory: Memory; index: number; onOpen: (m: Memory) => void }) {
  const style: React.CSSProperties & { ['--rot']?: string; ['--delay']?: string } = {
    ['--rot']: `${memory.rotation ?? 0}deg`,
    ['--delay']: `${Math.min(index * 60, 600)}ms`
  };

  const caption = snippet(memory.message);
  const imageSrc = memory.polaroidUrl ?? memory.imageUrl;

  return (
    <button
      type="button"
      className="polaroid"
      style={style}
      onClick={() => onOpen(memory)}
      aria-label={`Open memory from ${memory.name}`}
    >
      <div className="polaroid__frame">
        <div className="polaroid__photo">
          {imageSrc ? (
            <img className="polaroid__img" src={imageSrc} alt="Polaroid memory" loading="lazy" />
          ) : (
            <div className="polaroid__placeholder" aria-hidden="true">
              🌊
            </div>
          )}
        </div>
        <div className="polaroid__caption">
          <div className="polaroid__name">{memory.name}</div>
          <div className="polaroid__snippet">{caption}</div>
        </div>
      </div>
    </button>
  );
}

function MemoryModal({ memory, onClose }: { memory: Memory; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    closeRef.current?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Memory details">
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__panel">
        <div className="modal__header">
          <div>
            <div className="modal__title">{memory.name}</div>
            <div className="modal__meta">
              {memory.relationship ? `${memory.relationship} • ` : ''}
              {formatDate(memory.createdAt)}
            </div>
          </div>
          <button ref={closeRef} type="button" className="modal__close" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="modal__body">
          <div className="modal__image">
            {memory.polaroidUrl || memory.imageUrl ? (
              <img className="modal__img" src={memory.polaroidUrl ?? memory.imageUrl} alt="Memory polaroid" />
            ) : (
              <div className="modal__img-placeholder" aria-hidden="true">🌊</div>
            )}
          </div>

          <p className="modal__message">{memory.message}</p>
        </div>
      </div>
    </div>
  );
}

export function MemoriesSection() {
  const { isSubmitting, submitMemory, getApprovedMemories, refetchMemories } = useMemories();

  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<File | undefined>(undefined);

  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [selected, setSelected] = useState<Memory | null>(null);

  const approved = useMemo(() => getApprovedMemories(), [getApprovedMemories]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetchMemories();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetchMemories]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    const res = await submitMemory({ name, relationship, message, image });
    setResult(res);

    if (res.success) {
      setName('');
      setRelationship('');
      setMessage('');
      setImage(undefined);

      const fileInput = document.getElementById('photo') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      setTimeout(() => setResult(null), 5000);
    }
  };

  return (
    <section id="memories" className="section section--ocean memories">
      <div className="container">
        <div className="section-title">
          <h2>Memories &amp; Polaroids</h2>
          <p>
            A wall of stories, snapshots, and little moments. Short notes are welcome too —
            Reg would’ve loved that.
          </p>
        </div>

        <div className="memories__layout">
          <div className="memories__form">
            <h3 className="memories__heading">Share a Memory</h3>
            <p className="memories__guidance">
              Share a photo and a short memory — maybe where it was taken, what was happening,
              or just something you remember about that moment. A few sentences is plenty.
            </p>

            <form onSubmit={onSubmit} className="memories-form">
              <div className="form-group">
                <label className="form-label" htmlFor="name">Name (optional)</label>
                <input
                  id="name"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sam"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="relationship">Relationship (optional)</label>
                <input
                  id="relationship"
                  className="form-input"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="e.g. Mate from the pool"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="message">Your memory / message</label>
                <textarea
                  id="message"
                  className="form-textarea"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. This was at Coogee Beach, 2019. We'd just finished a swim and Reg was telling one of his classic stories…"
                />
                <div className="form-hint">Even two lines is perfect.</div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="photo">Photo (optional)</label>
                <input
                  id="photo"
                  className="memories-form__file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0])}
                />
                <div className="form-hint">
                  Got a photo with Reg? Add it here with a bit of context about when and where.
                </div>
              </div>

              <button type="submit" className="btn btn--warm memories-form__submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sharing…' : 'Share this memory'}
              </button>

              {result && (
                <div
                  className={`memories-form__result ${result.success ? 'memories-form__result--success' : 'memories-form__result--error'}`}
                  role="status"
                >
                  {result.message}
                </div>
              )}
            </form>
          </div>

          <div className="memories__wall" aria-label="Polaroid wall">
            <div className="memories__wall-inner">
              {approved.length === 0 ? (
                <div className="memories__empty" role="note">
                  <p className="memories__empty-title">This wall is waiting for your memories</p>
                  <p className="memories__empty-text">
                    Share a photo with Reg and tell us a bit about the moment — where it was, what was happening, why it sticks with you. Even just a line or two makes it special.
                  </p>
                </div>
              ) : (
                approved.map((m, idx) => (
                  <PolaroidCard key={m.id} memory={m} index={idx} onOpen={setSelected} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {selected && <MemoryModal memory={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
