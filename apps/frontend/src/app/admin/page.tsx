'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '@/lib/api';
import { Lock, Unlock, Plus, RefreshCw, Power } from 'lucide-react';

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [commodities, setCommodities] = useState<any[]>([]);
  
  // Login Form
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post(`${API_URL}/admin/login`, {
        identifier: email,
        password: password,
      });
      
      if (res.data.status === 'success') {
        const jwt = res.data.data.accessToken;
        setToken(jwt);
        localStorage.setItem('admin_token', jwt);
        await fetchCommodities(jwt);
      } else {
        setError(res.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchCommodities = async (jwt: string) => {
    try {
      // NOTE: We're reusing the public GET endpoint to fetch list
      const res = await axios.get(`${API_URL}/commodities`);
      if (res.data) setCommodities(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
      fetchCommodities(savedToken);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await axios.patch(
        `${API_URL}/commodities/${id}/status`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Optimistic update
      setCommodities(prev => prev.map(c => 
        c.assetId === id || c.id === id ? { ...c, isActive: !currentStatus } : c
      ));
    } catch (err) {
      alert('Failed to toggle tracking. Check console for details.');
      console.error(err);
    }
  };

  // Add Commodity state
  const [newSymbol, setNewSymbol] = useState('');
  const [newCategory, setNewCategory] = useState('METAL');
  const [newName, setNewName] = useState('');
  
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_URL}/commodities`,
        {
          symbol: newSymbol.toUpperCase(),
          assetId: `MCX_${newSymbol}`,
          name: newName || newSymbol,
          category: newCategory,
          exchange: 'MCX',
          unit: 'INR'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewSymbol('');
      setNewName('');
      await fetchCommodities(token!);
      alert(`Success! Backend Worker requested to HOT-RELOAD subscription for MCX_${newSymbol}.`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add commodity');
    }
  };

  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <form onSubmit={handleLogin} className="w-full max-w-sm rounded-lg bg-gray-900 border border-gray-800 p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <Lock className="mx-auto mb-2 h-10 w-10 text-amber-500" />
            <h1 className="text-2xl font-bold text-white">Admin Access</h1>
            <p className="text-sm text-gray-400">QuantPulse Control Center</p>
          </div>
          
          {error && <div className="mb-4 rounded bg-red-900/30 p-3 text-sm text-red-500 border border-red-800/50">{error}</div>}
          
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-300">Email / Mobile</label>
            <input 
              type="text" 
              className="w-full rounded bg-gray-800 border-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500" 
              value={email} onChange={e => setEmail(e.target.value)} required 
              placeholder="admin@quantpulse.com"
            />
          </div>
          
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-300">Password</label>
            <input 
              type="password" 
              className="w-full rounded bg-gray-800 border-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500" 
              value={password} onChange={e => setPassword(e.target.value)} required 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full rounded bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Unlock className="text-amber-500" /> Administrative Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Manage commodity subscriptions and live worker streams globally.</p>
          </div>
          <button onClick={logout} className="rounded bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 border border-gray-700 transition">
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Add Commodity Panel */}
          <div className="col-span-1 border border-gray-800 bg-gray-900 rounded-lg p-6 shadow-xl h-fit">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 border-b border-gray-800 pb-2">
              <Plus size={20} className="text-green-500" /> Create Tracker
            </h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Exchange Category</label>
                <select 
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
                  value={newCategory} onChange={e => setNewCategory(e.target.value)}
                >
                  <option value="METAL">METAL</option>
                  <option value="ENERGY">ENERGY</option>
                  <option value="AGRI">AGRICULTURE</option>
                  <option value="INDUSTRIAL">INDUSTRIAL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">MCX Symbol (Token)</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-amber-500 uppercase"
                  placeholder="e.g. NATURALGAS" 
                  value={newSymbol} onChange={e => setNewSymbol(e.target.value)} required
                />
                <span className="text-xs text-gray-500 mt-1 block">Asset ID will be auto-prefixed: MCX_{newSymbol.toUpperCase() || '...'}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Display Name</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
                  placeholder="e.g. Natural Gas Futures" 
                  value={newName} onChange={e => setNewName(e.target.value)}
                />
              </div>

              <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-medium py-2 rounded transition-colors mt-2">
                Inject & Hot Reload Worker
              </button>
            </form>
          </div>

          {/* Asset List Panel */}
          <div className="col-span-1 md:col-span-2 border border-gray-800 bg-gray-900 rounded-lg p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-2">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <RefreshCw size={20} className="text-amber-500" /> Active Endpoints
              </h2>
              <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">
                Total: {commodities.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-gray-800/50 text-xs uppercase text-gray-400">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Asset Profile</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Backend DB Stats</th>
                    <th className="px-4 py-3 text-right rounded-tr-lg">Worker Status</th>
                  </tr>
                </thead>
                <tbody>
                  {commodities.map((item) => {
                    const isTracking = item.isActive !== false; // Default true if undefined
                    return (
                      <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-white">{item.name}</div>
                          <div className="text-xs text-gray-500 font-mono tracking-wider">{item.assetId}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-gray-800 border border-gray-700 px-2 py-1 rounded text-xs select-none">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {item.summary24h ? `${item.summary24h.tickCount} Ticks (24h)` : 'No Data'}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          <button
                            onClick={() => toggleStatus(item.id, isTracking)}
                            className={`flex items-center gap-2 justify-end w-full px-3 py-1.5 rounded text-xs transition-colors ${
                              isTracking 
                                ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20' 
                                : 'bg-gray-800 text-gray-500 hover:bg-gray-700 border border-gray-700'
                            }`}
                          >
                            <Power size={14} />
                            {isTracking ? 'Tracking (Live)' : 'Offline / Frozen'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {commodities.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  No commodities loaded in DB.
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
