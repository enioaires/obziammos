import React, { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface CollapsibleCaptionProps {
  captions: string[] | string;
  className?: string;
  maxLines?: number;
  showMoreText?: string;
  showLessText?: string;
}

const CollapsibleCaption: React.FC<CollapsibleCaptionProps> = ({
  captions,
  className = "",
  maxLines = 12,
  showMoreText = "Ver mais",
  showLessText = "Ver menos"
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const renderCaptions = (captions: string[] | string) => {
    if (Array.isArray(captions)) {
      return captions.map((caption, index) => (
        <div
          key={index}
          dangerouslySetInnerHTML={{ __html: caption }}
          className="mb-2 last:mb-0 rich-text-content"
        />
      ));
    } else if (typeof captions === 'string') {
      // Se for string (novo formato), renderiza o HTML
      return (
        <div
          dangerouslySetInnerHTML={{ __html: captions }}
          className="rich-text-content"
        />
      );
    }
    return null;
  };

  // Verificar se o conteúdo precisa ser colapsado
  useEffect(() => {
    const checkContentHeight = () => {
      if (contentRef.current) {
        // Temporariamente expandir para medir altura total
        const originalMaxHeight = contentRef.current.style.maxHeight;
        const originalOverflow = contentRef.current.style.overflow;

        contentRef.current.style.maxHeight = 'none';
        contentRef.current.style.overflow = 'visible';

        const computedStyle = getComputedStyle(contentRef.current);
        const lineHeight = parseFloat(computedStyle.lineHeight);
        const contentHeight = contentRef.current.scrollHeight;

        // Restaurar estilos originais
        contentRef.current.style.maxHeight = originalMaxHeight;
        contentRef.current.style.overflow = originalOverflow;

        const maxHeight = lineHeight * maxLines;
        const needsToggle = contentHeight > maxHeight;

        setShowToggle(needsToggle);
        setIsInitialized(true);
      }
    };

    // Verificar quando o componente monta e quando o conteúdo muda
    if (captions) {
      const timeout = setTimeout(checkContentHeight, 50);
      return () => clearTimeout(timeout);
    }
  }, [captions, maxLines]);

  // Se não há conteúdo, não renderiza nada
  if (!captions || (Array.isArray(captions) && captions.length === 0)) {
    return null;
  }

  const lineHeightInEm = 1.6; // leading-relaxed
  const maxHeightValue = maxLines * lineHeightInEm;

  return (
    <div className={cn("text-md", className)}>
      {/* Conteúdo principal */}
      <div
        ref={contentRef}
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden leading-relaxed",
          "rich-text-content",
          !isExpanded && showToggle && isInitialized && "relative"
        )}
        style={{
          maxHeight: !isExpanded && showToggle && isInitialized
            ? `${maxHeightValue}em`
            : 'none'
        }}
      >
        {renderCaptions(captions)}

        {/* Gradiente de fade quando colapsado */}
        {!isExpanded && showToggle && isInitialized && (
          <div
            className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-dark-2 to-transparent pointer-events-none"
            style={{ background: 'linear-gradient(to top, var(--tw-gradient-from) 0%, transparent 100%)' }}
          />
        )}
      </div>

      {/* Botão Ver mais/Ver menos */}
      {showToggle && isInitialized && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-primary-500 hover:text-primary-400 transition-colors text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary-500 focus:ring-offset-1 focus:ring-offset-dark-2 rounded px-1 relative z-10"
        >
          {isExpanded ? showLessText : showMoreText}
        </button>
      )}
    </div>
  );
};

export default CollapsibleCaption;