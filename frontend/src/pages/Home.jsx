/**
 * Home.jsx – Landing page with hero section, features, and CTA.
 * This is the first page visitors see. It must be visually impressive.
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
    {
        icon: '🧠',
        title: 'Deep Learning AI',
        description: 'Powered by a Convolutional Neural Network trained on thousands of MRI brain scans for accurate classification.',
    },
    {
        icon: '⚡',
        title: 'Instant Analysis',
        description: 'Get tumor detection results in seconds. Upload your MRI scan and our AI processes it in real time.',
    },
    {
        icon: '🔒',
        title: 'Secure & Private',
        description: 'Your medical data is stored securely with JWT authentication. Only you can access your scan history.',
    },
    {
        icon: '📊',
        title: 'Confidence Score',
        description: 'Receive a detailed confidence percentage alongside each prediction for informed clinical decision-making.',
    },
    {
        icon: '📁',
        title: 'Prediction History',
        description: 'All your past scans are saved and organized chronologically so you can track changes over time.',
    },
    {
        icon: '🏥',
        title: 'Clinical Support',
        description: 'Designed as a screening aid to support radiologists and healthcare professionals—not replace them.',
    },
];

const stats = [
    { value: '95%+', label: 'Model Accuracy' },
    { value: '< 3s', label: 'Inference Time' },
    { value: 'CNN', label: 'Architecture' },
    { value: '2-Class', label: 'Classification' },
];

export default function Home() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-dark-900">

            {/* ── Hero Section ──────────────────────────────────────────────────────── */}
            <section className="relative pt-32 pb-20 px-4 overflow-hidden">
                {/* Background gradient orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl" />
                </div>

                {/* Hero pattern overlay */}
                <div className="absolute inset-0 bg-hero-pattern opacity-30 pointer-events-none" />

                <div className="relative max-w-5xl mx-auto text-center">
                    {/* Tag */}
                    <div className="inline-flex items-center gap-2 bg-primary-500/15 border border-primary-500/30 rounded-full px-4 py-2 text-sm text-primary-400 font-medium mb-8 animate-fade-in">
                        <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
                        AI-Powered Medical Imaging Analysis
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl font-display font-black text-white leading-tight mb-6 animate-slide-up">
                        Detect Brain Tumors
                        <br />
                        <span className="text-gradient">with AI Precision</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-xl md:text-2xl text-white/50 max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in">
                        Upload an MRI brain scan and receive an instant AI-powered tumor detection result
                        with clinical-grade confidence scoring.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
                        {isAuthenticated ? (
                            <Link to="/upload" className="btn-primary text-lg px-8 py-4 glow-primary group">
                                <span className="flex items-center gap-2">
                                    Upload MRI Scan
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                            </Link>
                        ) : (
                            <>
                                <Link to="/signup" className="btn-primary text-lg px-8 py-4 glow-primary group">
                                    <span className="flex items-center gap-2">
                                        Start Free Analysis
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                </Link>
                                <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Stats Row */}
                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                        {stats.map((stat) => (
                            <div key={stat.label} className="glass-card p-4 text-center">
                                <div className="text-2xl font-bold font-display text-gradient">{stat.value}</div>
                                <div className="text-xs text-white/40 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features Section ──────────────────────────────────────────────────── */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="section-title mb-4">
                            Why Choose <span className="text-gradient">BrainTumor AI</span>?
                        </h2>
                        <p className="text-white/50 text-lg max-w-2xl mx-auto">
                            Combining state-of-the-art deep learning with an intuitive interface
                            designed for both clinicians and patients.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className="glass-card p-6 hover:border-primary-500/30 hover:glow-primary transition-all duration-300 group cursor-default"
                            >
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How It Works ──────────────────────────────────────────────────────── */}
            <section className="py-20 px-4 bg-white/[0.02] border-y border-white/5">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="section-title mb-4">How It <span className="text-gradient">Works</span></h2>
                        <p className="text-white/50 text-lg">Three simple steps to AI-powered tumor detection</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connecting line */}
                        <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-px bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" />

                        {[
                            { step: '01', title: 'Create Account', desc: 'Register securely and log in to your personal dashboard.', icon: '👤' },
                            { step: '02', title: 'Upload MRI Scan', desc: 'Drag & drop or click to upload your brain MRI image (JPG/PNG).', icon: '📤' },
                            { step: '03', title: 'Get AI Results', desc: 'Receive instant prediction with confidence score and history storage.', icon: '🔬' },
                        ].map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center text-2xl mb-4 shadow-lg shadow-primary-500/20">
                                        {item.icon}
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary-900 border border-primary-500 flex items-center justify-center text-xs font-bold text-primary-400">
                                        {item.step}
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Section ───────────────────────────────────────────────────────── */}
            <section className="py-24 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="glass-card p-12 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-purple-600/10" />
                        <div className="relative">
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                                Ready to Get <span className="text-gradient">Started?</span>
                            </h2>
                            <p className="text-white/50 text-lg mb-8">
                                Join thousands of healthcare professionals using AI-powered brain tumor detection.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                {isAuthenticated ? (
                                    <Link to="/upload" className="btn-primary text-lg px-8 py-4">Upload Your First MRI</Link>
                                ) : (
                                    <>
                                        <Link to="/signup" className="btn-primary text-lg px-8 py-4">Create Free Account</Link>
                                        <Link to="/login" className="btn-secondary text-lg px-8 py-4">Sign In</Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Footer ────────────────────────────────────────────────────────────── */}
            <footer className="border-t border-white/10 py-8 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-white/40 text-sm">
                        © 2024 BrainTumor AI. For educational and screening purposes only.
                    </div>
                    <div className="text-white/30 text-xs text-center">
                        ⚠️ Not a substitute for professional medical diagnosis.
                    </div>
                </div>
            </footer>
        </div>
    );
}
