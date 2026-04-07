import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, RefreshCw, BookOpen, ShoppingBag, Home, Sparkles, Check } from "lucide-react";
import { useLocalStorage, useKeyboardNav } from "../utils";
import { DecorativeStar, WatercolorBackground } from "../components/shared";

/* ── Data ── */
const RESULT_LINKS = {
  secure: { readMore: "#", shop: "#" },
  anxious: { readMore: "#", shop: "#" },
  dismissive: { readMore: "#", shop: "#" },
  fearful: { readMore: "#", shop: "#" },
};

const STYLES = {
  secure: {
    label: "Secure", heading: "You're likely Secure",
    accent: "from-cyan-500 via-teal-500 to-sky-600",
    textGradient: "from-cyan-600 via-teal-600 to-sky-600",
  },
  anxious: {
    label: "Anxious Preoccupied", heading: "You're likely Anxious Preoccupied",
    accent: "from-fuchsia-500 via-purple-500 to-indigo-600",
    textGradient: "from-fuchsia-600 via-purple-600 to-indigo-600",
  },
  dismissive: {
    label: "Dismissive Avoidant", heading: "You're likely Dismissive Avoidant",
    accent: "from-slate-600 via-indigo-600 to-violet-600",
    textGradient: "from-slate-600 via-indigo-600 to-violet-700",
  },
  fearful: {
    label: "Fearful Avoidant", heading: "You're likely Fearful Avoidant",
    accent: "from-violet-600 via-fuchsia-600 to-pink-600",
    textGradient: "from-violet-600 via-fuchsia-600 to-pink-700",
  },
};

const LIKERT = [
  { value: 1, label: "Strongly disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral / mixed" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly agree" },
];

const QUESTIONS = [
  {
    id: "relationshipStatus", text: "Which best describes your relationship status right now?", type: "single_choice",
    options: [{ value: "single", label: "Single" }, { value: "relationship", label: "In a relationship" }, { value: "situationship", label: "It is complicated / situationship" }],
  },
  {
    id: "children", text: "Do you have children or a regular caregiving role?", type: "single_choice",
    options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }],
  },
  { id: "q1", section: "Core attachment", text: "I worry people I care about may pull away once I become attached.", dimension: "anxiety" },
  { id: "q2", section: "Core attachment", text: "I find it fairly easy to depend on people I trust.", dimension: "avoidance", reverse: true },
  { id: "q3", section: "Core attachment", text: "When someone gets emotionally close, I often feel the need to create space.", dimension: "avoidance" },
  { id: "q4", section: "Core attachment", text: "Uncertainty in relationships can take up a lot of space in my mind.", dimension: "anxiety" },
  { id: "q5", section: "Core attachment", text: "I generally feel comfortable opening up emotionally.", dimension: "avoidance", reverse: true },
  { id: "q6", section: "Core attachment", text: "I often need reassurance that I really matter to the other person.", dimension: "anxiety" },
  { id: "q7", section: "Core attachment", text: "After a particularly close interaction, I often feel the need to step back.", dimension: "avoidance" },
  { id: "q8", section: "Core attachment", text: "Mixed signals are especially hard for me to tolerate.", dimension: "anxiety" },
  { id: "q9", section: "Push-pull overlap", text: "I can crave closeness and then feel unsettled once it is actually there.", dimension: "fearful_marker" },
  { id: "q10", section: "Push-pull overlap", text: "Part of me wants deep intimacy, while another part wants to stay protected and hard to reach.", dimension: "fearful_marker" },
  { id: "q11", section: "Relational coping", text: "In conflict, I tend to stay engaged and try to repair things constructively.", dimension: "avoidance", reverse: true },
  { id: "q12", section: "Relational coping", text: "In conflict, I feel a strong need for quick reassurance or resolution.", dimension: "anxiety" },
  { id: "q13", section: "Self-worth", text: "At times, I feel I am not good enough or may be too much for other people.", measure: "self_esteem" },
  { id: "q14", section: "Self-worth", text: "Overall, I feel fairly solid in my own worth.", measure: "self_esteem", reverse: true },
  { id: "q15", section: "Emotion regulation", text: "When I am upset, my emotions can feel overwhelming.", measure: "emotion_regulation" },
  { id: "q16", section: "Emotion regulation", text: "When I am upset, I can usually steady myself without feeling consumed by it.", measure: "emotion_regulation", reverse: true },
];

const SCORED_QUESTION_COUNT = QUESTIONS.filter((q) => q.type !== "single_choice").length;
const TOTAL_QUESTION_COUNT = QUESTIONS.length;

const RESULTS = {
  secure: {
    title: "Secure",
    shortBlurb: "You likely have a relatively secure attachment pattern. Closeness may feel possible without becoming engulfing, and distance does not automatically feel like danger.",
    single: "When secure people are single, they can usually enjoy connection without chasing it frantically. Solitude does not automatically mean abandonment, and independence does not require emotional shutdown.",
    romantic: "In romantic relationships, secure people tend to communicate more directly, tolerate normal friction, and recover from conflict without turning every wobble into a catastrophe or every need into a threat.",
    parent: "As parents or caregivers, secure people are often better able to combine warmth with structure. They are more likely to notice emotional needs without becoming swallowed by them or pulling too far away from them.",
  },
  anxious: {
    title: "Anxious Preoccupied",
    shortBlurb: "You likely lean anxious preoccupied. Closeness matters deeply, but uncertainty can feel loud, personal, and hard to ignore.",
    single: "When anxious attachers are single, they may feel the absence of connection quite intensely. They can spend a lot of emotional energy wondering when love will arrive and whether they are truly chosen.",
    romantic: "In romantic relationships, anxious attachers often bring passion, devotion, and emotional depth. They may also become highly alert to shifts in tone, texting patterns, reassurance, or perceived distance.",
    parent: "As parents or caregivers, anxious attachers can be deeply loving and attentive. Under stress, they may become extra sensitive to responsiveness, closeness, or signs that they are getting the relationship wrong.",
  },
  dismissive: {
    title: "Dismissive Avoidant",
    shortBlurb: "You likely lean dismissive avoidant. Self-reliance may feel safer than dependence, and too much emotional intensity can trigger the urge to create distance.",
    single: "When dismissive avoidants are single, they often function well on the surface and may genuinely enjoy autonomy. At the same time, emotional distance can become so familiar that it starts to feel like personality rather than protection.",
    romantic: "In romantic relationships, dismissive avoidants may care more deeply than they show. They can struggle when closeness becomes sustained, emotionally demanding, or hard to control, which may lead to withdrawal or quiet deactivation.",
    parent: "As parents or caregivers, dismissive avoidants may be loyal, practical, and committed, yet less comfortable with repeated emotional intensity. They may find needs easier to meet in action than in ongoing emotional attunement.",
  },
  fearful: {
    title: "Fearful Avoidant",
    shortBlurb: "You likely lean fearful avoidant. You may want closeness very deeply, but vulnerability can feel tangled up with danger, shame, or the fear of being hurt.",
    single: "When fearful avoidants are single, there is often a push-pull even in private. Part of them longs for intimacy, while another part stays braced for disappointment, engulfment, or sudden loss.",
    romantic: "In romantic relationships, fearful avoidants can experience intense connection alongside intense alarm. They may move toward closeness, then feel flooded by it, creating cycles of pursuit, retreat, longing, and confusion.",
    parent: "As parents or caregivers, fearful avoidants can be loving, intuitive, and deeply protective. Under strain, they may become inconsistent or overwhelmed when emotional closeness activates their own unresolved alarm system.",
  },
};

/* ── Scoring ── */
function normalizeLikert(value, reverse = false) {
  if (value == null) return null;
  return reverse ? 6 - value : value;
}

function computeMetrics(questions, answers) {
  const totals = { anxiety: 0, avoidance: 0, fearfulMarkers: 0, selfEsteem: 0, emotionRegulation: 0 };
  const counts = { anxiety: 0, avoidance: 0, fearfulMarkers: 0, selfEsteem: 0, emotionRegulation: 0 };

  questions.forEach((question, index) => {
    const answer = answers[index];
    if (answer == null || question.type === "single_choice") return;
    const normalized = normalizeLikert(answer, question.reverse);
    if (question.dimension === "anxiety") { totals.anxiety += normalized; counts.anxiety += 1; }
    if (question.dimension === "avoidance") { totals.avoidance += normalized; counts.avoidance += 1; }
    if (question.dimension === "fearful_marker") { totals.fearfulMarkers += normalized; counts.fearfulMarkers += 1; }
    if (question.measure === "self_esteem") { totals.selfEsteem += normalized; counts.selfEsteem += 1; }
    if (question.measure === "emotion_regulation") { totals.emotionRegulation += normalized; counts.emotionRegulation += 1; }
  });

  return {
    averages: {
      anxiety: counts.anxiety ? totals.anxiety / counts.anxiety : 0,
      avoidance: counts.avoidance ? totals.avoidance / counts.avoidance : 0,
      fearfulMarkers: counts.fearfulMarkers ? totals.fearfulMarkers / counts.fearfulMarkers : 0,
      selfEsteem: counts.selfEsteem ? totals.selfEsteem / counts.selfEsteem : 0,
      emotionRegulation: counts.emotionRegulation ? totals.emotionRegulation / counts.emotionRegulation : 0,
    },
  };
}

function deriveAttachmentStyle(metrics) {
  const { anxiety, avoidance, fearfulMarkers, selfEsteem, emotionRegulation } = metrics.averages;
  const highAnxiety = anxiety >= 3.35;
  const highAvoidance = avoidance >= 3.35;
  const lowAnxiety = anxiety <= 2.65;
  const lowAvoidance = avoidance <= 2.65;

  let resultKey = "secure";
  if (highAnxiety && highAvoidance) resultKey = "fearful";
  else if (highAnxiety && !highAvoidance) resultKey = "anxious";
  else if (!highAnxiety && highAvoidance) resultKey = "dismissive";
  else if (lowAnxiety && lowAvoidance) resultKey = "secure";
  else {
    if (fearfulMarkers >= 3.75 && anxiety >= 3 && avoidance >= 2.9) resultKey = "fearful";
    else if (avoidance > anxiety + 0.25) resultKey = "dismissive";
    else if (anxiety > avoidance + 0.25) resultKey = "anxious";
    else resultKey = "secure";
  }

  if (resultKey === "anxious" && fearfulMarkers >= 3.7 && avoidance >= 2.85) resultKey = "fearful";
  if (resultKey === "dismissive" && anxiety >= 3.05 && fearfulMarkers >= 3.7) resultKey = "fearful";
  if (resultKey === "secure" && selfEsteem <= 2.4 && anxiety >= 3.15) resultKey = "anxious";
  if (resultKey === "anxious" && emotionRegulation >= 3.7 && avoidance >= 3) resultKey = "fearful";

  const confidenceGap = Math.abs(anxiety - 3) + Math.abs(avoidance - 3) + Math.abs(fearfulMarkers - 3) * 0.4;
  const confidence = confidenceGap >= 1.2 ? "Higher" : confidenceGap >= 0.75 ? "Moderate" : "Lighter";
  return { resultKey, confidence };
}

/* ── Screen Components ── */
function IntroScreen({ onStart, onNavigate }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }} className="min-h-[80vh] flex flex-col justify-center items-center px-4 relative">
      <DecorativeStar className="w-5 h-5 text-cyan-400 absolute md:top-20 top-10 md:left-[20%] left-[10%] animate-pulse" />
      <DecorativeStar className="w-6 h-6 text-fuchsia-400 absolute md:bottom-32 bottom-20 md:right-[20%] right-[10%] opacity-60" />

      <div className="max-w-2xl mx-auto text-center">
        <h1 className="font-serif text-5xl sm:text-6xl tracking-tight leading-tight text-slate-800">
          <span className="italic bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-600">
            Quick Snapshot
          </span>
        </h1>
        <p className="mt-8 text-lg text-slate-600 font-light leading-relaxed max-w-xl mx-auto">
          A fast, attachment-informed snapshot of your likely pattern. Get directional insights in about 5 minutes.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6 items-center text-sm font-medium text-slate-500 font-serif italic tracking-wide">
           <span className="flex items-center gap-2 border-b border-cyan-100/50 pb-2"><Check className="w-4 h-4 text-cyan-500"/> {SCORED_QUESTION_COUNT} scored questions</span>
           <span className="flex items-center gap-2 border-b border-fuchsia-100/50 pb-2"><Check className="w-4 h-4 text-fuchsia-500"/> Instant results</span>
           <span className="flex items-center gap-2 border-b border-violet-100/50 pb-2"><Check className="w-4 h-4 text-violet-500"/> Private & secure</span>
        </div>

        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
          <button onClick={onStart} className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white text-sm uppercase tracking-widest font-bold rounded-full transition-all flex items-center gap-3 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5">
            Begin Quiz <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => onNavigate("home")} className="px-8 py-4 bg-white/50 hover:bg-white text-slate-700 text-sm uppercase tracking-widest font-bold rounded-full transition-all border border-slate-200/50 flex items-center gap-2 shadow-sm backdrop-blur-sm">
            <Home className="w-4 h-4" /> Home
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function QuestionCard({ question, questionIndex, totalQuestions, selected, onSelect, progress, onBack, isLast, onNext }) {
  const isSingleChoice = question.type === "single_choice";
  const options = isSingleChoice ? question.options : LIKERT;

  useKeyboardNav({
    onNext: () => selected != null && onNext(),
    onBack,
    onSelect,
    options,
    selectedValue: selected,
  });

  return (
    <div className="w-full relative pt-12 pb-28 px-4 min-h-[85vh] flex flex-col">
       {/* Minimalist Progress Bar */}
       <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-100/50 backdrop-blur z-50">
          <motion.div 
             initial={{ width: 0 }} 
             animate={{ width: `${progress}%` }} 
             transition={{ duration: 0.5 }} 
             className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500" 
          />
       </div>

      <motion.div key={question.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ type: "spring", stiffness: 70, damping: 15 }} className="w-full max-w-3xl mx-auto flex-grow flex flex-col justify-center">
        
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400/80 mb-5 flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            {question.section ? `${question.section} · ` : ""} {questionIndex + 1} of {totalQuestions}
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-slate-800 leading-[1.3] tracking-tight">
            {question.text}
          </h2>
        </div>

        <div className="space-y-3 mb-8">
          {options.map((option, idx) => {
            const isSelected = selected === option.value;
            return (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={idx}
                type="button"
                onClick={() => onSelect(option.value)}
                className={[
                  "group w-full rounded-2xl px-6 py-5 text-left transition-all duration-300 outline-none flex items-center gap-5 backdrop-blur-md",
                  isSelected
                    ? "bg-white/90 border border-violet-200 shadow-[0_4px_20px_-4px_rgba(139,92,246,0.15)] ring-1 ring-violet-500/20"
                    : "bg-white/40 border border-white/60 hover:bg-white/80 hover:border-violet-100 hover:shadow-sm"
                ].join(" ")}
              >
                <div className={[
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                    isSelected ? "border-violet-600 bg-violet-600 scale-110" : "border-slate-300 bg-white group-hover:border-slate-400",
                  ].join(" ")}>
                  {isSelected && <motion.div layoutId="bubble_quick" className="h-2.5 w-2.5 rounded-full bg-white" />}
                </div>
                <span className={`text-base sm:text-lg transition-colors duration-300 ${isSelected ? "text-violet-900 font-semibold" : "text-slate-700 font-medium"}`}>
                  {option.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 w-full p-5 bg-gradient-to-t from-[#FDFDFE] via-[#FDFDFE]/90 to-transparent z-40">
         <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button type="button" onClick={onBack} disabled={questionIndex === 0} className="min-w-[100px] px-5 py-3 rounded-full text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 hover:bg-white/80 disabled:opacity-30 flex items-center gap-2 transition-all">
               <ArrowLeft className="w-4 h-4" /> Back
            </button>
            
            {/* Mobile: show tap hint when selected, Desktop: keyboard hints */}
            <div className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase text-center">
               <span className="hidden sm:inline">
                  Keyboard: <span className="px-1.5 py-0.5 rounded border border-slate-200 bg-white/50 mx-0.5">↑</span> <span className="px-1.5 py-0.5 rounded border border-slate-200 bg-white/50 mx-0.5">↓</span> <span className="px-1.5 py-0.5 rounded border border-slate-200 bg-white/50 mx-0.5">ENTER</span>
               </span>
               <span className="sm:hidden text-slate-400/70 italic tracking-wider">
                  {selected != null ? "Advancing…" : "Tap an answer"}
               </span>
            </div>
            
            <div className="min-w-[100px] flex justify-end">
              {/* Show manual Next on mobile if auto-advance didn't fire */}
              {selected != null && (
                <button type="button" onClick={onNext} className="sm:hidden px-5 py-3 rounded-full text-sm font-bold uppercase tracking-widest text-indigo-600 hover:bg-white/80 flex items-center gap-2 transition-all">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
         </div>
      </div>
    </div>
  );
}

function ResultCard({ resultKey, metrics, confidence, demo, onRestart, onNavigate }) {
  const style = STYLES[resultKey];
  const result = RESULTS[resultKey];
  const links = RESULT_LINKS[resultKey];

  const snapshot = [
    { label: "Attachment anxiety", value: metrics.averages.anxiety, gradient: STYLES.anxious.accent },
    { label: "Attachment avoidance", value: metrics.averages.avoidance, gradient: STYLES.dismissive.accent },
    { label: "Push-pull intensity", value: metrics.averages.fearfulMarkers, gradient: STYLES.fearful.accent },
  ];

  const parentTitle = demo.children === "yes" ? `${result.title} as a parent or caregiver` : `${result.title} in a caregiving role`;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }} className="w-full max-w-4xl mx-auto py-16 px-4">
      {/* Editorial Header */}
      <div className="text-center mb-20 relative">
        <DecorativeStar className={`w-8 h-8 opacity-40 absolute -top-8 left-1/2 -translate-x-1/2 ${style.textGradient.split(' ')[0].replace('from-', 'text-')}`} />
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-6 mt-8">Your Core Pattern</p>
        <h1 className={`font-serif text-5xl sm:text-7xl tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r ${style.textGradient}`}>
          {style.label}
        </h1>
        <p className="mt-8 text-lg sm:text-xl text-slate-600 font-light max-w-2xl mx-auto leading-relaxed">
          {result.shortBlurb}
        </p>
        <div className="mt-10 flex justify-center">
            <span className="px-4 py-1.5 rounded-full border border-slate-200 bg-white/50 text-[11px] font-bold uppercase tracking-widest text-slate-500 shadow-sm backdrop-blur-sm">
                Confidence: {confidence}
            </span>
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-20"></div>

      {/* Editorial Sections */}
      <div className="grid md:grid-cols-12 gap-16 mb-24">
         <div className="md:col-span-4 space-y-16">
             <div>
                <h3 className="font-serif text-2xl text-slate-800 mb-4">{result.title} when single</h3>
                <p className="text-slate-600 leading-relaxed text-[15px]">{result.single}</p>
             </div>
             <div>
                <h3 className="font-serif text-2xl text-slate-800 mb-4">{result.title} in romance</h3>
                <p className="text-slate-600 leading-relaxed text-[15px]">{result.romantic}</p>
             </div>
             <div>
                <h3 className="font-serif text-2xl text-slate-800 mb-4">{parentTitle}</h3>
                <p className="text-slate-600 leading-relaxed text-[15px]">{result.parent}</p>
             </div>
         </div>

         <div className="md:col-span-8 flex flex-col gap-12">
            {/* Score Snapshot */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-8 sm:p-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
               <h3 className="font-serif text-2xl text-slate-800 mb-10 text-center">Your Score Profile</h3>
               <div className="space-y-8">
                {snapshot.map((item, idx) => {
                  const width = Math.max((item.value / 5) * 100, 8);
                  return (
                    <div key={item.label}>
                      <div className="mb-3 flex items-center justify-between text-[13px] uppercase tracking-wider font-semibold text-slate-500">
                        <span>{item.label}</span>
                        <span className="text-slate-800 font-bold">{item.value.toFixed(2)}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100/50 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${width}%` }}
                          transition={{ duration: 1.5, delay: 0.2 + idx * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                          className={`h-full rounded-full bg-gradient-to-r ${item.gradient}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-[2rem] shadow-2xl">
               <h3 className="font-serif text-3xl mb-4">Moving Forward</h3>
               <p className="text-slate-300 font-light leading-relaxed mb-10 max-w-lg">
                 This quick quiz is designed to be directionally useful. For a deeper, multi-dimensional picture, try the full assessment. Use this result as a starting point for deeper self-work.
               </p>
               <div className="flex flex-col sm:flex-row gap-4">
                 <button onClick={() => onNavigate("full-assessment")} className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                    <BookOpen className="w-4 h-4"/> Take Full Assessment
                 </button>
                 <button onClick={() => onNavigate("home")} className="px-8 py-4 bg-white/10 text-white rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-white/20 transition-colors flex items-center justify-center gap-2 border border-white/10">
                    <Home className="w-4 h-4"/> Back to Home
                 </button>
               </div>
            </div>
         </div>
      </div>

      <div className="flex flex-wrap justify-center gap-6 border-t border-slate-200 pt-12 pb-12">
        <button onClick={onRestart} className="px-6 py-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors">
          <RefreshCw className="w-4 h-4" /> Retake Quiz
        </button>
        <button onClick={() => onNavigate("home")} className="px-6 py-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors">
          <Home className="w-4 h-4" /> Home
        </button>
        <button onClick={() => onNavigate("full-assessment")} className="px-6 py-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-violet-600 hover:text-fuchsia-600 transition-colors">
          Full Assessment <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

/* ── Main Component ── */
export default function QuickQuiz({ onNavigate }) {
  const [started, setStarted] = useLocalStorage("mae_quick_started", false);
  const [answersById, setAnswersById] = useLocalStorage("mae_quick_answers", {});
  const [currentIndex, setCurrentIndex] = useLocalStorage("mae_quick_index", 0);
  const [showResult, setShowResult] = useLocalStorage("mae_quick_result", false);
  const advanceRef = useRef(null);

  const questions = useMemo(() => QUESTIONS, []);
  const answers = useMemo(() => questions.map((q) => answersById[q.id] ?? null), [questions, answersById]);
  const currentQuestion = questions[currentIndex];
  const selected = answers[currentIndex];
  // Consistent progress: (currentIndex + 1) / total * 100 so question 1 = ~6%
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const metrics = useMemo(() => computeMetrics(questions, answers), [questions, answers]);
  const derived = useMemo(() => deriveAttachmentStyle(metrics), [metrics]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentIndex, showResult, started]);

  // Auto-advance: watch for answer changes and advance after delay
  useEffect(() => {
    if (advanceRef.current) {
      clearTimeout(advanceRef.current);
      advanceRef.current = null;
    }
    if (!started || showResult || !currentQuestion) return;
    
    const currentAnswer = answersById[currentQuestion.id];
    if (currentAnswer == null) return;
    
    advanceRef.current = setTimeout(() => {
      if (currentIndex === questions.length - 1) {
        setShowResult(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 300);
    
    return () => {
      if (advanceRef.current) clearTimeout(advanceRef.current);
    };
  }, [answersById, currentQuestion?.id]);

  const handleSelect = useCallback((value) => {
    if (!currentQuestion) return;
    setAnswersById((prev) => ({ ...prev, [currentQuestion.id]: value }));
    // Auto-advance handled by the useEffect above
  }, [currentQuestion, setAnswersById]);
  
  const handleNext = useCallback(() => {
    if (selected == null) return;
    if (currentIndex === questions.length - 1) {
      setShowResult(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
  }, [selected, currentIndex, questions.length, setShowResult, setCurrentIndex]);
  
  const handleBack = useCallback(() => {
    // Clear any pending auto-advance
    if (advanceRef.current) {
      clearTimeout(advanceRef.current);
      advanceRef.current = null;
    }
    if (currentIndex === 0) return;
    setCurrentIndex((prev) => prev - 1);
  }, [currentIndex, setCurrentIndex]);
  
  function handleRestart() {
    if (advanceRef.current) clearTimeout(advanceRef.current);
    setStarted(false);
    setAnswersById({});
    setCurrentIndex(0);
    setShowResult(false);
  }

  const demo = {
    relationshipStatus: answersById.relationshipStatus,
    children: answersById.children,
  };

  return (
    <div className="min-h-screen bg-[#FDFDFE] font-sans selection:bg-cyan-200 selection:text-cyan-900 overflow-hidden relative">
      <WatercolorBackground fixed />
      <div className="relative z-10 w-full">
        <AnimatePresence mode="wait">
          {!started ? (
            <IntroScreen key="intro" onStart={() => setStarted(true)} onNavigate={onNavigate} />
          ) : showResult ? (
            <ResultCard key="result" resultKey={derived.resultKey} metrics={metrics} confidence={derived.confidence} demo={demo} onRestart={handleRestart} onNavigate={onNavigate} />
          ) : currentQuestion ? (
            <QuestionCard
              key={currentQuestion.id} question={currentQuestion} questionIndex={currentIndex} totalQuestions={questions.length}
              selected={selected} onSelect={handleSelect} progress={progress} onBack={handleBack} onNext={handleNext}
              isLast={currentIndex === questions.length - 1}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
