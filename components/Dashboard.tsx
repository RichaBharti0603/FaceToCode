import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Archive, ArrowLeft, Heart, Calendar, ExternalLink, Sparkles, User } from 'lucide-react';
import { getOrInitializeUserId } from '../utils/identity';

interface Snapshot {
  id: string;
  preview_url: string;
  created_at: string;
}

export const Dashboard: React.FC = () => {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = getOrInitializeUserId();

  useEffect(() => {
    const fetchMySnapshots = async () => {
      try {
        const response = await fetch(`/api/snapshot?userId=${userId}`);
        if (!response.ok) throw new Error("Connection failed");
        const data = await response.json();
        setSnapshots(data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMySnapshots();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 text-slate-900 font-sans p-6 md:p-12 overflow-x-hidden">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 px-4">
        <div>
          <div className="flex items-center gap-4 text-3xl font-black tracking-tighter text-slate-900 mb-2">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-pink-100">
               <Archive className="w-8 h-8 text-pink-400" />
            </div>
            <h1>Your Archives<span className="text-pink-400">.</span></h1>
          </div>
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none px-1">
            Identity Node: <span className="text-pink-300">{userId.substring(0, 12)}...</span>
          </p>
        </div>
        
        <Link 
          to="/" 
          className="group flex items-center gap-3 text-[10px] uppercase font-black tracking-widest bg-white text-slate-900 border border-pink-100 px-10 py-5 transition-all rounded-full shadow-lg hover:shadow-pink-400/10 hover:border-pink-300"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-pink-400" /> Back to Core
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
           <div className="w-12 h-12 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin mb-6" />
           <p className="text-[10px] uppercase tracking-[0.4em] font-black text-pink-300 animate-pulse">Scanning Archive Grid...</p>
        </div>
      ) : snapshots.length === 0 ? (
        <div className="max-w-2xl mx-auto text-center py-32 bg-white/40 backdrop-blur-xl border border-pink-100 rounded-[3rem] shadow-xl px-12">
           <Heart className="w-12 h-12 mx-auto mb-6 text-pink-100" />
           <h2 className="text-2xl font-black tracking-tighter text-slate-900 mb-2">Empty Archive</h2>
           <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-relaxed">No aesthetic fragments found in your neural history. Begin your journey to fill this space.</p>
           <Link to="/" className="mt-10 inline-block px-10 py-5 bg-pink-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-pink-500/20 hover:scale-105 transition-all">New Session</Link>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 px-4">
          {snapshots.map((snap) => (
            <Link 
              key={snap.id} 
              to={`/s/${snap.id}`}
              className="group relative bg-white border border-pink-50 rounded-[2.5rem] overflow-hidden hover:border-pink-200 transition-all shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(244,114,182,0.1)] p-3"
            >
              {/* Preview Image */}
              <div className="aspect-[4/3] w-full bg-slate-50 relative rounded-[2rem] overflow-hidden">
                 {snap.preview_url ? (
                   <img 
                    src={snap.preview_url} 
                    alt="Neural Fragment" 
                    className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
                   />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center opacity-10">
                      <Archive className="w-12 h-12 text-pink-400" />
                   </div>
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
              </div>

              {/* Info Block */}
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                   <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter truncate max-w-[100px]">{snap.id}</span>
                   </div>
                   <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-pink-400 transition-colors" />
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-300 uppercase font-bold italic tracking-wide">
                   <Calendar className="w-4 h-4 opacity-50" />
                   {new Date(snap.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Unique Fragment ID Tag */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                 <div className="bg-slate-900 text-white text-[8px] px-3 py-1.5 font-bold uppercase rounded-full tracking-widest shadow-xl">
                    ID: {snap.id}
                 </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Footer Branding */}
      <footer className="max-w-6xl mx-auto mt-40 pt-20 border-t border-pink-100 flex flex-col items-center text-center pb-20 px-8">
         <Sparkles className="w-8 h-8 mb-6 text-pink-300 opacity-50" />
         <h3 className="text-[10px] font-black uppercase tracking-[1em] text-slate-900 mb-4">Neural Archive Grid</h3>
         <p className="text-[10px] max-w-sm leading-relaxed uppercase text-slate-400 tracking-[0.2em]">
            FaceToCode Persistence Engine // Local Identity Authorized Active // Secure Fragments
         </p>
      </footer>
    </div>
  );
};
