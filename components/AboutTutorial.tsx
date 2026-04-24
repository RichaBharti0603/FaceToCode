import React, { useState } from 'react';
import { Play, ChevronDown, ChevronRight, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutTutorial: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState('general');

  const faqs = [
    { id: 0, category: 'general', q: 'How do I allow camera access?', a: 'When you first open FaceToCode, your browser will show a permission dialog asking for camera access.\n\nChrome/Edge: Click "Allow" in the popup\nFirefox: Click "Allow" in the notification\nSafari: Go to Settings → Websites → Camera → Allow\n\nIf you accidentally blocked, click the camera icon in your browser\'s address bar and change to "Allow".' },
    { id: 1, category: 'technical', q: 'Why is my ASCII output flickering?', a: 'Flickering is usually caused by auto-exposure or auto-white-balance fighting with changes in lighting. Try locking these in your camera settings or ensure you are in a well-lit environment.' },
    { id: 2, category: 'general', q: 'Can I use this without a webcam?', a: 'Currently, FaceToCode requires a webcam for live interaction. However, future updates will include image upload support.' },
    { id: 3, category: 'general', q: 'How do I change the character set?', a: 'Open the "Settings" panel while on the Camera view, navigate to the "ASCII" tab, and select from standard presets or define your own characters.' },
    { id: 4, category: 'privacy', q: 'Is my video data sent to any server?', a: 'No! Everything runs entirely locally in your browser. We never transmit or store your video feed or ASCII creations unless you explicitly choose to share them.' },
  ];

  return (
    <div className="min-h-screen bg-bg-main text-text-primary font-sans overflow-x-hidden pt-8 pb-20 relative">
      <div className="fixed top-[64px] left-0 w-full h-[3px] bg-[#2a2a2a] z-40">
        <div className="h-full bg-primary" style={{ width: '30%' }} /> {/* Mock progress */}
      </div>

      <div className="max-w-4xl mx-auto px-6">
        
        {/* HERO SECTION */}
        <section className="text-center py-16 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Turn yourself into text art <br/><span className="text-primary">— one frame at a time</span>
          </h1>
          <div className="flex justify-center gap-4 mt-8">
            <Link to="/camera" className="btn-primary flex items-center gap-2">
              <Play size={16} fill="currentColor" /> Take me to Camera
            </Link>
          </div>
        </section>

        {/* TABLE OF CONTENTS */}
        <section className="bg-bg-surface border border-border p-4 rounded-xl flex flex-wrap justify-center gap-4 text-sm font-mono text-text-secondary mb-20 animate-slide-up">
          <a href="#what-is" className="hover:text-primary transition-colors">What is ASCII Art?</a>
          <span className="text-border">|</span>
          <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
          <span className="text-border">|</span>
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <span className="text-border">|</span>
          <a href="#tutorial" className="hover:text-primary transition-colors">Tutorial</a>
          <span className="text-border">|</span>
          <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
          <span className="text-border">|</span>
          <a href="#tips" className="hover:text-primary transition-colors">Tips</a>
        </section>

        {/* SECTION 1: WHAT IS ASCII ART */}
        <section id="what-is" className="mb-24 animate-slide-up">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-4">
            <span className="text-primary font-mono text-sm">[01]</span> WHAT IS ASCII ART?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6 text-center font-mono text-primary leading-tight text-xl">
              <pre className="animate-pulse">
                {"@@@@@@@@@@@@@@@\n@.............@\n@......O......@\n@.............@\n@@@@@@@@@@@@@@@"}
              </pre>
            </div>
            <div className="text-text-secondary leading-relaxed">
              <p className="mb-4">ASCII art is a graphic design technique that uses printable characters from the ASCII standard to create images.</p>
              <p>Each character's density creates the illusion of shading when viewed from a distance. Dense characters like <code className="text-primary">@</code> or <code className="text-primary">#</code> represent dark areas, while sparse characters like <code className="text-primary">.</code> or a space represent light areas.</p>
            </div>
          </div>
          
          <div className="mt-8 bg-bg-surface p-6 rounded-xl border border-border">
            <div className="text-sm font-mono mb-4 text-text-secondary">Character Density Scale:</div>
            <div className="flex justify-between font-mono text-primary text-xl">
              <span>█</span><span>▓</span><span>▒</span><span>░</span><span>:</span><span>.</span><span> </span>
            </div>
            <div className="flex justify-between text-xs text-text-muted mt-2">
              <span>Darkest</span><span>Brightest</span>
            </div>
          </div>
        </section>

        {/* SECTION 2: HOW IT WORKS */}
        <section id="how-it-works" className="mb-24 animate-slide-up">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-4">
            <span className="text-primary font-mono text-sm">[02]</span> HOW FACETOCODE WORKS
          </h2>
          <div className="flex flex-wrap md:flex-nowrap justify-between gap-4">
            {[
              { num: '1️⃣', title: 'Webcam\nAccess' },
              { num: '2️⃣', title: 'Frame\nGrab' },
              { num: '3️⃣', title: 'Pixel\nBright' },
              { num: '4️⃣', title: 'Map\nto ASCII' },
              { num: '5️⃣', title: 'Output\nRender' },
            ].map((step, i) => (
              <div key={i} className="bg-[#111] rounded-xl p-4 text-center border border-border flex-1 hover:border-primary hover:-translate-y-1 transition-all cursor-pointer">
                <div className="text-3xl mb-2">{step.num}</div>
                <div className="text-xs font-bold whitespace-pre-line">{step.title}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: VIDEO TUTORIAL */}
        <section id="tutorial" className="mb-24 animate-slide-up">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-4">
            <span className="text-primary font-mono text-sm">[04]</span> VIDEO TUTORIAL
          </h2>
          <div className="aspect-video bg-black rounded-xl border border-border flex items-center justify-center relative group overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
               <Play size={32} className="text-primary fill-primary ml-2" />
            </div>
            <div className="absolute bottom-4 left-4 font-mono text-sm">How to use FaceToCode (3:24)</div>
          </div>
        </section>

        {/* SECTION 5: FAQ */}
        <section id="faq" className="mb-24 animate-slide-up">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-4">
            <span className="text-primary font-mono text-sm">[05]</span> FREQUENTLY ASKED QUESTIONS
          </h2>
          
          <div className="flex gap-4 mb-6 border-b border-border pb-2">
            {['General', 'Technical', 'Privacy'].map(tab => (
               <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`text-sm font-mono pb-2 -mb-[9px] border-b-2 px-2 transition-colors ${activeTab === tab.toLowerCase() ? 'border-primary text-text-primary' : 'border-transparent text-text-secondary hover:text-primary'}`}
               >
                 {tab}
               </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
             {faqs.filter(f => f.category === activeTab || activeTab === 'general').map((faq) => (
               <div key={faq.id} className="border-b border-border">
                 <button 
                   onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                   className="w-full text-left py-4 flex items-center justify-between font-bold hover:text-primary transition-colors"
                 >
                   <span className={openFaq === faq.id ? 'text-primary' : ''}>{faq.q}</span>
                   {openFaq === faq.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                 </button>
                 {openFaq === faq.id && (
                   <div className="pb-4 pl-6 text-text-secondary text-sm whitespace-pre-line border-l-2 border-primary ml-2 mb-4">
                     {faq.a}
                   </div>
                 )}
               </div>
             ))}
          </div>
        </section>

        {/* SECTION 6: PRO TIPS */}
        <section id="tips" className="mb-24 animate-slide-up">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-4">
            <span className="text-primary font-mono text-sm">[06]</span> PRO TIPS & TRICKS
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'High-Contrast Lighting', desc: 'Position a light source to one side of your face for dramatic shadows that translate beautifully to ASCII.' },
              { title: 'Play with Font Size', desc: 'Decrease font size in Settings for higher resolution, or increase it for a chunky, pixelated retro look.' },
              { title: 'The "Blocks" Charset', desc: 'Try the Blocks character set for bold poster art that looks almost like a low-res image rather than text.' },
              { title: 'Reduce CPU Load', desc: 'Lower FPS to 15 or 24 for lower CPU usage without noticeable quality loss on most static portraits.' }
            ].map((tip, i) => (
              <div key={i} className="bg-gradient-to-br from-[#0d0d0d] to-[#111] p-6 rounded-xl border-l-4 border-primary shadow-sm hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-3 mb-3">
                  <Lightbulb size={20} className="text-primary" />
                  <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs font-bold font-mono">TIP #{i+1}</span>
                </div>
                <h3 className="font-bold mb-2">{tip.title}</h3>
                <p className="text-sm text-text-secondary">{tip.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
