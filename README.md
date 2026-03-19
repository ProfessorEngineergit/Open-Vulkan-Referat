# Open-Vulkan-Referat

> **Groundbreaking interactive website** on Open-Source Research & Volcanology — built with Three.js, Chart.js, and real scientific data.

## 🌋 Live Demo

Open `index.html` in any modern browser. No build step required — all libraries load from CDN.

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
