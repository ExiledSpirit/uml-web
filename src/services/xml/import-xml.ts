// src/services/xml/import-xml.ts
import type { IActor, IUseCase } from '@/types/uml';

const XML_NS_EXT = 'urn:umlweb:v1';

const uid = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

function textOnly(el: Element): string {
  return Array.from(el.childNodes)
    .filter((n) => n.nodeType === 3)
    .map((n) => (n as any).nodeValue as string)
    .join('')
    .trim();
}
function byTag(el: Element | Document, tag: string): Element[] {
  return Array.from(el.getElementsByTagName(tag));
}

export interface ImportedProject {
  useCases: IUseCase[];
  actors: IActor[];
  actorUseCaseLinks: { id: string; actorId: string; useCaseId: string }[];
  nodePositions: Record<string, { x: number; y: number; w?: number; h?: number }>;
}

export function importProjectFromXml(xml: string): ImportedProject {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror')?.length) {
    throw new Error('Invalid XML');
  }

  // --- Use Cases: core + alt flows ---
  const useCases: IUseCase[] = byTag(doc, 'use_case').map((ucEl, i) => {
    const id = ucEl.getAttribute('id') || `UC${i + 1}`;
    const name = textOnly(ucEl);

    // main phrases
    const phrases = byTag(ucEl, 'phrase').map((p, j) => ({
      id: p.getAttribute('id') || `P${j + 1}`,
      text: textOnly(p),
    }));

    // alternative flows
    const altEls = byTag(ucEl, 'alternative_flow');
    const alternativeFlows = altEls.map((afEl, k) => {
      const extParent = afEl.getAttributeNS(XML_NS_EXT, 'parent_phrase_id') || '';
      const extReturn = afEl.getAttributeNS(XML_NS_EXT, 'return_phrase_id') || undefined;
      const extKind = (afEl.getAttributeNS(XML_NS_EXT, 'kind') as 'alternative' | 'exception') || undefined;

      const flows = byTag(afEl, 'flow').map((f, m) => ({
        id: f.getAttribute('id') || `AF${k + 1}-${m + 1}`,
        text: textOnly(f),
      }));

      return {
        id: afEl.getAttribute('id') || `AF${k + 1}`,
        name: textOnly(afEl),
        kind: extKind,
        parentPhraseId: extParent || phrases[0]?.id || '', // fallback if missing in legacy XML
        returnPhraseId: extReturn,
        flows,
      };
    });

    return { id, name, description: '', phrases, alternativeFlows };
  });

  // --- ext:actors (optional) ---
  const actors: IActor[] = Array.from(doc.getElementsByTagNameNS(XML_NS_EXT, 'actor')).map((aEl) => ({
    id: aEl.getAttribute('id') || uid(),
    name: aEl.getAttribute('name') || 'Ator',
    icon: (aEl.getAttribute('type') === 'system' ? 'system' : 'person') as 'person' | 'system',
    description: '',
  }));

  // --- ext: links (optional) ---
  const actorUseCaseLinks = Array.from(doc.getElementsByTagNameNS(XML_NS_EXT, 'link'))
    .map((l) => ({
      id: l.getAttribute('id') || uid(),
      actorId: l.getAttribute('actorId') || '',
      useCaseId: l.getAttribute('useCaseId') || '',
    }))
    .filter((l) => l.actorId && l.useCaseId);

  // --- ext: layout (optional) ---
  const nodePositions: ImportedProject['nodePositions'] = {};
  Array.from(doc.getElementsByTagNameNS(XML_NS_EXT, 'position')).forEach((p) => {
    const refId = p.getAttribute('refId');
    if (!refId) return;
    nodePositions[refId] = {
      x: Number(p.getAttribute('x') || 0),
      y: Number(p.getAttribute('y') || 0),
      ...(p.getAttribute('w') ? { w: Number(p.getAttribute('w')) } : {}),
      ...(p.getAttribute('h') ? { h: Number(p.getAttribute('h')) } : {}),
    };
  });

  return { useCases, actors, actorUseCaseLinks, nodePositions };
}
