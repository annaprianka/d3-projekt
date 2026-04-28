d3.select("body").append("p").text("D3 funktioniert!");
const sandwiches = [
  { name: "Thesis",       price: 7.95,  size: "large" },
  { name: "Dissertation", price: 8.95,  size: "large" },
  { name: "Highlander",   price: 6.50,  size: "small" },
  { name: "Just Tuna",    price: 6.50,  size: "small" },
  { name: "So-La",        price: 7.95,  size: "large" },
  { name: "Special",      price: 12.50, size: "small" }
];

const width = 500;
const height = 500;

const svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const radius = d => d.size === "large" ? 40 : 20;
const color  = d => d.price < 7.00 ? "#1D9E75" : "#534AB7";

svg.selectAll("circle")
  .data(sandwiches)
  .enter()
  .append("circle")
  .attr("cx", (d, i) => 60 + i * 80)
  .attr("cy", height / 2)
  .attr("r",  d => radius(d))
  .attr("fill",         d => color(d))
  .attr("stroke",       "#333")
  .attr("stroke-width", 2);


  d3.csv("data/cities_and_population.csv").then(data => {

  // 1. Zahlen konvertieren
  data.forEach(d => {
    d.x          = +d.x;
    d.y          = +d.y;
    d.population = +d.population;
  });

  // 2. Nur EU-Städte behalten
  const euCities = data.filter(d => d.eu === "true" || d.eu === true);

  // 3. Anzahl ins HTML schreiben
  d3.select("body")
    .append("p")
    .text(`Anzahl EU-Städte: ${euCities.length}`);

  // 4. SVG-Zeichenfläche
  const svg = d3.select("body")
    .append("svg")
    .attr("width",  700)
    .attr("height", 550);

  // 5. Kreise zeichnen
  svg.selectAll("circle")
    .data(euCities)
    .enter()
    .append("circle")
    .attr("cx",   d => d.x)
    .attr("cy",   d => d.y)
    .attr("r",    d => d.population >= 1000000 ? 8 : 4)
    .attr("fill",         "#534AB7")
    .attr("fill-opacity", 0.7)
    .attr("stroke",       "#3C3489")
    .attr("stroke-width", 0.8);

  // 6. Labels für Großstädte
  svg.selectAll("text")
    .data(euCities)
    .enter()
    .append("text")
    .attr("class",   "city-label")
    .attr("x",       d => d.x)
    .attr("y",       d => d.y - 10)
    .attr("opacity", d => d.population >= 1000000 ? 1 : 0)
    .text(d => d.city || d.name);

}).catch(error => {
  console.error("Fehler beim Laden der CSV:", error);
});