/**
 * OScope — Academic Content & Knowledge Layer Types
 * Strongly typed data structures for OS theory, algorithm guides, formula references,
 * glossary items, viva question banks, and verified academic citations.
 */

export type SubsystemCategory =
  | 'PROCESS'
  | 'SCHEDULING'
  | 'MEMORY'
  | 'DEADLOCK'
  | 'FILESYSTEM'
  | 'ARCHITECTURE'
  | 'GENERAL';

export interface TheoryTopic {
  readonly id: string;
  readonly title: string;
  readonly subsystem: SubsystemCategory;
  readonly shortDefinition: string;
  readonly explanation: string;
  readonly keyPoints: readonly string[];
  readonly practicalExample?: string;
  readonly commonMisconception?: string;
  readonly theoryVsImplementation?: {
    readonly generalTheory: string;
    readonly oscopeImplementation: string;
  };
  readonly relatedTopics: readonly string[];
  readonly labRoute: string;
}

export interface AlgorithmGuide {
  readonly id: string;
  readonly name: string;
  readonly subsystem: SubsystemCategory;
  readonly preemptive: boolean;
  readonly definition: string;
  readonly mechanism: string;
  readonly selectionRule: string;
  readonly advantages: readonly string[];
  readonly disadvantages: readonly string[];
  readonly complexityNote: string;
  readonly starvationNote: string;
  readonly bestSuitedWorkload: string;
  readonly commonMisconceptions: readonly string[];
  readonly labRoute: string;
}

export interface FormulaVariable {
  readonly symbol: string;
  readonly name: string;
  readonly description: string;
  readonly unit?: string;
}

export interface FormulaEntry {
  readonly id: string;
  readonly name: string;
  readonly subsystem: SubsystemCategory;
  readonly latexOrText: string;
  readonly variables: readonly FormulaVariable[];
  readonly interpretation: string;
  readonly whereUsed: string;
  readonly sampleCalculation?: {
    readonly inputs: Record<string, number | string>;
    readonly result: string;
    readonly explanation: string;
  };
}

export interface GlossaryTerm {
  readonly term: string;
  readonly category: SubsystemCategory;
  readonly shortDefinition: string;
  readonly inDepthExplanation: string;
  readonly relatedConcepts: readonly string[];
  readonly labRoute: string;
}

export interface VivaQuestion {
  readonly id: string;
  readonly subsystem: SubsystemCategory;
  readonly question: string;
  readonly shortAnswer30s: string;
  readonly inDepthAnswer: string;
  readonly commonTrap: string;
  readonly relatedTopicId?: string;
}

export interface AcademicReference {
  readonly id: string;
  readonly title: string;
  readonly authors: readonly string[];
  readonly edition?: string;
  readonly publisher?: string;
  readonly year?: number;
  readonly canonicalCitation: string;
  readonly relevance: string;
  readonly verifiedType: 'TEXTBOOK' | 'STANDARDS_DOC' | 'CLASSIC_PAPER';
}

export interface SearchResultItem {
  readonly id: string;
  readonly title: string;
  readonly type: 'TOPIC' | 'ALGORITHM' | 'FORMULA' | 'GLOSSARY' | 'VIVA';
  readonly subsystem: SubsystemCategory;
  readonly snippet: string;
  readonly route: string;
}
