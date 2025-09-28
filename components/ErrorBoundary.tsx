'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-aegis-card border border-red-500/20 rounded-lg">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-200 mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-slate-400 mb-4 text-center max-w-md">
            {this.state.error?.message || 'An unexpected error occurred. Please try refreshing the page.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: undefined });
              window.location.reload();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-aegis-mint text-slate-900 rounded-md hover:bg-aegis-mint/80 transition-colors focus-ring"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
