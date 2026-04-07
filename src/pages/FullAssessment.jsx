import React, { useMemo, useEffect, useCallback, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
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
    accent: "from-teal-500 via-emerald-500 to-sky-600", soft: "from-teal-50/50 via-white to-sky-50/50",
    border: "border-teal-200/60", ring: "ring-teal-500/20",
    button: "from-teal-600 to-emerald-700 hover:shadow-teal-500/25", orb: "bg-teal-400/20"
  },
  anxious: {
    label: "Anxious Preoccupied", heading: "You're likely Anxious Preoccupied",
    accent: "from-fuchsia-500 via-purple-500 to-indigo-600", soft: "from-fuchsia-50/50 via-white to-purple-50/50",
    border: "border-fuchsia-200/60", ring: "ring-fuchsia-500/20",
    button: "from-fuchsia-600 to-purple-700 hover:shadow-fuchsia-500/25", orb: "bg-fuchsia-400/20"
  },
  dismissive: {
    label: "Dismissive Avoidant", heading: "You're likely Dismissive Avoidant",
    accent: "from-slate-600 via-indigo-600 to-violet-600", soft: "from-slate-50/50 via-white to-indigo-50/50",
    border: "border-slate-200/80", ring: "ring-indigo-500/20",
    button: "from-slate-700 to-indigo-800 hover:shadow-indigo-500/25", orb: "bg-indigo-400/20"
  },
  fearful: {
    label: "Fearful Avoidant", heading: "You're likely Fearful Avoidant",
    accent: "from-violet-600 via-indigo-600 to-slate-700", soft: "from-violet-50/50 via-white to-slate-50/50",
    border: "border-violet-200/60", ring: "ring-violet-500/20",
    button: "from-violet-600 to-indigo-800 hover:shadow-violet-500/25", orb: "bg-violet-400/20"
  },
};

const LIKERT = [
  { value: 1, label: "Strongly disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral / mixed" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly agree" },
];

/* ── Question banks ── */
const DEMOGRAPHIC_QUESTIONS = [
  {
    id: "relationshipStatus", text: "Which best describes your relationship status right now?", type: "single_choice",
    options: [
      { value: "single", label: "Single" },
      { value: "relationship", label: "In a relationship" },
      { value: "situationship", label: "It is complicated / situationship" },
    ],
  },
  {
    id: "ageBand", text: "Which age range are you in?", type: "single_choice",
    options: [
      { value: "18_24", label: "18 to 24" }, { value: "25_34", label: "25 to 34" },
      { value: "35_44", label: "35 to 44" }, { value: "45_54", label: "45 to 54" },
      { value: "55_plus", label: "55+" },
    ],
  },
  {
    id: "gender", text: "How do you describe your gender?", type: "single_choice",
    options: [
      { value: "woman", label: "Woman" }, { value: "man", label: "Man" },
      { value: "nonbinary", label: "Non-binary" },
      { value: "self_describe", label: "Prefer to self-describe / not listed" },
      { value: "prefer_not", label: "Prefer not to say" },
    ],
  },
  {
    id: "children", text: "Do you have children or a regular caregiving role?", type: "single_choice",
    options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }],
  },
];

const ADDITIONAL_BEHAVIORAL_QUESTIONS = [
  { id: "behav_reply_check", section: "Behavioral patterns in connection", text: "When I am waiting for a reply from someone important to me, I can find myself checking for it repeatedly.", dimension: "anxiety", reverse: false, domain: "general" },
  { id: "behav_reread", section: "Behavioral patterns in connection", text: "I re-read messages or replay interactions in my mind to work out whether something has changed.", dimension: "anxiety", reverse: false, domain: "general" },
  { id: "behav_mixed_signals", section: "Behavioral patterns in connection", text: "Mixed signals are especially hard for me to tolerate without becoming preoccupied.", dimension: "anxiety", reverse: false, domain: "general" },
  { id: "behav_pullaway", section: "Behavioral patterns in connection", text: "When someone gets emotionally close, I sometimes delay replying or create distance to regain my footing.", dimension: "avoidance", reverse: false, domain: "general" },
  { id: "behav_after_intimacy", section: "Behavioral patterns in connection", text: "After a particularly close or intimate interaction, I often feel the need to emotionally step back.", dimension: "avoidance", reverse: false, domain: "general" },
  { id: "behav_deactivate", section: "Behavioral patterns in connection", text: "When a relationship becomes more emotionally serious, I can start focusing on reasons to detach or cool off.", dimension: "avoidance", reverse: false, domain: "general" },
  { id: "trigger_pullaway", section: "Relationship triggers", text: "When someone I care about pulls away, I feel a strong emotional reaction that is hard to settle.", dimension: "anxiety", reverse: false, domain: "general" },
  { id: "trigger_neediness", section: "Relationship triggers", text: "When someone needs a great deal from me emotionally, I can feel overwhelmed or trapped.", dimension: "avoidance", reverse: false, domain: "general" },
  { id: "trigger_uncertainty", section: "Relationship triggers", text: "Uncertainty in relationships can take up a lot of space in my mind.", dimension: "anxiety", reverse: false, domain: "general" },
  { id: "trigger_dependence", section: "Relationship triggers", text: "Too much dependence in a relationship can make me want to protect my independence quickly.", dimension: "avoidance", reverse: false, domain: "general" },
];

const SCALE_QUESTIONS = [
  { id: "mother_open", section: "Mother or mother figure", text: "I feel comfortable opening up to my mother or mother figure.", dimension: "avoidance", reverse: true, domain: "mother" },
  { id: "mother_depend", section: "Mother or mother figure", text: "I find it easy to depend on my mother or mother figure when I need support.", dimension: "avoidance", reverse: true, domain: "mother" },
  { id: "mother_discuss", section: "Mother or mother figure", text: "I usually talk things through with my mother or mother figure when something is bothering me.", dimension: "avoidance", reverse: true, domain: "mother" },
  { id: "mother_helpful", section: "Mother or mother figure", text: "It helps to turn to my mother or mother figure when I am in need.", dimension: "avoidance", reverse: true, domain: "mother" },
  { id: "mother_hide", section: "Mother or mother figure", text: "I prefer not to show my mother or mother figure how I feel deep down.", dimension: "avoidance", reverse: false, domain: "mother" },
  { id: "mother_care", section: "Mother or mother figure", text: "I worry my mother or mother figure does not care about me as much as I care about her.", dimension: "anxiety", reverse: false, domain: "mother" },
  { id: "mother_abandon", section: "Mother or mother figure", text: "I worry my mother or mother figure may emotionally abandon me or pull away from me.", dimension: "anxiety", reverse: false, domain: "mother" },
  { id: "father_open", section: "Father or father figure", text: "I feel comfortable opening up to my father or father figure.", dimension: "avoidance", reverse: true, domain: "father" },
  { id: "father_depend", section: "Father or father figure", text: "I find it easy to depend on my father or father figure when I need support.", dimension: "avoidance", reverse: true, domain: "father" },
  { id: "father_discuss", section: "Father or father figure", text: "I usually talk things through with my father or father figure when something is bothering me.", dimension: "avoidance", reverse: true, domain: "father" },
  { id: "father_helpful", section: "Father or father figure", text: "It helps to turn to my father or father figure when I am in need.", dimension: "avoidance", reverse: true, domain: "father" },
  { id: "father_hide", section: "Father or father figure", text: "I prefer not to show my father or father figure how I feel deep down.", dimension: "avoidance", reverse: false, domain: "father" },
  { id: "father_care", section: "Father or father figure", text: "I worry my father or father figure does not care about me as much as I care about him.", dimension: "anxiety", reverse: false, domain: "father" },
  { id: "father_abandon", section: "Father or father figure", text: "I worry my father or father figure may emotionally abandon me or withdraw from me.", dimension: "anxiety", reverse: false, domain: "father" },
  // Partner questions
  { id: "partner_open", section: "Romantic relationship", text: "I feel comfortable opening up to my partner or love interest.", dimension: "avoidance", reverse: true, domain: "partner", when: (demo) => demo.relationshipStatus === "relationship" || demo.relationshipStatus === "situationship" },
  { id: "partner_depend", section: "Romantic relationship", text: "I find it easy to depend on my partner or love interest.", dimension: "avoidance", reverse: true, domain: "partner", when: (demo) => demo.relationshipStatus === "relationship" || demo.relationshipStatus === "situationship" },
  { id: "partner_discuss", section: "Romantic relationship", text: "I usually talk over my concerns and worries with my partner or love interest.", dimension: "avoidance", reverse: true, domain: "partner", when: (demo) => demo.relationshipStatus === "relationship" || demo.relationshipStatus === "situationship" },
  { id: "partner_need", section: "Romantic relationship", text: "It helps to turn to my partner or love interest in times of need.", dimension: "avoidance", reverse: true, domain: "partner", when: (demo) => demo.relationshipStatus === "relationship" || demo.relationshipStatus === "situationship" },
  { id: "partner_hide", section: "Romantic relationship", text: "I prefer not to show my partner or love interest how I feel deep down.", dimension: "avoidance", reverse: false, domain: "partner", when: (demo) => demo.relationshipStatus === "relationship" || demo.relationshipStatus === "situationship" },
  { id: "partner_not_comfortable", section: "Romantic relationship", text: "I do not feel fully comfortable being emotionally vulnerable with my partner or love interest.", dimension: "avoidance", reverse: false, domain: "partner", when: (demo) => demo.relationshipStatus === "relationship" || demo.relationshipStatus === "situationship" },
  { id: "partner_abandon", section: "Romantic relationship", text: "I am afraid my partner or love interest may abandon me.", dimension: "anxiety", reverse: false, domain: "partner", when: (demo) => demo.relationshipStatus === "relationship" || demo.relationshipStatus === "situationship" },
  { id: "partner_care", section: "Romantic relationship", text: "I worry my partner or love interest does not care about me as much as I care about them.", dimension: "anxiety", reverse: false, domain: "partner", when: (demo) => demo.relationshipStatus === "relationship" || demo.relationshipStatus === "situationship" },
  { id: "partner_reassurance", section: "Romantic relationship", text: "I often need reassurance that my partner or love interest truly cares about me.", dimension: "anxiety", reverse: false, domain: "partner", when: (demo) => demo.relationshipStatus === "relationship" || demo.relationshipStatus === "situationship" },
  // Single questions
  { id: "single_imagine_open", section: "Romantic relationship patterns", text: "When I imagine a close romantic relationship, opening up emotionally feels fairly natural to me.", dimension: "avoidance", reverse: true, domain: "partner", when: (demo) => demo.relationshipStatus === "single" },
  { id: "single_need_space", section: "Romantic relationship patterns", text: "In past or imagined romantic relationships, I tend to need distance when someone gets emotionally close.", dimension: "avoidance", reverse: false, domain: "partner", when: (demo) => demo.relationshipStatus === "single" },
  { id: "single_abandon", section: "Romantic relationship patterns", text: "In romantic relationships, I worry the other person may leave once I become attached.", dimension: "anxiety", reverse: false, domain: "partner", when: (demo) => demo.relationshipStatus === "single" },
  { id: "single_depend", section: "Romantic relationship patterns", text: "In a healthy romantic relationship, I believe I could depend on the other person when I needed them.", dimension: "avoidance", reverse: true, domain: "partner", when: (demo) => demo.relationshipStatus === "single" },
  { id: "single_overread", section: "Romantic relationship patterns", text: "In dating or past relationships, I tend to overread mixed signals or changes in attention.", dimension: "anxiety", reverse: false, domain: "partner", when: (demo) => demo.relationshipStatus === "single" },
  // General attachment
  { id: "general_abandon", section: "General attachment patterns", text: "I am afraid other people may abandon me when I become emotionally invested.", dimension: "anxiety", reverse: false, domain: "general" },
  { id: "general_talk", section: "General attachment patterns", text: "I generally talk things over with people when something matters to me.", dimension: "avoidance", reverse: true, domain: "general" },
  { id: "general_care", section: "General attachment patterns", text: "I often worry that other people do not really care about me.", dimension: "anxiety", reverse: false, domain: "general" },
  { id: "general_depend", section: "General attachment patterns", text: "I find it fairly easy to depend on other people.", dimension: "avoidance", reverse: true, domain: "general" },
  { id: "general_discuss", section: "General attachment patterns", text: "I usually discuss my concerns and problems with people I trust.", dimension: "avoidance", reverse: true, domain: "general" },
  { id: "general_hide", section: "General attachment patterns", text: "I prefer not to show others how I really feel deep down.", dimension: "avoidance", reverse: false, domain: "general" },
  { id: "general_not_open", section: "General attachment patterns", text: "I do not feel very comfortable opening up to other people.", dimension: "avoidance", reverse: false, domain: "general" },
  { id: "general_uneven", section: "General attachment patterns", text: "I worry that I care more about other people than they care about me.", dimension: "anxiety", reverse: false, domain: "general" },
  { id: "general_need", section: "General attachment patterns", text: "It helps to turn to people when I am in need.", dimension: "avoidance", reverse: true, domain: "general" },
  { id: "general_rejection", section: "General attachment patterns", text: "I can become highly sensitive to signs of rejection, exclusion, or emotional distance.", dimension: "anxiety", reverse: false, domain: "general" },
  // Work
  { id: "work_depend", section: "Attachment at work", text: "I find it easy to depend on coworkers when I genuinely need help.", dimension: "avoidance", reverse: true, domain: "work" },
  { id: "work_need", section: "Attachment at work", text: "It helps to turn to coworkers when I am under pressure or unsure about something.", dimension: "avoidance", reverse: true, domain: "work" },
  { id: "work_not_open", section: "Attachment at work", text: "I do not feel comfortable opening up to coworkers beyond the basics.", dimension: "avoidance", reverse: false, domain: "work" },
  { id: "work_talk", section: "Attachment at work", text: "I talk things through with coworkers when a problem needs solving.", dimension: "avoidance", reverse: true, domain: "work" },
  { id: "work_discuss", section: "Attachment at work", text: "I usually discuss my work-related concerns with coworkers rather than carrying them alone.", dimension: "avoidance", reverse: true, domain: "work" },
  { id: "work_care", section: "Attachment at work", text: "I worry my coworkers do not really care about me or have my back.", dimension: "anxiety", reverse: false, domain: "work" },
  { id: "work_leave", section: "Attachment at work", text: "I feel unsettled by the idea that the people I rely on at work could suddenly leave.", dimension: "anxiety", reverse: false, domain: "work" },
  { id: "work_self_reliant", section: "Attachment at work", text: "At work, I would usually rather figure things out on my own than lean on others too much.", dimension: "avoidance", reverse: false, domain: "work" },
  // Self-worth
  { id: "self_failure", section: "Self-worth and internal experience", text: "I often feel that I am falling short or failing in some important way.", measure: "self_esteem", reverse: false },
  { id: "self_respect", section: "Self-worth and internal experience", text: "I wish I had more respect for myself.", measure: "self_esteem", reverse: false },
  { id: "self_proud", section: "Self-worth and internal experience", text: "I do not feel I have much to be proud of.", measure: "self_esteem", reverse: false },
  { id: "self_satisfied", section: "Self-worth and internal experience", text: "Overall, I feel fairly satisfied with myself.", measure: "self_esteem", reverse: true },
  { id: "self_worth", section: "Self-worth and internal experience", text: "I feel I am a person of worth, equal in value to other people.", measure: "self_esteem", reverse: true },
  { id: "self_positive", section: "Self-worth and internal experience", text: "I take a generally positive attitude toward myself.", measure: "self_esteem", reverse: true },
  { id: "self_no_good", section: "Self-worth and internal experience", text: "At times, I feel I am no good at all.", measure: "self_esteem", reverse: false },
  { id: "self_capable", section: "Self-worth and internal experience", text: "I am able to do things as well as most other people.", measure: "self_esteem", reverse: true },
  { id: "self_useless", section: "Self-worth and internal experience", text: "I feel useless at times.", measure: "self_esteem", reverse: false },
  { id: "self_qualities", section: "Self-worth and internal experience", text: "I feel I have a number of good qualities.", measure: "self_esteem", reverse: true },
  // Emotion regulation
  { id: "ders_control", section: "Emotion regulation under stress", text: "When I am upset, I can feel out of control emotionally.", measure: "emotion_regulation", reverse: false },
  { id: "ders_work", section: "Emotion regulation under stress", text: "When I am upset, it becomes hard for me to get things done.", measure: "emotion_regulation", reverse: false },
  { id: "ders_weak", section: "Emotion regulation under stress", text: "When I am upset, I can judge myself as weak for feeling that way.", measure: "emotion_regulation", reverse: false },
  { id: "ders_long", section: "Emotion regulation under stress", text: "When I am upset, I fear I will stay that way for a long time.", measure: "emotion_regulation", reverse: false },
  { id: "ders_behaviour", section: "Emotion regulation under stress", text: "When I am upset, I struggle to control what I do next.", measure: "emotion_regulation", reverse: false },
  { id: "ders_sense", section: "Emotion regulation under stress", text: "I sometimes have difficulty making sense of what I am feeling.", measure: "emotion_regulation", reverse: false },
  { id: "ders_focus", section: "Emotion regulation under stress", text: "When I am upset, I struggle to focus on anything else.", measure: "emotion_regulation", reverse: false },
  { id: "ders_overwhelming", section: "Emotion regulation under stress", text: "When I am upset, my emotions can feel overwhelming.", measure: "emotion_regulation", reverse: false },
  { id: "ders_ruminate", section: "Emotion regulation under stress", text: "When I am upset, I can get stuck thinking about the feeling and little else.", measure: "emotion_regulation", reverse: false },
  { id: "ders_irritated", section: "Emotion regulation under stress", text: "When I am upset, I get irritated with myself for feeling upset at all.", measure: "emotion_regulation", reverse: false },
  { id: "ders_shame", section: "Emotion regulation under stress", text: "When I am upset, I can feel ashamed for having the eMotion.", measure: "emotion_regulation", reverse: false },
  { id: "ders_confused", section: "Emotion regulation under stress", text: "At times, I feel confused about what I am actually feeling.", measure: "emotion_regulation", reverse: false },
  { id: "ders_bad_self", section: "Emotion regulation under stress", text: "When I am upset, I tend to feel worse about myself overall.", measure: "emotion_regulation", reverse: false },
  { id: "ders_nothing", section: "Emotion regulation under stress", text: "When I am upset, I can believe there is little I can do to help myself feel better.", measure: "emotion_regulation", reverse: false },
  { id: "ders_depressed", section: "Emotion regulation under stress", text: "When I am upset, I may fear the feeling will spiral into something much heavier.", measure: "emotion_regulation", reverse: false },
];

const MIXED_PATTERN_QUESTIONS = [
  { id: "mixed_1", section: "Approach and avoidance overlap", text: "I can crave deep closeness and then feel alarmed by it once it is there.", dimension: "fearful_marker", reverse: false, domain: "general" },
  { id: "mixed_2", section: "Approach and avoidance overlap", text: "Part of me wants to be fully known, while another part wants to stay protected and hard to reach.", dimension: "fearful_marker", reverse: false, domain: "general" },
  { id: "mixed_3", section: "Approach and avoidance overlap", text: "I can move toward reassurance and then want distance almost immediately afterwards.", dimension: "fearful_marker", reverse: false, domain: "general" },
];

const ORIGINAL_SHORT_QUESTIONS = [
  { id: "orig_1", section: "Core relational tendencies", text: "When someone becomes emotionally important to me, I feel steady and let the connection unfold.", dimension: "avoidance", reverse: true },
  { id: "orig_2", section: "Core relational tendencies", text: "When someone becomes important to me, I start worrying their feelings may change.", dimension: "anxiety", reverse: false },
  { id: "orig_3", section: "Core relational tendencies", text: "When closeness increases, I feel the urge to pull back and create space.", dimension: "avoidance", reverse: false },
  { id: "orig_4", section: "Core relational tendencies", text: "I often want closeness but feel unsettled or overwhelmed by it.", dimension: "anxiety", reverse: false },
  { id: "orig_5", section: "Core relational tendencies", text: "In conflict, I stay engaged and try to repair things constructively.", dimension: "avoidance", reverse: true },
  { id: "orig_6", section: "Core relational tendencies", text: "In conflict, I feel the need for reassurance or immediate resolution.", dimension: "anxiety", reverse: false },
  { id: "orig_7", section: "Core relational tendencies", text: "In conflict, I tend to shut down or withdraw emotionally.", dimension: "avoidance", reverse: false },
  { id: "orig_8", section: "Core relational tendencies", text: "After emotional intimacy, I feel grounded and closer to the person.", dimension: "avoidance", reverse: true },
  { id: "orig_9", section: "Core relational tendencies", text: "After emotional intimacy, I worry it may not last.", dimension: "anxiety", reverse: false },
  { id: "orig_10", section: "Core relational tendencies", text: "After emotional closeness, I feel the need to create distance again.", dimension: "avoidance", reverse: false },
];

function buildQuizQuestions(demo) {
  return [
    ...DEMOGRAPHIC_QUESTIONS,
    ...SCALE_QUESTIONS.filter((q) => (q.when ? q.when(demo) : true)),
    ...ADDITIONAL_BEHAVIORAL_QUESTIONS,
    ...MIXED_PATTERN_QUESTIONS,
    ...ORIGINAL_SHORT_QUESTIONS,
  ];
}

/* ── Results ── */
const RESULTS = {
  secure: {
    title: "Secure",
    shortBlurb: "You likely have a relatively secure attachment pattern. That usually means closeness feels possible without becoming engulfing, and distance does not automatically feel like danger.",
    single: "When secure people are single, they can usually enjoy connection without chasing it frantically. Solitude does not automatically mean abandonment, and independence does not require emotional shutdown.",
    romantic: "In romantic relationships, secure people tend to communicate more directly, tolerate normal friction, and recover from conflict without turning every wobble into a catastrophe or every need into a threat.",
    parent: "As parents, secure people are often better able to combine warmth with structure. They are more likely to notice emotional needs without becoming swallowed by them or pulling too far away from them.",
  },
  anxious: {
    title: "Anxious Preoccupied",
    shortBlurb: "You likely lean anxious preoccupied. This often means closeness matters deeply, but uncertainty can feel loud, personal, and difficult to ignore.",
    single: "When anxious attachers are single, they may feel the absence of connection quite intensely. They can spend a lot of emotional energy wondering when love will arrive and whether they are truly chosen.",
    romantic: "In romantic relationships, anxious attachers often bring passion, devotion, and emotional depth. They may also become highly alert to shifts in tone, texting patterns, reassurance, or perceived distance.",
    parent: "As parents, anxious attachers can be deeply loving and attentive. Under stress, they may become extra sensitive to responsiveness, closeness, or signs that they are getting the relationship wrong.",
  },
  dismissive: {
    title: "Dismissive Avoidant",
    shortBlurb: "You likely lean dismissive avoidant. This often means self-reliance feels safer than dependence, and too much emotional intensity can trigger the urge to create distance.",
    single: "When dismissive avoidants are single, they often function well on the surface and may genuinely enjoy autonomy. At the same time, emotional distance can become so familiar that it starts to feel like personality rather than protection.",
    romantic: "In romantic relationships, dismissive avoidants may care more deeply than they show. They can struggle when closeness becomes sustained, emotionally demanding, or hard to control, which may lead to withdrawal, minimising, or quiet deactivation.",
    parent: "As parents, dismissive avoidants may be loyal, practical, and committed, yet less comfortable with repeated emotional intensity. They may find needs easier to meet in action than in ongoing emotional attunement.",
  },
  fearful: {
    title: "Fearful Avoidant",
    shortBlurb: "You likely lean fearful avoidant. This often means you want closeness very deeply, but vulnerability can feel tangled up with danger, shame, or the fear of being hurt.",
    single: "When fearful avoidants are single, there is often a push-pull even in private. Part of them longs for intimacy, while another part stays braced for disappointment, engulfment, or sudden loss.",
    romantic: "In romantic relationships, fearful avoidants can experience intense connection alongside intense alarm. They may move toward closeness, then feel flooded by it, creating cycles of pursuit, retreat, longing, and confusion.",
    parent: "As parents, fearful avoidants can be loving, intuitive, and deeply protective. Under strain, they may become inconsistent or overwhelmed when emotional closeness activates their own unresolved alarm system.",
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
  const byDomain = {};

  questions.forEach((question, index) => {
    const answer = answers[index];
    if (answer == null || question.type === "single_choice") return;
    const normalized = normalizeLikert(answer, question.reverse);

    if (question.dimension === "anxiety") {
      totals.anxiety += normalized; counts.anxiety += 1;
      byDomain[question.domain] = byDomain[question.domain] || { anxiety: 0, avoidance: 0, aCount: 0, vCount: 0 };
      byDomain[question.domain].anxiety += normalized; byDomain[question.domain].aCount += 1;
    }
    if (question.dimension === "avoidance") {
      totals.avoidance += normalized; counts.avoidance += 1;
      byDomain[question.domain] = byDomain[question.domain] || { anxiety: 0, avoidance: 0, aCount: 0, vCount: 0 };
      byDomain[question.domain].avoidance += normalized; byDomain[question.domain].vCount += 1;
    }
    if (question.dimension === "fearful_marker") { totals.fearfulMarkers += normalized; counts.fearfulMarkers += 1; }
    if (question.measure === "self_esteem") { totals.selfEsteem += normalized; counts.selfEsteem += 1; }
    if (question.measure === "emotion_regulation") { totals.emotionRegulation += normalized; counts.emotionRegulation += 1; }
  });

  const averages = {
    anxiety: counts.anxiety ? totals.anxiety / counts.anxiety : 0,
    avoidance: counts.avoidance ? totals.avoidance / counts.avoidance : 0,
    fearfulMarkers: counts.fearfulMarkers ? totals.fearfulMarkers / counts.fearfulMarkers : 0,
    selfEsteem: counts.selfEsteem ? totals.selfEsteem / counts.selfEsteem : 0,
    emotionRegulation: counts.emotionRegulation ? totals.emotionRegulation / counts.emotionRegulation : 0,
  };

  const domains = Object.fromEntries(
    Object.entries(byDomain).map(([key, value]) => [
      key,
      { anxiety: value.aCount ? value.anxiety / value.aCount : 0, avoidance: value.vCount ? value.avoidance / value.vCount : 0 },
    ])
  );

  return { totals, counts, averages, domains };
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
    if (avoidance > anxiety + 0.2) resultKey = "dismissive";
    else if (anxiety > avoidance + 0.2) resultKey = "anxious";
    else if (anxiety > 3 && avoidance > 3) resultKey = "fearful";
    else resultKey = "secure";
  }

  if (resultKey === "anxious" && avoidance >= 3.1 && emotionRegulation >= 3.6) resultKey = "fearful";
  if (resultKey === "dismissive" && anxiety >= 3.05 && fearfulMarkers >= 3.5) resultKey = "fearful";
  if (resultKey === "anxious" && fearfulMarkers >= 3.6 && avoidance >= 2.9) resultKey = "fearful";
  if (resultKey === "secure" && selfEsteem <= 2.5 && anxiety >= 3.1) resultKey = "anxious";

  const confidenceGap = Math.abs(anxiety - 3) + Math.abs(avoidance - 3) + Math.abs(fearfulMarkers - 3) * 0.35;
  const confidence = confidenceGap >= 1.35 ? "Higher" : confidenceGap >= 0.8 ? "Moderate" : "Lighter";
  return { resultKey, confidence };
}

/* ── Screen Components ── */
function IntroScreen({ onStart, onNavigate }) {
  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }} className="min-h-[80vh] flex flex-col justify-center items-center px-4 relative">
      <DecorativeStar className="w-5 h-5 text-fuchsia-400 absolute md:top-20 top-10 md:left-[20%] left-[10%] animate-pulse" />
      <DecorativeStar className="w-6 h-6 text-cyan-400 absolute md:bottom-32 bottom-20 md:right-[20%] right-[10%] opacity-60" />

      <div className="max-w-3xl mx-auto text-center">
        <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-tight text-slate-800">
          <span className="italic bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-600">
            Full Assessment
          </span>
        </h1>
        <p className="mt-8 text-lg sm:text-xl text-slate-600 font-light leading-relaxed max-w-2xl mx-auto">
          A deeper, multi-layered assessment across relationships, behavior, self-worth, and emotional regulation. Takes ~12 minutes.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6 items-center text-sm font-medium text-slate-500 font-serif italic tracking-wide">
           <span className="flex items-center gap-2 border-b border-fuchsia-100/50 pb-2"><Check className="w-4 h-4 text-fuchsia-500"/> 70+ adaptive questions</span>
           <span className="flex items-center gap-2 border-b border-violet-100/50 pb-2"><Check className="w-4 h-4 text-violet-500"/> Deep context metrics</span>
           <span className="flex items-center gap-2 border-b border-indigo-100/50 pb-2"><Check className="w-4 h-4 text-indigo-500"/> Private & secure</span>
        </div>

        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
          <button onClick={onStart} className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white text-sm uppercase tracking-widest font-bold rounded-full transition-all flex items-center gap-3 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5">
            Begin Full Assessment <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => onNavigate("home")} className="px-8 py-4 bg-white/50 hover:bg-white text-slate-700 text-sm uppercase tracking-widest font-bold rounded-full transition-all border border-slate-200/50 flex items-center gap-2 shadow-sm backdrop-blur-sm">
            <Home className="w-4 h-4" /> Home
          </button>
        </div>
      </div>
    </Motion.div>
  );
}

function QuestionCard({ question, questionIndex, totalQuestions, selected, onSelect, progress, onBack, onNext }) {
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
          <Motion.div 
             initial={{ width: 0 }} 
             animate={{ width: `${progress}%` }} 
             transition={{ duration: 0.5 }} 
             className="h-full bg-gradient-to-r from-fuchsia-400 via-violet-500 to-indigo-500" 
          />
       </div>

      <Motion.div key={question.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ type: "spring", stiffness: 70, damping: 15 }} className="w-full max-w-3xl mx-auto flex-grow flex flex-col justify-center">
        
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-400/80 mb-5 flex items-center gap-2">
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
              <Motion.button
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
                  {isSelected && <Motion.div layoutId="bubble_full" className="h-2.5 w-2.5 rounded-full bg-white" />}
                </div>
                <span className={`text-base sm:text-lg transition-colors duration-300 ${isSelected ? "text-violet-900 font-semibold" : "text-slate-700 font-medium"}`}>
                  {option.label}
                </span>
              </Motion.button>
            );
          })}
        </div>
      </Motion.div>

      {/* Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 w-full p-5 bg-gradient-to-t from-[#FDFDFE] via-[#FDFDFE]/90 to-transparent z-40">
         <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button type="button" onClick={onBack} disabled={questionIndex === 0} className="min-w-[100px] px-5 py-3 rounded-full text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 hover:bg-white/80 disabled:opacity-30 flex items-center gap-2 transition-all">
               <ArrowLeft className="w-4 h-4" /> Back
            </button>
            
            {/* Mobile: show tap hint */}
            <div className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase text-center">
               <span className="sm:hidden text-slate-400/70 italic tracking-wider">
                  {selected != null ? "Advancing…" : "Tap an answer"}
               </span>
            </div>
            
            <div className="min-w-[100px] flex justify-end">
              {selected != null && (
                <button type="button" onClick={onNext} className="sm:hidden px-5 py-3 rounded-full text-sm font-bold uppercase tracking-widest text-violet-600 hover:bg-white/80 flex items-center gap-2 transition-all">
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

  const snapshot = [
    { label: "Attachment anxiety", value: metrics.averages.anxiety, gradient: STYLES.anxious.accent || "from-fuchsia-500 to-indigo-600" },
    { label: "Attachment avoidance", value: metrics.averages.avoidance, gradient: STYLES.dismissive.accent || "from-slate-600 to-violet-600" },
    { label: "Push-pull intensity", value: metrics.averages.fearfulMarkers, gradient: STYLES.fearful.accent || "from-violet-600 to-pink-600" },
    { label: "Negative self-model", value: metrics.averages.selfEsteem, gradient: "from-amber-400 via-orange-500 to-rose-500" },
    { label: "Emotion dysregulation", value: metrics.averages.emotionRegulation, gradient: "from-rose-400 via-pink-500 to-fuchsia-600" },
  ];

  const parentTitle = demo.children === "yes" ? `${result.title} as a parent or caregiver` : `${result.title} in a caregiving role`;

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }} className="w-full max-w-4xl mx-auto py-16 px-4">
      {/* Editorial Header */}
      <div className="text-center mb-20 relative">
        <DecorativeStar className="w-8 h-8 opacity-40 absolute -top-8 left-1/2 -translate-x-1/2 text-violet-400" />
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-6 mt-8">Your Core Pattern</p>
        <h1 className={`font-serif text-5xl sm:text-7xl tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r ${style.accent}`}>
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
                        <Motion.div
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
               <p className="text-slate-300 font-light leading-relaxed mb-6 max-w-lg">
                 You've completed the full assessment. The metrics above represent a comprehensive snapshot of your internal world. Take your time to digest this.
               </p>
               <p className="text-slate-300 font-light leading-relaxed mb-10 max-w-lg">
                 <a href="https://medium.com/my-avoidant-ex" target="_blank" rel="noopener noreferrer" className="text-fuchsia-400 hover:text-fuchsia-300 underline decoration-fuchsia-400/30 hover:decoration-fuchsia-300/80 transition-colors">
                   Read more on your attachment style in the My Avoidant Ex publication here.
                 </a>
               </p>
               <div className="flex flex-col sm:flex-row gap-4">
                 <button onClick={() => onNavigate("home")} className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                    <Home className="w-4 h-4"/> Back to Home
                 </button>
                 <button onClick={onRestart} className="px-8 py-4 bg-white/10 text-white rounded-full font-bold uppercase tracking-widest text-[12px] hover:bg-white/20 transition-colors flex items-center justify-center gap-2 border border-white/10">
                    <RefreshCw className="w-4 h-4"/> Retake Assessment
                 </button>
               </div>
            </div>
         </div>
      </div>

      <div className="flex flex-wrap justify-center gap-6 border-t border-slate-200 pt-12 pb-12">
        <button onClick={onRestart} className="px-6 py-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors">
          <RefreshCw className="w-4 h-4" /> Retake Assessment
        </button>
        <button onClick={() => onNavigate("home")} className="px-6 py-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors">
          <Home className="w-4 h-4" /> Home
        </button>
      </div>
    </Motion.div>
  );
}

/* ── Main Component ── */
export default function FullAssessment({ onNavigate }) {
  const [started, setStarted] = useLocalStorage("mae_full_started", false);
  const [answersById, setAnswersById] = useLocalStorage("mae_full_answers", {});
  const [currentIndex, setCurrentIndex] = useLocalStorage("mae_full_index", 0);
  const [showResult, setShowResult] = useLocalStorage("mae_full_result", false);
  const advanceRef = useRef(null);

  const demo = useMemo(() => ({
    relationshipStatus: answersById.relationshipStatus,
    ageBand: answersById.ageBand,
    gender: answersById.gender,
    children: answersById.children,
  }), [answersById.relationshipStatus, answersById.ageBand, answersById.gender, answersById.children]);

  const questions = useMemo(() => buildQuizQuestions(demo), [demo]);
  const answers = useMemo(() => questions.map((q) => answersById[q.id] ?? null), [questions, answersById]);
  const currentQuestion = questions[currentIndex];
  const selected = currentQuestion ? (answersById[currentQuestion.id] ?? null) : null;
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const metrics = useMemo(() => computeMetrics(questions, answers), [questions, answers]);
  const derived = useMemo(() => deriveAttachmentStyle(metrics), [metrics]);

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
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setCurrentIndex((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 300);
    
    return () => {
      if (advanceRef.current) clearTimeout(advanceRef.current);
    };
  }, [answersById, currentQuestion?.id]);

  const handleSelect = useCallback((value) => {
    if (!currentQuestion) return;
    setAnswersById((prev) => ({ ...prev, [currentQuestion.id]: value }));
  }, [currentQuestion, setAnswersById]);

  const handleNext = useCallback(() => {
    if (selected == null) return;
    if (currentIndex === questions.length - 1) {
      setShowResult(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selected, currentIndex, questions.length, setShowResult, setCurrentIndex]);

  const handleBack = useCallback(() => {
    if (advanceRef.current) {
      clearTimeout(advanceRef.current);
      advanceRef.current = null;
    }
    if (currentIndex === 0) return;
    setCurrentIndex((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentIndex, setCurrentIndex]);

  function handleRestart() {
    if (advanceRef.current) clearTimeout(advanceRef.current);
    setStarted(false);
    setAnswersById({});
    setCurrentIndex(0);
    setShowResult(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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
            />
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
