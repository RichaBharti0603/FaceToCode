import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Terminal, Share2, Home, Zap } from 'lucide-react';
import { trackPH } from '../services/posthogService';

export const SnapshotView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSnapshot = async () => {
      try {
        const response = await fetch(`/api/snapshot?id=${id}`);
        if (!response.ok) throw new Error("Snapshot not found");
        const data = await response.json();
        setContent(data.content);
        setSettings(data.settings);
        
        trackPH('view_snapshot', { id });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSnapshot();
  }, [id]);

  const handleRemix = () => {
    trackPH('remix_click', { id });
    navigate(`/?remix=${id}`);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-green-500 font-mono">
        <div className="w-12 h-12 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="animate-pulse tracking-widest uppercase text-xs">Retrieving Neural Fragment...</p>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-red-500 font-mono p-6 text-center">
        <h1 className="text-2xl font-bold mb-4 uppercase">CRITICAL ERROR: FRAGMENT NOT FOUND</h1>
        <p className="text-xs opacity-60 mb-8 max-w-sm">The requested neural snapshot has been purged or never existed in the current datastream.</p>
        <Link to="/" className="px-6 py-2 border border-red-500 hover:bg-red-500 hover:text-black transition-all text-xs uppercase font-bold">Return to Core</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono selection:bg-green-500 selection:text-black">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full p-4 flex justify-between items-center bg-black/80 backdrop-blur-md border-b border-green-900/30 z-50">
        <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            <h1 className="text-sm font-bold tracking-widest uppercase">Snapshot: {id}</h1>
        </div>
        <div className="flex gap-4">
            <button 
                onClick={handleRemix}
                className="flex items-center gap-2 text-[10px] uppercase text-yellow-500 hover:text-white transition-colors bg-yellow-900/20 px-3 py-1 border border-yellow-500/30 rounded font-black shadow-[0_0_10px_rgba(234,179,8,0.1)] hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]"
            >
                <Zap className="w-3 h-3 animate-pulse text-yellow-400" /> Remix This
            </button>
            <button 
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="flex items-center gap-2 text-[10px] uppercase hover:text-white transition-colors border border-green-500/20 px-3 py-1 rounded"
            >
                <Share2 className="w-3 h-3" /> Copy Link
            </button>
            <Link to="/" className="flex items-center gap-2 text-[10px] uppercase hover:text-white transition-colors bg-green-900/20 px-3 py-1 border border-green-500/30 rounded">
                <Home className="w-3 h-3" /> Core Engine
            </Link>
        </div>
      </div>

      {/* ASCII Content Area */}
      <div className="pt-20 p-8 flex justify-center w-full">
        <pre 
            className="text-[6px] md:text-[8px] leading-[0.7] md:leading-[1] whitespace-pre bg-transparent p-4 border border-green-900/20 rounded-lg shadow-[0_0_50px_rgba(0,255,65,0.05)]"
            style={{ fontFamily: '"Courier New", Courier, monospace', letterSpacing: '0' }}
        >
          {content}
        </pre>
      </div>

      {/* Watermark */}
      <div className="p-8 text-center text-[8px] opacity-20 uppercase tracking-[0.5em]">
          End of Neural Fragment // FaceToCode Visualization
      </div>
    </div>
  );
};
