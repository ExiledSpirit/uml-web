// src/services/xml/export-xml.ts
import type { IActor, IUseCase } from '@/types/uml';

export interface ExportProjectInput {
  useCases: IUseCase[];
  actors?: IActor[];
  // Optional: positions (if you already store layout)
  nodePositions?: Record<string, { x: number; y: number; w?: number; h?: number }>;
  // Optional: actor->usecase links { id, actorId, useCaseId }
  actorUseCaseLinks?: { id: string; actorId: string; useCaseId: string }[];
  // When true, strip every ext:* node/attr (compat-only export)
  compatOnly?: boolean;
}

const XML_NS_EXT = 'urn:umlweb:v1';
const esc = (s: string) =>
  (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Ensure phrases have ids
function normalizePhrases(uc: IUseCase) {
  if (!uc.phrases || !Array.isArray(uc.phrases)) return [];
  if (uc.phrases.length && typeof (uc.phrases[0] as any) === 'string') {
    // @ts-ignore legacy: string[]
    return (uc.phrases as string[]).map((t, i) => ({ id: `P${i + 1}`, text: t }));
  }
  return uc.phrases as { id: string; text: string }[];
}

// Ensure alt flows are well-formed with ids in inner flows
function normalizeAltFlows(uc: IUseCase) {
  const alts = uc.alternativeFlows ?? [];
  return alts.map((af, j) => ({
    id: af.id || `AF${j + 1}`,
    name: af.name ?? '',
    kind: af.kind,
    parentPhraseId: af.parentPhraseId ?? '',
    returnPhraseId: af.returnPhraseId,
    flows: (af.flows ?? []).map((f, k) => ({
      id: f.id || `AF${j + 1}-${k + 1}`,
      text: f.text ?? '',
    })),
  }));
}

export function exportProjectToXml(input: ExportProjectInput): string {
  const ucXml = input.useCases
    .map((uc, ucIdx) => {
      const phrases = normalizePhrases(uc);
      const alts = normalizeAltFlows(uc);

      const main = phrases
        .map((p) => `      <phrase id="${esc(p.id)}">${esc(p.text)}</phrase>`)
        .join('\n');

      const altBlocks = alts
        .map((af, afi) => {
          const attrs = [
            `id="${esc(af.id)}"`,
            !input.compatOnly && af.parentPhraseId ? `ext:parent_phrase_id="${esc(af.parentPhraseId)}"` : '',
            !input.compatOnly && af.returnPhraseId ? `ext:return_phrase_id="${esc(af.returnPhraseId)}"` : '',
            !input.compatOnly && af.kind ? `ext:kind="${esc(af.kind)}"` : '',
          ]
            .filter(Boolean)
            .join(' ');

          const flows = af.flows
            .map((f) => `      <flow id="${esc(f.id)}">${esc(f.text)}</flow>`)
            .join('\n');

          return `    <alternative_flow ${attrs}>
      ${esc(af.name)}
${flows ? `${flows}\n` : ''}    </alternative_flow>`;
        })
        .join('\n');

      return `  <use_case id="${esc(uc.id || `UC${ucIdx + 1}`)}">
    ${esc(uc.name || '')}
    <main_flow>
${main}
    </main_flow>${altBlocks ? `\n${altBlocks}\n  ` : '\n  '}</use_case>`;
    })
    .join('\n');

  const header = `<?xml version="1.0" encoding="UTF-8"?>\n<root${
    input.compatOnly ? '' : ` xmlns:ext="${XML_NS_EXT}"`
  }>\n`;
  const footer = `\n</root>`;

  if (input.compatOnly) {
    return `${header}${ucXml}${footer}`;
  }

  // ext blocks (actors, links, layout)
  const extActors = (input.actors ?? [])
    .map(
      (a) =>
        `    <ext:actor id="${esc(a.id)}" name="${esc(a.name)}" type="${
          a.icon === 'system' ? 'system' : 'person'
        }"/>`
    )
    .join('\n');

  const extLinks = (input.actorUseCaseLinks ?? [])
    .map((l) => `    <ext:link id="${esc(l.id)}" actorId="${esc(l.actorId)}" useCaseId="${esc(l.useCaseId)}"/>`)
    .join('\n');

  const extLayout = Object.entries(input.nodePositions ?? {})
    .map(
      ([refId, pos]) =>
        `    <ext:position refType="${refId.startsWith('UC') ? 'use_case' : 'node'}" refId="${esc(refId)}" x="${pos.x}" y="${pos.y}"${
          pos.w ? ` w="${pos.w}"` : ''
        }${pos.h ? ` h="${pos.h}"` : ''}/>`
    )
    .join('\n');

  const extBlocks = [
    extActors && `  <ext:actors>\n${extActors}\n  </ext:actors>`,
    extLinks && `  <ext:actor_usecase_links>\n${extLinks}\n  </ext:actor_usecase_links>`,
    extLayout && `  <ext:layout>\n${extLayout}\n  </ext:layout>`,
    `  <ext:meta exportedBy="uml-web" version="1.0"/>`,
  ]
    .filter(Boolean)
    .join('\n\n');

  return `${header}${ucXml}\n\n${extBlocks}${footer}`;
}
