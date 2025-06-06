import * as Accordion from '@radix-ui/react-accordion';
import { useProjectStore } from '@/store/use-project.store';
import { SidebarSection } from './sidebar-section.component';
import { useState } from 'react';

export function Sidebar() {
  const {
    actors,
    useCases,
    addActor,
    addUseCase,
    removeActor,
    removeUseCase,
    focusElement,
  } = useProjectStore();

  const [dialogType, setDialogType] = useState<null | 'actor' | 'usecase'>(null);

  return (
    <div className="w-[300px] border-r overflow-y-auto">
      <Accordion.Root type="multiple" className="w-full p-4 space-y-2">
        <SidebarSection
          title="Atores"
          items={actors.map((a) => ({ ...a, type: 'actor' }))}
          type="actor"
          dialogOpen={dialogType === 'actor'}
          onDialogOpen={() => setDialogType('actor')}
          onCloseDialog={() => setDialogType(null)}
          onSave={addActor}
          onDelete={removeActor}
          onSelect={focusElement}
        />
        <SidebarSection
          title="Casos de Uso"
          items={useCases.map((u) => ({ ...u, type: 'usecase' }))}
          type="usecase"
          dialogOpen={dialogType === 'usecase'}
          onDialogOpen={() => setDialogType('usecase')}
          onCloseDialog={() => setDialogType(null)}
          onSave={addUseCase}
          onDelete={removeUseCase}
          onSelect={focusElement}
        />
      </Accordion.Root>
    </div>
  );
}