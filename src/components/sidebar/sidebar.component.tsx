// src/components/sidebar/index.tsx (your Sidebar)
import * as Accordion from '@radix-ui/react-accordion';
import { useProjectStore } from '@/store/use-project.store';
import { useState } from 'react';
import actor from '/actor.svg';
import useCase from '/use-case.svg';
import subject from '/subject.svg';
import package_ from '/package.svg';
import note from '/note.svg';

enum EEntityType {
  ACTOR = 'ACTOR',
  USE_CASE = 'USE_CASE',
  NOTE = 'NOTE',
  PACKAGE = 'PACKAGE',
  SUBJECT = 'SUBJECT',
}

interface DraggableEntity {
  name: string;
  imageSrc: string;
  entityType: EEntityType;
}

const useCaseDraggableEntities: DraggableEntity[] = [
  { entityType: EEntityType.ACTOR, imageSrc: actor, name: 'Actor' },
  { entityType: EEntityType.USE_CASE, imageSrc: useCase, name: 'Use Case' },
  { entityType: EEntityType.SUBJECT, imageSrc: subject, name: 'Subject' },
  { entityType: EEntityType.PACKAGE, imageSrc: package_, name: 'Package' },
  { entityType: EEntityType.NOTE, imageSrc: note, name: 'Note' },
];

export function Sidebar() {
  const { /* ...store usage if needed */ } = useProjectStore();
  const [dialogType, setDialogType] = useState<null | 'actor' | 'usecase'>(null);

  const onDragStart = (
    e: React.DragEvent<HTMLImageElement>,
    entity: DraggableEntity
  ) => {
    e.dataTransfer.setData(
      'application/uml-entity',
      JSON.stringify({ entityType: entity.entityType, name: entity.name })
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-[230px] max-w-[230px] min-h-96 h-min flex grow overflow-y-auto rounded-md shadow-xl bg-white z-[9999]">
      <Accordion.Root type="multiple" className="w-full p-4 space-y-2">
        <Accordion.Item value={"Use Case"}>
          <Accordion.Header>
            <Accordion.Trigger>
              {'Use Case'}
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>
          <div className="grid grid-cols-3 gap-4">
            {useCaseDraggableEntities.map((e) => (
              <div key={e.entityType} className="flex flex-col items-center gap-1">
                <img
                  src={e.imageSrc}
                  draggable
                  onDragStart={(evt) => onDragStart(evt, e)}
                  className="w-10 h-10 cursor-grab active:cursor-grabbing"
                  alt={e.name}
                  title={`Arraste para o diagrama • ${e.name}`}
                />
                <span className="text-xs select-none">{e.name}</span>
              </div>
            ))}
          </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
}
