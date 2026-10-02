"use client";

import { useId, useState } from "react";
import { Check, FileText, Upload } from "lucide-react";
import { sarahDocumentGroups, sarahSampleDocuments, sarahQuote } from "@/lib/sarah-demo";
import { aed } from "@/lib/format";
import type { Action, DemoDocument } from "@/lib/types";

export function SarahDocuments({ act }: { act: (action: Action, label: string) => void }) {
  const [documents, setDocuments] = useState<DemoDocument[]>([]);
  const [error, setError] = useState("");
  const inputId = useId();
  const complete = sarahDocumentGroups.every((group) => documents.some((doc) => doc.group === group.id));
  const ready = sarahDocumentGroups.filter((group) => documents.some((doc) => doc.group === group.id)).length;
  return <section className="wu-sarah-card" aria-label="Sarah’s family assessment documents">
    <div className="wu-sarah-heading"><span className="hal-kicker">FAMILY ASSESSMENT · DEMO</span><span className="wu-sarah-status" role="status">{ready} of 5 groups ready</span></div>
    <h3>Your document checklist</h3>
    <p className="wu-note">Sarah · December move · Year 6 &amp; Year 10 · French · Engineering career</p>
    <ol className="wu-sarah-docs">
      {sarahDocumentGroups.map((group, index) => {
        const files = documents.filter((doc) => doc.group === group.id);
        return <li key={group.id}>
          <span className="wu-sarah-number" aria-hidden>{files.length ? <Check size={16} /> : index + 1}</span>
          <div className="wu-sarah-doc-body"><h4>{group.title}</h4><p>{group.detail}</p>
            {files.length > 0 && <ul className="wu-sarah-files">{files.map((file) => <li key={file.name}><FileText size={14} aria-hidden /><span>{file.name}</span></li>)}</ul>}
            <label className="wu-sarah-attach" htmlFor={`${inputId}-${group.id}`}><Upload size={14} aria-hidden />{files.length ? "Replace demo files" : "Attach demo files"}</label>
            <input id={`${inputId}-${group.id}`} type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" className="wu-sarah-file-input" onChange={(event) => {
              const selected = Array.from(event.target.files ?? []);
              if (!selected.length) return;
              if (selected.length > 8 || selected.some((file) => file.size > 10 * 1024 * 1024 || !/\.(?:pdf|png|jpe?g|docx?)$/i.test(file.name))) {
                setError("Choose up to 8 PDF, image or Word demo files per group, each under 10 MB.");
              } else {
                setError("");
                setDocuments((previous) => [...previous.filter((doc) => doc.group !== group.id), ...selected.map((file) => ({ group: group.id, name: file.name }))]);
              }
              event.target.value = "";
            }} />
          </div>
        </li>;
      })}
    </ol>
    <p className="wu-note">Use fictional or redacted documents. Only file names are kept in this local demo; file contents are never sent or read. The assessment uses Sarah’s fictional sample profile.</p>
    {error && <p role="alert" className="wu-sarah-error">{error}</p>}
    <div className="wu-sarah-actions">
      <button className="hal-btn hal-btn--secondary" type="button" onClick={() => { setDocuments(sarahSampleDocuments); setError(""); }}>Use Sarah’s sample documents</button>
      <button className="hal-btn hal-btn--primary" type="button" disabled={!complete} onClick={() => act({ a: "sarahDemo", stage: "assessment", documents }, `I’ve uploaded the demo document pack: ${documents.map((doc) => doc.name).join(", ")}. Please complete my family assessment.`)}>Submit for demo assessment</button>
    </div>
  </section>;
}

export function SarahQuote() {
  return <section className="wu-sarah-card wu-sarah-quote" aria-label="Sarah’s itemized mock relocation quotation">
    <div className="wu-sarah-heading"><span className="hal-kicker">RELOCATION QUOTATION</span><span className="wu-sarah-status">Mock provider · sample pricing</span></div>
    <h3>One family. A coordinated move.</h3>
    <p className="wu-note">{sarahQuote.reference} · Prepared for Sarah Martin · {sarahQuote.partner} (fictional)</p>
    <dl className="wu-sarah-meta"><div><dt>Adviser</dt><dd>{sarahQuote.adviser} (demo)</dd></div><div><dt>Terms</dt><dd>Sample offer valid 14 days from preparation</dd></div><div><dt>Scope</dt><dd>Family of four · two school applications · career coaching · arrival planning</dd></div></dl>
    <table className="wu-sarah-costs"><caption>Illustrative partner service fees</caption><thead><tr><th scope="col">Service</th><th scope="col">Amount</th></tr></thead>
      <tbody>{sarahQuote.lines.map(([label, amount]) => <tr key={label}><th scope="row">{label}</th><td>{aed(amount)}</td></tr>)}<tr><th scope="row">Subtotal</th><td>{aed(sarahQuote.subtotal)}</td></tr><tr><th scope="row">Illustrative VAT (5%)</th><td>{aed(sarahQuote.tax)}</td></tr></tbody>
      <tfoot><tr><th scope="row">Total partner fee</th><td>{aed(sarahQuote.total)}</td></tr></tfoot>
    </table>
    <p className="wu-sarah-payment">Sample payment schedule: {aed(sarahQuote.deposit)} on engagement · {aed(sarahQuote.total - sarahQuote.deposit)} after delivery.</p>
    <div className="wu-sarah-budget"><h4>Paid separately to schools and providers</h4><p>BSAK published 2025/26 tuition reference: Year 6, AED 55,520; Year 10, AED 74,560. Combined annual reference: <strong>{aed(sarahQuote.schoolReference)}</strong>.</p><p>Assumed rent: AED 150,000 per year. Tuition reference + assumed rent: <strong>{aed(sarahQuote.schoolReference + 150000)} per year</strong>, before other household costs. These are separate from the partner fee.</p><a href="https://www.britishschool.sch.ae/admissions/fees" target="_blank" rel="noopener noreferrer">View the school’s published fee reference</a></div>
    <p className="wu-note">Current school fees, term-entry billing, school buses, uniforms, exam fees, rent deposits, agency charges, government fees, insurance, flights and temporary accommodation are excluded. No school place, job, property or residence approval is guaranteed. No payment is collected.</p>
    <p className="wu-sarah-fineprint">This is a sample commercial quotation from a fictional partner. A real quotation must be issued and approved by the actual provider.</p>
  </section>;
}
