# Open-Vulkan-Referat

Educational website prototype about open science and volcanology, using Three.js and Chart.js.

Charts contain hard-coded arrays and source references. The repository does not provide a reproducible data-import pipeline or a point-by-point source verification; the visualisations should not be presented as independently validated research.

## 🌋 Live Demo

Serve the repository with `python3 -m http.server 8080`, then open `http://localhost:8080`. No build step is required. Three.js, Chart.js and GSAP are bundled under `vendor/`; see `index.html` for the resource paths.

## 📂 Structure

```
index.html          – Main page (all sections)
css/style.css       – Dark glassmorphism theme, responsive grid
js/three-scenes.js  – Three.js 3D visualisations (ES module)
js/charts.js        – Chart.js data charts (9 charts)
js/main.js          – Scroll effects, counters, navigation
```

## ✨ Features

### Section 1 – Open Science
- **Interactive 3D research network globe** (OrbitControls, institution nodes, collaboration arcs)
- **Open-Access publication growth** 2000–2024 (Unpaywall / EC Open Science Monitor)
- **Reproducibility rates** by field (Baker 2016; Errington et al. 2021; Open Science Collaboration 2015)
- **Citation advantage** of OA papers per discipline (Piwowar et al. 2018)
- **ROI comparison** open vs. closed research (McKinsey 2013; OECD 2015)
- COVID-19 case study

### Section 2 – Volcanology
#### Phlegraean Fields (Campi Flegrei)
- **Interactive 3D caldera terrain** with animated bradyseism & fumarole particles
- **Ground uplift** 1968–2023 (INGV OsservatorioVesuviano)
- **Annual seismicity** 2010–2023 (INGV Rete Sismica Nazionale)
- **Fumarole temperature** trend 2000–2023 (INGV)

#### Kilimanjaro
- **Interactive 3D mountain** with animated glacier retreat controlled by a timeline slider
- **Glacier area** 1912–2020 + projection to 2060 (Thompson et al. 2009; Cullen et al. 2013)
- **Temperature anomaly & precipitation** correlation (TMA; CRU TS v4.06; NOAA)

## 🛠 Tech Stack

| Library | Version | Purpose |
|---|---|---|
| [Three.js](https://threejs.org/) | 0.160 | 3D WebGL scenes |
| [Chart.js](https://www.chartjs.org/) | 4.4.1 | Interactive data charts |
| [GSAP](https://gsap.com/) | 3.12.4 | Scroll animations |
| Pure HTML/CSS/JS | — | No framework, no build step |

## 📚 Key Data Sources

- Unpaywall (2022/2024) — Open Access publication statistics
- Baker, *Nature* 533 (2016) — Reproducibility survey
- Open Science Collaboration, *Science* 349 (2015) — Replication study
- Errington et al., *eLife* (2021) — Cancer biology replication
- Piwowar et al., *PeerJ* (2018) — Citation advantage of OA
- INGV OsservatorioVesuviano — Campi Flegrei monitoring data
- Thompson et al., *PNAS* (2009) — Kilimanjaro glacier data
- Cullen et al., *The Cryosphere* (2013) — Kilimanjaro glacier survey

## Development and AI assistance

The default-branch history includes contributions explicitly attributed to GitHub Copilot ([example](https://github.com/ProfessorEngineergit/Open-Vulkan-Referat/commit/f4767e3edbf55f6ecedb2b875ebc9512eee76560)). This documents AI involvement in those contributions; it does not establish the origin of every line or independent validation. Existing author, co-author and session records are retained.
