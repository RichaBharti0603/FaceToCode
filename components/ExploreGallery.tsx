import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft, Terminal, TrendingUp, Sparkles, User } from 'lucide-react';

interface Snapshot {
  id: string;
  preview_url: string;
  created_at: string;
}

export const ExploreGallery: React.FC = () => {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExplore = async () => {
      try {
        const response = await fetch('/api/snapshot?explore=true');
        if (!response.ok) throw new Error("Portal connection unstable");
        const data = await response.json();
        setSnapshots(data);
      } catch (err) {
        console.error("Explore fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExplore();
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 md:p-8 selection:bg-green-500 selection:text-black">
      {/* HUD Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 border-b border-green-900/40 pb-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Compass className="w-12 h-12 animate-[spin_10s_linear_infinite]" />
            <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-500 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none mb-2">Discovery Hub</h1>
            <div className="flex items-center gap-4 text-[10px] text-green-800 uppercase tracking-widest font-bold">
               <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Global Stream</span>
               <span className="opacity-30">|</span>
               <span>Neural Fragments Detected: {snapshots.length}</span>
            </div>
          </div>
        </div>
        
        <Link 
          to="/" 
          className="group flex items-center gap-3 text-xs uppercase bg-green-900/10 hover:bg-green-500 hover:text-black border border-green-500/40 px-8 py-3 transition-all font-black rounded-sm shadow-[0_0_20px_rgba(34,197,94,0.1)]"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Sync Core
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
           <div className="w-16 h-16 border-4 border-green-900 border-t-green-500 rounded-full animate-spin mb-6" />
           <p className="text-sm uppercase tracking-[0.5em] animate-pulse">Scanning Global Meshes...</p>
        </div>
      ) : snapshots.length === 0 ? (
        <div className="text-center py-40 border border-dashed border-green-900/40 rounded-3xl bg-green-900/5 backdrop-blur-sm">
           <Terminal className="w-16 h-16 mx-auto mb-6 opacity-10" />
           <h2 className="text-xl font-bold uppercase mb-2 opacity-60">Silent Transmission</h2>
           <p className="text-[10px] uppercase opacity-40 tracking-widest">The global feed is currently dormant. Be the first to broadcast.</p>
           <Link to="/" className="text-xs text-green-500 underline mt-8 inline-block hover:text-white uppercase font-black">Initiate Sequence</Link>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {snapshots.map((snap) => (
            <Link 
              key={snap.id} 
              to={`/s/${snap.id}`}
              className="group relative bg-zinc-950 border border-green-900/30 overflow-hidden hover:border-green-400/80 transition-all shadow-xl hover:shadow-green-500/10"
            >
              {/* Preview Thumbnail */}
              <div className="aspect-square w-full bg-zinc-900 relative">
                 {snap.preview_url ? (
                   <img 
                    src={snap.preview_url} 
                    alt="Neural Fragment" 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 bg-black grayscale group-hover:grayscale-0"
                   />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center opacity-10">
                      <Terminal className="w-12 h-12" />
                   </div>
                 )}
                 {/* Visual Glitch Elements */}
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                 <div className="absolute top-0 left-0 w-full h-px bg-green-500/20 translate-y-[-100%] group-hover:animate-[scan_2s_linear_infinite]" />
              </div>

              {/* Fragment Info */}
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="bg-green-500/10 text-green-400 text-[10px] px-2 py-0.5 border border-green-500/20 font-black uppercase tracking-tighter">
                    {snap.id}
                  </div>
                  <div className="flex items-center gap-1 text-[8px] text-green-900 group-hover:text-green-500 transition-colors uppercase font-bold">
                     <User className="w-2 h-2" /> DATA_NODE
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-green-800 italic">
                   <span>Rec. {new Date(snap.created_at).toLocaleDateString()}</span>
                   <span className="group-hover:text-green-400 transition-colors">View Fragment</span>
                </div>
              </div>

              {/* Hover HUD Overlay */}
              <div className="absolute inset-0 border-2 border-green-500/0 group-hover:border-green-500/20 pointer-events-none transition-all" />
            </Link>
          ))}
        </div>
      )}

      {/* Global Metadata */}
      <div className="max-w-7xl mx-auto mt-32 p-10 border border-green-900/20 bg-green-900/5 flex flex-col items-center text-center">
         <Sparkles className="w-6 h-6 mb-6 opacity-30" />
         <h3 className="text-xs font-black uppercase tracking-[0.8em] mb-4 opacity-40">Public Discovery Grid</h3>
         <p className="text-[9px] max-w-lg leading-relaxed uppercase opacity-30 tracking-widest italic">
            Visual representations are captures of neural responses via the FaceToCode engine. 
            Privacy is maintained unless explicitly broadcast to the global mesh.
         </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(400px); }
        }
      `}} />
    </div>
  );
};
