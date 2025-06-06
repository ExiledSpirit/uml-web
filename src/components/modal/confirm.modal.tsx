import { Modal } from './modal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

export function ConfirmDialog({ open, onClose, onConfirm, message }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title="Confirmar">
      <p className="mb-4">{message}</p>
      <div className="flex justify-end gap-2">
        <button className="text-gray-600" onClick={onClose}>Cancelar</button>
        <button className="text-red-600 font-semibold" onClick={onConfirm}>Confirmar</button>
      </div>
    </Modal>
  );
}