import * as d3 from 'd3';
import BarChart from './barchart';
import AreaChart, { StockRow } from './areachart';
 

// ─── Typen ────────────────────────────────────────────────────────────────────

interface Sandwich {
  name:  string;
  price: number;
  size:  'large' | 'small';
}

interface City {
  city:       string;
  x:          number;
  y:          number;
  population: number;
  eu:         string;
}

interface SalesRow {
  month: string;
  sales: number;
}

// ─── Sandwiches ───────────────────────────────────────────────────────────────

d3.select('body').append('p').text('D3 funktioniert!');

const sandwiches: Sandwich[] = [
  { name: 'Thesis',       price: 7.95,  size: 'large' },
  { name: 'Dissertation', price: 8.95,  size: 'large' },
  { name: 'Highlander',   price: 6.50,  size: 'small' },
  { name: 'Just Tuna',    price: 6.50,  size: 'small' },
  { name: 'So-La',        price: 7.95,  size: 'large' },
  { name: 'Special',      price: 12.50, size: 'small' },
];

const svgSandwich = d3.select('body')
  .append('svg')
  .attr('width',  500)
  .attr('height', 500);

const radius = (d: Sandwich): number => d.size === 'large' ? 40 : 20;
const color  = (d: Sandwich): string => d.price < 7.00 ? '#1D9E75' : '#534AB7';

svgSandwich.selectAll('circle')
  .data(sandwiches)
  .enter()
  .append('circle')
  .attr('cx',           (_d, i) => 60 + i * 80)
  .attr('cy',           250)
  .attr('r',            d => radius(d))
  .attr('fill',         d => color(d))
  .attr('stroke',       '#333')
  .attr('stroke-width', 2);

// ─── Bar Chart ────────────────────────────────────────────────────────────────

const salesData: SalesRow[] = [
  { month: 'May',    sales: 6900  },
  { month: 'June',   sales: 14240 },
  { month: 'July',   sales: 25000 },
  { month: 'August', sales: 17500 },
];

// ── Activity 1: showBarChart() Funktion ──────────────────────────────────────
// In Activity 1 haben wir den Chart als einfache Funktion implementiert.
// Der gesamte Code (Skalen, Achsen, Balken) war in einer einzigen Funktion.
// Nachteil: nicht wiederverwendbar, bei Datenänderung muss alles neu gezeichnet werden.
//
// function showBarChart(data: SalesRow[]): void {
//   // Margin Convention: Abstände definieren damit Achsen nicht abgeschnitten werden
//   const margin = { top: 5, right: 20, bottom: 20, left: 60 };
//   const width  = 500 - margin.left - margin.right;
//   const height = 140 - margin.top  - margin.bottom;
//
//   // SVG-Element anlegen und innere Gruppe verschieben
//   const svg = d3.select('#chart')
//     .append('svg')
//       .attr('width',  width  + margin.left + margin.right)
//       .attr('height', height + margin.top  + margin.bottom)
//     .append('g')
//       .attr('transform', `translate(${margin.left}, ${margin.top})`);
//
//   // Lineare Skala für x-Achse (Verkaufszahlen → Pixel)
//   const xScale = d3.scaleLinear()
//     .domain([0, d3.max(data, d => d.sales) ?? 0])
//     .range([0, width]);
//
//   // Band-Skala für y-Achse (Monate → Pixel)
//   const yScale = d3.scaleBand<string>()
//     .domain(data.map(d => d.month))
//     .range([0, height])
//     .paddingInner(0.15);
//
//   // Achsen initialisieren
//   const xAxis = d3.axisBottom(xScale).ticks(6).tickSizeOuter(0);
//   const yAxis = d3.axisLeft(yScale).tickSizeOuter(0);
//
//   // x-Achse nach unten verschieben und zeichnen
//   svg.append('g')
//     .attr('class', 'axis x-axis')
//     .attr('transform', `translate(0, ${height})`)
//     .call(xAxis);
//
//   // y-Achse zeichnen
//   svg.append('g')
//     .attr('class', 'axis y-axis')
//     .call(yAxis);
//
//   // Balken als <rect>-Elemente zeichnen
//   svg.selectAll<SVGRectElement, SalesRow>('rect')
//     .data(data)
//     .enter()
//     .append('rect')
//       .attr('class',  'bar')
//       .attr('x',      0)
//       .attr('y',      d => yScale(d.month) ?? 0)
//       .attr('width',  d => xScale(d.sales))   // Breite = skalierter Verkaufswert
//       .attr('height', yScale.bandwidth());     // Höhe = Bandbreite der Skala
// }
//
// showBarChart(salesData);

// ── Activity 2: BarChart Klasse ───────────────────────────────────────────────
// In Activity 2 haben wir den gleichen Chart als wiederverwendbare ES6-Klasse
// umgeschrieben. Die Logik ist auf 3 Funktionen aufgeteilt:
//   - initVis()   → einmalig: SVG, Gruppen, leere Skalen anlegen
//   - updateVis() → Domains setzen, renderVis() aufrufen
//   - renderVis() → Balken und Achsen zeichnen/aktualisieren
// Vorteil: Bei Datenänderung reicht es updateVis() aufzurufen.
new BarChart({ parentElement: '#chart' }, salesData);

// ─── EU-Städte ────────────────────────────────────────────────────────────────

d3.csv('data/cities_and_population.csv').then(rawData => {

  const data: City[] = rawData.map(d => ({
    city:       d.city ?? d.name ?? '',
    x:          +d.x,
    y:          +d.y,
    population: +d.population,
    eu:         d.eu ?? '',
  }));

  const euCities = data.filter(d => d.eu === 'true');

  d3.select('body')
    .append('p')
    .text(`Anzahl EU-Städte: ${euCities.length}`);

  const svgCities = d3.select('body')
    .append('svg')
    .attr('width',  700)
    .attr('height', 550);

  svgCities.selectAll('circle')
    .data(euCities)
    .enter()
    .append('circle')
    .attr('cx',           d => d.x)
    .attr('cy',           d => d.y)
    .attr('r',            d => d.population >= 1_000_000 ? 8 : 4)
    .attr('fill',         '#534AB7')
    .attr('fill-opacity', 0.7)
    .attr('stroke',       '#3C3489')
    .attr('stroke-width', 0.8);

  svgCities.selectAll('text')
    .data(euCities)
    .enter()
    .append('text')
    .attr('class',   'city-label')
    .attr('x',       d => d.x)
    .attr('y',       d => d.y - 10)
    .attr('opacity', d => d.population >= 1_000_000 ? 1 : 0)
    .text(d => d.city);

}).catch((error: Error) => {
  console.error('Fehler beim Laden der CSV:', error);
});

// ─── 2. Hausaufgabe: Charts -Activity 3: Area & Line Chart ───────────────────────────────────────────

d3.csv('data/sp_500_index.csv').then(rawData => {
 
  const data: StockRow[] = rawData.map(d => ({
    date:  new Date(d.date),
    close: +d.close,
  }));
 
  new AreaChart({ parentElement: '#areachart' }, data);
 
}).catch((error: Error) => {
  console.error('Fehler beim Laden der S&P 500 CSV:', error);
});
 