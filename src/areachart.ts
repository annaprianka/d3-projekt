import * as d3 from 'd3';

// ─── Typen ────────────────────────────────────────────────────────────────────

export interface StockRow {
  date:  Date;
  close: number;
}

interface AreaChartConfig {
  parentElement:    string;
  containerWidth?:  number;
  containerHeight?: number;
}

// ─── Klasse ───────────────────────────────────────────────────────────────────

class AreaChart {
  config: {
    parentElement:   string;
    containerWidth:  number;
    containerHeight: number;
    margin:          { top: number; right: number; bottom: number; left: number };
  };

  data: StockRow[];

  // D3-Elemente
  svg!:    d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>;
  chart!:  d3.Selection<SVGGElement,   unknown, HTMLElement, unknown>;
  xScale!: d3.ScaleTime<number, number>;
  yScale!: d3.ScaleLinear<number, number>;
  xAxisG!: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>;
  yAxisG!: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>;

  // Accessor-Funktionen
  xValue!: (d: StockRow) => Date;
  yValue!: (d: StockRow) => number;

  constructor(_config: AreaChartConfig, _data: StockRow[]) {
    this.config = {
      parentElement:   _config.parentElement,
      containerWidth:  _config.containerWidth  || 600,
      containerHeight: _config.containerHeight || 300,
      margin:          { top: 20, right: 20, bottom: 30, left: 60 },
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
    vis.xScale = d3.scaleTime().range([0, width]);
    vis.yScale = d3.scaleLinear().range([height, 0]);

    // Achsen-Gruppen
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
    vis.xValue = (d: StockRow) => d.date;
    vis.yValue = (d: StockRow) => d.close;

    // Domains setzen
    vis.xScale.domain(d3.extent(vis.data, vis.xValue) as [Date, Date]);
    vis.yScale.domain([0, d3.max(vis.data, vis.yValue) ?? 0]);

    vis.renderVis();
  }

  // ── 3. DOM-Elemente zeichnen ──────────────────────────────────────────────
  renderVis(): void {
    const vis = this;

    // Area-Generator
    const area = d3.area<StockRow>()
      .x(d => vis.xScale(vis.xValue(d)))
      .y0(vis.yScale(0))
      .y1(d => vis.yScale(vis.yValue(d)));

    // Line-Generator
    const line = d3.line<StockRow>()
      .x(d => vis.xScale(vis.xValue(d)))
      .y(d => vis.yScale(vis.yValue(d)));

    // Area zeichnen
    vis.chart.selectAll<SVGPathElement, StockRow[]>('.area-path')
      .data([vis.data])
      .join('path')
        .attr('class', 'area-path')
        .attr('d', area)
        .attr('fill',         '#534AB7')
        .attr('fill-opacity', 0.2)
        .attr('stroke',       'none');

    // Line zeichnen
    vis.chart.selectAll<SVGPathElement, StockRow[]>('.line-path')
      .data([vis.data])
      .join('path')
        .attr('class', 'line-path')
        .attr('d', line)
        .attr('fill',         'none')
        .attr('stroke',       '#534AB7')
        .attr('stroke-width', 1.5);

    // Achsen rendern
    vis.xAxisG.call(d3.axisBottom(vis.xScale).ticks(6).tickSizeOuter(0));
    vis.yAxisG.call(d3.axisLeft(vis.yScale).ticks(6).tickSizeOuter(0));
  }
}

export default AreaChart;