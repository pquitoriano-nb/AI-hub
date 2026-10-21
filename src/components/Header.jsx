import { useHub } from "../App.jsx";

const TABS = [
  ["home", "Home"],
  ["intake", "Intake form"],
  ["dashboard", "Dashboard"],
  ["team", "Our team"],
  ["agents", "Agents & automations"],
  ["learn", "AI 101"],
];

export default function Header({ current }) {
  const { go } = useHub();
  const link = (v) => ({ href: "#" + v, onClick: (e) => { e.preventDefault(); go(v); } });
  return (
    <header className="top">
      <div className="wrap nav">
        <a className="brandmark" {...link("home")}>
          <span className="orb-s" aria-hidden="true" />AI Hub
        </a>
        <nav className="tabs" aria-label="Sections">
          {TABS.map(([v, label]) => (
            <a key={v} className="tab" aria-current={current === v ? "page" : undefined} {...link(v)}>{label}</a>
          ))}
        </nav>
        <a className="btn btn-night cta-top" {...link("intake")}>
          Submit a request <span className="arr" aria-hidden="true">↗</span>
        </a>
      </div>
    </header>
  );
}
