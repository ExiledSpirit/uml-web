import * as Accordion from '@radix-ui/react-accordion';
import { useState } from 'react';
import { Modal } from '../modal/modal';
import { SidebarItem } from './sidebar-item.component';
import { EntityForm } from '../entity-form.component';

interface SidebarSectionProps {
  title: string;
  items: { id: string; name: string; type: 'actor' | 'usecase' }[];
  type: 'actor' | 'usecase';
  dialogOpen: boolean;
  onDialogOpen: () => void;
  onCloseDialog: () => void;
  onSave: (entity: any) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
}

export function SidebarSection({ title, items, type, dialogOpen, onDialogOpen, onCloseDialog, onSave, onDelete, onSelect }: SidebarSectionProps) {
  const [editId, setEditId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<{ id: string; name: string } | null>(null);
  const [showDelete, setShowDelete] = useState<string | null>(null);

  const handleEdit = (item: { id: string; name: string }) => {
    setEditId(item.id);
    setEditValue(item);
  };

  return (
    <Accordion.Item value={type}>
      <Accordion.Header>
        <Accordion.Trigger className="w-full flex justify-between items-center px-2 py-1 font-semibold">
          {title}
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="px-2">
        <button onClick={onDialogOpen} className="text-blue-500 underline">Novo {type === 'actor' ? 'Ator' : 'Caso'}</button>

        <Modal open={dialogOpen} onClose={onCloseDialog} title={`Novo ${type === 'actor' ? 'Ator' : 'Caso de Uso'}`}>
          <EntityForm type={type} onSave={onSave} onClose={onCloseDialog} />
        </Modal>

        <Modal open={!!editId && !!editValue} onClose={() => setEditId(null)} title={`Editar ${type === 'actor' ? 'Ator' : 'Caso de Uso'}`}>
          {editValue && (
            <EntityForm
              type={type}
              initialValues={editValue}
              onSave={(updated) => {
                onSave({ ...updated, id: editId });
                setEditId(null);
              }}
              onClose={() => setEditId(null)}
            />
          )}
        </Modal>

        <Modal open={!!showDelete} onClose={() => setShowDelete(null)} title="Confirmar">
          <p className="mb-4">Deseja excluir este item?</p>
          <div className="flex justify-end gap-2">
            <button className="text-gray-600" onClick={() => setShowDelete(null)}>Cancelar</button>
            <button
              className="text-red-600 font-semibold"
              onClick={() => {
                if (showDelete) onDelete(showDelete);
                setShowDelete(null);
              }}
            >Excluir</button>
          </div>
        </Modal>

        <ul className="mt-2 space-y-1">
          {items.map((item) => (
            <SidebarItem
              key={item.id}
              name={item.name}
              onDelete={() => setShowDelete(item.id)}
              onClick={() => onSelect(item.id)}
              onEdit={() => handleEdit(item)}
            />
          ))}
        </ul>
      </Accordion.Content>
    </Accordion.Item>
  );
}