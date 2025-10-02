// src/services/xml/export-xml.ts
import type { IActor, IUseCase } from '@/types/uml';
import type { ActorUseCaseLink, UseCaseAssociation } from '@/store/use-project.store';

export interface ExportInput {
  actors: IActor[];
  useCases: (IUseCase & {
    // optional extras if you have them in your model
    phases?: string[];
    alternativeFlows?: { id: string; name: string; flows: string[] }[];
  })[];
  actorUseCaseLinks: ActorUseCaseLink[];
  useCaseAssociations: UseCaseAssociation[];
  nodePositions?: Record<string, { x: number; y: number; w?: number; h?: number }>;
}

export function exportProjectToXml(input: ExportInput): string {
  const esc = (s: string) =>
    (s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const compatUseCases = input.useCases
    .map((uc, ucIdx) => {
      const mainFlow = (uc.phases ?? []).map((p, i) => `      <phase id="${i}">${esc(p)}</phase>`).join('\n');

      const altFlows = (uc.alternativeFlows ?? [])
        .map(
          (af, afi) => `
    <alternative_flow id="${afi}">
      ${esc(af.name)}
${af.flows.map((f, fi) => `      <flow id="${fi}">${esc(f)}</flow>`).join('\n')}
    </alternative_flow>`
        )
        .join('\n');

      return `
  <use_case id="${uc.id ?? ucIdx}">
    ${esc(uc.name ?? '')}
    <main_flow>
${mainFlow}
    </main_flow>
${altFlows}
  </use_case>`;
    })
    .join('\n');

  const extActors = input.actors
    .map((a) => `    <ext:actor id="${a.id}" name="${esc(a.name)}" type="${a.icon === 'system' ? 'system' : 'person'}"/>`)
    .join('\n');

  const extLinks = input.actorUseCaseLinks
    .map((l) => `    <ext:link id="${l.id}" actorId="${l.actorId}" useCaseId="${l.useCaseId}"/>`)
    .join('\n');

  const extAssocs = input.useCaseAssociations
    .map((a) => `    <ext:assoc id="${a.id}" sourceId="${a.sourceId}" targetId="${a.targetId}" type="${a.type}"/>`)
    .join('\n');

  const extLayout = Object.entries(input.nodePositions ?? {})
    .map(([refId, pos]) => {
      const refType =
        input.actors.find((a) => a.id === refId)
          ? 'actor'
          : input.useCases.find((u) => u.id === refId)
          ? 'use_case'
          : 'other';
      const sizeAttrs =
        pos.w || pos.h ? ` w="${pos.w ?? ''}" h="${pos.h ?? ''}"` : '';
      return `    <ext:position refType="${refType}" refId="${refId}" x="${pos.x}" y="${pos.y}"${sizeAttrs}/>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<root xmlns:ext="urn:umlweb:v1">
${compatUseCases}

  <ext:actors>
${extActors}
  </ext:actors>

  <ext:actor_usecase_links>
${extLinks}
  </ext:actor_usecase_links>

  <ext:usecase_associations>
${extAssocs}
  </ext:usecase_associations>

  <ext:layout>
${extLayout}
  </ext:layout>

  <ext:meta exportedBy="uml-web" version="1.0"/>
</root>`;
}
