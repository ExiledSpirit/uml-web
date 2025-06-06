import { useState, useEffect } from 'react';
import { v4 } from 'uuid';

interface EntityFormProps {
  type: 'actor' | 'usecase';
  onSave: (entity: { id?: string; name: string }) => void;
  onClose: () => void;
  initialValues?: { id?: string; name: string };
}

export function EntityForm({ type, onSave, onClose, initialValues }: EntityFormProps) {
  const [name, setName] = useState(initialValues?.name || '');

  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name);
    }
  }, [initialValues]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({ id: initialValues?.id || v4(), name });
    onClose();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium mb-1">Nome do {type === 'actor' ? 'ator' : 'caso de uso'}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="text-sm text-foreground">Cancelar</button>
        <button type="submit" className="text-sm text-blue-600 font-semibold">Salvar</button>
      </div>
    </form>
  );
}
