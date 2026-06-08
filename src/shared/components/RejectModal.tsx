import { useState } from 'react';
import Modal from './Modal';
import { Button } from './Button';
import { FormTextarea } from './FormInput';

interface Props {
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  isPending?: boolean;
  helper?: string;
  placeholder?: string;
}

export default function RejectModal({
  onClose, onConfirm, isPending = false,
  helper = 'Se enviará al niño al rechazar.',
  placeholder = 'Explica el motivo del rechazo…',
}: Props) {
  const [reason, setReason] = useState('');

  return (
    <Modal title="Motivo del rechazo" maxWidth={420} onClose={onClose}>
      <FormTextarea
        label="Motivo (opcional)"
        helper={helper}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder={placeholder}
        autoFocus
      />
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="danger" disabled={isPending}
          onClick={() => onConfirm(reason || undefined)}>
          ✖ Rechazar
        </Button>
      </div>
    </Modal>
  );
}
