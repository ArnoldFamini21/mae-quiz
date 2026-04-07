import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { DecorativeStar, WatercolorBackground, fadeUp } from "../components/shared";

const ATTACHMENT_LINKS = [
  { label: "Secure", href: "https://medium.com/my-avoidant-ex" },
  { label: "Anxious Preoccupied", href: "https://medium.com/my-avoidant-ex" },
  { label: "Dismissive Avoidant", href: "https://medium.com/my-avoidant-ex" },
  { label: "Fearful Avoidant", href: "https://medium.com/my-avoidant-ex" },
];

export default function Home({ onNavigate }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#FDFDFE] font-sans selection:bg-cyan-200 selection:text-cyan-900 text-slate-800 overflow-hidden">
      
      {/* ─── Banner with gradient fade ─── */}
      <div className="relative w-full bg-white z-20">
        <img
          src="/banner.png"
          alt="My Avoidant Ex — Understand · Heal · Reclaim"
          className="w-full h-auto object-cover max-h-[300px] sm:max-h-[380px]"
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[rgba(253,253,254,1)] via-[rgba(253,253,254,0.7)] to-transparent pointer-events-none"></div>
      </div>

      <WatercolorBackground />

      <div className="mx-auto max-w-5xl px-6 sm:px-12 pt-12 pb-24 relative z-10">
        {/* ─── Hero section ─── */}
        <motion.section
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mx-auto relative"
        >
          <DecorativeStar className="w-5 h-5 text-cyan-300 absolute -top-8 left-[10%] animate-pulse" />
          <DecorativeStar className="w-4 h-4 text-fuchsia-300 absolute top-12 right-[5%] opacity-70" />
          <DecorativeStar className="w-6 h-6 text-violet-300 absolute -bottom-10 left-[85%] animate-pulse delay-700" />

          <motion.h1
            variants={fadeUp}
            custom={0}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight"
          >
            <span className="text-slate-800">Welcome to the</span> <br />
            <span className="italic bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 via-violet-600 to-cyan-500 pr-2">
              Attachment Style Assessment
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={1}
            className="mt-8 text-lg sm:text-xl text-slate-600 font-light leading-relaxed tracking-wide"
          >
            Understanding your attachment style could change your relationships for the better.
          </motion.p>
          
          <motion.div variants={fadeUp} custom={2} className="mt-8 flex justify-center">
             <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-cyan-300 to-transparent"></div>
          </motion.div>

          <motion.p
            variants={fadeUp}
            custom={3}
            className="mt-8 text-[15px] sm:text-base leading-relaxed text-slate-600 max-w-2xl mx-auto font-serif relative"
          >
            The way you connect, pull away, overthink, or shut down is a pattern that was learned in
            childhood or through experiences in life. The pattern is predictable and <span className="font-medium text-cyan-700/80">something you can work on</span>. By understanding your attachment style, you can improve your relationships in all
            spheres of life.
          </motion.p>
        </motion.section>

        {/* ─── Quiz selection ─── */}
        <motion.section
          initial="hidden"
          animate="visible"
          className="mt-28"
        >
          <motion.div variants={fadeUp} custom={4} className="flex justify-center mb-14 relative">
             <p className="text-xs font-semibold tracking-[0.2em] uppercase text-cyan-600 flex items-center gap-3">
                <DecorativeStar className="w-3 h-3 text-fuchsia-400" /> 
                Choose Your Assessment 
                <DecorativeStar className="w-3 h-3 text-cyan-400" />
             </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-0 border-t border-b border-cyan-100/50 divide-y md:divide-y-0 md:divide-x divide-cyan-100/50 backdrop-blur-sm bg-white/30 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            
            {/* Quick Quiz Column */}
            <motion.div variants={fadeUp} custom={5} className="relative z-10 p-10 md:p-14 flex flex-col items-center text-center group cursor-pointer hover:bg-white/80 transition-all duration-500 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none hover:shadow-[0_0_40px_-15px_rgba(6,182,212,0.2)]" onClick={() => onNavigate("quick-quiz")}>
              <span className="text-xs font-bold tracking-widest text-cyan-500 uppercase mb-4">~5 Minutes</span>
              <h2 className="font-serif text-3xl text-slate-800 mb-4 group-hover:text-cyan-700 transition-colors">Quick Snapshot</h2>
              <p className="text-sm font-medium text-slate-500 mb-6 font-serif italic border-b border-cyan-100/50 pb-6 w-full group-hover:border-cyan-200 transition-colors">16 core questions</p>
              <p className="text-[15px] leading-relaxed text-slate-600 mb-10 flex-grow px-4">
                A fast, directionally accurate snapshot of your likely attachment pattern. Perfect if you are short on time but want immediate insights.
              </p>
              <button className="inline-flex items-center gap-3 text-[13px] font-bold tracking-widest uppercase text-cyan-600 group-hover:text-cyan-800 transition-colors">
                Begin Quick Quiz <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>

            {/* Full Assessment Column */}
            <motion.div variants={fadeUp} custom={6} className="relative z-10 p-10 md:p-14 flex flex-col items-center text-center group cursor-pointer hover:bg-white/80 transition-all duration-500 rounded-b-2xl md:rounded-r-2xl md:rounded-bl-none hover:shadow-[0_0_40px_-15px_rgba(192,38,211,0.2)]" onClick={() => onNavigate("full-assessment")}>
              <span className="text-xs font-bold tracking-widest text-fuchsia-500 uppercase mb-4">~12 Minutes</span>
              <h2 className="font-serif text-3xl text-slate-800 mb-4 group-hover:text-fuchsia-700 transition-colors">Full Assessment</h2>
              <p className="text-sm font-medium text-slate-500 mb-6 font-serif italic border-b border-fuchsia-100/50 pb-6 w-full group-hover:border-fuchsia-200 transition-colors">70+ adaptive questions</p>
              <p className="text-[15px] leading-relaxed text-slate-600 mb-10 flex-grow px-4">
                A deeper, multi-layered assessment across relationships, behavior, and emotional patterns. Our most comprehensive self-discovery tool.
              </p>
              <button className="inline-flex items-center gap-3 text-[13px] font-bold tracking-widest uppercase text-fuchsia-600 group-hover:text-fuchsia-800 transition-colors">
                Begin Full Assessment <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>
          
          <motion.div variants={fadeUp} custom={7} className="mt-8 text-center text-xs text-slate-400 italic">
            Not a clinical diagnosis. Designed strictly for self-reflection and personal growth.
          </motion.div>
        </motion.section>

        {/* ─── What To Do With Your Result ─── */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-28 max-w-4xl mx-auto"
        >
           <motion.div variants={fadeUp} custom={0} className="mb-12 relative">
              <DecorativeStar className="w-6 h-6 text-cyan-200 absolute -top-10 -left-10" />
              <h2 className="font-serif text-3xl sm:text-4xl text-slate-800 mb-4">What To Do With Your Result</h2>
              <p className="text-lg text-slate-600 font-light relative z-10">
                Once you have your result, the next step is understanding what it actually means in your real life. You can go deeper here:
              </p>
           </motion.div>

           <div className="space-y-0 border-t border-violet-100/60">
              {/* Row 1 — Read your style */}
              <motion.div variants={fadeUp} custom={1} className="py-10 border-b border-violet-100/60 grid sm:grid-cols-12 gap-8 items-start hover:bg-white/60 transition-colors duration-500 rounded-xl px-6 -mx-6 group backdrop-blur-sm">
                 <div className="sm:col-span-4">
                    <h3 className="font-serif text-2xl text-slate-800 group-hover:text-violet-700 transition-colors">Read your style</h3>
                    <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-[200px]">Deep dives into the psychology of each attachment pattern.</p>
                 </div>
                 <div className="sm:col-span-8 flex flex-wrap gap-3">
                    {ATTACHMENT_LINKS.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-white border border-violet-100 text-[13px] uppercase tracking-wider font-bold text-violet-900 rounded-full shadow-[0_2px_10px_-4px_rgba(139,92,246,0.1)] hover:bg-violet-50 transition-colors"
                      >
                        {link.label}
                      </a>
                    ))}
                 </div>
              </motion.div>

              {/* Row 2 — Explore tools */}
              <motion.div variants={fadeUp} custom={2} className="py-8 border-b border-violet-100/60 grid sm:grid-cols-12 gap-8 items-center hover:bg-white/60 transition-colors duration-500 rounded-xl px-6 -mx-6 group backdrop-blur-sm">
                 <div className="sm:col-span-4">
                    <h3 className="font-serif text-2xl text-slate-800 group-hover:text-fuchsia-700 transition-colors">Explore tools</h3>
                 </div>
                 <div className="sm:col-span-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <p className="text-base text-slate-600 max-w-sm">Guided resources designed to help you work with your patterns, not against them.</p>
                    <a href="https://buymeacoffee.com/mollywritesmentalhealth/extras" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[13px] font-bold tracking-widest uppercase text-fuchsia-600 shrink-0 bg-fuchsia-50/80 px-5 py-2.5 rounded-full border border-fuchsia-100/50 hover:bg-fuchsia-100/80 transition-colors">
                      Browse the store <ArrowRight className="w-4 h-4" />
                    </a>
                 </div>
              </motion.div>

              {/* Row 3 — Learn patterns */}
              <motion.div variants={fadeUp} custom={3} className="py-8 border-b border-violet-100/60 grid sm:grid-cols-12 gap-8 items-center hover:bg-white/60 transition-colors duration-500 rounded-xl px-6 -mx-6 group backdrop-blur-sm">
                 <div className="sm:col-span-4">
                    <h3 className="font-serif text-2xl text-slate-800 group-hover:text-cyan-600 transition-colors">Learn the patterns</h3>
                 </div>
                 <div className="sm:col-span-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <p className="text-base text-slate-600 max-w-sm">Understand why avoidants pull away and push-pull cycles happen.</p>
                    <a href="https://medium.com/my-avoidant-ex" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[13px] font-bold tracking-widest uppercase text-cyan-600 shrink-0 bg-cyan-50/80 px-5 py-2.5 rounded-full border border-cyan-100/50 hover:bg-cyan-100/80 transition-colors">
                      Go to publication <ArrowRight className="w-4 h-4" />
                    </a>
                 </div>
              </motion.div>
           </div>
        </motion.section>
      </div>

      {/* ─── Footer ─── */}
      <footer className="bg-white/50 backdrop-blur-md border-t border-slate-100 py-16 text-center text-slate-500 relative z-10 mt-8">
        <div className="mb-8 flex justify-center">
           <img src="/logo.png" alt="MAE logo" className="h-16 w-auto opacity-90 mix-blend-multiply" />
        </div>
        <p className="text-sm">
          © {new Date().getFullYear()} My Avoidant Ex. All rights reserved.
        </p>
        <p className="mt-4 text-[11px] font-bold tracking-[0.3em] uppercase opacity-70 text-violet-600">
          Understand · Heal · Reclaim
        </p>
      </footer>
    </div>
  );
}
