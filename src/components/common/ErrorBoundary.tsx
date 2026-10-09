/**
 * OScope — Top-Level React Error Boundary
 * Catches unhandled runtime exceptions during visualization rendering,
 * prevents white-screen crashes, and displays technical diagnostics
 * with single-click state recovery.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorState } from './ErrorState';
import { Button } from './Button';
import { Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    // Keep internal error record for diagnostics without unhandled crash
    console.error('[OScope Observatory Error Boundary caught exception]:', error, errorInfo);
  }

  handleReset = (): void => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const diagnostic = {
        name: this.state.error?.name ?? 'UnknownError',
        message: this.state.error?.message ?? 'No message provided',
        stack: this.state.error?.stack,
        componentStack: this.state.errorInfo?.componentStack,
      };

      return (
        <div style={{ padding: 'var(--space-8) var(--space-4)', maxWidth: '900px', margin: '0 auto' }}>
          <ErrorState
            title={this.props.fallbackTitle ?? 'Observatory Runtime Fault Intercepted'}
            message="An unexpected rendering anomaly occurred in the laboratory view. The simulation kernel has intercepted the fault to prevent host session termination."
            diagnosticDetails={diagnostic}
            onRetry={this.handleReset}
            retryLabel="Recover Subsystem"
            action={
              <Button
                variant="primary"
                size="sm"
                icon={<Home size={14} />}
                onClick={this.handleReload}
              >
                Return to Observatory
              </Button>
            }
          />
        </div>
      );
    }

    return this.props.children;
  }
}
