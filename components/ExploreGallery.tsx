import React, { useEffect, useState } from 'react';
import { Search, Grid, List, Filter, Download, Trash2, Heart, Clock, Code2 } from 'lucide-react';
import { Toast } from './Toaster';

interface ExploreGalleryProps {
  addToast: (message: string, type?: Toast['type']) => void;
}

export const ExploreGallery: React.FC<ExploreGalleryProps> = ({ addToast }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // Mock data
  const mockItems = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    timestamp: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
    resolution: '120x80',
    charset: ['Standard', 'Blocks', 'Binary'][Math.floor(Math.random() * 3)],
  }));

  const handleSelect = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleBatchAction = (action: string) => {
    if (selectedItems.length === 0) return;
    addToast(`${action} ${selectedItems.length} items.`, 'success');
    if (action === 'Deleted') {
      setSelectedItems([]);
      setIsBatchMode(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-bg-main text-text-primary overflow-hidden">
      
      {/* Header & Filters */}
      <div className="h-[80px] border-b border-border bg-bg-surface px-6 md:px-12 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6 flex-1 max-w-2xl">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
              <input 
                 type="text" 
                 placeholder="Search by ID, charset, or date..." 
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
                 className="w-full bg-[#111] border border-[#222] text-sm text-text-primary rounded-full py-2 pl-10 pr-4 outline-none focus:border-primary transition-colors font-mono"
              />
           </div>
           
           <div className="hidden md:flex items-center gap-2">
              <select className="bg-bg-main border border-border text-sm font-mono p-2 rounded-lg outline-none">
                 <option>Sort: Newest</option>
                 <option>Sort: Oldest</option>
              </select>
           </div>
        </div>

        <div className="flex items-center gap-4 ml-4">
           <div className="flex bg-bg-main rounded-lg border border-border p-1">
              <button 
                 onClick={() => setViewMode('grid')} 
                 className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-text-primary'}`}
              >
                 <Grid className="w-4 h-4" />
              </button>
              <button 
                 onClick={() => setViewMode('list')} 
                 className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-text-primary'}`}
              >
                 <List className="w-4 h-4" />
              </button>
           </div>
           <button 
              onClick={() => { setIsBatchMode(!isBatchMode); setSelectedItems([]); }}
              className={`text-xs font-mono font-bold px-3 py-1.5 rounded border transition-colors ${isBatchMode ? 'bg-primary text-bg-main border-primary' : 'border-border text-text-secondary hover:text-text-primary hover:border-text-secondary'}`}
           >
              {isBatchMode ? 'CANCEL BATCH' : 'BATCH OPS'}
           </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="h-[40px] border-b border-border bg-[#0a0a0a] px-6 md:px-12 flex items-center gap-8 text-[11px] font-mono text-text-secondary shrink-0">
         <div className="flex items-center gap-2" title="Total Captures">
            <Code2 className="w-3 h-3 text-primary" /> {mockItems.length} ITEMS
         </div>
         <div className="flex items-center gap-2" title="Storage Used">
            <span>💾</span> 2.4 MB USED
         </div>
      </div>

      {/* Main Content: Gallery Grid/List */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12 relative">
         {/* Batch Operations Bar */}
         {isBatchMode && (
           <div className="sticky top-0 z-40 bg-bg-elevated border border-border rounded-xl p-4 mb-6 flex items-center justify-between shadow-lg animate-slide-up">
              <div className="text-sm font-mono text-primary font-bold">
                 {selectedItems.length} ITEMS SELECTED
              </div>
              <div className="flex gap-2">
                 <button onClick={() => handleBatchAction('Downloaded')} className="btn-secondary py-2 text-xs flex items-center gap-2">
                    <Download className="w-4 h-4" /> EXPORT ZIP
                 </button>
                 <button onClick={() => handleBatchAction('Deleted')} className="btn-secondary py-2 text-xs flex items-center gap-2 !border-error !text-error hover:!bg-error/10">
                    <Trash2 className="w-4 h-4" /> DELETE
                 </button>
              </div>
           </div>
         )}

         <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            : "flex flex-col gap-4 max-w-4xl mx-auto"
         }>
            {mockItems.map((item) => (
              <div 
                 key={item.id} 
                 className={`group relative bg-[#0a0a0a] border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 ${selectedItems.includes(item.id) ? 'border-primary ring-1 ring-primary' : 'border-[#1a1a1a] hover:border-primary/50'}`}
                 onClick={() => isBatchMode && handleSelect(item.id)}
              >
                 {isBatchMode && (
                   <div className="absolute top-3 left-3 z-30">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedItems.includes(item.id) ? 'bg-primary border-primary' : 'border-text-secondary bg-bg-main/50'}`}>
                         {selectedItems.includes(item.id) && <div className="w-2 h-2 bg-bg-main" />}
                      </div>
                   </div>
                 )}
                 
                 <div className={`${viewMode === 'grid' ? 'aspect-[4/5]' : 'h-32'} w-full relative bg-[#111] overflow-hidden`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                       {/* Mock ASCII Content */}
                       <pre className="text-[4px] leading-[4px] text-primary/50 font-mono scale-[2] group-hover:scale-[2.2] transition-transform duration-700">
                          {Array.from({length: 40}).map(() => "@@@@%#*+=-:. \n").join('')}
                       </pre>
                    </div>
                    
                    {/* Hover overlay */}
                    {!isBatchMode && (
                       <div className="absolute inset-0 bg-bg-main/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm z-20">
                          <button className="btn-icon bg-bg-surface border border-border hover:border-primary"><Download className="w-4 h-4" /></button>
                          <button className="btn-icon bg-bg-surface border border-border hover:border-error hover:text-error"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    )}
                 </div>

                 <div className="p-4 border-t border-[#1a1a1a] bg-[#0a0a0a]">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-mono font-bold text-text-primary">CAPTURE_{item.id.toString().padStart(4, '0')}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-[10px] font-mono text-text-secondary">
                       <span className="flex items-center gap-2"><Clock className="w-3 h-3" /> {new Date(item.timestamp).toLocaleDateString()}</span>
                       <div className="flex gap-2 mt-1">
                          <span className="bg-[#1a1a1a] px-1.5 py-0.5 rounded text-primary">{item.charset}</span>
                          <span className="bg-[#1a1a1a] px-1.5 py-0.5 rounded">{item.resolution}</span>
                       </div>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};
