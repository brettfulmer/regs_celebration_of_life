import { useState, useCallback } from 'react';
import './ShareButtons.css';

interface ShareButtonsProps {
  variant?: 'default' | 'compact';
}

export function ShareButtons({ variant = 'default' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  // Check if Web Share API is available
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://regscelebrationoflife.netlify.app';
  const shareTitle = 'Celebrating Reg Fulmer';
  const shareText = 'Join us to celebrate the life of Reg Fulmer at Coogee.';

  const handleFacebookShare = useCallback(() => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
  }, [shareUrl]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (canNativeShare) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed - that's ok
      }
    }
  }, [canNativeShare, shareUrl, shareTitle, shareText]);

  const isCompact = variant === 'compact';

  return (
    <div className={`share-buttons ${isCompact ? 'share-buttons--compact' : ''}`}>
      {canNativeShare && (
        <button
          type="button"
          className="share-btn share-btn--native"
          onClick={handleNativeShare}
          aria-label="Share this page"
        >
          <svg className="share-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
            <polyline points="16,6 12,2 8,6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          {!isCompact && <span>Share</span>}
        </button>
      )}

      <button
        type="button"
        className="share-btn share-btn--facebook"
        onClick={handleFacebookShare}
        aria-label="Share on Facebook"
      >
        <svg className="share-btn__icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        {!isCompact && <span>Facebook</span>}
      </button>

      <button
        type="button"
        className={`share-btn share-btn--copy ${copied ? 'share-btn--copied' : ''}`}
        onClick={handleCopyLink}
        aria-label={copied ? 'Link copied!' : 'Copy link'}
      >
        {copied ? (
          <>
            <svg className="share-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12" />
            </svg>
            {!isCompact && <span>Copied!</span>}
          </>
        ) : (
          <>
            <svg className="share-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            {!isCompact && <span>Copy link</span>}
          </>
        )}
      </button>
    </div>
  );
}
