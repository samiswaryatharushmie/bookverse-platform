import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 animate-fade-in">
          <div className="glass-panel p-8 max-w-md w-full text-center border-l-4 border-l-[var(--color-danger)]">
            <div className="w-16 h-16 rounded-full bg-[var(--color-danger)]/10 text-[var(--color-danger)] flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold font-display mb-2">Something went wrong</h2>
            <p className="text-[var(--color-text-muted)] text-sm mb-6">
              We encountered an unexpected error while loading this content. 
            </p>
            <button
              className="btn btn-outline mx-auto flex items-center gap-2"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
            >
              <RefreshCcw size={16} />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
