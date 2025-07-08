import { AlertTriangle, Trash2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  // Ícone baseado no variant
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <Trash2 className="w-6 h-6 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
      case 'info':
        return <AlertTriangle className="w-6 h-6 text-blue-400" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-red-400" />;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-dark-2 rounded-2xl border border-dark-4 w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-dark-3">
              {getIcon()}
            </div>
            <h3 className="text-lg font-semibold text-light-1">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-3 rounded-lg transition-colors text-light-3 hover:text-light-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-light-2 leading-relaxed mb-6 whitespace-pre-line">
            {message}
          </p>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              onClick={onClose}
              variant="ghost"
              className="flex-1 bg-dark-3 hover:bg-dark-4 text-light-1"
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors text-white disabled:opacity-50"
              style={{
                backgroundColor: variant === 'danger' ? '#ef4444' : variant === 'warning' ? '#f59e0b' : '#3b82f6',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = variant === 'danger' ? '#dc2626' : variant === 'warning' ? '#d97706' : '#2563eb';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = variant === 'danger' ? '#ef4444' : variant === 'warning' ? '#f59e0b' : '#3b82f6';
                }
              }}
            >
              {isLoading ? 'Processando...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;