// components/ErrorBoundary.tsx
// Error boundary for graceful handling of component failures

'use client';

import React from 'react';
import * as Sentry from '@sentry/nextjs';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const {componentName = 'Unknown Component'} = this.props;

    Sentry.withScope(scope => {
      scope.setTag('component', componentName);
      scope.setContext('errorInfo', {
        componentStack: errorInfo.componentStack,
      });
      Sentry.captureException(error);
    });

    console.error(`Error in ${componentName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const {fallback, componentName = 'component'} = this.props;

      if (fallback) {
        return fallback;
      }

      return (
        <div className="border border-red-200 dark:border-red-800 rounded-md p-4 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200 text-sm font-medium mb-2">
            <span>⚠️</span>
            <span>Error loading {componentName}</span>
          </div>
          <p className="text-red-600 dark:text-red-300 text-sm">
            Something went wrong. Please try refreshing the page.
          </p>
          <button
            onClick={() => this.setState({hasError: false})}
            className="mt-2 text-sm underline text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-red-100"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
