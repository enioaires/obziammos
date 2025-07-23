import React, { useState } from 'react';
import { Share2, MessageCircle, Copy, X } from 'lucide-react';

interface ShareButtonProps {
  post: {
    $id: string;
    title: string;
    imageUrl?: string;
  };
  variant?: 'icon' | 'full';
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  post,
  variant = 'icon',
  className = ''
}) => {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // URL do post
  const postUrl = `${window.location.origin}/posts/${post.$id}`;

  // Texto para compartilhar
  const shareText = `Confira este post: ${post.title}`;
  const whatsappText = `${shareText}\n\n${postUrl}`;

  // Compartilhar no WhatsApp
  const shareWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
    window.open(whatsappUrl, '_blank');
    setShowModal(false);
  };

  // Copiar link
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback para dispositivos que não suportam clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = postUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Botão principal */}
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 p-2 hover:bg-dark-3 rounded-lg transition-colors text-light-3 hover:text-light-1 ${className}`}
        title="Compartilhar"
      >
        <Share2 className="w-5 h-5" />
        {variant === 'full' && <span className="text-sm">Compartilhar</span>}
      </button>

      {/* Modal de compartilhamento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end md:items-center justify-center z-50 p-4">
          <div className="bg-dark-2 border border-dark-4 rounded-t-3xl md:rounded-3xl w-full max-w-sm mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-4">
              <h3 className="font-semibold text-light-1">Compartilhar</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-dark-3 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-light-3" />
              </button>
            </div>

            {/* Opções de compartilhamento */}
            <div className="p-4 space-y-3">
              {/* WhatsApp - Destaque */}
              <button
                onClick={shareWhatsApp}
                className="w-full flex items-center gap-3 p-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">WhatsApp</span>
              </button>

              {/* Copiar link */}
              <button
                onClick={copyLink}
                className="w-full flex items-center gap-3 p-3 hover:bg-dark-3 rounded-lg transition-colors text-light-1"
              >
                {copied ? (
                  <>
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-green-400">Link copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span>Copiar link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareButton;