/**
 * Upload.jsx – MRI scan upload page with drag & drop, preview, and prediction result.
 * This is the core feature page of the application.
 */

import { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { predictionService } from '../services/api';
import PredictionCard from '../components/PredictionCard';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff', 'image/webp'];
const MAX_SIZE_MB = 10;

export default function Upload() {
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [prediction, setPrediction] = useState(null);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    const processFile = useCallback((selectedFile) => {
        setError('');
        setPrediction(null);

        if (!ALLOWED_TYPES.includes(selectedFile.type)) {
            setError('Unsupported file type. Please upload JPG, PNG, BMP, TIFF, or WebP.');
            return;
        }

        if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`File too large. Maximum size is ${MAX_SIZE_MB}MB.`);
            return;
        }

        setFile(selectedFile);
        // Generate a local preview URL
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(selectedFile);
    }, []);

    // ── Drag & Drop Handlers ─────────────────────────────────────────────────────
    const handleDragEnter = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDragOver = (e) => { e.preventDefault(); };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) processFile(dropped);
    };

    const handleFileInput = (e) => {
        const selected = e.target.files[0];
        if (selected) processFile(selected);
    };

    const handleReset = () => {
        setFile(null);
        setImagePreview(null);
        setPrediction(null);
        setError('');
        setUploadProgress(0);
        if (inputRef.current) inputRef.current.value = '';
    };

    // ── Submit to API ─────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) { setError('Please select an MRI image first.'); return; }

        setIsLoading(true);
        setUploadProgress(0);
        setPrediction(null);
        setError('');

        try {
            const response = await predictionService.predict(file, setUploadProgress);
            setPrediction(response.data);
            const result = response.data.result;
            if (result === 'Tumor') {
                toast.error('⚠️ Tumor detected! Please consult a doctor.', { duration: 6000 });
            } else {
                toast.success('✅ No tumor detected in this scan.', { duration: 4000 });
            }
        } catch (err) {
            const message = err.response?.data?.detail || 'Analysis failed. Please try again.';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="min-h-screen bg-dark-900 pt-24 pb-12 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10 animate-fade-in">
                    <h1 className="section-title mb-3">
                        MRI <span className="text-gradient">Analysis</span>
                    </h1>
                    <p className="text-white/50 text-lg">
                        Upload a brain MRI scan and our AI will analyze it for tumor presence.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Upload */}
                    <div className="space-y-6 animate-slide-up">
                        <div className="glass-card p-6">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-sm">1</span>
                                Select MRI Image
                            </h2>

                            {/* Drag & Drop Zone */}
                            <div
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => !file && inputRef.current?.click()}
                                className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden
                  ${isDragging
                                        ? 'border-primary-400 bg-primary-400/10 scale-[1.02]'
                                        : file
                                            ? 'border-primary-500/40 bg-primary-500/5 cursor-default'
                                            : 'border-white/20 bg-white/[0.02] hover:border-primary-400/50 hover:bg-primary-400/5'
                                    }`}
                            >
                                {imagePreview ? (
                                    /* Image Preview */
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Selected MRI"
                                            className="w-full h-56 object-contain bg-black/30"
                                        />
                                        {/* Animated scan bar */}
                                        {!isLoading && (
                                            <div className="absolute inset-x-0 h-0.5 bg-primary-400/40 blur-sm animate-scan top-0" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
                                                <span className="text-xs text-white/70 truncate max-w-[180px]">{file?.name}</span>
                                            </div>
                                            <span className="text-xs text-white/50">{(file?.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </div>
                                    </div>
                                ) : (
                                    /* Drop Zone Empty State */
                                    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                                        <div className={`w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-4 transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
                                            <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-white font-medium mb-1">
                                            {isDragging ? 'Drop your MRI here!' : 'Drag & drop your MRI scan'}
                                        </p>
                                        <p className="text-white/40 text-sm mb-4">or click to browse files</p>
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {['JPG', 'PNG', 'BMP', 'TIFF', 'WebP'].map((ext) => (
                                                <span key={ext} className="text-xs bg-white/5 border border-white/10 rounded px-2 py-0.5 text-white/40">
                                                    .{ext}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-xs text-white/30 mt-2">Max file size: 10MB</p>
                                    </div>
                                )}
                            </div>

                            <input
                                ref={inputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileInput}
                                className="hidden"
                                id="mri-file-input"
                            />

                            {/* Error */}
                            {error && (
                                <div className="mt-3 bg-danger-500/15 border border-danger-500/30 rounded-xl px-4 py-3 text-danger-400 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-4 flex gap-3">
                                {file && (
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="btn-secondary flex-1 !py-2.5 text-sm"
                                        disabled={isLoading}
                                    >
                                        ✕ Remove
                                    </button>
                                )}
                                {!file && (
                                    <button
                                        type="button"
                                        onClick={() => inputRef.current?.click()}
                                        className="btn-secondary flex-1 !py-2.5 text-sm"
                                    >
                                        Browse Files
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className={`btn-primary flex-1 !py-2.5 text-sm ${!file ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={!file || isLoading}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Analyzing...
                                        </span>
                                    ) : '🔬 Analyze MRI'}
                                </button>
                            </div>

                            {/* Upload Progress Bar */}
                            {isLoading && uploadProgress > 0 && (
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs text-white/50 mb-1">
                                        <span>Uploading...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Guidelines Card */}
                        <div className="glass-card p-5">
                            <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Image Guidelines
                            </h3>
                            <ul className="space-y-1.5 text-xs text-white/40">
                                {[
                                    'Use axial (top-down) or coronal MRI views for best results',
                                    'Images should be clear and unobstructed',
                                    'FLAIR or T1-weighted sequences are recommended',
                                    'Minimum resolution: 64×64 pixels',
                                    'Remove any patient information overlays if possible',
                                ].map((tip, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-primary-500 mt-0.5">•</span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Result / Empty State */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        {prediction ? (
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-lg bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-sm">2</span>
                                    Analysis Result
                                </h2>
                                <PredictionCard prediction={prediction} imagePreview={imagePreview} />
                                <Link to="/history" className="btn-secondary w-full block text-center !py-2.5 text-sm">
                                    View All Past Scans →
                                </Link>
                            </div>
                        ) : (
                            /* Empty state while waiting */
                            <div className="glass-card h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8">
                                {isLoading ? (
                                    <div className="space-y-4">
                                        {/* Brain scan animation */}
                                        <div className="relative w-24 h-24 mx-auto">
                                            <div className="absolute inset-0 rounded-full border-4 border-primary-500/20 animate-ping" />
                                            <div className="absolute inset-2 rounded-full border-4 border-primary-500/30 animate-spin" />
                                            <div className="absolute inset-0 flex items-center justify-center text-4xl">🧠</div>
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold text-lg">AI is analyzing...</p>
                                            <p className="text-white/40 text-sm mt-1">Running CNN model inference on your MRI scan</p>
                                        </div>
                                        {/* Animated loading dots */}
                                        <div className="flex items-center justify-center gap-1">
                                            {[0, 1, 2].map((i) => (
                                                <div
                                                    key={i}
                                                    className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
                                                    style={{ animationDelay: `${i * 0.15}s` }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 opacity-50">
                                        <div className="text-6xl animate-float">🔬</div>
                                        <div>
                                            <p className="text-white font-medium">No analysis yet</p>
                                            <p className="text-white/50 text-sm mt-1">
                                                Upload an MRI scan and click<br />&ldquo;Analyze MRI&rdquo; to see results here.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
