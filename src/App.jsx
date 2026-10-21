import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useCollection } from "./lib/store.js";
import { Toast } from "./components/ui.jsx";
import Header from "./components/Header.jsx";
import EntitySheet from "./components/EntitySheet.jsx";
import Home from "./pages/Home.jsx";
import Intake from "./pages/Intake.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Team from "./pages/Team.jsx";
import Agents from "./pages/Agents.jsx";
import Learn from "./pages/Learn.jsx";

const VIEWS = ["home", "intake", "responses", "dashboard", "team", "agents", "learn"];
const Hub = createContext(null);
export const useHub = () => useContext(Hub);

function readHash() {
  const h = window.location.hash.slice(1);
  return VIEWS.includes(h) ? h : "home";
}

export default function App() {
  const intake = useCollection("intake", "createdAt");
  const team = useCollection("team");
  const agents = useCollection("agents");
  const automations = useCollection("automations");

  // Route: #home, #intake, #responses, #dashboard, #team, #agents, #learn
  const [route, setRoute] = useState(readHash);
  useEffect(() => {
    const on = () => setRoute(readHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const go = useCallback((v) => {
    if (window.location.hash !== "#" + v) window.location.hash = v;
    else setRoute(v);
    window.scrollTo({ top: 0 });
  }, []);

  // Editor mode: shows add / edit / delete / status controls.
  // This is a simple local switch, NOT security. Replace with real auth (see README).
  const [canEdit, setCanEdit] = useState(() => {
    try { return localStorage.getItem("aihub:editor") === "1"; } catch { return false; }
  });
  const toggleEdit = () => setCanEdit((v) => {
    try { localStorage.setItem("aihub:editor", v ? "0" : "1"); } catch {}
    return !v;
  });

  const [toastMsg, setToastMsg] = useState("");
  const timer = useRef();
  const toast = useCallback((m) => {
    setToastMsg(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastMsg(""), 2800);
  }, []);

  const [sheet, setSheet] = useState(null); // {kind, item?}
  const [draftTitle, setDraftTitle] = useState("");

  const ctx = {
    intake, team, agents, automations, canEdit, toast, go,
    openSheet: (kind, item) => setSheet({ kind, item }),
    draftTitle, setDraftTitle,
  };

  const page = route === "responses" ? "intake" : route;

  return (
    <Hub.Provider value={ctx}>
      <Header current={page} />
      <main className="wrap">
        {page === "home" && <Home />}
        {page === "intake" && <Intake initialTab={route === "responses" ? "resp" : "form"} key={route} />}
        {page === "dashboard" && <Dashboard />}
        {page === "team" && <Team />}
        {page === "agents" && <Agents />}
        {page === "learn" && <Learn />}
      </main>
      <footer>
        <div className="wrap">
          <span>AI Hub · built by the AI Team</span>
          <label className="admin-toggle">
            <input type="checkbox" checked={canEdit} onChange={toggleEdit} /> Editor mode
          </label>
        </div>
      </footer>
      {sheet && <EntitySheet kind={sheet.kind} item={sheet.item} onClose={() => setSheet(null)} />}
      <Toast message={toastMsg} />
    </Hub.Provider>
  );
}
