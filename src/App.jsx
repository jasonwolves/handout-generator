import { useState, useCallback } from "react";
import * as mammoth from "mammoth";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Serif+4:ital,wght@0,300;0,400;1,300&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Source Serif 4', serif; background: #1a1208; min-height: 100vh; }
  .app { min-height: 100vh; background: #1a1208; color: #f5ead6; display: flex; flex-direction: column; }

  .header { text-align: center; padding: 48px 24px 32px; border-bottom: 1px solid rgba(212,175,95,0.2); }
  .header::before { content: '✦'; display: block; font-size: 14px; color: #d4af5f; margin-bottom: 12px; letter-spacing: 8px; }
  .header h1 { font-family: 'Playfair Display', serif; font-size: clamp(28px, 5vw, 48px); font-weight: 700; color: #f5ead6; line-height: 1.1; }
  .header h1 span { color: #d4af5f; }
  .header p { margin-top: 12px; color: rgba(245,234,214,0.55); font-size: 16px; font-style: italic; font-weight: 300; }

  .main { flex: 1; max-width: 900px; margin: 0 auto; width: 100%; padding: 40px 24px; display: flex; flex-direction: column; gap: 32px; }

  .upload-zone { border: 1.5px dashed rgba(212,175,95,0.4); border-radius: 4px; padding: 56px 40px; text-align: center; cursor: pointer; transition: all 0.3s ease; background: rgba(212,175,95,0.03); position: relative; overflow: hidden; }
  .upload-zone:hover, .upload-zone.drag-over { border-color: #d4af5f; background: rgba(212,175,95,0.07); }
  .upload-icon { font-size: 40px; margin-bottom: 16px; opacity: 0.7; }
  .upload-zone h2 { font-family: 'Playfair Display', serif; font-size: 22px; color: #f5ead6; margin-bottom: 8px; }
  .upload-zone p { color: rgba(245,234,214,0.5); font-size: 14px; font-weight: 300; }
  .upload-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
  .file-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(212,175,95,0.12); border: 1px solid rgba(212,175,95,0.3); border-radius: 2px; padding: 10px 18px; color: #d4af5f; font-size: 14px; margin-top: 16px; }

  .controls { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 600px) { .controls { grid-template-columns: 1fr; } }
  .control-group { display: flex; flex-direction: column; gap: 8px; }
  .control-group label { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: rgba(212,175,95,0.7); font-weight: 400; }
  .text-input, select, textarea { background: rgba(245,234,214,0.05); border: 1px solid rgba(212,175,95,0.2); border-radius: 2px; color: #f5ead6; padding: 12px 14px; font-family: 'Source Serif 4', serif; font-size: 14px; transition: border-color 0.2s; width: 100%; }
  .text-input:focus, select:focus, textarea:focus { outline: none; border-color: #d4af5f; }
  select option { background: #1a1208; }
  textarea { resize: vertical; min-height: 80px; font-style: italic; }

  .generate-btn { background: #d4af5f; color: #1a1208; border: none; padding: 16px 40px; font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 600; cursor: pointer; border-radius: 2px; width: 100%; transition: all 0.2s; letter-spacing: 0.5px; }
  .generate-btn:hover:not(:disabled) { background: #e8c96f; transform: translateY(-1px); }
  .generate-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .status { text-align: center; padding: 16px; color: rgba(245,234,214,0.6); font-style: italic; font-size: 15px; display: flex; align-items: center; justify-content: center; gap: 10px; }
  .spinner { width: 18px; height: 18px; border: 2px solid rgba(212,175,95,0.2); border-top-color: #d4af5f; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .error { background: rgba(200,60,60,0.1); border: 1px solid rgba(200,60,60,0.3); border-radius: 2px; padding: 16px; color: #f08080; font-size: 14px; }

  .result-section { border-top: 1px solid rgba(212,175,95,0.2); padding-top: 32px; }
  .result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
  .result-header h2 { font-family: 'Playfair Display', serif; font-size: 22px; color: #d4af5f; }
  .download-btns { display: flex; gap: 10px; flex-wrap: wrap; }

  .btn-outline { background: transparent; border: 1px solid rgba(212,175,95,0.4); color: #d4af5f; padding: 8px 18px; font-family: 'Source Serif 4', serif; font-size: 13px; cursor: pointer; border-radius: 2px; transition: all 0.2s; }
  .btn-outline:hover { border-color: #d4af5f; background: rgba(212,175,95,0.1); }

  .handout { background: #fdf8f0; color: #1a1208; border-radius: 2px; padding: 56px 64px; font-family: 'Source Serif 4', serif; line-height: 1.85; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
  @media (max-width: 600px) { .handout { padding: 32px 24px; } }
  .handout-title { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; text-align: center; margin-bottom: 6px; color: #1a1208; }
  .handout-subtitle { text-align: center; font-style: italic; color: rgba(26,18,8,0.5); font-size: 14px; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 1px solid rgba(26,18,8,0.15); }
  .handout-section-title { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #8b6914; margin-bottom: 12px; margin-top: 32px; }
  .handout-line { margin-bottom: 10px; font-size: 15px; color: #1a1208; }
  .blank { display: inline-block; border-bottom: 1.5px solid #1a1208; min-width: 160px; margin: 0 4px; vertical-align: bottom; height: 20px; }
  .handout-note { background: rgba(212,175,95,0.1); border-left: 3px solid #d4af5f; padding: 14px 18px; margin: 20px 0; font-size: 14px; font-style: italic; color: rgba(26,18,8,0.75); border-radius: 0 2px 2px 0; }
  .handout-footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid rgba(26,18,8,0.12); text-align: center; font-size: 12px; color: rgba(26,18,8,0.35); letter-spacing: 1px; text-transform: uppercase; }
`;

const parsePDF = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const base64 = e.target.result.split(",")[1];
        resolve({ base64, type: "pdf" });
      } catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const parseDOCX = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const result = await mammoth.extractRawText({ arrayBuffer: e.target.result });
        resolve({ text: result.value });
      } catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

function esc(str) {
  return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildWordXML(html, docTitle) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const nodes = Array.from(doc.body.firstChild.childNodes).filter(n => n.nodeType === 1);

  let body = "";

  for (const node of nodes) {
    const cls = node.className || "";

    if (cls.includes("handout-title")) {
      body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="80"/></w:pPr>
        <w:r><w:rPr><w:b/><w:sz w:val="52"/><w:szCs w:val="52"/></w:rPr><w:t>${esc(node.textContent.trim())}</w:t></w:r></w:p>`;

    } else if (cls.includes("handout-subtitle")) {
      body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="200"/><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="4" w:color="CCCCCC"/></w:pBdr></w:pPr>
        <w:r><w:rPr><w:i/><w:sz w:val="22"/><w:szCs w:val="22"/><w:color w:val="888888"/></w:rPr><w:t>${esc(node.textContent.trim())}</w:t></w:r></w:p>`;

    } else if (cls.includes("handout-section-title")) {
      body += `<w:p><w:pPr><w:spacing w:before="280" w:after="100"/></w:pPr>
        <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:szCs w:val="22"/><w:color w:val="8B6914"/><w:caps/></w:rPr><w:t>${esc(node.textContent.trim())}</w:t></w:r></w:p>`;

    } else if (cls.includes("handout-line")) {
      let runs = "";
      node.childNodes.forEach((child) => {
        if (child.nodeType === 3 && child.textContent) {
          runs += `<w:r><w:rPr><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr><w:t xml:space="preserve">${esc(child.textContent)}</w:t></w:r>`;
        } else if (child.nodeType === 1 && (child.className || "").includes("blank")) {
          runs += `<w:r><w:rPr><w:u w:val="single"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr><w:t xml:space="preserve">                        </w:t></w:r>`;
        }
      });
      if (runs) {
        body += `<w:p><w:pPr><w:spacing w:after="120"/></w:pPr>${runs}</w:p>`;
      }

    } else if (cls.includes("handout-note")) {
      body += `<w:p><w:pPr><w:spacing w:before="160" w:after="160"/><w:ind w:left="440"/><w:pBdr><w:left w:val="single" w:sz="12" w:space="8" w:color="D4AF5F"/></w:pBdr></w:pPr>
        <w:r><w:rPr><w:i/><w:sz w:val="22"/><w:szCs w:val="22"/><w:color w:val="555555"/></w:rPr><w:t>${esc(node.textContent.trim())}</w:t></w:r></w:p>`;

    } else if (cls.includes("handout-footer")) {
      body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="400"/><w:pBdr><w:top w:val="single" w:sz="4" w:space="4" w:color="CCCCCC"/></w:pBdr></w:pPr>
        <w:r><w:rPr><w:sz w:val="18"/><w:szCs w:val="18"/><w:color w:val="AAAAAA"/></w:rPr><w:t>${esc(node.textContent.trim())}</w:t></w:r></w:p>`;
    }
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${body}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

// Minimal DOCX zip builder (no external lib needed)
async function buildDocxBlob(html, docTitle) {
  const docXml = buildWordXML(html, docTitle);

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const wordRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

  // Use fflate (bundled with modern browsers as CompressionStream) to zip
  // We'll build the ZIP manually using a simple approach
  const files = {
    "[Content_Types].xml": contentTypes,
    "_rels/.rels": rels,
    "word/document.xml": docXml,
    "word/_rels/document.xml.rels": wordRels,
  };

  return await createZipBlob(files);
}

async function createZipBlob(files) {
  // Build ZIP file manually using the ZIP spec
  const encoder = new TextEncoder();
  const parts = [];
  const centralDir = [];
  let offset = 0;

  for (const [name, content] of Object.entries(files)) {
    const nameBytes = encoder.encode(name);
    const contentBytes = encoder.encode(content);

    // Compress using CompressionStream (deflate-raw)
    const compressed = await compress(contentBytes);

    const crc = crc32(contentBytes);
    const now = dosDateTime();

    // Local file header
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true); // signature
    lv.setUint16(4, 20, true);          // version needed
    lv.setUint16(6, 0, true);           // flags
    lv.setUint16(8, 8, true);           // compression: deflate
    lv.setUint16(10, now.time, true);
    lv.setUint16(12, now.date, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, compressed.length, true);
    lv.setUint32(22, contentBytes.length, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);          // extra field length
    localHeader.set(nameBytes, 30);

    parts.push(localHeader);
    parts.push(compressed);

    // Central directory entry
    const cdEntry = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(cdEntry.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0, true);
    cv.setUint16(10, 8, true);
    cv.setUint16(12, now.time, true);
    cv.setUint16(14, now.date, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, compressed.length, true);
    cv.setUint32(24, contentBytes.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    cdEntry.set(nameBytes, 46);

    centralDir.push(cdEntry);
    offset += localHeader.length + compressed.length;
  }

  const cdStart = offset;
  const cdBytes = concat(centralDir);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, Object.keys(files).length, true);
  ev.setUint16(10, Object.keys(files).length, true);
  ev.setUint32(12, cdBytes.length, true);
  ev.setUint32(16, cdStart, true);
  ev.setUint16(20, 0, true);

  return new Blob([concat(parts), cdBytes, eocd], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  });
}

function concat(arrays) {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(total);
  let pos = 0;
  for (const a of arrays) { out.set(a, pos); pos += a.length; }
  return out;
}

async function compress(data) {
  const cs = new CompressionStream("deflate-raw");
  const writer = cs.writable.getWriter();
  writer.write(data);
  writer.close();
  const chunks = [];
  const reader = cs.readable.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return concat(chunks);
}

function crc32(data) {
  let crc = 0xFFFFFFFF;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[i] = c;
    }
    return t;
  })());
  for (let i = 0; i < data.length; i++) crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function dosDateTime() {
  const d = new Date();
  return {
    time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
    date: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  };
}

export default function App() {
  const [file, setFile] = useState(null);
  const [density, setDensity] = useState("medium");
  const [title, setTitle] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [handoutHTML, setHandoutHTML] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [downloading, setDownloading] = useState("");
  const [answerKey, setAnswerKey] = useState([]);

  const handleFile = (f) => {
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["pdf", "docx", "doc"].includes(ext)) { setError("Please upload a PDF or DOCX file."); return; }
    setError(""); setFile(f);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]);
  }, []);


  const downloadWord = async () => {
    setDownloading("word");
    try {
      const blob = await buildDocxBlob(handoutHTML, title || "Sermon Notes");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(title || "sermon-handout").toLowerCase().replace(/\s+/g, "-")}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Word download failed: " + err.message);
    } finally {
      setDownloading("");
    }
  };

  const generate = async () => {
    if (!file) return;
    console.log("API KEY:", process.env.REACT_APP_ANTHROPIC_API_KEY);

    setLoading(true); setError(""); setHandoutHTML("");

    try {
      const ext = file.name.split(".").pop().toLowerCase();
      let messages;

      const densityMap = {
        light: "Replace about 10-12% of key terms — only a handful of the most critical words",
        medium: "Replace about 18-22% of key terms — light sprinkling, only the most important concepts",
        heavy: "Replace about 28-32% of key terms — moderate blanks on key concepts only",
      };
const systemPrompt = `You are an expert at creating sermon and lecture fill-in-the-blank handouts for church congregations and students.
Transform the raw notes into a beautifully structured handout where key words are replaced with blanks.

Rules:
- ${densityMap[density]}
- Preserve all scripture references, quotes, and illustrations — never blank those
- Use section headings where appropriate
- Output JSON only in this exact format:
{
  "html": "<div class=\\"handout-section-title\\">...</div>...",
  "answers": ["word1", "word2", "word3"]
}
- In the html field, use these exact classes:
  <div class="handout-section-title">Title</div> for section headers
  <p class="handout-line">text <span class="blank"></span> more text</p> for content
  <div class="handout-note">text</div> for stories/illustrations
- Never add inline styles to blank spans
- The answers array should list every blanked word in order from top to bottom
${customInstructions ? `\nExtra instructions: ${customInstructions}` : ""}`;

      if (ext === "pdf") {
        setStatus("Reading PDF...");
        const { base64 } = await parsePDF(file);
        messages = [{ role: "user", content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
          { type: "text", text: `Transform these notes into a fill-in-the-blank handout. ${title ? `Title: "${title}"` : "Pick an appropriate title."} Return only the HTML body content.` },
        ]}];
      } else {
        setStatus("Reading DOCX...");
        const { text } = await parseDOCX(file);
        messages = [{ role: "user", content: `Transform these notes into a fill-in-the-blank handout. ${title ? `Title: "${title}"` : "Pick an appropriate title."} Return only the HTML body content.\n\nNOTES:\n${text}` }];
      }

      setStatus("Generating handout with AI...");

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
       headers: { "Content-Type": "application/json", "anthropic-dangerous-direct-browser-access": "true", "x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },


        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4000, system: systemPrompt, messages }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

     const raw = data.content.map((c) => c.text || "").join("");
const clean = raw.replace(/```json|```/g, "").trim();
const parsed = JSON.parse(clean);
setAnswerKey(parsed.answers || []);
setHandoutHTML(`
  <div class="handout-title">${title || "Sermon Notes"}</div>
  <div class="handout-subtitle">Fill in the blanks as we study together</div>
  ${parsed.html}
  <div class="handout-footer">✦ &nbsp; Notes &nbsp; ✦</div>
`);
      setStatus("");
    } catch (err) {
      setError("Something went wrong: " + err.message);
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <div className="header">
          <h1>Sermon <span>&</span> Lecture</h1>
          <h1>Handout <span>Generator</span></h1>
          <p>Upload your notes — receive a fill-in-the-blank handout</p>
        </div>

        <div className="main">
          <div
            className={`upload-zone${dragOver ? " drag-over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input type="file" accept=".pdf,.docx,.doc" onChange={(e) => handleFile(e.target.files[0])} />
            <div className="upload-icon">📄</div>
            <h2>Drop your notes here</h2>
            <p>PDF or DOCX files accepted</p>
            {file && <div className="file-badge">✓ &nbsp; {file.name}</div>}
          </div>

          <div className="controls">
            <div className="control-group">
              <label>Handout Title (optional)</label>
              <input className="text-input" type="text" placeholder="e.g. The Sermon on the Mount" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="control-group">
              <label>Blank Density</label>
              <select value={density} onChange={(e) => setDensity(e.target.value)}>
                <option value="light">Light — fewer blanks</option>
                <option value="medium">Medium — balanced</option>
                <option value="heavy">Heavy — more challenge</option>
              </select>
            </div>
            <div className="control-group" style={{ gridColumn: "1 / -1" }}>
              <label>Special Instructions (optional)</label>
              <textarea placeholder="e.g. Keep all scripture references visible. Focus blanks on action steps." value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} />
            </div>
          </div>

          <button className="generate-btn" onClick={generate} disabled={!file || loading}>
            {loading ? "Generating..." : "Generate Handout →"}
          </button>

          {loading && <div className="status"><div className="spinner" />{status}</div>}
          {error && <div className="error">⚠ {error}</div>}

          {handoutHTML && (
            <div className="result-section">
              <div className="result-header">
                <h2>Your Handout</h2>
                <button className="btn-outline" onClick={downloadWord} disabled={!!downloading}>
                  {downloading === "word" ? "Building..." : "⬇ Download Word (.docx)"}
                </button>
              </div>
            <div className="handout" dangerouslySetInnerHTML={{ __html: handoutHTML }} />
            </div>
          )}

          {answerKey.length > 0 && (
            <div className="result-section" style={{ marginTop: "32px" }}>
              <div className="result-header">
                <h2>Answer Key</h2>
              </div>
              <div className="handout" style={{ padding: "32px 64px" }}>
                <div className="handout-section-title">Blanked Words — In Order</div>
                {answerKey.map((word, i) => (
                  <p className="handout-line" key={i}>{i + 1}. {word}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
