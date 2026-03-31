'use client';

import React, { type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;
            return (
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/30 bg-red-900/10 p-8 text-center">
                    <p className="text-sm font-black uppercase tracking-widest text-red-400">Something went wrong</p>
                    {this.state.error?.message && (
                        <p className="max-w-sm text-xs text-red-300/70">{this.state.error.message}</p>
                    )}
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="rounded-xl border border-red-500/30 px-6 py-2 text-xs font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        Try again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
