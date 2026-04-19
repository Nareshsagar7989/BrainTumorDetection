import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminPanel() {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'users', 'scans', 'model'
    
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [modelStatus, setModelStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch data based on active tab
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                if (activeTab === 'stats') {
                    const res = await fetch('http://localhost:8000/admin/stats', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setStats(data.metrics);
                    }
                } else if (activeTab === 'users') {
                    const res = await fetch('http://localhost:8000/admin/users', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) setUsers(await res.json());
                } else if (activeTab === 'scans') {
                    const res = await fetch('http://localhost:8000/admin/predictions', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) setPredictions(await res.json());
                } else if (activeTab === 'model') {
                    fetchModelStatus();
                }
            } catch (error) {
                toast.error('Failed to load admin data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [activeTab, token]);

    const fetchModelStatus = async () => {
        try {
            const res = await fetch('http://localhost:8000/admin/model/status', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setModelStatus(await res.json());
        } catch (error) {
            console.error("Failed to fetch model status", error);
        }
    };

    const triggerRetrain = async () => {
        try {
            const res = await fetch('http://localhost:8000/admin/model/retrain', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Model training triggered successfully');
                fetchModelStatus(); // Refresh status immediately
            } else {
                toast.error(data.detail || 'Failed to start training');
            }
        } catch (error) {
            toast.error('Server error triggering training');
        }
    };

    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-white">Admin Control Panel</h1>
                <p className="text-white/60 mt-2">Manage users, view system-wide predictions, and monitor AI training.</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-white/5 p-1 rounded-xl mb-8 w-max border border-white/10 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('stats')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'stats' ? 'bg-primary-600 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                >
                    Dashboard Stats
                </button>
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-primary-600 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                >
                    User Management
                </button>
                <button 
                    onClick={() => setActiveTab('scans')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'scans' ? 'bg-primary-600 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                >
                    Global Scans
                </button>
                <button 
                    onClick={() => setActiveTab('model')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'model' ? 'bg-primary-600 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                >
                    Model Training
                </button>
            </div>

            {isLoading && activeTab !== 'model' ? (
                <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
                <div className="bg-dark-800 rounded-2xl border border-white/10 shadow-2xl p-6">
                    {/* ──── STATS TAB ──── */}
                    {activeTab === 'stats' && stats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                                <p className="text-white/50 text-sm font-medium mb-1">Total Users</p>
                                <p className="text-4xl font-display font-bold text-white">{stats.total_users}</p>
                            </div>
                            <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                                <p className="text-white/50 text-sm font-medium mb-1">Global Predictions</p>
                                <p className="text-4xl font-display font-bold text-white">{stats.total_predictions}</p>
                            </div>
                            <div className="bg-danger-500/10 p-6 rounded-xl border border-danger-500/20">
                                <p className="text-danger-400 text-sm font-medium mb-1">Tumors Detected</p>
                                <p className="text-4xl font-display font-bold text-danger-50">{stats.tumor_detections}</p>
                            </div>
                            <div className="bg-primary-500/10 p-6 rounded-xl border border-primary-500/20">
                                <p className="text-primary-400 text-sm font-medium mb-1">Detection Rate</p>
                                <p className="text-4xl font-display font-bold text-primary-50">{stats.tumor_ratio_percentage}%</p>
                            </div>
                        </div>
                    )}

                    {/* ──── USERS TAB ──── */}
                    {activeTab === 'users' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="p-4 text-white/50 font-medium text-sm">Username</th>
                                        <th className="p-4 text-white/50 font-medium text-sm">Email</th>
                                        <th className="p-4 text-white/50 font-medium text-sm">Role</th>
                                        <th className="p-4 text-white/50 font-medium text-sm">Status</th>
                                        <th className="p-4 text-white/50 font-medium text-sm">Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u._id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="p-4 text-white font-medium">{u.username}</td>
                                            <td className="p-4 text-white/70">{u.email}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-primary-500/20 text-primary-400' : 'bg-white/10 text-white/60'}`}>
                                                    {u.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${u.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {u.is_active ? 'ACTIVE' : 'BANNED'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-white/50 text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-white/50">No users found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ──── SCANS TAB ──── */}
                    {activeTab === 'scans' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="p-4 text-white/50 font-medium text-sm">Image</th>
                                        <th className="p-4 text-white/50 font-medium text-sm">User ID</th>
                                        <th className="p-4 text-white/50 font-medium text-sm">Result</th>
                                        <th className="p-4 text-white/50 font-medium text-sm">Confidence</th>
                                        <th className="p-4 text-white/50 font-medium text-sm">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {predictions.map(p => (
                                        <tr key={p._id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="p-4 text-white">{p.image_filename}</td>
                                            <td className="p-4 text-white/70 text-xs font-mono">{p.user_id}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${p.result === 'Tumor' ? 'bg-danger-500/20 text-danger-400' : 'bg-green-500/20 text-green-400'}`}>
                                                    {p.result}
                                                </span>
                                            </td>
                                            <td className="p-4 text-white/70">{p.confidence_percentage}%</td>
                                            <td className="p-4 text-white/50 text-sm">{new Date(p.timestamp).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ──── MODEL TRAINING TAB ──── */}
                    {activeTab === 'model' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-white">CNN Model Retraining</h2>
                                    <p className="text-white/60 text-sm mt-1">Status: <span className={`font-bold uppercase ${modelStatus?.status === 'training' ? 'text-primary-400' : 'text-green-400'}`}>{modelStatus?.status || 'UNKNOWN'}</span></p>
                                </div>
                                <button 
                                    onClick={triggerRetrain}
                                    disabled={modelStatus?.status === 'training'}
                                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {modelStatus?.status === 'training' ? 'Training...' : 'Trigger Retrain Now'}
                                </button>
                            </div>

                            <div className="bg-black/50 rounded-xl border border-white/10 p-4 font-mono text-sm text-green-400 h-96 overflow-y-auto">
                                {!modelStatus?.logs?.length ? (
                                    <p className="text-white/30">No recent training logs across this server session.</p>
                                ) : (
                                    modelStatus.logs.map((log, i) => (
                                        <div key={i} className="mb-1 leading-relaxed">{log}</div>
                                    ))
                                )}
                            </div>
                            
                            {modelStatus?.status === 'training' && (
                                <div className="mt-4 flex items-center justify-between text-white/50 text-sm">
                                    <span>Fetching logs automatically...</span>
                                    <button onClick={fetchModelStatus} className="text-primary-400 hover:text-primary-300 underline">Refresh Logs</button>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
