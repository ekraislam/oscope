import React from 'react';
import { Route, Switch } from 'wouter';
import { Header, Sidebar, Footer } from './components/layout';
import { LandingView } from './labs/landing/LandingView';
import { ObservatoryLab } from './labs/observatory/ObservatoryLab';
import { ProcessLab } from './labs/process/ProcessLab';
import { SchedulingLab } from './labs/scheduling/SchedulingLab';
import { MemoryLab } from './labs/memory/MemoryLab';
import { DeadlockLab } from './labs/deadlock/DeadlockLab';
import { FileSystemLab } from './labs/filesystem/FileSystemLab';
import { NotFoundView } from './labs/notfound/NotFoundView';
import { ErrorBoundary } from './components/common';

const DocsHubView = React.lazy(() => import('./labs/docs/DocsHubView'));

export const App: React.FC = () => {
  return (
    <div className="app-container observatory-grid-bg">
      <Header />
      <div className="shell-body">
        <Sidebar />
        <main className="main-content" tabIndex={-1}>
          <ErrorBoundary fallbackTitle="Observatory Kernel Fault Recovered">
            <React.Suspense fallback={<div style={{ padding: 'var(--space-6)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>Loading Academic Observatory...</div>}>
              <Switch>
                <Route path="/" component={LandingView} />
                <Route path="/observatory" component={ObservatoryLab} />
                <Route path="/process" component={ProcessLab} />
                <Route path="/scheduling" component={SchedulingLab} />
                <Route path="/memory" component={MemoryLab} />
                <Route path="/deadlock" component={DeadlockLab} />
                <Route path="/filesystem" component={FileSystemLab} />
                <Route path="/docs" component={DocsHubView} />
                <Route path="/docs/:subtopic*" component={DocsHubView} />
                <Route component={NotFoundView} />
              </Switch>
            </React.Suspense>
          </ErrorBoundary>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default App;
