/**
 * History.jsx – Displays the user's complete prediction history.
 * Fetches from GET /history and shows a sortable, filterable list.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { historyService } from '../services/api';
import PredictionCard from '../components/PredictionCard';

export default function History() {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all' | 'tumor' | 'normal'
    const [error, setError] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await historyService.getHistory();
            setHistory(response.data.predictions || []);
        } catch (err) {
            const message = err.response?.data?.detail || 'Failed to load history. Please try again.';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredHistory = history.filter((item) => {
        if (filter === 'tumor') return item.result === 'Tumor';
        if (filter === 'normal') return item.result === 'Normal';
        return true;
    });

    const tumorCount = history.filter((h) => h.result === 'Tumor').length;
    const normalCount = history.filter((h) => h.result === 'Normal').length;

    return (
        <div className="min-h-screen bg-dark-900 pt-24 pb-12 px-4">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in">
                    <div>
                        <h1 className="section-title mb-1">
                            Scan <span className="text-gradient">History</span>
                        </h1>
                        <p className="text-white/50">Your complete MRI analysis record</p>
                    </div>
                    <Link to="/upload" className="btn-primary self-start md:self-auto !py-2.5">
                        + New Analysis
                    </Link>
                </div>

                {/* Stats Row */}
                {!isLoading && history.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mb-8 animate-slide-up">
                        <div className="glass-card p-4 text-center">
                            <div className="text-2xl font-bold font-display text-white">{history.length}</div>
                            <div className="text-xs text-white/40 mt-1">Total Scans</div>
                        </div>
                        <div className="glass-card p-4 text-center border-danger-500/20">
                            <div className="text-2xl font-bold font-display text-danger-400">{tumorCount}</div>
                            <div className="text-xs text-white/40 mt-1">Tumor Detected</div>
                        </div>
                        <div className="glass-card p-4 text-center border-safe-500/20">
                            <div className="text-2xl font-bold font-display text-safe-400">{normalCount}</div>
                            <div className="text-xs text-white/40 mt-1">Normal Results</div>
                        </div>
                    </div>
                )}

                {/* Filter Tabs */}
                {!isLoading && history.length > 0 && (
                    <div className="flex gap-2 mb-6">
                        {[
                            { key: 'all', label: `All (${history.length})` },
                            { key: 'tumor', label: `Tumor (${tumorCount})` },
                            { key: 'normal', label: `Normal (${normalCount})` },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${filter === tab.key
                                        ? 'bg-primary-600/30 text-primary-400 border border-primary-500/30'
                                        : 'bg-white/5 text-white/50 border border-white/10 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content */}
                {isLoading ? (
                    /* Loading skeleton */
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="glass-card p-5 space-y-3">
                                <div className="flex justify-between">
                                    <div className="h-7 w-36 rounded-full animate-shimmer" />
                                    <div className="h-4 w-20 rounded animate-shimmer" />
                                </div>
                                <div className="h-4 w-48 rounded animate-shimmer" />
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <div className="h-4 w-28 rounded animate-shimmer" />
                                        <div className="h-4 w-12 rounded animate-shimmer" />
                                    </div>
                                    <div className="h-3 w-full rounded-full animate-shimmer" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    /* Error State */
                    <div className="glass-card p-12 text-center">
                        <div className="text-5xl mb-4">❌</div>
                        <h3 className="text-white font-semibold text-lg mb-2">Failed to Load History</h3>
                        <p className="text-white/50 text-sm mb-6">{error}</p>
                        <button onClick={fetchHistory} className="btn-primary">Try Again</button>
                    </div>
                ) : history.length === 0 ? (
                    /* Empty State */
                    <div className="glass-card p-16 text-center animate-fade-in">
                        <div className="text-7xl mb-6 animate-float">🧬</div>
                        <h3 className="text-white font-semibold text-2xl mb-3">No Scans Yet</h3>
                        <p className="text-white/50 text-base mb-8 max-w-sm mx-auto">
                            You haven&lsquo;t uploaded any MRI scans yet. Start your first analysis to see your results here.
                        </p>
                        <Link to="/upload" className="btn-primary text-base px-8 py-3">
                            Upload Your First MRI
                        </Link>
                    </div>
                ) : filteredHistory.length === 0 ? (
                    /* No results for filter */
                    <div className="glass-card p-12 text-center animate-fade-in">
                        <div className="text-5xl mb-4">🔍</div>
                        <h3 className="text-white font-semibold text-lg mb-2">No {filter === 'tumor' ? 'Tumor' : 'Normal'} Results</h3>
                        <p className="text-white/50 text-sm mb-4">
                            You don&lsquo;t have any scans with &ldquo;{filter === 'tumor' ? 'Tumor' : 'Normal'}&rdquo; results.
                        </p>
                        <button onClick={() => setFilter('all')} className="btn-secondary !py-2 !px-4 text-sm">
                            Show All Results
                        </button>
                    </div>
                ) : (
                    /* History Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-fade-in">
                        {filteredHistory.map((item, idx) => (
                            <div key={item.prediction_id} style={{ animationDelay: `${idx * 0.05}s` }}>
                                <PredictionCard prediction={item} compact={true} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Refresh button */}
                {!isLoading && history.length > 0 && (
                    <div className="mt-8 text-center">
                        <button
                            onClick={fetchHistory}
                            className="text-sm text-white/40 hover:text-white/70 flex items-center gap-2 mx-auto transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh History
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
