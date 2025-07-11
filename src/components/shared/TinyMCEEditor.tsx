// src/components/shared/TinyMCEEditor.tsx - VERSÃO ESTILIZADA

import { Editor } from '@tinymce/tinymce-react';
import React, { useCallback, useState } from 'react';
import { uploadFile, getFilePreview } from '@/lib/appwrite/posts/api';
import { useToast } from '@/components/ui/use-toast';
import { Maximize2, Minimize2 } from 'lucide-react';

interface TinyMCEEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const TinyMCEEditor: React.FC<TinyMCEEditorProps> = ({
  value,
  onChange,
  placeholder = "Digite sua legenda aqui...",
  className
}) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleImageUpload = useCallback(async (blobInfo: any): Promise<string> => {
    try {
      const file = new File([blobInfo.blob()], blobInfo.filename(), {
        type: blobInfo.blob().type
      });

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Imagem muito grande",
          description: "Imagens na legenda devem ter no máximo 5MB",
          variant: "destructive"
        });
        throw new Error('Arquivo muito grande');
      }

      const uploadedFile = await uploadFile(file);

      if (!uploadedFile) {
        throw new Error('Falha no upload');
      }

      const imageUrl = getFilePreview(uploadedFile.$id);

      toast({
        title: "Imagem adicionada!",
        description: "A imagem foi inserida na legenda com sucesso."
      });

      return imageUrl?.toString() || '';

    } catch (error) {
      console.error('Erro no upload da imagem:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível adicionar a imagem. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  return (
    <div className={className}>
      {/* Header com botão de expandir */}
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-light-1">
          Legenda
        </label>
        <button
          type="button"
          onClick={toggleExpanded}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-light-4 hover:text-primary-500 hover:bg-dark-4 rounded-lg transition-all duration-200"
          title={isExpanded ? "Contrair editor" : "Expandir editor"}
        >
          {isExpanded ? (
            <>
              <Minimize2 className="w-3 h-3" />
              <span>Contrair</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3 h-3" />
              <span>Expandir</span>
            </>
          )}
        </button>
      </div>

      <Editor
        apiKey={import.meta.env.VITE_TINYMCE_API_KEY || "no-api-key"}
        value={value}
        onEditorChange={onChange}
        init={{
          height: isExpanded ? 500 : 320,
          menubar: false,

          // TEMA CUSTOMIZADO
          skin: 'oxide-dark',
          content_css: 'dark',

          plugins: [
            'image', 'paste', 'link', 'lists', 'autolink'
          ],

          toolbar: 'bold italic | bullist numlist | image link | removeformat',
          toolbar_mode: 'sliding',

          // UPLOAD DE IMAGENS
          images_upload_handler: handleImageUpload,
          automatic_uploads: true,
          paste_data_images: true,
          images_reuse_filename: true,

          // MOBILE OTIMIZADO
          mobile: {
            toolbar_mode: 'sliding',
            theme: 'mobile'
          },

          // ESTILOS CUSTOMIZADOS DO PROJETO
          content_style: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              font-size: 14px;
              line-height: 1.6;
              color: #EFEFEF;
              background-color: #101012;
              margin: 16px;
              padding: 0;
            }
            
            img {
              max-width: 100% !important;
              height: auto !important;
              border-radius: 12px;
              margin: 16px 0;
              box-shadow: 0 4px 12px rgba(0,0,0,0.4);
              border: 1px solid rgba(135, 126, 255, 0.2);
            }
            
            p {
              margin: 0 0 12px 0;
              color: #EFEFEF;
            }
            
            strong, b {
              color: #877EFF;
              font-weight: 600;
            }
            
            em, i {
              color: #A855F7;
            }
            
            ul, ol {
              margin: 12px 0;
              padding-left: 24px;
            }
            
            li {
              margin-bottom: 6px;
              color: #EFEFEF;
            }
            
            a {
              color: #877EFF;
              text-decoration: underline;
            }
            
            a:hover {
              color: #A855F7;
            }
          `,

          placeholder,
          branding: false,
          elementpath: false,
          statusbar: isExpanded, // Mostrar statusbar apenas quando expandido

          // CONFIGURAÇÕES UI CUSTOMIZADAS
          ui_mode: 'combined',
          resize: true, // Permitir redimensionamento manual
          min_height: 200,
          max_height: isExpanded ? 800 : 400,

          setup: (editor: any) => {
            // CSS customizado para o editor
            editor.on('init', () => {
              const editorContainer = editor.getContainer();
              if (editorContainer) {
                // Aplicar estilos do projeto ao container
                editorContainer.style.border = '1px solid #1F1F22';
                editorContainer.style.borderRadius = '12px';
                editorContainer.style.overflow = 'hidden';
                editorContainer.style.backgroundColor = '#1F1F22';
              }

              // Estilizar toolbar
              const toolbar = editorContainer?.querySelector('.tox-toolbar');
              if (toolbar) {
                (toolbar as HTMLElement).style.backgroundColor = '#09090B';
                (toolbar as HTMLElement).style.borderBottom = '1px solid #1F1F22';
                (toolbar as HTMLElement).style.padding = '8px 12px';
              }

              // Estilizar statusbar se expandido
              if (isExpanded) {
                const statusbar = editorContainer?.querySelector('.tox-statusbar');
                if (statusbar) {
                  (statusbar as HTMLElement).style.backgroundColor = '#09090B';
                  (statusbar as HTMLElement).style.borderTop = '1px solid #1F1F22';
                  (statusbar as HTMLElement).style.color = '#7C7C8A';
                  (statusbar as HTMLElement).style.fontSize = '11px';
                }
              }

              // Estilizar botões da toolbar
              const buttons = editorContainer?.querySelectorAll('.tox-tbtn');
              buttons?.forEach((btn: Element) => {
                const button = btn as HTMLElement;
                button.style.color = '#7C7C8A';
                button.style.borderRadius = '6px';
                button.style.margin = '0 2px';

                // Hover states
                button.addEventListener('mouseenter', () => {
                  button.style.backgroundColor = '#1F1F22';
                  button.style.color = '#877EFF';
                });

                button.addEventListener('mouseleave', () => {
                  if (!button.classList.contains('tox-tbtn--enabled')) {
                    button.style.backgroundColor = 'transparent';
                    button.style.color = '#7C7C8A';
                  }
                });
              });
            });

            // Auto-ajustar imagens
            editor.on('NodeChange', () => {
              const images = editor.getBody().querySelectorAll('img');
              images.forEach((img: HTMLImageElement) => {
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.style.borderRadius = '12px';
                img.style.border = '1px solid rgba(135, 126, 255, 0.2)';
              });
            });

            // Placeholder customizado
            if (placeholder) {
              editor.on('init', () => {
                if (!editor.getContent()) {
                  editor.setContent(`<p style="color: #7C7C8A; font-style: italic;">${placeholder}</p>`);
                }
              });

              editor.on('focus', () => {
                if (editor.getContent().includes(placeholder)) {
                  editor.setContent('');
                }
              });
            }
          }
        }}
      />

      {/* Dica estilizada */}
      <div className="mt-3 flex items-center gap-2 text-xs text-light-4 bg-dark-4 rounded-lg p-3 border border-dark-4">
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
        <span>
          <strong className="text-primary-500">Dica:</strong> Cole imagens diretamente com Ctrl+V ou use o botão de imagem na barra de ferramentas
          {isExpanded && " • Arraste a borda inferior para redimensionar"}
        </span>
      </div>
    </div>
  );
};

export { TinyMCEEditor };