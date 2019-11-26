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

function getCountriesData(datasetJSON, indicator, year) {
    retval = []; // [{id:..., value:...},{...},...]

    Object.keys(datasetJSON[indicator]).forEach(function (key) {
        element = {};
        element["id"] = key;
        element["value"] = datasetJSON[indicator][key][year - 1960]
        retval.push(element);
        return
    })

    return retval;
}

d3.json("../../dataset/reducedDataset.json", function (error, datasetJSON) {

    if (error) { throw error; }

    data = {}
    Object.keys(datasetJSON).forEach(function (indicator) {
        data[indicator] = {};
        for (let y = 1960; y < 2020; y++) {
            data[indicator][y] = getCountriesData(datasetJSON, indicator, y);
        }
    })

    am4core.useTheme(am4themes_animated);

    // Create map instance
    let chart = am4core.create("chartdiv", am4maps.MapChart);
    chart.zoomControl = new am4maps.ZoomControl()


    chart.events.on("down", function (d) {
        console.log(d)
        if (d.target.zoomLevel < 1.1) {
            chart.seriesContainer.draggable = false;
        } else {
            chart.seriesContainer.draggable = true;
        }
    })



    // Set map definition
    // chart.geodata = am4geodata_worldLow;

    chart.geodataSource.url = "../../dataset/world_countries.json";

    // Pan behavior
    chart.panBehavior = "move";

    // chart.seriesContainer.draggable = false;
    // chart.seriesContainer.resizable = false;

    // Set projection
    chart.projection.d3Projection = d3.geoEquirectangular();

    // Create map polygon series
    let polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
    polygonSeries.north = 100;

    // Make map load polygon (like country names) data from GeoJSON
    polygonSeries.useGeodata = true;

    polygonSeries.heatRules.push({
        property: "fill",
        target: polygonSeries.mapPolygons.template,
        min: am4core.color("#00ff00"),
        max: am4core.color("#ff0000")
    });

    // polygonSeries.data = [{
    //     id: "US",
    //     value: 1000
    // },
    // {
    //     id: "RU",
    //     value: 500
    // },
    // {
    //     id: "AU",
    //     value: 0
    // }];

    let slider = document.getElementById("chosenYear");

    // Update the current slider value (each time you drag the slider handle)
    slider.oninput = function () {
        polygonSeries.data = data["SP.DYN.AMRT.P3"][slider.value];
        //polygonSeries.data = getCountriesData(datasetJSON,"SP.DYN.AMRT.P3",slider.value)
    }

    // console.log(polygonSeries.data)
    polygonSeries.data = data["SP.DYN.AMRT.P3"][slider.value];
    //polygonSeries.data = getCountriesData(datasetJSON,"SP.DYN.AMRT.P3",slider.value)
    //console.log(polygonSeries.data)

    // Configure series
    let polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.tooltipText = "{name}:{value}";
    polygonTemplate.fill = chart.colors.getIndex(0);

    polygonTemplate.events.on("hit", function (ev) {
        console.log(ev.target.dataItem.dataContext.name);
    });

    // Create hover state and set alternative fill color
    let hs = polygonTemplate.states.create("hover");
    // hs.properties.stroke = am4core.color("#000000");
    hs.properties.opacity = 0.55;

    // Add grid
    let grid = chart.series.push(new am4maps.GraticuleSeries());
    grid.toBack();

});

