'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';
import { PAGE_DEFAULTS, PAGE_INFO, PAGE_KEYS, PAGE_TOKENS } from '@/lib/pages-content';
import { ConfirmDialog, FormMessage, SingleImage, useMutation } from './ui';

function HowTo() {
  return (
    <details className="panel more" style={{ marginTop: 4 }}>
      <summary><Icon name="chevronDown" size={16} /> How to format the text, and words that fill in automatically</summary>
      <div className="panel__body" style={{ display: 'grid', gap: 12, fontSize: 14 }}>
        <ul style={{ listStyle: 'disc', paddingLeft: 20, display: 'grid', gap: 4 }}>
          <li>Leave an <b>empty line</b> to start a new paragraph.</li>
          <li>Start a line with <code>## </code> to make it a <b>heading</b>, e.g. <code>## Delivery time</code></li>
          <li>Start lines with <code>- </code> to make a <b>bullet list</b>.</li>
        </ul>
        <div>
          These words are replaced with your current details from Store Settings, so you never need to update the pages when they change. If a value is empty (for example no free-delivery amount), that line is hidden.
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {PAGE_TOKENS.map(([k, label]) => (
              <span key={k} className="cat-tag" title={label}><code>{`{${k}}`}</code> – {label}</span>
            ))}
          </div>
        </div>
      </div>
    </details>
  );
}

function FaqEditor({ items, onChange }) {
  const update = (i, k, v) => onChange(items.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const move = (i, d) => {
    const n = [...items];
    const j = i + d;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {items.map((it, i) => (
        <div key={i} className="panel panel__body" style={{ display: 'grid', gap: 8, background: 'var(--surface-2)' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <b style={{ minWidth: 22 }}>{i + 1}.</b>
            <input className="input" value={it.q} onChange={(e) => update(i, 'q', e.target.value)} placeholder="Question" aria-label={`Question ${i + 1}`} />
            <button type="button" className="icon-action" onClick={() => move(i, -1)} aria-label="Move up" title="Move up"><Icon name="chevronDown" size={15} style={{ transform: 'rotate(180deg)' }} /></button>
            <button type="button" className="icon-action" onClick={() => move(i, 1)} aria-label="Move down" title="Move down"><Icon name="chevronDown" size={15} /></button>
            <button type="button" className="icon-action icon-action--danger" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remove question" title="Remove"><Icon name="trash" size={15} /></button>
          </div>
          <textarea className="textarea" style={{ minHeight: 70 }} value={it.a} onChange={(e) => update(i, 'a', e.target.value)} placeholder="Answer" aria-label={`Answer ${i + 1}`} />
        </div>
      ))}
      <div>
        <button type="button" className="btn btn--outline btn--sm" onClick={() => onChange([...items, { q: '', a: '' }])}><Icon name="plus" size={15} /> Add a question</button>
      </div>
    </div>
  );
}

export default function PagesManager({ initial }) {
  const [pages, setPages] = useState(initial);
  const [active, setActive] = useState('about');
  const [confirmReset, setConfirmReset] = useState(false);
  const [state, run, setState] = useMutation();
  const page = pages[active];
  const set = (k, v) => setPages((p) => ({ ...p, [active]: { ...p[active], [k]: v } }));

  async function save(e) {
    e?.preventDefault();
    try {
      await run('/api/admin/settings/pages', { method: 'PUT', body: pages }, { success: `“${page.title}” saved. Changes are live on the website.` });
    } catch {}
  }

  return (
    <>
      <div className="page-bar">
        <div>
          <h1>Pages</h1>
          <p>Edit the wording of your About, FAQ, Contact and policy pages. Click Save when you’re done.</p>
        </div>
      </div>
      <nav className="tabs-nav">
        {PAGE_KEYS.map((k) => (
          <a
            key={k}
            href={`#${k}`}
            className={active === k ? 'is-active' : ''}
            onClick={(e) => {
              e.preventDefault();
              setActive(k);
              setState({ busy: false, error: null, message: null });
            }}
          >
            {PAGE_INFO[k].label}
          </a>
        ))}
      </nav>

      <form className="panel" onSubmit={save}>
        <div className="panel__head">
          <h3>{PAGE_INFO[active].label}</h3>
          <a href={PAGE_INFO[active].path} target="_blank" className="btn btn--outline btn--sm"><Icon name="eye" size={15} /> See page</a>
        </div>
        <div className="panel__body form-grid">
          <div className="field">
            <label htmlFor="pg-title">Page title</label>
            <input id="pg-title" className="input" value={page.title} onChange={(e) => set('title', e.target.value)} required />
            <span className="hint">Also used for the link in the footer.</span>
          </div>
          <div className="field">
            <label htmlFor="pg-intro">Short line under the title</label>
            <input id="pg-intro" className="input" value={page.intro} onChange={(e) => set('intro', e.target.value)} />
          </div>

          {active === 'about' && (
            <>
              <div className="field">
                <label htmlFor="pg-heading">Heading above the text</label>
                <input id="pg-heading" className="input" value={page.heading} onChange={(e) => set('heading', e.target.value)} />
              </div>
              <div className="field">
                <span className="label">Picture next to the text</span>
                <SingleImage value={page.image} onChange={(v) => set('image', v)} folder="settings" />
                <span className="hint">For example a photo of your shop. If empty, a category picture is used.</span>
              </div>
            </>
          )}

          {active === 'faq' && (
            <div className="field span-2">
              <span className="label">Questions and answers</span>
              <FaqEditor items={page.items} onChange={(v) => set('items', v)} />
            </div>
          )}

          {'body' in page && (
            <div className="field span-2">
              <label htmlFor="pg-body">Page text</label>
              <textarea id="pg-body" className="textarea" style={{ minHeight: 360, fontSize: 14.5, lineHeight: 1.6 }} value={page.body} onChange={(e) => set('body', e.target.value)} />
            </div>
          )}

          {active === 'contact' && (
            <p className="help span-2">Your phone, WhatsApp, email, address, map link and opening hours on this page come from <a className="link" href="/admin/settings#shop">Store Settings</a>.</p>
          )}

          {active !== 'contact' && <div className="span-2"><HowTo /></div>}

          <div className="span-2"><FormMessage state={state} /></div>
          <div className="span-2" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn--primary" disabled={state.busy}>{state.busy ? 'Saving…' : 'Save'}</button>
            <button type="button" className="btn btn--ghost" onClick={() => setConfirmReset(true)}>Use the original text again</button>
          </div>
        </div>
      </form>

      {confirmReset && (
        <ConfirmDialog
          title={`Restore the original “${PAGE_INFO[active].label}” text?`}
          confirmLabel="Restore original text"
          danger={false}
          onClose={() => setConfirmReset(false)}
          onConfirm={() => {
            setPages((p) => ({ ...p, [active]: structuredClone(PAGE_DEFAULTS[active]) }));
            setConfirmReset(false);
            setState({ busy: false, error: null, message: 'Original text restored in the editor. Click Save to put it on the website.' });
          }}
        >
          <p>Your changes to this page will be replaced in the editor. Nothing changes on the website until you click Save.</p>
        </ConfirmDialog>
      )}
    </>
  );
}
