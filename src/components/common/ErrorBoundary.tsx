import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary] Uncaught render error:', error, errorInfo);
  }

  handleReload = () => {
    try {
      localStorage.removeItem('scc_current_user_v1');
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#0f172a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: 'Inter, system-ui, sans-serif',
            color: '#f8fafc',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 22,
              color: '#fff',
              marginBottom: 24,
              boxShadow: '0 0 30px rgba(99,102,241,0.3)',
            }}
          >
            SC
          </div>

          <h1
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: '#f8fafc',
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              fontSize: 13,
              color: '#94a3b8',
              textAlign: 'center',
              maxWidth: 400,
              marginBottom: 24,
              lineHeight: 1.6,
            }}
          >
            Smart Campus Companion encountered an unexpected error. Clearing the session and reloading should fix it.
          </p>

          {this.state.error && (
            <pre
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 12,
                padding: '12px 16px',
                fontSize: 11,
                color: '#f87171',
                maxWidth: 480,
                overflow: 'auto',
                marginBottom: 24,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {this.state.error.toString()}
              {this.state.errorInfo?.componentStack
                ? '\n\nComponent Stack:' + this.state.errorInfo.componentStack.slice(0, 600)
                : ''}
            </pre>
          )}

          <button
            onClick={this.handleReload}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '12px 28px',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
            }}
          >
            Clear Session &amp; Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
