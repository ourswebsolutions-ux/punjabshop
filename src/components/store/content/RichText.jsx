/**
 * Fills in {words} and turns plain text into paragraphs, "## " headings and
 * "- " bullet lists. A line whose {word} has no value is left out.
 */
export function fillTokens(text, tokens) {
  return String(text || '')
    .split('\n')
    .filter((line) => !/\{(\w+)\}/g.test(line) || ![...line.matchAll(/\{(\w+)\}/g)].some(([, k]) => k in tokens && !tokens[k]))
    .map((line) => line.replace(/\{(\w+)\}/g, (m, k) => (k in tokens ? tokens[k] : m)))
    .join('\n');
}

export default function RichText({ text, tokens = {} }) {
  const blocks = fillTokens(text, tokens)
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  const out = [];
  blocks.forEach((block, i) => {
    const lines = block.split('\n');
    let rest = lines;
    if (lines[0].startsWith('## ')) {
      out.push(<h2 key={`h${i}`}>{lines[0].slice(3)}</h2>);
      rest = lines.slice(1);
    }
    if (!rest.length) return;
    // Consecutive "- " lines become one list; other lines become a paragraph.
    let para = [];
    let list = [];
    const flush = (k) => {
      if (para.length) out.push(<p key={`p${i}-${k}`}>{para.flatMap((l, j) => (j ? [<br key={j} />, l] : [l]))}</p>);
      if (list.length) out.push(<ul key={`u${i}-${k}`}>{list.map((l, j) => <li key={j}>{l}</li>)}</ul>);
      para = [];
      list = [];
    };
    rest.forEach((line, k) => {
      if (line.startsWith('- ')) {
        if (para.length) flush(`a${k}`);
        list.push(line.slice(2));
      } else {
        if (list.length) flush(`b${k}`);
        para.push(line);
      }
    });
    flush('end');
  });
  return <div className="prose">{out}</div>;
}
