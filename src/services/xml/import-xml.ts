// src/services/xml/import-xml.ts
import type { ProjectData } from '@/services/project.repository';
import type { IActor, IUseCase } from '@/types/uml';
import type { ActorUseCaseLink, UseCaseAssociation } from '@/store/use-project.store';

export function importXmlToProject(xml: string): ProjectData & {
  nodePositions?: Record<string, { x: number; y: number; w?: number; h?: number }>;
} {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) {
    throw new Error('Invalid XML');
  }

  const getText = (n: Element) => (n.childNodes ? [...n.childNodes].filter(c => c.nodeType === 3).map((t: any) => t.nodeValue).join('').trim() : '');

  // --- compat use cases
  const useCaseEls = Array.from(doc.getElementsByTagName('use_case'));
  const useCases: IUseCase[] = useCaseEls.map((uc) => {
    const id = uc.getAttribute('id') ?? crypto.randomUUID();
    const name = getText(uc);
    return { id, name, description: '' };
  });

  // --- actors (ext)
  const extNS = 'urn:umlweb:v1';
  const actors: IActor[] = Array.from(doc.getElementsByTagNameNS(extNS, 'actor')).map((a) => ({
    id: a.getAttribute('id') || crypto.randomUUID(),
    name: a.getAttribute('name') || 'Actor',
    icon: (a.getAttribute('type') === 'system' ? 'system' : 'person') as 'person' | 'system',
    description: '',
  }));

  // --- actor-usecase links (ext)
  const actorUseCaseLinks: ActorUseCaseLink[] = Array.from(
    doc.getElementsByTagNameNS(extNS, 'link')
  ).map((l) => ({
    id: l.getAttribute('id') || crypto.randomUUID(),
    actorId: l.getAttribute('actorId') || '',
    useCaseId: l.getAttribute('useCaseId') || '',
  })).filter(l => l.actorId && l.useCaseId);

  // --- associations (ext)
  const useCaseAssociations: UseCaseAssociation[] = Array.from(
    doc.getElementsByTagNameNS(extNS, 'assoc')
  ).map((a) => ({
    id: a.getAttribute('id') || crypto.randomUUID(),
    sourceId: a.getAttribute('sourceId') || '',
    targetId: a.getAttribute('targetId') || '',
    type: (a.getAttribute('type') as any) ?? 'association',
  })).filter(a => a.sourceId && a.targetId);

  // --- layout positions (ext)
  const nodePositions: Record<string, { x: number; y: number; w?: number; h?: number }> = {};
  Array.from(doc.getElementsByTagNameNS(extNS, 'position')).forEach((p) => {
    const refId = p.getAttribute('refId');
    if (!refId) return;
    const x = Number(p.getAttribute('x') || 0);
    const y = Number(p.getAttribute('y') || 0);
    const w = p.getAttribute('w'); const h = p.getAttribute('h');
    nodePositions[refId] = { x, y, ...(w ? { w: Number(w) } : {}), ...(h ? { h: Number(h) } : {}) };
  });

  return {
    actors,
    useCases,
    actorUseCaseLinks,
    useCaseAssociations,
    nodePositions,
  };
}
