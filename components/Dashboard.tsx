import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Grid3X3, ArrowLeft, Terminal, Calendar, ExternalLink } from 'lucide-react';
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
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12 border-b border-green-900/30 pb-8">
        <div>
          <div className="flex items-center gap-3 text-2xl font-bold tracking-tighter uppercase mb-1">
            <Grid3X3 className="w-8 h-8" />
            <h1>Neural Archives</h1>
          </div>
          <p className="text-[10px] text-green-800 uppercase tracking-widest leading-none">
            User ID: <span className="text-green-600">{userId.substring(0, 18)}...</span>
          </p>
        </div>
        
        <Link 
          to="/" 
          className="flex items-center gap-2 text-xs uppercase bg-green-900/20 hover:bg-green-500 hover:text-black border border-green-500/30 px-6 py-2 transition-all font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Core
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-50">
           <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
           <p className="text-xs uppercase tracking-[0.3em]">Accessing Datastream...</p>
        </div>
      ) : snapshots.length === 0 ? (
        <div className="text-center py-32 border border-dashed border-green-900/30 rounded-2xl bg-green-900/5">
           <Terminal className="w-12 h-12 mx-auto mb-4 opacity-20" />
           <p className="text-sm uppercase opacity-40">No entries found in your neural history.</p>
           <Link to="/" className="text-[10px] text-green-500 underline mt-4 inline-block hover:text-white uppercase tracking-widest">Start Transmitting</Link>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {snapshots.map((snap) => (
            <Link 
              key={snap.id} 
              to={`/s/${snap.id}`}
              className="group relative bg-green-900/5 border border-green-500/20 overflow-hidden hover:border-green-500/60 transition-all rounded-lg"
            >
              {/* Preview Image */}
              <div className="aspect-[4/3] w-full bg-black relative">
                 {snap.preview_url ? (
                   <img 
                    src={snap.preview_url} 
                    alt="Neural Fragment" 
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0"
                   />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center opacity-20">
                      <Terminal className="w-8 h-8" />
                   </div>
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </div>

              {/* Info Overlay */}
              <div className="p-4 relative">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">{snap.id}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-center gap-2 text-[8px] text-green-800 uppercase">
                   <Calendar className="w-2 h-2" />
                   {new Date(snap.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Hover Effect HUD */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                 <div className="bg-green-500 text-black text-[8px] px-2 py-0.5 font-black uppercase">FRAGMENT_ID: {snap.id}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Footer Meta */}
      <footer className="max-w-6xl mx-auto mt-20 pt-8 border-t border-green-900/10 text-center">
         <p className="text-[8px] opacity-20 uppercase tracking-[0.5em] font-mono">
            FaceToCode Neural Archive System // Local Identity Persistence Active
         </p>
      </footer>
    </div>
  );
};
