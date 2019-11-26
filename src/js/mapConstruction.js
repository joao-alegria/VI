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

    // Check for errors when loading data
    if (error) { throw error; }

    /* DATASET */

    // Make dataset ready for faster slider update
    data = {}
    Object.keys(datasetJSON).forEach(function (indicator) {
        data[indicator] = {};
        for (let y = 1960; y < 2020; y++) {
            data[indicator][y] = getCountriesData(datasetJSON, indicator, y);
        }
    })

    neonatalCode = "SH.DYN.NMRT";
    under5Code = "SH.DYN.MORT";
    infantCode = "SP.DYN.IMRT.IN";
    adultCode = "SP.DYN.AMRT.P3";

    /* MAP DEFINITION */

    // Assign theme to the world map
    am4core.useTheme(am4themes_animated);

    // Create map instance
    let chart = am4core.create("world-map", am4maps.MapChart);
    chart.zoomControl = new am4maps.ZoomControl()


    chart.events.on("down", function (d) {
        if (d.target.zoomLevel < 1.1) {
            chart.seriesContainer.draggable = false;
        } else {
            chart.seriesContainer.draggable = true;
        }
    })



    // Set map definition
    // chart.geodata = am4geodata_worldLow;

    chart.geodataSource.url = "../../dataset/world_countries.json";
    //chart.geodata = am4geodata_worldLow;

    // Pan behavior
    chart.panBehavior = "move";

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

    // Add grid
    let grid = chart.series.push(new am4maps.GraticuleSeries());
    grid.toBack();

    // Add chart background color
    //chart.background.fill = am4core.color("#aadaff");
    //chart.background.fillOpacity = 0.3;

    /* FILTERS */

    // Prepare Slider and Current Year
    let slider = document.getElementById("chosenYear");
    let currentYear = document.getElementById("currentYear");
    currentYear.innerHTML = slider.value;

    // Prepare Buttons
    let btnNeonatal = document.getElementById("btn-neonatal");
    let btnUnder5 = document.getElementById("btn-under5");
    let btnInfant = document.getElementById("btn-infant");
    let btnAdult = document.getElementById("btn-adult");
    let btnSelected = adultCode;

    // Update the current slider value (each time you drag the slider handle)
    slider.oninput = function () {
        polygonSeries.data = data[btnSelected][slider.value];
        currentYear.innerHTML = slider.value;
    }
    polygonSeries.data = data[btnSelected][slider.value];
    // polygonSeries.data = [{id:"US", value:1000}, {id:"RU", value:500}, {id:"AU", value:0}];

    // Update Map when buttons are clicked
    btnNeonatal.onclick = function () {
        btnNeonatal.setAttribute("class", "btn btn-primary btn-lg active");
        btnUnder5.setAttribute("class", "btn btn-primary btn-lg");
        btnInfant.setAttribute("class", "btn btn-primary btn-lg");
        btnAdult.setAttribute("class", "btn btn-primary btn-lg");
        btnSelected = neonatalCode;
        polygonSeries.data = data[btnSelected][slider.value];
    }
    btnUnder5.onclick = function () {
        btnNeonatal.setAttribute("class", "btn btn-primary btn-lg");
        btnUnder5.setAttribute("class", "btn btn-primary btn-lg active");
        btnInfant.setAttribute("class", "btn btn-primary btn-lg");
        btnAdult.setAttribute("class", "btn btn-primary btn-lg");
        btnSelected = under5Code;
        polygonSeries.data = data[btnSelected][slider.value];
    }
    btnInfant.onclick = function () {
        btnNeonatal.setAttribute("class", "btn btn-primary btn-lg");
        btnUnder5.setAttribute("class", "btn btn-primary btn-lg");
        btnInfant.setAttribute("class", "btn btn-primary btn-lg active");
        btnAdult.setAttribute("class", "btn btn-primary btn-lg");
        btnSelected = infantCode;
        polygonSeries.data = data[btnSelected][slider.value];
    }
    btnAdult.onclick = function () {
        btnNeonatal.setAttribute("class", "btn btn-primary btn-lg");
        btnUnder5.setAttribute("class", "btn btn-primary btn-lg");
        btnInfant.setAttribute("class", "btn btn-primary btn-lg");
        btnAdult.setAttribute("class", "btn btn-primary btn-lg active");
        btnSelected = adultCode;
        polygonSeries.data = data[btnSelected][slider.value];
    }

    /* DATA INSERTION */

    // Configure series
    let polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.tooltipText = "{name}:{value}";
    polygonTemplate.fill = "lightgrey" //chart.colors.getIndex(0);

    polygonTemplate.events.on("hit", function (ev) {
        console.log(ev.target.dataItem.dataContext.id);
    });

    // Create hover state and set alternative fill color
    let hs = polygonTemplate.states.create("hover");
    hs.properties.opacity = 0.55;
    // hs.properties.stroke = am4core.color("#000000");

});

