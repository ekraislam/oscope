import React from 'react';
import { Binary, Layers, AlertTriangle, Scale, BookOpen, Database, Sparkles } from 'lucide-react';
import { LabLayout } from '../../components/layout';
import { Button, Card, StatusBadge, ExplanationCard, EmptyState } from '../../components/common';
import { useMemoryStore } from '../../state';
import { MEMORY_PRESETS } from '../../core/algorithms/memory';
import { useDocumentTitle } from '../../core/utils/useDocumentTitle';
import {
  AddressTranslationPipeline,
  PhysicalMemoryGrid,
  PageTableView,
  TLBView,
  PageReplacementSimulator,
  BeladyAnomalyShowcase,
  MemoryComparisonView,
  MemoryTheoryPanel,
} from './components';

export const MemoryLab: React.FC = () => {
  useDocumentTitle('Virtual Memory & Paging Laboratory', 'Virtual-to-physical address translation, TLB cache hits/misses, and FIFO/LRU/Optimal page replacement.');

  const {
    config,
    virtualAddressInput,
    tlb,
    pageTable,
    physicalMemory,
    translationResult,
    referenceString,
    selectedReplacementAlgorithm,
    replacementFrameCount,
    replacementResult,
    comparisonResult,
    currentPlaybackStep,
    activeTab,
    activePresetId,
    setVirtualAddressInput,
    resetTranslationState,
    setReplacementAlgorithm,
    setReferenceString,
    setReplacementFrameCount,
    runComparison,
    loadPreset,
    goToPlaybackStep,
    stepForward,
    stepBack,
    resetPlayback,
    setActiveTab,
  } = useMemoryStore();

  const activePreset = MEMORY_PRESETS.find((p) => p.id === activePresetId);

  const handleTabSwitch = (tab: 'translation' | 'replacement' | 'belady' | 'comparison' | 'theory') => {
    setActiveTab(tab === 'belady' ? 'replacement' : tab);
    if (tab === 'comparison' && !comparisonResult) {
      runComparison();
    }
    // Custom sub-state for belady
    if (tab === 'belady') {
      loadPreset('belady_anomaly_demo');
    }
  };

  const activePageNumber = translationResult?.pageNumber ?? null;
  const activeFrameNumber = translationResult?.resolvedFrameNumber ?? null;
  const isTLBHit = translationResult?.isTLBHit ?? false;

  return (
    <LabLayout
      title="Memory Management & Address Translation Laboratory"
      description="Deterministic simulation of virtual memory address translation (Virtual Address → TLB → Page Table → Physical Frame) and FIFO, LRU, and Optimal page replacement algorithms."
      badge={<StatusBadge status="ACTIVE" size="sm" />}
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Button
            variant={activeTab === 'translation' ? 'primary' : 'outline'}
            size="md"
            icon={<Binary size={16} />}
            onClick={() => handleTabSwitch('translation')}
          >
            Address Translation
          </Button>
          <Button
            variant={activeTab === 'replacement' && activePresetId !== 'belady_anomaly_demo' ? 'primary' : 'outline'}
            size="md"
            icon={<Layers size={16} />}
            onClick={() => handleTabSwitch('replacement')}
          >
            Page Replacement
          </Button>
          <Button
            variant={activePresetId === 'belady_anomaly_demo' ? 'primary' : 'outline'}
            size="md"
            icon={<AlertTriangle size={16} />}
            onClick={() => handleTabSwitch('belady')}
          >
            Bélády&apos;s Anomaly
          </Button>
          <Button
            variant={activeTab === 'comparison' ? 'primary' : 'outline'}
            size="md"
            icon={<Scale size={16} />}
            onClick={() => handleTabSwitch('comparison')}
          >
            Multi-Algorithm Benchmark
          </Button>
          <Button
            variant={activeTab === 'theory' ? 'primary' : 'outline'}
            size="md"
            icon={<BookOpen size={16} />}
            onClick={() => handleTabSwitch('theory')}
          >
            Theory & Concepts
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Preset Selector Banner */}
        <Card padding="md" variant="subdued">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Sparkles size={18} color="var(--color-accent)" />
                <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  ACADEMIC PRESETS & SHOWCASES
                </span>
              </div>

              <select
                value={activePresetId}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) loadPreset(val);
                }}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-2) var(--space-4)',
                  fontSize: '0.9375rem',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                  minWidth: '320px',
                }}
              >
                <option value="">Select an educational memory scenario...</option>
                {MEMORY_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {activePreset && (
              <div
                style={{
                  marginTop: 'var(--space-2)',
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: 'rgba(56, 189, 248, 0.06)',
                  borderLeft: '4px solid var(--color-accent)',
                  borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)',
                  fontSize: '0.9rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <strong style={{ color: 'var(--color-accent)' }}>Concept:</strong>
                  <span>{activePreset.expectedConcept}</span>
                </div>
                <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  <strong>Purpose:</strong> {activePreset.purpose}
                </div>
                <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', lineHeight: 1.4 }}>
                  <strong>Key Observation:</strong> {activePreset.interestingBehavior}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Tab 1: Address Translation Observatory */}
        {activeTab === 'translation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <AddressTranslationPipeline
              config={config}
              virtualAddress={virtualAddressInput}
              translationResult={translationResult}
              onTranslateAddress={setVirtualAddressInput}
              onReset={resetTranslationState}
            />

            {/* Academic Explanation Card */}
            {translationResult && (
              <ExplanationCard
                subsystem="MEMORY"
                title="Virtual Address Translation Invariant"
                what={
                  <span>
                    Virtual Address <code>0x{virtualAddressInput.toString(16).toUpperCase()}</code> (decimal {virtualAddressInput})
                    decomposed into Virtual Page Number <strong>{translationResult.pageNumber}</strong> and Offset <strong>0x{translationResult.offset.toString(16).toUpperCase()}</strong>.
                  </span>
                }
                why={
                  <span>
                    {translationResult.isTLBHit
                      ? 'Resolved directly in O(1) from the hardware Translation Lookaside Buffer (TLB Hit).'
                      : translationResult.isPageFault
                      ? 'TLB Miss + Page Table Miss: Requested page was not resident in physical RAM (Page Fault interrupt triggered).'
                      : 'TLB Miss followed by Page Table Hit: Page is resident in RAM; translation fetched from page table and cached into TLB (A TLB Miss is NOT a Page Fault!).'}
                  </span>
                }
                result={
                  translationResult.physicalAddress !== null
                    ? `Physical Address resolved: 0x${translationResult.physicalAddress.rawAddress.toString(16).toUpperCase()} (Frame #${translationResult.resolvedFrameNumber}).`
                    : `OS Demand Pager allocates free frame #${translationResult.resolvedFrameNumber} and binds Page #${translationResult.pageNumber}.`
                }
              />
            )}

            {/* Hardware Memory Subsystems Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
              {/* TLB View */}
              <TLBView tlb={tlb} activePageNumber={activePageNumber} isHit={isTLBHit} />

              {/* Page Table View */}
              <PageTableView pageTable={pageTable} activePageNumber={activePageNumber} />

              {/* Physical Memory Frames */}
              <PhysicalMemoryGrid
                memory={physicalMemory}
                activeFrameNumber={activeFrameNumber}
                pageSizeBytes={config.pageSizeBytes}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Page Replacement Simulator */}
        {activeTab === 'replacement' && activePresetId !== 'belady_anomaly_demo' && (
          <PageReplacementSimulator
            result={replacementResult}
            selectedAlgorithm={selectedReplacementAlgorithm}
            referenceString={referenceString}
            frameCount={replacementFrameCount}
            currentStep={currentPlaybackStep}
            onSelectAlgorithm={setReplacementAlgorithm}
            onUpdateReferenceString={setReferenceString}
            onUpdateFrameCount={setReplacementFrameCount}
            onGoToStep={goToPlaybackStep}
            onStepForward={stepForward}
            onStepBack={stepBack}
            onReset={resetPlayback}
          />
        )}

        {/* Tab 3: Dedicated Belady's Anomaly Showcase */}
        {activePresetId === 'belady_anomaly_demo' && (
          <BeladyAnomalyShowcase />
        )}

        {/* Tab 4: Multi-Algorithm Benchmark Comparison */}
        {activeTab === 'comparison' && (
          <div>
            {comparisonResult ? (
              <MemoryComparisonView
                comparison={comparisonResult}
                selectedAlgorithm={selectedReplacementAlgorithm}
                onSelectAlgorithm={(algo) => {
                  setReplacementAlgorithm(algo);
                  setActiveTab('replacement');
                }}
              />
            ) : (
              <EmptyState
                icon={<Database size={28} />}
                title="Memory Benchmark Not Computed"
                description="Evaluate FIFO, LRU, and Optimal replacement algorithms side-by-side against the active reference string."
                action={
                  <Button variant="primary" size="sm" onClick={runComparison}>
                    Run Comparative Benchmark
                  </Button>
                }
              />
            )}
          </div>
        )}

        {/* Tab 5: Theory & Concepts */}
        {activeTab === 'theory' && (
          <MemoryTheoryPanel />
        )}
      </div>
    </LabLayout>
  );
};
