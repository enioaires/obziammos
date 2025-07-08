import { useCallback, useState } from 'react';

interface ConfirmModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const useConfirmModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmModalOptions>({
    title: '',
    message: ''
  });
  const [onConfirm, setOnConfirm] = useState<() => void>(() => {});

  const openModal = useCallback((
    confirmOptions: ConfirmModalOptions,
    confirmCallback: () => void
  ) => {
    setOptions(confirmOptions);
    setOnConfirm(() => confirmCallback);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setOptions({ title: '', message: '' });
    setOnConfirm(() => {});
  }, []);

  return {
    isOpen,
    options,
    onConfirm,
    openModal,
    closeModal
  };
};