import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft, Heart, Sparkles, User, Search, Grid } from 'lucide-react';

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
        if (!response.ok) throw new Error("Connection failed");
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 text-slate-900 font-sans p-6 md:p-12 overflow-x-hidden">
      {/* Aesthetic Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 px-4">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-pink-400 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-pink-100/50">
               <Compass className="w-8 h-8 text-pink-500 animate-[spin_20s_linear_infinite]" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-1">Explore Discoveries<span className="text-pink-400">.</span></h1>
            <div className="flex items-center gap-4 text-[10px] text-slate-400 uppercase font-black tracking-widest">
               <span className="flex items-center gap-1"><Grid className="w-3 h-3 text-pink-300" /> Global Stream</span>
               <span className="opacity-30">|</span>
               <span>{snapshots.length} Magic Fragments Detected</span>
            </div>
          </div>
        </div>
        
        <Link 
          to="/" 
          className="group flex items-center gap-3 text-[10px] uppercase font-black tracking-widest bg-white text-slate-900 border border-pink-100 px-10 py-5 transition-all rounded-full shadow-lg hover:shadow-pink-400/10 hover:border-pink-300"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-pink-400" /> Start Capture
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
           <div className="w-12 h-12 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin mb-6" />
           <p className="text-[10px] uppercase tracking-[0.4em] font-black text-pink-300 animate-pulse">Syncing Aesthetic Grid...</p>
        </div>
      ) : snapshots.length === 0 ? (
        <div className="max-w-2xl mx-auto text-center py-32 bg-white/40 backdrop-blur-xl border border-pink-100 rounded-[3rem] shadow-xl">
           <Heart className="w-12 h-12 mx-auto mb-6 text-pink-200" />
           <h2 className="text-2xl font-black tracking-tighter text-slate-900 mb-2">No Fragments Yet</h2>
           <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-8">The discovery feed is currently silent. Be the first to share your magic.</p>
           <Link to="/" className="mt-10 inline-block px-10 py-5 bg-pink-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-pink-500/20 hover:scale-105 transition-all">Begin Sequence</Link>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 px-4">
          {snapshots.map((snap) => (
            <Link 
              key={snap.id} 
              to={`/s/${snap.id}`}
              className="group relative bg-white border border-pink-50 rounded-[2.5rem] overflow-hidden hover:border-pink-200 transition-all shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(244,114,182,0.1)] p-3"
            >
              <div className="aspect-[4/5] w-full bg-slate-50 relative rounded-[2rem] overflow-hidden">
                 {snap.preview_url ? (
                   <img 
                    src={snap.preview_url} 
                    alt="Neural Fragment" 
                    className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
                   />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center opacity-10">
                      <Sparkles className="w-12 h-12 text-pink-400" />
                   </div>
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter truncate max-w-[100px]">
                    ID: {snap.id}
                  </div>
                  <div className="flex items-center gap-1 text-[8px] text-pink-300 font-black uppercase tracking-widest">
                     <User className="w-2 h-2" /> PORTAL_NODE
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-300 group-hover:text-pink-400 transition-colors">
                   <span className="italic">{new Date(snap.created_at).toLocaleDateString()}</span>
                   <span className="tracking-widest">View Magic</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Footer Branding */}
      <div className="max-w-7xl mx-auto mt-40 pt-20 border-t border-pink-100 flex flex-col items-center text-center pb-20">
         <Sparkles className="w-8 h-8 mb-6 text-pink-300 opacity-50" />
         <h3 className="text-[10px] font-black uppercase tracking-[1em] text-slate-900 mb-4 opacity-100">Public Discovery Grid</h3>
         <p className="text-[10px] max-w-lg leading-relaxed uppercase text-slate-400 tracking-[0.2em] px-8">
            Visual representations are high-fidelity captures of aesthetic moments. 
            Join the global stream by authorizing your session.
         </p>
      </div>
    </div>
  );
};
