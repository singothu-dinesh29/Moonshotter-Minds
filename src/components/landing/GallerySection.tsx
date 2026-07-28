'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Camera, Maximize2, X, Sparkles, Building2, Landmark, CheckCircle2 } from 'lucide-react';

export interface GalleryItem {
  id: string;
  src: string;
  title: string;
  category: string;
  aspect: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    src: '/images/college_logo.png',
    title: 'Official Muthayammal Crest Emblem',
    category: 'Institutional Identity',
    aspect: 'aspect-square bg-white/95 p-6',
  },
  {
    id: 'gal-2',
    src: '/images/campus_building.png',
    title: 'Main Academic Campus Building (Dusk View)',
    category: 'Architecture & Campus',
    aspect: 'aspect-[4/3]',
  },
  {
    id: 'gal-3',
    src: '/images/campus_facade.png',
    title: 'Frontage Entrance & Academic Facade',
    category: 'Main Entry Panel',
    aspect: 'aspect-[16/9] col-span-1 md:col-span-2',
  },
  {
    id: 'gal-4',
    src: '/images/campus_building.png',
    title: 'AI & Machine Learning High-Performance Computing Lab',
    category: 'R&D Infrastructure',
    aspect: 'aspect-[4/3]',
  },
  {
    id: 'gal-5',
    src: '/images/campus_facade.png',
    title: 'Central Engineering Plaza & Cloud Arena',
    category: 'Symposium Venue',
    aspect: 'aspect-[4/3]',
  },
];

export default function GallerySection() {
  const [activeLightbox, setActiveLightbox] = useState<GalleryItem | null>(null);

  return (
    <section id="gallery" className="py-20 md:py-28 bg-[#090d16] border-b border-slate-800/80 relative overflow-hidden">
      
      {/* Background Accent Glow */}
      <div 
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-cyan-500/10 via-amber-500/10 to-transparent blur-[160px] pointer-events-none rounded-full" 
      />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10 space-y-12">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono"
          >
            <Camera className="h-4 w-4 text-cyan-400" />
            <span>MUTHAYAMMAL CAMPUS GALLERY</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-white tracking-tight"
          >
            Official Campus & Infrastructure Showcase
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-base text-slate-300 font-sans"
          >
            Explore the official Muthayammal Engineering College campus architecture, entry panels, and high-performance labs.
          </motion.p>
        </div>

        {/* MASONRY GALLERY GRID WITH HOVER ZOOM & LAZY LOADING */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {GALLERY_ITEMS.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              onClick={() => setActiveLightbox(item)}
              className={`group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer hover:border-amber-500/50 transition-all shadow-xl relative ${item.aspect}`}
            >
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                {/* Hover Preview Icon */}
                <div className="absolute top-4 right-4 h-9 w-9 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md">
                  <Maximize2 className="h-4 w-4" />
                </div>

                {/* Bottom Title & Category Tag */}
                <div className="absolute bottom-0 left-0 right-0 p-5 space-y-1 z-10">
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                    {item.category}
                  </span>
                  <h4 className="font-bold text-sm text-white pt-1 group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h4>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* INTERACTIVE LIGHTBOX PREVIEW MODAL */}
      <AnimatePresence>
        {activeLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveLightbox(null)}
            className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-4 md:p-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveLightbox(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/80 text-slate-300 hover:text-white border border-slate-700 transition-all"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Lightbox Image Container */}
              <div className="relative w-full h-[65vh] rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center">
                <Image
                  src={activeLightbox.src}
                  alt={activeLightbox.title}
                  fill
                  priority
                  className="object-contain"
                />
              </div>

              {/* Lightbox Metadata */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-2 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                    {activeLightbox.category}
                  </span>
                  <h3 className="font-bold text-base text-white pt-1">{activeLightbox.title}</h3>
                </div>

                <span className="text-xs font-mono text-slate-400">
                  Muthayammal Engineering College • Official Asset
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
