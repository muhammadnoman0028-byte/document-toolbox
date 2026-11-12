# Docx.Hub

![License: MIT](https://img.shields.io/badge/License-MIT-green)
![Platform: Web](https://img.shields.io/badge/Platform-Web%20%7C%20Android-blue)
![Stack: Vanilla JS](https://img.shields.io/badge/Stack-Vanilla%20JS-F7DF1E?logo=javascript&logoColor=black)

Docx.Hub is a **browser-based** conversion and compression hub with a premium neomorphic UI. Most processing runs entirely on the client — your files never leave your device.

## Tools

- **DOCX to PDF** — convert DOCX content to a downloadable PDF
- **PDF to DOCX** — extract PDF text into an editable DOCX
- **Image Compressor** — compress JPG/PNG/WEBP images client-side (quality/resize)
- **PDF Compressor** — optimize/repackage PDFs in the browser
- **DOCX Compressor** — recompress DOCX (ZIP) packages

## App Flow

- `index.html` — splash screen + neomorphic login (session saved with "Remember me")
- `src/pages/home.html` — tools hub/dashboard after login
- `src/pages/*.html` — conversion/compression tool pages

## Project Structure

```text
Docx.Hub/
├─ config/
│  └─ app.config.json      # App configuration
├─ docs/                   # Project documentation
├─ public/
│  ├─ fonts/               # Web fonts
│  ├─ icons/               # App/UI icons
│  ├─ images/              # Static images
│  ├─ libs/                # Vendored browser libraries (pdf-lib, jszip, pdf.js, mammoth, docx, html2pdf)
│  ├─ favicon.ico
│  └─ robots.txt
├─ src/
│  ├─ assets/              # Source assets
│  ├─ components/          # Reusable UI components
│  ├─ layouts/             # Shared layouts/templates
│  ├─ pages/               # App pages (home + tool pages)
│  ├─ scripts/
│  │  └─ main.js          # Auth, routing, and tool logic
│  ├─ styles/
│  │  └─ main.css         # Neomorphic theme and layout styles
│  └─ utils/
│     └─ format.js         # Utility helpers
├─ tests/                  # Automated tests
├─ .gitignore
├─ index.html              # Entry: splash + login
├─ package.json
└─ README.md
```

## Notes

- Most processing runs **client-side** in the browser; some conversions (especially DOCX⇄PDF with complex formatting/layouts or scanned PDFs) may be best-effort depending on file content and loaded libraries.
- This project ships with a simple local-only sign-in screen for the UI flow (any email, 4+ char password). There are no server-side accounts or embedded credentials.

## License

[MIT](LICENSE) — free to use, modify, and distribute. No API keys or personal credentials are included in this repository.
