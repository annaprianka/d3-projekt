import * as d3 from 'd3';

// ─── Typen ────────────────────────────────────────────────────────────────────

interface SalesRow {
  month: string;
  sales: number;
}

interface BarChartConfig {
  parentElement:   string;
  containerWidth?: number;
  containerHeight?: number;
}

// ─── Klasse ───────────────────────────────────────────────────────────────────

class BarChart {
  config: {
    parentElement:   string;
    containerWidth:  number;
    containerHeight: number;
    margin:          { top: number; right: number; bottom: number; left: number };
  };

  data: SalesRow[];

  // D3-Elemente
  svg!:    d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>;
  chart!:  d3.Selection<SVGGElement,   unknown, HTMLElement, unknown>;
  xScale!: d3.ScaleLinear<number, number>;
  yScale!: d3.ScaleBand<string>;
  xAxisG!: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>;
  yAxisG!: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>;

  constructor(_config: BarChartConfig, _data: SalesRow[]) {
    this.config = {
      parentElement:   _config.parentElement,
      containerWidth:  _config.containerWidth  || 500,
      containerHeight: _config.containerHeight || 140,
      margin:          { top: 5, right: 20, bottom: 20, left: 60 },
    };
    this.data = _data;

    this.initVis();
  }

  // ── 1. Einmalig: SVG, Achsen-Gruppen, Skalen anlegen ─────────────────────
  initVis(): void {
    const vis = this;

    const width  = vis.config.containerWidth  - vis.config.margin.left - vis.config.margin.right;
    const height = vis.config.containerHeight - vis.config.margin.top  - vis.config.margin.bottom;

    // SVG + innere Gruppe
    vis.svg = d3.select<SVGSVGElement, unknown>(vis.config.parentElement)
      .append('svg')
        .attr('width',  vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);

    // Skalen (Domain wird in updateVis gesetzt)
    vis.xScale = d3.scaleLinear().range([0, width]);
    vis.yScale = d3.scaleBand<string>().range([0, height]).paddingInner(0.15);

    // Achsen-Gruppen (leer, werden in updateVis befüllt)
    vis.xAxisG = vis.chart.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0, ${height})`);

    vis.yAxisG = vis.chart.append('g')
      .attr('class', 'axis y-axis');

    vis.updateVis();
  }

  // ── 2. Daten & Domains aktualisieren ─────────────────────────────────────
  updateVis(): void {
    const vis = this;

    // Accessor-Funktionen
    const xValue = (d: SalesRow) => d.sales;
    const yValue = (d: SalesRow) => d.month;

    // Domains setzen
    vis.xScale.domain([0, d3.max(vis.data, xValue) ?? 0]);
    vis.yScale.domain(vis.data.map(yValue));

    vis.renderVis();
  }

  // ── 3. DOM-Elemente zeichnen / aktualisieren ──────────────────────────────
  renderVis(): void {
    const vis = this;

    // Balken
    vis.chart.selectAll<SVGRectElement, SalesRow>('.bar')
      .data(vis.data)
      .join('rect')
        .attr('class',  'bar')
        .attr('x',      0)
        .attr('y',      d => vis.yScale(d.month) ?? 0)
        .attr('width',  d => vis.xScale(d.sales))
        .attr('height', vis.yScale.bandwidth());

    // Achsen rendern
    vis.xAxisG.call(d3.axisBottom(vis.xScale).ticks(6).tickSizeOuter(0));
    vis.yAxisG.call(d3.axisLeft(vis.yScale).tickSizeOuter(0));
  }
}

export default BarChart;