import React, { useState, useEffect } from "react";
import Home from "./pages/Home";
import QuickQuiz from "./pages/QuickQuiz";
import FullAssessment from "./pages/FullAssessment";

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
    <>
      {page === "home" && <Home onNavigate={navigate} />}
      {page === "quick-quiz" && <QuickQuiz onNavigate={navigate} />}
      {page === "full-assessment" && <FullAssessment onNavigate={navigate} />}
    </>
  );
}

export default App;
