import { useEffect, useRef, useState } from "react";
import { useHub } from "../App.jsx";
import { SCHEMAS } from "../data/constants.js";
import { addDoc, updateDoc } from "../lib/store.js";

/** Add / edit dialog for team members, Onyx agents and automations. */
export default function EntitySheet({ kind, item, onClose }) {
  const { toast } = useHub();
  const sc = SCHEMAS[kind];
  const [vals, setVals] = useState(() =>
    Object.fromEntries(sc.fields.map((f) => [f.k, item?.[f.k] ?? (f.k === "status" ? "Live" : "")]))
  );
  const [err, setErr] = useState("");
  const first = useRef(null);

  useEffect(() => {
    first.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (k) => (e) => setVals((v) => ({ ...v, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    const data = {};
    for (const f of sc.fields) {
      const v = String(vals[f.k] ?? "").trim();
      if (f.req && !v) return setErr(`${f.l} is required.`);
      data[f.k] = f.type === "number" ? (v === "" ? null : Number(v)) : v;
    }
    data.updatedAt = Date.now();
    try {
      if (item) await updateDoc(sc.coll, item.id, data);
      else await addDoc(sc.coll, { ...data, createdAt: Date.now() });
      toast(item ? "Saved" : "Added");
      onClose();
    } catch {
      setErr("Couldn't save. Try again.");
    }
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheetT" onSubmit={submit}>
        <h3 id="sheetT">{item ? "Edit" : "Add"} {sc.label}</h3>
        {sc.fields.map((f, i) => {
          const id = `sh_${kind}_${f.k}`;
          const common = { id, className: "in-text", value: vals[f.k] ?? "", onChange: set(f.k), ref: i === 0 ? first : undefined };
          return (
            <div className="fld" key={f.k}>
              <label htmlFor={id}>{f.l}{f.req && <span style={{ color: "var(--danger)" }}> *</span>}</label>
              {f.type === "select" ? (
                <select {...common}>
                  <option value="">Choose…</option>
                  {f.opts.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : f.type === "textarea" ? (
                <textarea {...common} maxLength={1500} />
              ) : (
                <input {...common} type={f.type === "number" ? "number" : "text"} min={f.type === "number" ? 0 : undefined}
                  step={f.type === "number" ? 0.5 : undefined} maxLength={200} placeholder={f.ph || ""} />
              )}
            </div>
          );
        })}
        <span className="err">{err}</span>
        <div className="acts">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-night">{item ? "Save changes" : `Add ${sc.label}`}</button>
        </div>
      </form>
    </div>
  );
}
