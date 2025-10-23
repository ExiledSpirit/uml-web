export interface IUseCase {
  id: string;
  name: string;
  description: string;

  // Main flow (keep ids stable once created)
  phrases?: { id: string; text: string }[];

  // Alternative flows (branching from a main phrase)
  alternativeFlows?: {
    id: string;
    name: string; // alt flow title text
    kind?: 'alternative' | 'exception';
    parentPhraseId: string;     // ext:parent_phrase_id
    returnPhraseId?: string;    // ext:return_phrase_id
    flows: { id: string; text: string }[];
  }[];
}
