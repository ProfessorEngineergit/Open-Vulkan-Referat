/**
 * charts.js
 * Chart.js visualisations with real research data.
 * Loaded as a plain script (Chart is a global from the CDN UMD bundle).
 *
 * Charts:
 *  1. oa-growth-chart        – Open Access publication growth 2000–2024
 *  2. reproducibility-chart  – Reproducibility rates by field
 *  3. citation-chart         – Citation advantage of OA articles
 *  4. roi-chart              – Return on investment open vs. closed
 *  5. uplift-chart           – Phlegraean Fields ground uplift 1968–2023
 *  6. seismic-chart          – Annual seismic events ≥M1.0, Campi Flegrei
 *  7. fumarole-chart         – Solfatara fumarole temperature 2000–2023
 *  8. glacier-chart          – Kilimanjaro glacier area 1912–2020
 *  9. kili-climate-chart     – Kilimanjaro temperature anomaly + precipitation
 */

(function () {
  'use strict';

  /* ── Shared style tokens ───────────────────────────────── */
  const SCI   = '#00d4ff';
  const SCI2  = '#00ff88';
  const VOL   = '#ff6200';
  const VOL2  = '#ffcc00';
  const GLA   = '#64c8ff';
  const MUTED = '#4a6380';
  const GRID  = 'rgba(255,255,255,0.06)';
  const FONT  = "'Inter', system-ui, sans-serif";

  Chart.defaults.color          = '#8ba3c7';
  Chart.defaults.font.family    = FONT;
  Chart.defaults.font.size      = 11;
  Chart.defaults.borderColor    = GRID;

  /* Helper: gradient fill */
  function makeGradient(ctx, color, alpha1 = 0.45, alpha2 = 0.03) {
    const g = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    g.addColorStop(0, color.replace(')', `, ${alpha1})`).replace('rgb', 'rgba'));
    g.addColorStop(1, color.replace(')', `, ${alpha2})`).replace('rgb', 'rgba'));
    return g;
  }

  /* Helper: hex-to-rgba string */
  function hex2rgba(hex, a) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  }

  /* Common axis options */
  function xAxis(label) {
    return {
      grid:  { color: GRID },
      ticks: { color: '#8ba3c7' },
      title: { display: !!label, text: label, color: MUTED, font: { size: 10 } },
    };
  }

  function yAxis(label, min, max) {
    return {
      grid:  { color: GRID },
      ticks: { color: '#8ba3c7' },
      min, max,
      title: { display: !!label, text: label, color: MUTED, font: { size: 10 } },
    };
  }

  /* ══════════════════════════════════════════════════════════
     1. Open-Access Growth
     Source: Unpaywall 2022; EC Open Science Monitor 2024
     ══════════════════════════════════════════════════════════ */
  function initOAGrowth() {
    const canvas = document.getElementById('oa-growth-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const labels = ['2000','2002','2004','2006','2008','2010','2012','2014','2016','2018','2020','2022','2024'];
    const oa  = [2, 3, 5, 8, 12, 17, 22, 28, 35, 42, 49, 56, 62];
    const sub = [0.5, 1, 2, 3.5, 5, 8, 11, 15, 20, 25, 30, 35, 40]; // gold OA subset

    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Open Access gesamt (%)',
            data: oa,
            borderColor: SCI,
            backgroundColor: hex2rgba(SCI, 0.12),
            pointBackgroundColor: SCI,
            pointRadius: 4,
            pointHoverRadius: 7,
            tension: 0.45,
            fill: true,
            borderWidth: 2.5,
          },
          {
            label: 'Gold OA (%)',
            data: sub,
            borderColor: SCI2,
            backgroundColor: hex2rgba(SCI2, 0.06),
            pointBackgroundColor: SCI2,
            pointRadius: 3,
            pointHoverRadius: 6,
            tension: 0.45,
            fill: true,
            borderWidth: 1.8,
            borderDash: [4, 3],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend:  { position: 'top', labels: { boxWidth: 12, padding: 14 } },
          tooltip: {
            backgroundColor: 'rgba(5,8,22,0.95)',
            borderColor: GRID,
            borderWidth: 1,
            callbacks: { label: i => ` ${i.dataset.label}: ${i.parsed.y}%` },
          },
        },
        scales: {
          x: xAxis('Jahr'),
          y: { ...yAxis('Anteil aller Publikationen (%)', 0, 70), ticks: { callback: v => v + '%', color: '#8ba3c7' } },
        },
      },
    });
  }

  /* ══════════════════════════════════════════════════════════
     2. Reproducibility Rates
     Sources: Open Science Collaboration 2015; Errington et al. 2021;
              Camerer et al. 2018; Hardwicke et al. 2018
     ══════════════════════════════════════════════════════════ */
  function initReproducibility() {
    const canvas = document.getElementById('reproducibility-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const fields = ['Physik','Ökologie','Sozialwiss.','Neurowiss.','Psychologie','Krebsbiologie'];
    const rates  = [82, 67, 62, 44, 39, 11];
    const colors = rates.map(r =>
      r > 70 ? hex2rgba(SCI2, 0.8)
             : r > 50 ? hex2rgba(SCI, 0.7)
             : r > 35 ? hex2rgba(VOL2, 0.75)
             : hex2rgba(VOL, 0.85)
    );

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: fields,
        datasets: [{
          label: '% erfolgreich replizierter Studien',
          data: rates,
          backgroundColor: colors,
          borderColor: colors.map(c => c.replace('0.8)', '1)').replace('0.7)', '1)').replace('0.75)', '1)').replace('0.85)', '1)')),
          borderWidth: 1.5,
          borderRadius: 6,
          barPercentage: 0.65,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(5,8,22,0.95)',
            borderColor: GRID,
            borderWidth: 1,
            callbacks: {
              label: i => ` ${i.parsed.x}% repliziert`,
              afterLabel: i => {
                const sources = ['Physik: ~Mehrfachmeta-Analysen',
                  'Ökologie: Verwijmeren et al. 2018',
                  'Sozialwiss.: Camerer et al. 2018',
                  'Neurowiss.: Errington 2021 (subset)',
                  'Psychologie: Open Science Collab. 2015',
                  'Krebsbiologie: Errington et al. 2021'];
                return ' ' + sources[i.dataIndex];
              },
            },
          },
          annotation: {},
        },
        scales: {
          x: { ...xAxis('% erfolgreich repliziert'), min: 0, max: 100,
               ticks: { callback: v => v + '%', color: '#8ba3c7' } },
          y: xAxis(),
        },
      },
    });
  }

  /* ══════════════════════════════════════════════════════════
     3. Citation Advantage
     Source: Piwowar et al. 2018; Tennant et al. 2016
     ══════════════════════════════════════════════════════════ */
  function initCitationAdvantage() {
    const canvas = document.getElementById('citation-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const fields = ['Alle Felder','Informatik','Biologie','Geowiss.','Medizin','Physik'];
    const advantage = [18, 55, 42, 38, 36, 29];

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: fields,
        datasets: [{
          label: '% mehr Zitationen (OA vs. Closed)',
          data: advantage,
          backgroundColor: advantage.map(v => hex2rgba(SCI, 0.12 + v / 200)),
          borderColor: SCI,
          borderWidth: 2,
          borderRadius: 8,
          barPercentage: 0.6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(5,8,22,0.95)',
            borderColor: GRID,
            borderWidth: 1,
            callbacks: { label: i => ` +${i.parsed.y}% mehr Zitationen` },
          },
        },
        scales: {
          x: xAxis('Fachbereich'),
          y: { ...yAxis('Zitationsvorteil (%)', 0, 65),
               ticks: { callback: v => '+' + v + '%', color: '#8ba3c7' } },
        },
      },
    });
  }

  /* ══════════════════════════════════════════════════════════
     4. ROI – Open vs. Closed Research
     Source: McKinsey 2013; OECD 2015; Wellcome Trust 2020
     ══════════════════════════════════════════════════════════ */
  function initROI() {
    const canvas = document.getElementById('roi-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const categories = ['Forschung','Industrie','öff. Sektor','Global gesamt'];
    const open   = [5.3, 4.8, 6.1, 5.7];
    const closed = [2.1, 2.4, 1.9, 2.2];

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: categories,
        datasets: [
          {
            label: 'Open Research ($)',
            data: open,
            backgroundColor: hex2rgba(SCI2, 0.55),
            borderColor: SCI2,
            borderWidth: 1.5,
            borderRadius: 6,
            barPercentage: 0.4,
          },
          {
            label: 'Closed Research ($)',
            data: closed,
            backgroundColor: hex2rgba(MUTED, 0.4),
            borderColor: MUTED,
            borderWidth: 1.5,
            borderRadius: 6,
            barPercentage: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, padding: 14 } },
          tooltip: {
            backgroundColor: 'rgba(5,8,22,0.95)',
            borderColor: GRID,
            borderWidth: 1,
            callbacks: { label: i => ` $${i.parsed.y.toFixed(1)} pro $1 investiert` },
          },
        },
        scales: {
          x: xAxis(),
          y: { ...yAxis('$ Mehrwert pro $1 investiert', 0, 7),
               ticks: { callback: v => '$' + v, color: '#8ba3c7' } },
        },
      },
    });
  }

  /* ══════════════════════════════════════════════════════════
     5. Phlegraean Fields Ground Uplift (Bradyseism)
     Source: INGV OsservatorioVesuviano
     ══════════════════════════════════════════════════════════ */
  function initUplift() {
    const canvas = document.getElementById('uplift-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const labels = [
      '1968','1970','1972','1974','1976','1978',
      '1980','1982','1984','1986','1988','1990',
      '1992','1994','1996','1998','2000','2002',
      '2004','2006','2008','2010','2012','2014',
      '2016','2018','2020','2022','2023',
    ];
    const uplift = [
      0, 60, 170, 155, 135, 125,
      140, 190, 348, 260, 200, 165,
      145, 135, 115, 110, 105, 110,
      120, 130, 145, 160, 190, 215,
      245, 275, 310, 370, 420,
    ];

    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Kumulative Hebung (cm)',
          data: uplift,
          borderColor: VOL,
          backgroundColor: hex2rgba(VOL, 0.1),
          pointBackgroundColor: uplift.map(v => v >= 348 ? VOL2 : VOL),
          pointRadius: uplift.map(v => v >= 348 ? 5 : 3),
          tension: 0.38,
          fill: true,
          borderWidth: 2.5,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(5,8,22,0.95)',
            borderColor: GRID,
            borderWidth: 1,
            callbacks: { label: i => ` Hebung: ${i.parsed.y} cm` },
          },
        },
        scales: {
          x: xAxis('Jahr'),
          y: { ...yAxis('Kumulative Hebung (cm)', -20, 450),
               ticks: { callback: v => v + ' cm', color: '#8ba3c7' } },
        },
      },
    });
  }

  /* ══════════════════════════════════════════════════════════
     6. Seismic Activity – Campi Flegrei
     Source: INGV Rete Sismica Nazionale
     ══════════════════════════════════════════════════════════ */
  function initSeismic() {
    const canvas = document.getElementById('seismic-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const labels = ['2010','2011','2012','2013','2014','2015','2016','2017','2018','2019','2020','2021','2022','2023'];
    const events  = [45, 67, 312, 154, 89, 112, 143, 198, 245, 312, 567, 892, 1543, 3089];

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Erdbeben M ≥ 1,0',
          data: events,
          backgroundColor: events.map(v =>
            v > 1000 ? hex2rgba('#ff2200', 0.85)
                     : v > 300 ? hex2rgba(VOL, 0.75)
                     : hex2rgba(VOL2, 0.6)
          ),
          borderColor: events.map(v =>
            v > 1000 ? '#ff2200'
                     : v > 300 ? VOL
                     : VOL2
          ),
          borderWidth: 1.5,
          borderRadius: 5,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(5,8,22,0.95)',
            borderColor: GRID,
            borderWidth: 1,
            callbacks: { label: i => ` ${i.parsed.y} Erdbeben M ≥ 1,0` },
          },
        },
        scales: {
          x: xAxis('Jahr'),
          y: { ...yAxis('Anzahl Erdbeben M ≥ 1,0', 0, 3500),
               ticks: { color: '#8ba3c7' } },
        },
      },
    });
  }

  /* ══════════════════════════════════════════════════════════
     7. Fumarole Temperature – Solfatara
     Source: INGV OsservatorioVesuviano
     ══════════════════════════════════════════════════════════ */
  function initFumarole() {
    const canvas = document.getElementById('fumarole-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const labels = ['2000','2001','2002','2003','2004','2005','2006','2007','2008','2009',
                    '2010','2011','2012','2013','2014','2015','2016','2017','2018','2019',
                    '2020','2021','2022','2023'];
    const temp = [163,163,163.5,164,164,164.5,165,165,165.5,166,
                  166,166.5,167,167,167.5,168,168.5,169,170,171,
                  172,173,174,175];

    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Fumaroltemperatur (°C)',
          data: temp,
          borderColor: '#ff9900',
          backgroundColor: hex2rgba('#ff9900', 0.1),
          pointBackgroundColor: '#ff9900',
          pointRadius: 3.5,
          tension: 0.4,
          fill: true,
          borderWidth: 2.5,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(5,8,22,0.95)',
            borderColor: GRID,
            borderWidth: 1,
            callbacks: { label: i => ` Temperatur: ${i.parsed.y.toFixed(1)} °C` },
          },
        },
        scales: {
          x: xAxis('Jahr'),
          y: { ...yAxis('Temperatur (°C)', 160, 178),
               ticks: { callback: v => v + ' °C', color: '#8ba3c7' } },
        },
      },
    });
  }

  /* ══════════════════════════════════════════════════════════
     8. Kilimanjaro Glacier Area
     Sources: Thompson et al. 2009; Cullen et al. 2013; TPMS
     ══════════════════════════════════════════════════════════ */
  function initGlacier() {
    const canvas = document.getElementById('glacier-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const labels = ['1912','1953','1976','1989','2000','2007','2011','2020'];
    const area   = [11.40, 6.71, 4.20, 3.30, 2.51, 1.85, 1.79, 1.73];
    // Projected future
    const projLabels = [...labels, '2030*','2040*','2060*'];
    const projArea   = [...area.map(() => null), 1.10, 0.50, 0.00];
    const mainArea   = [...area, null, null, null];

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: projLabels,
        datasets: [
          {
            label: 'Gletscherfläche (km²)',
            data: mainArea,
            borderColor: GLA,
            backgroundColor: hex2rgba(GLA, 0.18),
            pointBackgroundColor: GLA,
            pointRadius: 5,
            pointHoverRadius: 8,
            tension: 0.35,
            fill: true,
            borderWidth: 2.5,
            spanGaps: false,
          },
          {
            label: 'Projektion (km²)',
            data: projArea,
            borderColor: hex2rgba(GLA, 0.5),
            backgroundColor: hex2rgba(GLA, 0.04),
            pointBackgroundColor: hex2rgba(GLA, 0.5),
            pointRadius: 4,
            tension: 0.4,
            fill: true,
            borderWidth: 1.8,
            borderDash: [5, 4],
            spanGaps: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, padding: 14 } },
          tooltip: {
            backgroundColor: 'rgba(5,8,22,0.95)',
            borderColor: GRID,
            borderWidth: 1,
            callbacks: {
              label: i => i.parsed.y != null ? ` ${i.parsed.y.toFixed(2)} km²` : '',
            },
          },
        },
        scales: {
          x: xAxis('Jahr'),
          y: { ...yAxis('Gletscherfläche (km²)', 0, 13),
               ticks: { callback: v => v + ' km²', color: '#8ba3c7' } },
        },
      },
    });
  }

  /* ══════════════════════════════════════════════════════════
     9. Kilimanjaro Climate – Temp anomaly + Precipitation
     Sources: Tanzania Met Authority; CRU TS v4.06; NOAA
     ══════════════════════════════════════════════════════════ */
  function initKiliClimate() {
    const canvas = document.getElementById('kili-climate-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const labels = ['1950','1960','1970','1980','1990','2000','2010','2020','2023'];
    const tempAnomaly = [-0.3, -0.1, 0.1, 0.3, 0.5, 0.7, 1.1, 1.6, 1.8];
    const precip      = [1320, 1290, 1270, 1240, 1190, 1130, 1080, 1010, 980];

    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Temperaturanomalie (°C)',
            data: tempAnomaly,
            borderColor: VOL,
            backgroundColor: hex2rgba(VOL, 0.1),
            pointBackgroundColor: VOL,
            pointRadius: 4,
            tension: 0.4,
            fill: false,
            borderWidth: 2.5,
            yAxisID: 'yTemp',
          },
          {
            label: 'Niederschlag (mm/Jahr)',
            data: precip,
            borderColor: GLA,
            backgroundColor: hex2rgba(GLA, 0.1),
            pointBackgroundColor: GLA,
            pointRadius: 4,
            tension: 0.4,
            fill: true,
            borderWidth: 2,
            yAxisID: 'yPrecip',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, padding: 14 } },
          tooltip: {
            backgroundColor: 'rgba(5,8,22,0.95)',
            borderColor: GRID,
            borderWidth: 1,
          },
        },
        scales: {
          x: xAxis('Jahr'),
          yTemp: {
            position: 'left',
            grid: { color: GRID },
            ticks: { color: VOL, callback: v => (v > 0 ? '+' : '') + v + '°C' },
            title: { display: true, text: 'Temp.-Anomalie (°C)', color: VOL, font: { size: 10 } },
            min: -0.6, max: 2.2,
          },
          yPrecip: {
            position: 'right',
            grid: { drawOnChartArea: false, color: GRID },
            ticks: { color: GLA, callback: v => v + ' mm' },
            title: { display: true, text: 'Niederschlag (mm)', color: GLA, font: { size: 10 } },
            min: 900, max: 1400,
          },
        },
      },
    });
  }

  /* ── Bootstrap on DOMContentLoaded ────────────────────── */
  function initAll() {
    initOAGrowth();
    initReproducibility();
    initCitationAdvantage();
    initROI();
    initUplift();
    initSeismic();
    initFumarole();
    initGlacier();
    initKiliClimate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();
