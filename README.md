```markdown
# Teacher Candidate E-Portfolio

This repository contains a complete responsive HTML/CSS/JS starter portfolio for a Teacher Candidate (Bachelor of Education). The site is intentionally minimalist and academic in tone, with placeholder text and assets you can replace with your own content.

New features and updates:
- Dark mode preloader snippet added to every HTML head to prevent white flashes when navigating in dark mode.
- Persistent dark/light theme stored in localStorage under the key `portfolio-theme`. The site honors system preference if no stored choice exists.
- Theme toggle injected into the header (or you can add it directly to your header markup if you prefer).
- Lightbox gallery: click artifact thumbnails (images with `data-full` attribute) to open a fullscreen viewer with next/prev controls and keyboard support.
- The theme preloader sets a theme-color meta tag to keep the browser UI consistent on mobile.

How the flash-free dark mode works:
- A small inline script runs synchronously before the stylesheet loads. It reads the stored theme or system preference and sets `data-theme="dark"` on the documentElement and sets an inline background color to match the dark CSS variable. This ensures the first paint uses the correct background color and eliminates the bright white flash during page navigation.

Files changed:
- index.html, about.html, philosophy.html, resume.html, artifacts.html, reflections.html, contact.html — each now includes the head theme preloader (before the CSS link).
- assets/js/main.js — improved applyTheme function that immediately updates document background and meta theme-color and persists the choice.
- README.md — updated to document the new behavior.

Notes:
- Keep the darkBg and lightBg hex values in the head snippet and assets/js/main.js in sync with the CSS :root variables (`--bg`) to ensure smooth appearance and no visual mismatch.
- If you prefer a visible toggle in HTML instead of the injected button, add a button with id="themeToggle" in the header area. The JS will detect and use it.
- If you'd like these files committed to a GitHub repo and published to GitHub Pages, provide the repo (owner/repo). If you want me to create a branch and open a PR, tell me the repo and base branch to use.

```