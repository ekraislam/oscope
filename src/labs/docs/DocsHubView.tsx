/**
 * OScope — Academic Documentation, Theory Guides & Viva-Ready Knowledge Layer
 * Central Hub unifying process, scheduling, memory, deadlock, filesystem,
 * formulas, glossary, concept map, architecture, viva mode, and references.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useRoute } from 'wouter';
import {
  BookOpen,
  Search,
  Layers,
  Cpu,
  Database,
  Lock,
  HardDrive,
  Calculator,
  Compass,
  GraduationCap,
  Network,
  Award,
  CheckCircle2,
  ChevronRight,
  X
} from 'lucide-react';

import { searchDocs } from '../../content/searchIndex';
import { PROCESS_THEORY_TOPICS } from '../../content/processTheory';
import { SCHEDULING_THEORY_TOPICS, SCHEDULING_ALGORITHMS } from '../../content/schedulingTheory';
import { MEMORY_THEORY_TOPICS, PAGE_REPLACEMENT_ALGORITHMS } from '../../content/memoryTheory';
import { DEADLOCK_THEORY_TOPICS, DEADLOCK_ALGORITHMS } from '../../content/deadlockTheory';
import { FILESYSTEM_THEORY_TOPICS, FILE_ALLOCATION_STRATEGIES } from '../../content/filesystemTheory';
import { FORMULA_CATALOG } from '../../content/formulas';

import { TheoryTopicCard } from './components/TheoryTopicCard';
import { AlgorithmGuideCard } from './components/AlgorithmGuideCard';
import { InteractiveFormulaCalculator } from './components/InteractiveFormulaCalculator';
import { GlossaryView } from './components/GlossaryView';
import { ConceptRelationshipMap } from './components/ConceptRelationshipMap';
import { VivaModeView } from './components/VivaModeView';
import { ArchitectureView } from './components/ArchitectureView';
import { TestingView } from './components/TestingView';
import { ReferencesView } from './components/ReferencesView';

export type DocTab =
  | 'overview'
  | 'process'
  | 'scheduling'
  | 'memory'
  | 'deadlock'
  | 'filesystem'
  | 'formulas'
  | 'glossary'
  | 'concept-map'
  | 'architecture'
  | 'testing'
  | 'viva'
  | 'references';

export type TabCategory = 'subsystem' | 'theory' | 'assessment';

interface TabItem {
  id: DocTab;
  label: string;
  icon: React.ReactNode;
  category: TabCategory;
}

const TABS: readonly TabItem[] = [
  { id: 'overview', label: 'Overview', icon: <Compass size={16} />, category: 'theory' },
  { id: 'process', label: 'Process', icon: <Layers size={16} />, category: 'subsystem' },
  { id: 'scheduling', label: 'Scheduling', icon: <Cpu size={16} />, category: 'subsystem' },
  { id: 'memory', label: 'Memory', icon: <Database size={16} />, category: 'subsystem' },
  { id: 'deadlock', label: 'Deadlock', icon: <Lock size={16} />, category: 'subsystem' },
  { id: 'filesystem', label: 'File System', icon: <HardDrive size={16} />, category: 'subsystem' },
  { id: 'formulas', label: 'Formulas', icon: <Calculator size={16} />, category: 'theory' },
  { id: 'glossary', label: 'Glossary', icon: <BookOpen size={16} />, category: 'theory' },
  { id: 'concept-map', label: 'Concept Map', icon: <Network size={16} />, category: 'theory' },
  { id: 'architecture', label: 'Architecture', icon: <Layers size={16} />, category: 'theory' },
  { id: 'testing', label: 'Testing', icon: <CheckCircle2 size={16} />, category: 'assessment' },
  { id: 'viva', label: 'Viva Mode', icon: <GraduationCap size={16} />, category: 'assessment' },
  { id: 'references', label: 'References', icon: <Award size={16} />, category: 'assessment' }
];

export const DocsHubView: React.FC = () => {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/docs/:subtopic*');

  // Determine active tab from URL or fallback to overview
  const initialTab: DocTab = useMemo(() => {
    const raw = (params as any)?.subtopic;
    if (raw) {
      const sanitized = raw.toLowerCase().split('/')[0] as DocTab;
      if (TABS.some((t) => t.id === sanitized)) {
        return sanitized;
      }
    }
    return 'overview';
  }, [params]);

  const [activeTab, setActiveTab] = useState<DocTab>(initialTab);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'subsystem' | 'theory' | 'assessment'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync tab with URL
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // If activeTab is outside selectedCategory, reset selectedCategory to 'all' so activeTab is always visible
  useEffect(() => {
    const targetTab = TABS.find((t) => t.id === activeTab);
    if (targetTab && selectedCategory !== 'all' && targetTab.category !== selectedCategory) {
      setSelectedCategory('all');
    }
  }, [activeTab, selectedCategory]);

  const handleSelectTab = (tab: DocTab) => {
    setActiveTab(tab);
    setLocation(tab === 'overview' ? '/docs' : `/docs/${tab}`);
  };

  const filteredTabs = useMemo(() => {
    if (selectedCategory === 'all') return TABS;
    return TABS.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  // Search results
  const searchResults = useMemo(() => {
    return searchDocs(searchQuery);
  }, [searchQuery]);

  const handleSelectSearchResult = (route: string) => {
    setSearchQuery('');
    const [path, hash] = route.split('#');
    setLocation(path);
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        padding: 'var(--space-5)',
        maxWidth: '1440px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Header & Search Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          backgroundColor: 'var(--color-surface)',
          padding: 'var(--space-4) var(--space-5)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              color: 'var(--color-primary)'
            }}
          >
            <BookOpen size={20} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
              OScope Academic Knowledge & Documentation
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Interactive theory guides, formula proofs, viva preparation, and system architecture
            </span>
          </div>
        </div>

        {/* Global Search Input */}
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)'
            }}
          />
          <input
            type="text"
            placeholder="Search topics, algorithms, formulas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 30px 8px 34px',
              fontSize: '0.8125rem',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-main)',
              outline: 'none'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={14} />
            </button>
          )}

          {/* Autocomplete Search Dropdown */}
          {searchQuery && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                maxHeight: '340px',
                overflowY: 'auto',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-md)',
                zIndex: 50,
                padding: '6px'
              }}
            >
              {searchResults.length === 0 ? (
                <div style={{ padding: '12px', fontSize: '0.8125rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                  No documentation matches found for "{searchQuery}"
                </div>
              ) : (
                searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectSearchResult(item.route)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-xs)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      borderBottom: '1px solid var(--color-border)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                        {item.title}
                      </span>
                      <span
                        style={{
                          fontSize: '0.625rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '1px 5px',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: 'rgba(56, 189, 248, 0.1)',
                          color: 'var(--color-primary)'
                        }}
                      >
                        {item.type}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.snippet}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs Bar with Wrapping & Category Filtering */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          backgroundColor: 'var(--color-surface)',
          padding: 'var(--space-3) var(--space-4)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Category Filter Pills Toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
            borderBottom: '1px solid var(--color-border-subtle)',
            paddingBottom: 'var(--space-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Topic Categories:
            </span>
            {[
              { id: 'all', label: `All Topics (${TABS.length})` },
              { id: 'subsystem', label: '🔬 OS Subsystems (5)' },
              { id: 'theory', label: '📚 Theory & Reference (5)' },
              { id: 'assessment', label: '🎓 Testing & Viva (3)' },
            ].map((cat) => {
              const isCatActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as any)}
                  style={{
                    padding: '6px 14px',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid',
                    borderColor: isCatActive ? 'var(--color-accent)' : 'var(--color-border)',
                    backgroundColor: isCatActive ? 'rgba(56, 189, 248, 0.18)' : 'var(--color-surface-subdued)',
                    color: isCatActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-muted)',
              fontWeight: 600,
            }}
          >
            Showing {filteredTabs.length} of {TABS.length} topics (All visible)
          </span>
        </div>

        {/* Tab Buttons (Always wrapping cleanly with flexWrap: 'wrap', zero clipping) */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          {filteredTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  fontSize: '0.8125rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border-subtle)',
                  backgroundColor: isActive ? 'rgba(56, 189, 248, 0.22)' : 'var(--color-surface-subdued)',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  boxShadow: isActive ? '0 0 10px rgba(56, 189, 248, 0.25)' : 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- TAB CONTENT AREA --- */}

      {/* 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Welcome Card */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)'
            }}
          >
            <div style={{ fontSize: '0.6875rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ACADEMIC OBSERVATORY KNOWLEDGE BASE
            </div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Visualizing the Hidden Operations of an Operating System
            </h2>
            <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
              Welcome to the academic theory repository for <strong>OScope</strong>. While the laboratories simulate and visualize execution results, this documentation layer explains the rigorous academic theory, algorithmic rules, mathematical formulas, and historical principles behind those results.
            </p>
          </div>

          {/* Quick Subsystem Launch Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
            {[
              { id: 'process', title: 'Process Management', desc: 'Process vs. Program, PCB layout, 5-state lifecycle transitions, and context switch costs.', icon: <Layers size={20} color="#38bdf8" /> },
              { id: 'scheduling', title: 'CPU Scheduling', desc: 'FCFS, SJF, SRTF, Priority, Round Robin, Gantt timelines, convoy effects, and preemption.', icon: <Cpu size={20} color="#10b981" /> },
              { id: 'memory', title: 'Virtual Memory & Paging', desc: 'Address translation math, TLB cache lookup, Page Fault handling, and Belady anomaly.', icon: <Database size={20} color="#f59e0b" /> },
              { id: 'deadlock', title: 'Deadlock Avoidance', desc: 'The 4 Coffman conditions, Safe vs Unsafe states, Banker algorithm, and RAG cycles.', icon: <Lock size={20} color="#ef4444" /> },
              { id: 'filesystem', title: 'Storage & File Systems', desc: 'Inodes, Contiguous vs Linked vs Indexed allocation, and internal vs external fragmentation.', icon: <HardDrive size={20} color="#a855f7" /> },
              { id: 'viva', title: 'Viva & Teacher Mode', desc: '30s pitch, 5-min presentation script, 10-step teacher demo cheat sheet, and common traps.', icon: <GraduationCap size={20} color="#38bdf8" /> }
            ].map((card) => (
              <div
                key={card.id}
                onClick={() => handleSelectTab(card.id as DocTab)}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-4)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {card.icon}
                  <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  {card.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--color-text-muted)' }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Interactive Calculator Banner */}
          <InteractiveFormulaCalculator />
        </div>
      )}

      {/* 2. PROCESS MANAGEMENT */}
      {activeTab === 'process' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Process Lifecycle & PCB Academic Theory
            </h2>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Explanations of process abstractions, kernel PCB structures, 5-state transitions, and context switching
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {PROCESS_THEORY_TOPICS.map((topic) => (
              <TheoryTopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        </div>
      )}

      {/* 3. CPU SCHEDULING */}
      {activeTab === 'scheduling' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
              CPU Scheduling Knowledge Base & Algorithm Guides
            </h2>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Burst cycles, preemption semantics, convoy effects, and teardowns of 6 canonical scheduling algorithms
            </span>
          </div>

          {/* Theory Topics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {SCHEDULING_THEORY_TOPICS.map((topic) => (
              <TheoryTopicCard key={topic.id} topic={topic} />
            ))}
          </div>

          {/* Algorithm Guides */}
          <h3 style={{ margin: 'var(--space-4) 0 0 0', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
            Canonical CPU Scheduling Algorithms
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {SCHEDULING_ALGORITHMS.map((algo) => (
              <AlgorithmGuideCard key={algo.id} algorithm={algo} />
            ))}
          </div>
        </div>
      )}

      {/* 4. VIRTUAL MEMORY */}
      {activeTab === 'memory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Virtual Memory, Address Translation & Page Replacement
            </h2>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Paging mathematics, TLB caching vs Page Table, page fault lifecycle, and Belady's anomaly
            </span>
          </div>

          {/* Theory Topics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {MEMORY_THEORY_TOPICS.map((topic) => (
              <TheoryTopicCard key={topic.id} topic={topic} />
            ))}
          </div>

          {/* Replacement Algorithms */}
          <h3 style={{ margin: 'var(--space-4) 0 0 0', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
            Page Replacement Policies (FIFO, LRU, Optimal)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {PAGE_REPLACEMENT_ALGORITHMS.map((algo) => (
              <AlgorithmGuideCard key={algo.id} algorithm={algo} />
            ))}
          </div>
        </div>
      )}

      {/* 5. DEADLOCK */}
      {activeTab === 'deadlock' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Deadlocks, Banker's Algorithm & Resource Graphs
            </h2>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              The 4 Coffman conditions, Safe vs Unsafe vs Deadlocked, Banker safety math, and RAG cycle analysis
            </span>
          </div>

          {/* Theory Topics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {DEADLOCK_THEORY_TOPICS.map((topic) => (
              <TheoryTopicCard key={topic.id} topic={topic} />
            ))}
          </div>

          {/* Deadlock Algorithms */}
          <h3 style={{ margin: 'var(--space-4) 0 0 0', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
            Deadlock Avoidance Protocols
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {DEADLOCK_ALGORITHMS.map((algo) => (
              <AlgorithmGuideCard key={algo.id} algorithm={algo} />
            ))}
          </div>
        </div>
      )}

      {/* 6. FILE SYSTEM */}
      {activeTab === 'filesystem' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
              File Systems & Secondary Storage Allocation
            </h2>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Inode pointer structures, Contiguous vs Linked vs Indexed allocation, and internal vs external fragmentation
            </span>
          </div>

          {/* Theory Topics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {FILESYSTEM_THEORY_TOPICS.map((topic) => (
              <TheoryTopicCard key={topic.id} topic={topic} />
            ))}
          </div>

          {/* Storage Allocation Strategies */}
          <h3 style={{ margin: 'var(--space-4) 0 0 0', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
            Storage Allocation Strategies
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {FILE_ALLOCATION_STRATEGIES.map((algo) => (
              <AlgorithmGuideCard key={algo.id} algorithm={algo} />
            ))}
          </div>
        </div>
      )}

      {/* 7. FORMULAS */}
      {activeTab === 'formulas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Interactive Calculator */}
          <InteractiveFormulaCalculator />

          {/* Complete Formula Catalog */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: 'var(--space-3)' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              Complete Academic Formula Catalog
            </h3>

            {FORMULA_CATALOG.map((f) => (
              <div
                key={f.id}
                id={f.id}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  scrollMarginTop: '80px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    {f.name}
                  </h4>
                  <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', fontWeight: 700, padding: '2px 6px', borderRadius: 'var(--radius-xs)', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: 'var(--color-primary)' }}>
                    {f.subsystem}
                  </span>
                </div>

                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-primary)', backgroundColor: 'var(--color-bg)', padding: '10px 14px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
                  {f.latexOrText}
                </div>

                <p style={{ margin: 0, fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--color-text-main)' }}>
                  {f.interpretation}
                </p>

                {/* Variable Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                    Variables:
                  </div>
                  {f.variables.map((v) => (
                    <div key={v.symbol} style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      <code style={{ color: 'var(--color-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{v.symbol}</code>
                      {' — '}{v.description} {v.unit ? `(${v.unit})` : ''}
                    </div>
                  ))}
                </div>

                {f.sampleCalculation && (
                  <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '8px 12px', borderRadius: 'var(--radius-xs)', fontSize: '0.75rem' }}>
                    <strong style={{ color: '#10b981' }}>Example: </strong>
                    <span style={{ color: 'var(--color-text-main)', fontFamily: 'var(--font-mono)' }}>{f.sampleCalculation.result}</span>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>{f.sampleCalculation.explanation}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. GLOSSARY */}
      {activeTab === 'glossary' && <GlossaryView />}

      {/* 9. CONCEPT MAP */}
      {activeTab === 'concept-map' && <ConceptRelationshipMap />}

      {/* 10. ARCHITECTURE */}
      {activeTab === 'architecture' && <ArchitectureView />}

      {/* 11. TESTING */}
      {activeTab === 'testing' && <TestingView />}

      {/* 12. VIVA MODE */}
      {activeTab === 'viva' && <VivaModeView />}

      {/* 13. REFERENCES */}
      {activeTab === 'references' && <ReferencesView />}
    </div>
  );
};

export default DocsHubView;
