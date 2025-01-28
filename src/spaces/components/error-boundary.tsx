'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

const DefaultFallback = ({ error, reset }: { error: Error; reset: () => void }) => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-foreground">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
      >
        Try again
      </button>
    </div>
  </div>
)

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <DefaultFallback error={this.state.error!} reset={this.reset} />
      )
    }

    return this.props.children
  }
}
