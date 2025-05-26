import { useState } from 'react';
import { useProjectStore } from '@/store/use-project.store';

export function ActorForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState<'person' | 'system'>('person');
  const addActor = useProjectStore((s) => s.addActor);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name) return;
        addActor({ name, description, icon });
        setName('');
        setDescription('');
      }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" required />
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição" />
      <select value={icon} onChange={(e) => setIcon(e.target.value as 'person' | 'system')}>
        <option value="person">Pessoa</option>
        <option value="system">Sistema</option>
      </select>
      <button type="submit">Criar Ator</button>
    </form>
  );
}