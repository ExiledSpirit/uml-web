import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Accordion from '@radix-ui/react-accordion';
import type { IActor } from '@/types/uml';
import { useProjectStore } from '@/store/use-project.store';

export function SidebarComponent() {
  const actors = useProjectStore((s) => s.actors);
  const useCases = useProjectStore((s) => s.useCases);
  const addActor = useProjectStore((s) => s.addActor);
  const addUseCase = useProjectStore((s) => s.addUseCase);
  const [dialogType, setDialogType] = useState<'actor' | 'usecase' | null>(null);

  return (
    <div className='w-2xs h-full overflow-y-auto'>
      <Accordion.Root type="multiple" className="w-full p-4 space-y-2 border-r-0">
        <Accordion.Item value="actors">
          <Accordion.Header>
            <Accordion.Trigger className="w-full flex justify-between items-center px-2 py-1 font-semibold">
              Atores
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="px-2">
            <Dialog.Root open={dialogType === 'actor'} onOpenChange={(o) => !o && setDialogType(null)}>
              <Dialog.Trigger asChild>
                <button onClick={() => setDialogType('actor')} className="text-blue-500 underline">Novo Ator</button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/30" />
                <Dialog.Content className="fixed top-[20%] left-[50%] -translate-x-1/2 bg-white border p-4 rounded shadow">
                  <Dialog.Title className="font-bold mb-2">Novo Ator</Dialog.Title>
                  {/* <EntityForm type="actor" onSave={addActor} onClose={() => setDialogType(null)} /> */}
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            <ul className="mt-2 space-y-1">
              {actors.map((a: IActor) => (
                <li key={a.id}>{a.name}</li>
              ))}
            </ul>
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="usecases">
          <Accordion.Header>
            <Accordion.Trigger className="w-full flex justify-between items-center px-2 py-1 font-semibold">
              Casos de Uso
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="px-2">
            <Dialog.Root open={dialogType === 'usecase'} onOpenChange={(o) => !o && setDialogType(null)}>
              <Dialog.Trigger asChild>
                <button onClick={() => setDialogType('usecase')} className="text-blue-500 underline">Novo Caso</button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/30" />
                <Dialog.Content className="fixed top-[20%] left-[50%] -translate-x-1/2 bg-white border p-4 rounded shadow">
                  <Dialog.Title className="font-bold mb-2">Novo Caso de Uso</Dialog.Title>
                  {/* <EntityForm type="usecase" onSave={addUseCase} onClose={() => setDialogType(null)} /> */}
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            <ul className="mt-2 space-y-1">
              {useCases.map((u) => (
                <li key={u.id}>{u.name}</li>
              ))}
            </ul>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
}
