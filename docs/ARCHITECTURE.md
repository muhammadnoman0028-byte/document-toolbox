# Architecture

## Overview

This document describes the high-level structure and technical decisions for Docx.Hub.

## Frontend Structure

- `index.html`: Application entry document.
- `public/`: Static files served as-is (icons, fonts, robots, etc.).
- `src/components/`: Reusable UI building blocks.
- `src/layouts/`: Shared page layouts and shells.
- `src/pages/`: Page-level views or route targets.
- `src/styles/`: Global and modular styles.
- `src/scripts/`: Client-side behavior and entry scripts.
- `src/utils/`: Shared helper functions.
- `src/assets/`: Source assets that may be processed/bundled.

## Supporting Directories

- `config/`: Environment/build/runtime configuration.
- `docs/`: Project documentation and decisions.
- `tests/`: Automated tests (unit/integration/e2e as added).

## Notes

Update this document as the stack, build tooling, and architecture evolve.
