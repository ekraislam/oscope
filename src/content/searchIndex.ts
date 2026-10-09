/**
 * OScope — Unified Documentation Search Index
 * Instant, zero-dependency client-side search indexing topics, algorithm guides,
 * formulas, glossary entries, and viva question bank items.
 */

import type { SearchResultItem, SubsystemCategory } from './types';
import { PROCESS_THEORY_TOPICS } from './processTheory';
import { SCHEDULING_THEORY_TOPICS, SCHEDULING_ALGORITHMS } from './schedulingTheory';
import { MEMORY_THEORY_TOPICS, PAGE_REPLACEMENT_ALGORITHMS } from './memoryTheory';
import { DEADLOCK_THEORY_TOPICS, DEADLOCK_ALGORITHMS } from './deadlockTheory';
import { FILESYSTEM_THEORY_TOPICS, FILE_ALLOCATION_STRATEGIES } from './filesystemTheory';
import { FORMULA_CATALOG } from './formulas';
import { GLOSSARY_TERMS } from './glossary';
import { VIVA_QUESTIONS } from './vivaGuide';

export function buildSearchIndex(): readonly SearchResultItem[] {
  const items: SearchResultItem[] = [];

  // 1. Theory Topics
  const allTopics = [
    ...PROCESS_THEORY_TOPICS,
    ...SCHEDULING_THEORY_TOPICS,
    ...MEMORY_THEORY_TOPICS,
    ...DEADLOCK_THEORY_TOPICS,
    ...FILESYSTEM_THEORY_TOPICS
  ];

  for (const topic of allTopics) {
    items.push({
      id: topic.id,
      title: topic.title,
      type: 'TOPIC',
      subsystem: topic.subsystem,
      snippet: topic.shortDefinition,
      route: `/docs/${topic.subsystem.toLowerCase()}#${topic.id}`
    });
  }

  // 2. Algorithm Guides
  const allAlgorithms = [
    ...SCHEDULING_ALGORITHMS,
    ...PAGE_REPLACEMENT_ALGORITHMS,
    ...DEADLOCK_ALGORITHMS,
    ...FILE_ALLOCATION_STRATEGIES
  ];

  for (const algo of allAlgorithms) {
    items.push({
      id: algo.id,
      title: algo.name,
      type: 'ALGORITHM',
      subsystem: algo.subsystem,
      snippet: algo.definition,
      route: `/docs/${algo.subsystem.toLowerCase()}#${algo.id}`
    });
  }

  // 3. Formulas
  for (const formula of FORMULA_CATALOG) {
    items.push({
      id: formula.id,
      title: `${formula.name} (${formula.latexOrText})`,
      type: 'FORMULA',
      subsystem: formula.subsystem,
      snippet: formula.interpretation,
      route: `/docs/formulas#${formula.id}`
    });
  }

  // 4. Glossary Terms
  for (const term of GLOSSARY_TERMS) {
    items.push({
      id: `glossary-${term.term.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      title: term.term,
      type: 'GLOSSARY',
      subsystem: term.category,
      snippet: term.shortDefinition,
      route: `/docs/glossary#${term.term.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
    });
  }

  // 5. Viva Questions
  for (const q of VIVA_QUESTIONS) {
    items.push({
      id: q.id,
      title: q.question,
      type: 'VIVA',
      subsystem: q.subsystem,
      snippet: q.shortAnswer30s,
      route: `/docs/viva#${q.id}`
    });
  }

  return Object.freeze(items);
}

export const SEARCH_INDEX: readonly SearchResultItem[] = buildSearchIndex();

export function searchDocs(query: string, subsystemFilter?: SubsystemCategory): SearchResultItem[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed && !subsystemFilter) {
    return [];
  }

  return SEARCH_INDEX.filter((item) => {
    if (subsystemFilter && item.subsystem !== subsystemFilter) {
      return false;
    }
    if (!trimmed) {
      return true;
    }

    const titleMatch = item.title.toLowerCase().includes(trimmed);
    const snippetMatch = item.snippet.toLowerCase().includes(trimmed);
    const idMatch = item.id.toLowerCase().includes(trimmed);

    return titleMatch || snippetMatch || idMatch;
  });
}
