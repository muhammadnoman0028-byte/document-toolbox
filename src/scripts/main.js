// Docx.Hub - splash, auth, routing, and conversion/compression tools
(() => {
  const AUTH_KEY = "docxhub.auth";
  const REMEMBER_KEY = "docxhub.rememberedEmail";

  const script = document.currentScript;
  const pageType = script?.dataset?.page || "login";
  const tool = script?.dataset?.tool;

  const splash = document.getElementById("splash-screen");
  const authView = document.getElementById("auth-view");
  const loginForm = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const rememberInput = document.getElementById("remember");
  const errorEl = document.getElementById("login-error");
  const demoFill = document.getElementById("demo-fill");
  const forgotLink = document.getElementById("forgot-link");

  const $ = (id) => document.getElementById(id);
  const fmtBytes = (n) => {
    if (!Number.isFinite(n)) return "-";
    const u = ["B", "KB", "MB", "GB"]; let i = 0, v = n;
    while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
    return `${v.toFixed(i ? 2 : 0)} ${u[i]}`;
  };
  const setStatus = (msg, isErr = false) => {
    const el = $("tool-status"); if (!el) return;
    el.textContent = msg || ""; el.style.color = isErr ? "var(--danger)" : "var(--muted)";
  };
  const setResult = (html) => { const el = $("result-info"); if (el) el.innerHTML = html; };
  const setDownload = (blob, filename, auto = true) => {
    const a = $("download-link"); if (!a) return null;
    if (a.dataset.url) URL.revokeObjectURL(a.dataset.url);
    const url = URL.createObjectURL(blob);
    a.href = url; a.download = filename; a.dataset.url = url; a.classList.remove("hidden");
    a.textContent = "Download File";
    if (auto) {
      try {
        a.click(); // try immediately (best chance to keep user-gesture context)
      } catch {}
      setTimeout(() => { try { a.click(); } catch {} }, 150);
    }
    return url;
  };

  function getSession() {
    try {
      const raw = localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
  function setSession(session, persist) {
    const store = persist ? localStorage : sessionStorage;
    const other = persist ? sessionStorage : localStorage;
    other.removeItem(AUTH_KEY);
    store.setItem(AUTH_KEY, JSON.stringify(session));
  }
  function clearSession() { localStorage.removeItem(AUTH_KEY); sessionStorage.removeItem(AUTH_KEY); }
  function redirect(to) { if (location.pathname.replace(/\\/g, "/").endsWith(to)) return; location.href = to; }
  function requireAuth() {
    const session = getSession();
    if (!session || !session.email) { redirect(loginPath); return null; }
    return session;
  }

  const loginPath = script?.dataset?.login || "./index.html";
  const homePath = script?.dataset?.home || "./home.html";

  function initLogin() {
    const existing = getSession();
    if (existing && existing.email) { redirect(homePath); return; }
    if (authView) authView.classList.remove("hidden");

    const remembered = localStorage.getItem(REMEMBER_KEY);
    if (remembered && emailInput) { emailInput.value = remembered; if (rememberInput) rememberInput.checked = true; }

    loginForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      if (errorEl) errorEl.textContent = "";
      const email = (emailInput?.value || "").trim();
      const password = passwordInput?.value || "";
      const remember = !!rememberInput?.checked;
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) { if (errorEl) errorEl.textContent = "Please enter a valid email address."; return; }
      if (!password || password.length < 4) { if (errorEl) errorEl.textContent = "Password must be at least 4 characters."; return; }
      if (remember) localStorage.setItem(REMEMBER_KEY, email); else localStorage.removeItem(REMEMBER_KEY);
      setSession({ email, loggedInAt: new Date().toISOString() }, remember);
      redirect(homePath);
    });

    demoFill?.addEventListener("click", (e) => {
      e.preventDefault();
      if (emailInput) emailInput.value = "demo@docxhub.app";
      if (passwordInput) passwordInput.value = "demo1234";
      if (rememberInput) rememberInput.checked = true;
      if (errorEl) errorEl.textContent = "";
      emailInput?.focus();
    });
    forgotLink?.addEventListener("click", (e) => {
      e.preventDefault();
      if (errorEl) errorEl.textContent = "Demo: use any valid email and a password (4+ chars) to sign in.";
    });
  }

  function initCommonApp(session) {
    const navUser = $("nav-user");
    if (navUser) navUser.textContent = session.email;
    document.querySelectorAll("#logout-btn, #logout-btn-secondary").forEach((btn) => {
      btn.addEventListener("click", () => { clearSession(); redirect(loginPath); });
    });
  }

  function wireDropzone(fileInput) {
    if (!fileInput) return;
    const dz = fileInput.closest(".dropzone");
    if (!dz) return;
    const onFiles = () => { if (fileInput.files?.length) setStatus(`Selected: ${fileInput.files[0].name}`); };
    fileInput.addEventListener("change", onFiles);
    ["dragenter", "dragover"].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add("drag"); }));
    ["dragleave", "drop"].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove("drag"); }));
    dz.addEventListener("drop", e => { if (e.dataTransfer?.files?.length) { fileInput.files = e.dataTransfer.files; onFiles(); } });
  }

  async function initImageCompressor() {
    const input = $("tool-file"), btn = $("process-btn"), q = $("quality"), qv = $("quality-val"), mw = $("max-width");
    const previewWrap = $("preview-wrap"), previewImg = $("preview-img");
    wireDropzone(input);
    q?.addEventListener("input", () => { if (qv) qv.textContent = q.value; });
    btn?.addEventListener("click", async () => {
      const file = input?.files?.[0];
      if (!file) return setStatus("Please select an image file.", true);
      setStatus("Compressing image..."); $("download-link")?.classList.add("hidden");
      try {
        const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); });
        let w = img.naturalWidth, h = img.naturalHeight;
        const maxW = parseInt(mw?.value || "", 10);
        if (maxW && w > maxW) { h = Math.round(h * (maxW / w)); w = maxW; }
        const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d"); ctx.drawImage(img, 0, 0, w, h);
        const quality = Math.min(1, Math.max(0.1, parseFloat(q?.value || "0.7")));
        const outType = file.type === "image/png" ? "image/png" : "image/jpeg";
        const blob = await new Promise((res) => canvas.toBlob(res, outType, outType === "image/jpeg" ? quality : undefined));
        if (!blob) throw new Error("Compression failed.");
        const ext = outType === "image/png" ? "png" : "jpg";
        const base = file.name.replace(/\.[^.]+$/, "");
        setDownload(blob, `${base}-compressed.${ext}`);
        const saved = file.size - blob.size; const pct = file.size ? ((saved / file.size) * 100).toFixed(1) : "0";
        setResult(`<strong>Original:</strong> ${fmtBytes(file.size)}<br><strong>Compressed:</strong> ${fmtBytes(blob.size)}<br><strong>Saved:</strong> ${fmtBytes(Math.max(0,saved))} (${pct}%)<br><strong>Dimensions:</strong> ${w}×${h}`);
        if (previewImg && previewWrap) { previewImg.src = URL.createObjectURL(blob); previewWrap.classList.remove("hidden"); }
        setStatus("Done. If download didn't start automatically, tap the 'Download File' button.");
      } catch (e) { console.error(e); setStatus("Failed to compress image. Try another file.", true); }
    });
  }

  async function initPdfCompressor() {
    const input = $("tool-file"), btn = $("process-btn");
    wireDropzone(input);
    btn?.addEventListener("click", async () => {
      const file = input?.files?.[0];
      if (!file) return setStatus("Please select a PDF file.", true);
      if (!window.PDFLib) return setStatus("PDF library not loaded. Check your connection and reload.", true);
      setStatus("Optimizing PDF..."); $("download-link")?.classList.add("hidden");
      try {
        const bytes = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true });
        try { pdf.setCreator("Docx.Hub"); pdf.setProducer("Docx.Hub"); } catch {}
        const out = await pdf.save({ useObjectStreams: true, addDefaultPage: false });
        const blob = new Blob([out], { type: "application/pdf" });
        const base = file.name.replace(/\.[^.]+$/, "");
        setDownload(blob, `${base}-compressed.pdf`);
        const saved = file.size - blob.size; const pct = file.size ? ((saved / file.size) * 100).toFixed(1) : "0";
        setResult(`<strong>Original:</strong> ${fmtBytes(file.size)}<br><strong>Optimized:</strong> ${fmtBytes(blob.size)}<br><strong>Change:</strong> ${saved >= 0 ? "Saved " : "Increased "}${fmtBytes(Math.abs(saved))} (${Math.abs(pct)}%)<br><strong>Pages:</strong> ${pdf.getPageCount()}`);
        setStatus((saved >= 0 ? "PDF optimized successfully. " : "PDF repackaged. ") + "If download didn't start automatically, tap 'Download File'.");
      } catch (e) { console.error(e); setStatus("Failed to process PDF. The file may be encrypted or unsupported.", true); }
    });
  }

  async function initDocxCompressor() {
    const input = $("tool-file"), btn = $("process-btn");
    wireDropzone(input);
    btn?.addEventListener("click", async () => {
      const file = input?.files?.[0];
      if (!file) return setStatus("Please select a DOCX file.", true);
      if (!window.JSZip) return setStatus("Compression library not loaded. Check your connection and reload.", true);
      setStatus("Compressing DOCX package..."); $("download-link")?.classList.add("hidden");
      try {
        const buf = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(buf);
        const blob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", compression: "DEFLATE", compressionOptions: { level: 9 } });
        const base = file.name.replace(/\.[^.]+$/, "");
        setDownload(blob, `${base}-compressed.docx`);
        const saved = file.size - blob.size; const pct = file.size ? ((saved / file.size) * 100).toFixed(1) : "0";
        setResult(`<strong>Original:</strong> ${fmtBytes(file.size)}<br><strong>Compressed:</strong> ${fmtBytes(blob.size)}<br><strong>Saved:</strong> ${fmtBytes(Math.max(0,saved))} (${pct}%)`);
        setStatus((saved > 0 ? "DOCX compressed successfully. " : "DOCX repackaged. ") + "If download didn't start automatically, tap 'Download File'.");
      } catch (e) { console.error(e); setStatus("Failed to compress DOCX. Ensure it is a valid .docx file.", true); }
    });
  }

  async function initDocxToPdf() {
    const input = $("tool-file"), btn = $("process-btn"), preview = $("docx-preview");
    wireDropzone(input);
    btn?.addEventListener("click", async () => {
      const file = input?.files?.[0];
      if (!file) return setStatus("Please select a DOCX file.", true);
      if (!window.mammoth || !window.html2pdf) return setStatus("Conversion libraries not loaded. Check your connection and reload.", true);
      setStatus("Converting DOCX to PDF..."); $("download-link")?.classList.add("hidden");
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const html = result.value || "<p>(No content extracted)</p>";
        if (preview) { preview.innerHTML = html; preview.classList.remove("hidden"); }
        const container = document.createElement("div");
        container.style.padding = "24px"; container.style.color = "#222"; container.style.background = "#fff"; container.style.fontFamily = "Arial, sans-serif";
        container.innerHTML = `<h2 style="margin-top:0">${file.name.replace(/\.[^.]+$/, "")}</h2>${html}`;
        const base = file.name.replace(/\.[^.]+$/, "");
        const worker = html2pdf().set({ margin: 10, filename: `${base}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: "mm", format: "a4", orientation: "portrait" } }).from(container);
        const blob = await worker.outputPdf("blob");
        setDownload(blob, `${base}.pdf`);
        setResult(`<strong>Source:</strong> ${file.name}<br><strong>Output:</strong> ${base}.pdf (${fmtBytes(blob.size)})<br><strong>Status:</strong> Converted successfully`);
        if (result.messages?.length) setResult($("result-info").innerHTML + `<br><small class="muted">${result.messages.length} conversion note(s)</small>`);
        setStatus("DOCX converted to PDF successfully. If download didn't start automatically, tap 'Download File'.");
      } catch (e) { console.error(e); setStatus("Failed to convert DOCX. Try a simpler document.", true); }
    });
  }

  async function initPdfToDocx() {
    const input = $("tool-file"), btn = $("process-btn"), preview = $("text-preview");
    wireDropzone(input);
    if (window.pdfjsLib) { pdfjsLib.GlobalWorkerOptions.workerSrc = "./public/libs/pdf.worker.min.js"; }
    btn?.addEventListener("click", async () => {
      const file = input?.files?.[0];
      if (!file) return setStatus("Please select a PDF file.", true);
      if (!window.pdfjsLib || !window.docx) return setStatus("Conversion libraries not loaded.", true);
      setStatus("Extracting PDF and creating DOCX..."); $("download-link")?.classList.add("hidden");
      try {
        const data = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const tc = await page.getTextContent();
          const strings = tc.items.map(it => (it.str || "")).filter(Boolean);
          const pageText = strings.join(" ").replace(/\s+/g, " ").trim();
          if (pageText) fullText += pageText + "\n\n"; else fullText += "\n";
        }
        fullText = fullText.trim() || "(No extractable text found in this PDF. It may be scanned/image-only.)";
        if (preview) { preview.textContent = fullText.slice(0, 8000) + (fullText.length > 8000 ? "\n..." : ""); preview.classList.remove("hidden"); }
        const blocks = fullText.split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
        const paragraphs = (blocks.length ? blocks : [fullText]).flatMap(block => {
          const lines = block.split(/\n/);
          return lines.map(line => new docx.Paragraph({ children: [new docx.TextRun({ text: line, size: 24 })], spacing: { after: 120 } }));
        });
        const doc = new docx.Document({ sections: [{ properties: {}, children: paragraphs.length ? paragraphs : [new docx.Paragraph("No extractable text found.")] }] });
        const blob = await docx.Packer.toBlob(doc);
        const base = file.name.replace(/\.[^.]+$/, "");
        setDownload(blob, `${base}.docx`);
        setResult(`<strong>Source:</strong> ${file.name}<br><strong>Pages processed:</strong> ${pdf.numPages}<br><strong>Output:</strong> ${base}.docx (${fmtBytes(blob.size)})`);
        setStatus("PDF converted to DOCX (text extracted) successfully. If download didn't start automatically, tap 'Download File'.");
      } catch (e) { console.error(e); setStatus("Failed to convert PDF. " + (e && e.message ? e.message : "File may be scanned, encrypted, or unsupported."), true); }
    });
  }

  function initTool() {
    if (!tool) return;
    if (tool === "image-compressor") initImageCompressor();
    else if (tool === "pdf-compressor") initPdfCompressor();
    else if (tool === "docx-compressor") initDocxCompressor();
    else if (tool === "docx-to-pdf") initDocxToPdf();
    else if (tool === "pdf-to-docx") initPdfToDocx();
  }

  function initApp() {
    const session = requireAuth();
    if (!session) return;
    initCommonApp(session);
    initTool();
  }

  function registerSW() {
    if (!("serviceWorker" in navigator)) return;
    const sw = script?.dataset?.sw;
    if (!sw) return;
    const scope = script?.dataset?.swScope || "./";
    window.addEventListener("load", () => {
      navigator.serviceWorker.register(sw, { scope }).catch((e) => console.warn("SW registration failed", e));
    });
  }

  function reveal() {
    if (splash) {
      splash.classList.add("fade-out");
      splash.addEventListener("transitionend", () => splash.remove(), { once: true });
    }
    if (pageType === "login") initLogin();
    else initApp();
    registerSW();
    console.log("Docx.Hub initialized");
  }

  window.addEventListener("load", () => {
    setTimeout(reveal, pageType === "login" ? 1600 : 400);
  });
})();
