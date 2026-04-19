/**
 * PredictionCard.jsx – Displays a single tumor prediction result.
 * Used on both the Upload page (latest result) and History page (list items).
 *
 * Props:
 *   prediction: {
 *     result:                "Tumor" | "Normal"
 *     probability:           number (0–1)
 *     confidence_percentage: number (0–100)
 *     image_filename:        string
 *     timestamp:             string (ISO date)
 *     prediction_id:         string
 *   }
 *   compact: boolean (true for history list view, false for full card view)
 */

import { useState, useEffect } from 'react';

function formatDate(isoString) {
    return new Date(isoString).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function PredictionCard({ prediction, compact = false, imagePreview = null }) {
    const [barWidth, setBarWidth] = useState('0%');

    const isTumor = prediction.result === 'Tumor';
    const confidence = prediction.confidence_percentage ?? (prediction.probability * 100);

    // Trigger the bar animation after component mounts
    useEffect(() => {
        const timer = setTimeout(() => {
            setBarWidth(`${confidence.toFixed(1)}%`);
        }, 200);
        return () => clearTimeout(timer);
    }, [confidence]);

    return (
        <div className={`glass-card overflow-hidden animate-slide-up ${isTumor ? 'border-danger-500/20 glow-danger' : 'border-safe-500/20 glow-safe'
            } ${compact ? 'p-4' : 'p-6'}`}>

            {/* Header: Result Badge + Date */}
            <div className="flex items-center justify-between mb-4">
                <div className={isTumor ? 'badge-tumor' : 'badge-normal'}>
                    <span className={`w-2 h-2 rounded-full ${isTumor ? 'bg-danger-400' : 'bg-safe-400'} animate-pulse`} />
                    {isTumor ? '⚠️ Tumor Detected' : '✅ No Tumor Detected'}
                </div>
                <span className="text-xs text-white/40">{formatDate(prediction.timestamp)}</span>
            </div>

            {/* Image Preview (only shown on Upload page result card) */}
            {imagePreview && !compact && (
                <div className="mb-4 rounded-xl overflow-hidden border border-white/10 bg-black/30">
                    <div className="relative">
                        <img
                            src={imagePreview}
                            alt="MRI Scan"
                            className="w-full h-48 object-contain"
                        />
                        {/* Scan overlay */}
                        <div className={`absolute inset-0 opacity-20 ${isTumor ? 'bg-gradient-to-b from-danger-500/0 via-danger-500 to-danger-500/0'
                                : 'bg-gradient-to-b from-safe-500/0 via-safe-500 to-safe-500/0'
                            }`} />
                    </div>
                </div>
            )}

            {/* Filename */}
            <div className="flex items-center gap-2 mb-4">
                <svg className="w-4 h-4 text-white/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm text-white/50 truncate">{prediction.image_filename}</span>
            </div>

            {/* Confidence Bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Confidence Score</span>
                    <span className={`font-bold text-lg ${isTumor ? 'text-danger-400' : 'text-safe-400'}`}>
                        {confidence.toFixed(1)}%
                    </span>
                </div>

                {/* Animated probability bar */}
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full probability-bar-fill ${isTumor
                                ? 'bg-gradient-to-r from-danger-600 to-danger-400'
                                : 'bg-gradient-to-r from-safe-600 to-safe-400'
                            }`}
                        style={{ width: barWidth }}
                    />
                </div>

                <div className="flex justify-between text-xs text-white/30 mt-1">
                    <span>0%</span>
                    <span className="text-white/40">50% threshold</span>
                    <span>100%</span>
                </div>
            </div>

            {/* Probability Details (full card only) */}
            {!compact && (
                <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                        <div className="text-xs text-white/40 mb-1">Raw Probability</div>
                        <div className="font-bold text-white">{prediction.probability?.toFixed(4) ?? '—'}</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                        <div className="text-xs text-white/40 mb-1">Classification</div>
                        <div className={`font-bold ${isTumor ? 'text-danger-400' : 'text-safe-400'}`}>
                            {prediction.result}
                        </div>
                    </div>
                </div>
            )}

            {/* Medical Disclaimer (full card) */}
            {!compact && (
                <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                    <p className="text-xs text-yellow-400/80">
                        ⚠️ <strong>Medical Disclaimer:</strong> This is an AI-assisted screening tool only.
                        Results must be reviewed and confirmed by a qualified medical professional.
                    </p>
                </div>
            )}
        </div>
    );
}
