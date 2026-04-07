import React, { useState, useEffect, lazy, Suspense } from "react";

const Home = lazy(() => import("./pages/Home"));
const QuickQuiz = lazy(() => import("./pages/QuickQuiz"));
const FullAssessment = lazy(() => import("./pages/FullAssessment"));

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFE]">
      <div className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
        Loading…
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState(() => {
    const hash = window.location.hash.slice(1);
    return hash || "home";
  });

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.slice(1);
      setPage(hash || "home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const navigate = (target) => {
    window.location.hash = target;
  };

  return (
    <Suspense fallback={<PageFallback />}>
      {page === "home" && <Home onNavigate={navigate} />}
      {page === "quick-quiz" && <QuickQuiz onNavigate={navigate} />}
      {page === "full-assessment" && <FullAssessment onNavigate={navigate} />}
    </Suspense>
  );
}

export default App;
