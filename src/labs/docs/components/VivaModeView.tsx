/**
 * OScope — Viva Mode & Examination Presentation View
 * Equips students with 30s pitch, 2min overview, 5min timed demo script,
 * 10-step teacher walkthrough cheat sheet, searchable question bank, common traps,
 * and transparent project limitations.
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  Clock,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  ListChecks
} from 'lucide-react';
import {
  PITCH_30_SECONDS,
  OVERVIEW_2_MINUTES,
  PRESENTATION_SCRIPT_5_MINUTES,
  TEACHER_DEMO_CHEAT_SHEET,
  VIVA_QUESTIONS,
  COMMON_VIVA_TRAPS,
  PROJECT_LIMITATIONS,
  FUTURE_WORK_ROADMAP
} from '../../../content/vivaGuide';
import type { SubsystemCategory } from '../../../content/types';

export const VivaModeView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'SCRIPTS' | 'CHEAT_SHEET' | 'QUESTIONS' | 'TRAPS' | 'LIMITATIONS'>('SCRIPTS');
  const [questionCategory, setQuestionCategory] = useState<SubsystemCategory | 'ALL'>('ALL');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  const categories: (SubsystemCategory | 'ALL')[] = [
    'ALL',
    'PROCESS',
    'SCHEDULING',
    'MEMORY',
    'DEADLOCK',
    'FILESYSTEM'
  ];

  const filteredQuestions = VIVA_QUESTIONS.filter(
    (q) => questionCategory === 'ALL' || q.subsystem === questionCategory
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Header Banner */}
      <div
        style={{
          backgroundColor: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4) var(--space-5)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-primary)', color: '#0f172a' }}>
            <GraduationCap size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Viva Voce & Teacher Demonstration Mode
            </h2>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Comprehensive oral defense toolkit, timed demo scripts, cheat sheets, and trap questions
            </span>
          </div>
        </div>

        {/* Section Navigation Buttons */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {[
            { id: 'SCRIPTS', label: 'Presentation Scripts', icon: <Clock size={13} /> },
            { id: 'CHEAT_SHEET', label: '10-Step Cheat Sheet', icon: <ListChecks size={13} /> },
            { id: 'QUESTIONS', label: 'Question Bank', icon: <HelpCircle size={13} /> },
            { id: 'TRAPS', label: 'Common Viva Traps', icon: <AlertTriangle size={13} /> },
            { id: 'LIMITATIONS', label: 'Limitations & Future', icon: <ShieldCheck size={13} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id as any)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: activeSection === tab.id ? 'var(--color-primary)' : 'var(--color-border)',
                backgroundColor: activeSection === tab.id ? 'var(--color-primary)' : 'var(--color-surface)',
                color: activeSection === tab.id ? '#0f172a' : 'var(--color-text-main)',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* --- SECTION 1: SCRIPTS --- */}
      {activeSection === 'SCRIPTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* 30-Second Elevator Pitch */}
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: 'var(--radius-xs)' }}>
                30-SECOND ELEVATOR PITCH
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>For quick evaluator questions</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--color-text-main)', fontStyle: 'italic', borderLeft: '3px solid var(--color-primary)', paddingLeft: '14px' }}>
              {PITCH_30_SECONDS}
            </p>
          </div>

          {/* 2-Minute Academic Overview */}
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: 'var(--radius-xs)' }}>
                2-MINUTE PROJECT OVERVIEW
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Structured project walkthrough</span>
            </div>
            <div style={{ fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--color-text-main)', whiteSpace: 'pre-line' }}>
              {OVERVIEW_2_MINUTES}
            </div>
          </div>

          {/* 5-Minute Timed Demonstration Guide */}
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)' }}>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: 'var(--radius-xs)', display: 'inline-block', marginBottom: '4px' }}>
                5-MINUTE FORMAL PRESENTATION TIMELINE
              </div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                Step-by-Step Viva Presentation Script
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {PRESENTATION_SCRIPT_5_MINUTES.map((slot, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    display: 'grid',
                    gridTemplateColumns: '120px 1fr',
                    gap: '14px',
                    alignItems: 'flex-start'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
                      {slot.interval}
                    </div>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {slot.title}
                    </div>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--color-text-main)' }}>
                      "{slot.script}"
                    </p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.6875rem', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '2px 8px', borderRadius: 'var(--radius-xs)' }}>
                      <CheckCircle size={11} />
                      <span>Action: {slot.visualAction}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- SECTION 2: CHEAT SHEET --- */}
      {activeSection === 'CHEAT_SHEET' && (
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: 'var(--radius-xs)' }}>
              TEACHER DEMO CHEAT SHEET
            </span>
            <h3 style={{ margin: '6px 0 0 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              10-Step Laboratory Walkthrough
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Follow these sequential steps during an in-person examiner demonstration for optimal flow.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {TEACHER_DEMO_CHEAT_SHEET.map((step) => (
              <div
                key={step.stepNumber}
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  display: 'grid',
                  gridTemplateColumns: '40px 140px 1fr 1fr',
                  gap: '12px',
                  alignItems: 'center'
                }}
              >
                <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', textAlign: 'center' }}>
                  {step.stepNumber}
                </div>
                <div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', display: 'block' }}>
                    {step.lab}
                  </span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                    {step.actionToPerform}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', lineHeight: 1.45, color: 'var(--color-text-muted)' }}>
                  <strong style={{ color: 'var(--color-text-main)', display: 'block', marginBottom: '2px' }}>What to explain:</strong>
                  {step.whatToExplain}
                </div>
                <div style={{ fontSize: '0.75rem', lineHeight: 1.45, color: '#10b981' }}>
                  <strong style={{ display: 'block', marginBottom: '2px' }}>Expected observation:</strong>
                  {step.expectedObservation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SECTION 3: QUESTION BANK --- */}
      {activeSection === 'QUESTIONS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {/* Category filter */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setQuestionCategory(cat)}
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-xs)',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: questionCategory === cat ? 'var(--color-primary)' : 'var(--color-border)',
                  backgroundColor: questionCategory === cat ? 'rgba(56, 189, 248, 0.12)' : 'var(--color-surface)',
                  color: questionCategory === cat ? 'var(--color-primary)' : 'var(--color-text-muted)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredQuestions.map((q) => {
              const isExpanded = expandedQuestionId === q.id;
              return (
                <div
                  key={q.id}
                  id={q.id}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', fontWeight: 700, padding: '2px 6px', borderRadius: 'var(--radius-xs)', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: 'var(--color-primary)' }}>
                        {q.subsystem}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                        {q.question}
                      </h4>
                    </div>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>

                  {/* 30s Quick Answer */}
                  <div style={{ backgroundColor: 'var(--color-bg)', padding: '10px 12px', borderRadius: 'var(--radius-xs)', borderLeft: '3px solid var(--color-primary)' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', marginBottom: '3px' }}>
                      30-Second Model Answer
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--color-text-main)' }}>
                      {q.shortAnswer30s}
                    </p>
                  </div>

                  {/* Expanded In-Depth & Trap */}
                  {isExpanded && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '6px' }}>
                      <div style={{ fontSize: '0.8125rem', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
                        <strong style={{ color: 'var(--color-text-main)', display: 'block', marginBottom: '2px' }}>In-Depth Technical Answer:</strong>
                        {q.inDepthAnswer}
                      </div>

                      <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px 12px', borderRadius: 'var(--radius-xs)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <AlertTriangle size={15} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ fontSize: '0.75rem', lineHeight: 1.45, color: 'var(--color-text-main)' }}>
                          <strong style={{ color: '#ef4444' }}>Viva Trap Alert: </strong>
                          {q.commonTrap}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- SECTION 4: VIVA TRAPS --- */}
      {activeSection === 'TRAPS' && (
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: 'var(--radius-xs)' }}>
              QUESTIONS THAT CATCH STUDENTS
            </span>
            <h3 style={{ margin: '6px 0 0 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              Top 5 Common Operating Systems Examination Traps
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Examiners frequently test these conceptual nuances to determine if students truly understand the theory.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {COMMON_VIVA_TRAPS.map((trap, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    {trap.trapQuestion}
                  </h4>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: 'var(--radius-xs)' }}>
                    {trap.quickAnswer}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--color-text-muted)' }}>
                  {trap.detailedExplanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SECTION 5: LIMITATIONS & FUTURE --- */}
      {activeSection === 'LIMITATIONS' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
          {/* Current Limitations */}
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: 'var(--radius-xs)' }}>
                HONEST ACADEMIC SCOPE
              </span>
              <h3 style={{ margin: '6px 0 0 0', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                Current Simulation Limitations
              </h3>
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {PROJECT_LIMITATIONS.map((item, idx) => (
                <li key={idx} style={{ fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--color-text-main)' }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Future Work */}
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: 'var(--radius-xs)' }}>
                ACADEMIC ROADMAP
              </span>
              <h3 style={{ margin: '6px 0 0 0', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                Realistic Future Work
              </h3>
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {FUTURE_WORK_ROADMAP.map((item, idx) => (
                <li key={idx} style={{ fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--color-text-main)' }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
