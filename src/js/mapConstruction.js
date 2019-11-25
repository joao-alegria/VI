/**
 * ---------------------------------------
 * This demo was created using amCharts 4.
 * 
 * For more information visit:
 * https://www.amcharts.com/
 * 
 * Documentation is available at:
 * https://www.amcharts.com/docs/v4/
 * ---------------------------------------
 */

// Themes begin
am4core.useTheme(am4themes_animated);
// Themes end

// Create map instance
var chart = am4core.create("chartdiv", am4maps.MapChart);

// Set map definition
chart.geodata = am4geodata_worldLow;

// chart.geodataSource.url = "world_countries.json";

// Pan behavior
// chart.panBehavior = "move";

// Set projection
chart.projection.d3Projection = d3.geoEquirectangular();

// Create map polygon series
var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
polygonSeries.north = 100;

// Make map load polygon (like country names) data from GeoJSON
polygonSeries.useGeodata = true;

polygonSeries.heatRules.push({
    property: "fill",
    target: polygonSeries.mapPolygons.template,
    min: am4core.color("#00ff00"),
    max: am4core.color("#ff0000")
});

polygonSeries.data = [{
    id: "US",
    value: 1000
},
{
    id: "RU",
    value: 500
},
{
    id: "AU",
    value: 0
}];

// Configure series
var polygonTemplate = polygonSeries.mapPolygons.template;
polygonTemplate.tooltipText = "{name}:{value}";
polygonTemplate.fill = chart.colors.getIndex(0);

polygonTemplate.events.on("hit", function (ev) {
    console.log(ev.target.dataItem.dataContext.name);
});

// Create hover state and set alternative fill color
var hs = polygonTemplate.states.create("hover");
// hs.properties.stroke = am4core.color("#000000");
hs.properties.opacity = 0.55;


// Add grid
var grid = chart.series.push(new am4maps.GraticuleSeries());
grid.toBack();