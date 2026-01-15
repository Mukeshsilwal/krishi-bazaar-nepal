import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class RouteErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('RouteErrorBoundary caught an error:', error);
        console.error('Component stack:', errorInfo.componentStack);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        // Optionally trigger a re-fetch or just re-render children
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="h-full w-full min-h-[400px] flex flex-col items-center justify-center p-6 bg-red-50/50 rounded-xl border border-red-100 m-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                        यो खण्ड लोड गर्न सकिएन
                    </h3>
                    <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
                        Unable to load this section. Please try again.
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <span className="block mt-2 text-xs font-mono text-red-700 bg-red-50 p-2 rounded text-left w-full break-all">
                                {this.state.error.message}
                            </span>
                        )}
                    </p>

                    <Button
                        onClick={this.handleRetry}
                        variant="outline"
                        className="gap-2 border-red-200 hover:bg-red-50 text-red-700 hover:text-red-800"
                    >
                        <RefreshCw className="w-4 h-4" />
                        पुन: प्रयास गर्नुहोस् (Retry)
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default RouteErrorBoundary;
