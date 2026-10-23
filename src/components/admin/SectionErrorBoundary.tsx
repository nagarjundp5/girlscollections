'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  sectionName: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class SectionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[SectionErrorBoundary] Exception in ${this.props.sectionName}:`, error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50/50 border border-red-200 rounded-2xl text-center space-y-4 my-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-red-900 uppercase tracking-wider">
              {this.props.sectionName} Error
            </h3>
            <p className="text-xs text-red-700 mt-1 max-w-md mx-auto">
              An unexpected error occurred in this admin panel section. Other admin features remain active.
            </p>
            {this.state.error && (
              <p className="text-[10px] font-mono text-red-800 bg-red-100/60 p-2 rounded mt-3 inline-block max-w-lg truncate">
                {this.state.error.message}
              </p>
            )}
          </div>
          <div>
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reload {this.props.sectionName}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
