export interface IUseCase {
  id: string;
  name: string;
  description: string;

  // Main flow (keep ids stable once created)
  phases?: { id: string; text: string }[];

  // Alternative flows (branching from a main phase)
  alternativeFlows?: {
    id: string;
    name: string; // alt flow title text
    kind?: 'alternative' | 'exception';
    parentPhaseId: string;     // ext:parent_phase_id
    returnPhaseId?: string;    // ext:return_phase_id
    flows: { id: string; text: string }[];
  }[];
}
