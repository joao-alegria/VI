/**
 * JavaScript for website visualization tools
 * 
 * Authors: Filipe Pires [85122] and João Alegria [85048]
 * Information Visualization Course, DETI, UA, 2019
 * 
 */

/* GLOBAL VARIABLES */

let allIndicators = []
let allCountries = []
let presentedIndicators = []
let presentedCountries = []

let IDLE_TIMEOUT

/* MAP FUNCTIONS */

// Retrieves the data from the dataset for the given indicator and year
function getCountriesData(datasetJSON, indicator, year) {
    let retval = []; // [{id:..., value:...},{...},...]

    Object.keys(datasetJSON[indicator]).forEach(function (key) {
        let element = {};
        element["id"] = key;
        element["value"] = datasetJSON[indicator][key][year - 1960]
        retval.push(element);
        return
    })

    return retval;
}

// Retrieves maximum and minimum values of a given indicator for all years
function getMaxMinValueByIndicator(data, indicator) {
    let max = 0.0;
    let min = Number.MAX_VALUE;
    Object.keys(data[indicator]).forEach(function (year) {
        Object.keys(data[indicator][year]).forEach(function (country) {
            if (data[indicator][year][country]["value"] != null) {
                if (data[indicator][year][country]["value"] > max) {
                    max = data[indicator][year][country]["value"];
                }
                if (data[indicator][year][country]["value"] < min) {
                    min = data[indicator][year][country]["value"];
                }
            }
        })
    })
    return [max, min];
}

// Retrieves maximum value of the entire dataset (all indicators for all years)
function getMaxValue(data) {
    let max = 0.0;
    Object.keys(data).forEach(function (indicator) {
        tmp = getMaxMinValueByIndicator(data, indicator);
        if (tmp[0] > max) {
            max = tmp[0]
        }
    })
    return max;
}

/* SCATTER PLOT FUNCTIONS */

// Aux function for brushing feature
function idled() { IDLE_TIMEOUT = null; }

// Adds lines to the chart, connecting the scattered points
function addLines(svg, x, y, myColor, newData) {
    let line = d3.line()
        .x(function (d) { return x(+d.time) })
        .y(function (d) { return y(+d.value) })
    svg.selectAll("myLines")
        .data(newData)
        .enter()
        .append("path")
            .attr("class", function (d) { return d.name.substring(d.name.indexOf("/") + 1, d.name.length).replace(/\./g, "_") + " " + d.name.substring(0, d.name.indexOf("/")) + " lines" })
            .attr("d", function (d) { return line(d.values) })
            .attr("stroke", function (d) { 
                return myColor(d.name) 
            })
            .style("stroke-width", 3)
            .style("fill", "none")      
}

// Adds points to the chart from the selected indicators and countries (null values appear in grey)
function addPoints(svg, x, y, myColor, newData) {
    // create a tooltip
    let Tooltip = d3.select("#scatter-plot")
        .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")

    // Three function that change the tooltip when user hover / move / leave a cell
    let mouseover = function (d) {
        Tooltip
            .style("opacity", 1)
    }
    let mousemove = function (d) {
        let cursorX = d3.mouse(this)[0]
        let cursorY = d3.mouse(this)[1]
        let label = ""
        switch(d.class) {
            case "H_SH_TBS_INCD":
                label = "Incidence of tuberculosis"
            case "G_VC_IHR_PSRC_P5":
                label = "Intentional homicides"
            case "A_SH_STA_WASH_P5":
                label = "Mortality rate attributed to unsafe water, unsafe sanitation and lack of hygiene"
            case "F_SH_STA_SUIC_P5":
                label = "Suicide mortality rate"
            case "I_SH_HIV_INCD_ZS":
                label = "Incidence of HIV"
            case "J_SH_MLR_INCD_P3":
                label = "Incidence of malaria"
            case "E_SH_DYN_NMRT":
                label = "Mortality rate, neonatal"
            case "D_SH_DYN_MORT":
                label = "Mortality rate, under-5"
            case "C_SP_DYN_IMRT_IN":
                label = "Mortality rate, infant"
            case "K_SH_MED_NUMW_P3":
                label = "Number of nurses and midwives"
            case "B_SP_DYN_AMRT_P3":
                label = "Mortality rate, adult" 
        }
        Tooltip
            .html(d.country + "/" + label + ": " + d.value)
            //.style("left", (d3.mouse(this)[0]+70) + "px")
            //.style("top", (d3.mouse(this)[1]) + "px")
            .style("left", (cursorX + 70) + "px")
            .style("top", (cursorY) + "px")
    }
    let mouseleave = function (d) {
        Tooltip
            .style("opacity", 0)
    }

    // Retrieve points from the dataset and draw them
    svg.selectAll("myDots")
        .data(newData)
        .enter()
        .append('g')
            .attr("class", function (d) { return d.name })
            .selectAll("myPoints")
                .data(function (d) {
                    return d.values.map(function (a) {
                        return {
                            time: a.time,
                            value: a.value,
                            class: d.name.substring(d.name.indexOf("/") + 1, d.name.length).replace(/\./g, "_"),
                            country: d.name.substring(0, d.name.indexOf("/")),
                            prev: d.name
                        }
                    })
                })
        .enter()
        .append("circle")
            .attr("class", function (d) { return d.class + " " + d.country + " points" })
            .attr("cx", function (d) { return x(d.time) })
            .attr("cy", function (d) { return y(d.value) })
            .attr("r",6)
            .attr("stroke", "white")
            .style("fill", function (d) { 
                if (d.value == 0) {
                    return am4core.color("grey")
                }
                return myColor(d.prev) 
            })
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
        
}

// Adds side filters for the plot (two columns with countries and available indicators)
function addFilters(svg, x, y, myColor, updateScatterPlot, originalData, newData) {
    // countries
    d3.select("#countries").selectAll("myLegend")
        .data(allCountries)
        .enter()
        .append('div')
            .attr("class", "row")
            .style("text-align", "right")
        .append("label")
            .style("cursor", "pointer")
            .text(function (d) { return d })
        .append("input")
            .attr("type", "checkbox")
            .attr("id", function (d) { return d })
            .attr("class", "country")
            .style("margin-left", "4px")
            .on("click", function (d) {
                if (presentedCountries.includes(d)) {
                    presentedCountries = presentedCountries.filter(function (value, index, arr) { return value != d })
                    svg.selectAll("." + d).remove()
                } else {
                    let indArr = []
                    d3.selectAll(".indicator").each(function (z) {
                        if (d3.select("#" + z.name.replace(/\./g, "_")).property("checked")) {
                            indArr.push(z.name)
                        }
                    })
                    presentedCountries.push(d)

                    let values = []
                    for (let z in indArr) {
                        values.push([])
                    }
                    for (let indIdx in indArr) {
                        for (let year in originalData[indArr[indIdx]]) {
                            for (let countryIdx in originalData[indArr[indIdx]][year]) {
                                if (originalData[indArr[indIdx]][year][countryIdx].id == d) {
                                    values[indIdx].push({ time: parseInt(year), value: (originalData[indArr[indIdx]][year][countryIdx].value == null ? 0 : Math.log(originalData[indArr[indIdx]][year][countryIdx].value)) })
                                }

                            }

                        }
                    }
                    let newData = []
                    for (let idx in values) {
                        newData.push({ name: d + "/" + indArr[idx], values: values[idx] })
                    }

                    addPoints(svg1, x, y, myColor, newData)
                    addLines(svg, x, y, myColor, newData)

                    d3.select("#" + d).property("checked", "true")
                }
            })

    // indicators
    d3.select("#indicators").selectAll("myLegend")
        .data(newData)
        .enter()
        .append('div')
            .attr("class", "row")
            .style("text-align", "right")
        .append("label")
            .style("cursor", "pointer")
            //.text(function (d) { return d.name.replace(/\./g, "_"); })
            .text(function (d) { 
                switch(d.name) {
                    case "H.SH.TBS.INCD":
                        return "Incidence of tuberculosis"
                    case "G.VC.IHR.PSRC.P5":
                        return "Intentional homicides"
                    case "A.SH.STA.WASH.P5":
                        return "Mortality rate attributed to unsafe water, unsafe sanitation and lack of hygiene"
                    case "F.SH.STA.SUIC.P5":
                        return "Suicide mortality rate"
                    case "I.SH.HIV.INCD.ZS":
                        return "Incidence of HIV"
                    case "J.SH.MLR.INCD.P3":
                        return "Incidence of malaria"
                    case "E.SH.DYN.NMRT":
                        return "Mortality rate, neonatal"
                    case "D.SH.DYN.MORT":
                        return "Mortality rate, under-5"
                    case "C.SP.DYN.IMRT.IN":
                        return "Mortality rate, infant"
                    case "K.SH.MED.NUMW.P3":
                        return "Number of nurses and midwives"
                    case "B.SP.DYN.AMRT.P3":
                        return "Mortality rate, adult"
                }
                return d.name.replace(/\./g, "_"); 
            })
        .append("input")
            .attr("type", "checkbox")
            .attr("id", function (d) { return d.name.replace(/\./g, "_"); })
            .attr("class", "indicator")
            .style("margin-left", "4px")
            .on("click", function (d) {
                updateScatterPlot(svg, x, y, myColor, d, originalData)
            })
}

// Called everytime filters are changed by the user (or map is clicked) in order for the chart to be updated with the new data
function updateScatterPlot(svg, x, y, myColor, d, data) {
    if (presentedIndicators.includes(d.name)) {
        presentedIndicators = presentedIndicators.filter(function (value, index, arr) { return value != d.name })
        svg.selectAll("." + d.name.replace(/\./g, "_")).remove()
    } else {
        let countryArr = []
        d3.selectAll(".country").each(function (z) {
            if (d3.select("#" + z).property("checked")) {
                countryArr.push(z)
            }
        })
        presentedIndicators.push(d.name)

        let values = []
        for (let z in countryArr) {
            values.push([])
        }
        for (let year in data[d.name]) {
            for (let countryIdx in data[d.name][year]) {
                if (countryArr.indexOf(data[d.name][year][countryIdx].id) != -1) {
                    values[countryArr.indexOf(data[d.name][year][countryIdx].id)].push({ time: parseInt(year), value: (data[d.name][year][countryIdx].value == null ? 0 : Math.log(data[d.name][year][countryIdx].value)) })
                }

            }

        }

        let newData = []
        for (let idx in values) {
            newData.push({ name: countryArr[idx] + "/" + d.name, values: values[idx] })
        }

        addPoints(svg1, x, y, myColor, newData)
        addLines(svg, x, y, myColor, newData)

        d3.select("#" + d.name.replace(/\./g, "_")).property("checked", "true")
    }
}


/* MAIN SCRIPT */

// Set the dimensions and margins of the graph
let width = parseFloat(
    d3.select("#scatter-plot").style("width").substring(0, d3.select("#scatter-plot").style("width").length - 2)) * 0.9,
    height = parseFloat(d3.select("#scatter-plot").style("height").substring(0, d3.select("#scatter-plot").style("height").length - 2));
let margin_left = 20;

// Append the svg object to the body of the page
let svg = d3.select("#scatter-plot")
    .append("svg")
        .attr("id", "mySVG")
        .attr("width", width + 100)
        .attr("height", height + 50)
    .append("g")

let svg1 = svg.append("g")

// Read the data
d3.json("../../dataset/reducedDataset.json", function (error, datasetJSON) {

    // Check for errors when loading data
    if (error) { throw error; }

    /* DATASET */

    // order datasetJSON
    const orderedDatasetJSON = {};
    Object.keys(datasetJSON).sort().forEach(function(key) {
        orderedDatasetJSON[key] = datasetJSON[key];
    });

    // Make dataset ready for faster slider update
    data = {}
    Object.keys(orderedDatasetJSON).forEach(function (indicator) {
        data[indicator] = {};
        for (let y = 1960; y < 2020; y++) {
            data[indicator][y] = getCountriesData(orderedDatasetJSON, indicator, y);
        }
    })

    /* MAP RELATED */

    // Add fictitious countries to insert max and min values of current indicator 
    // (this is done for the color scaling to be correct throughout the years)
    let MaxMin
    Object.keys(data).forEach(function (indicator) {
        tmp = getMaxMinValueByIndicator(data, indicator)

        max = {};
        max["id"] = "max";
        max["value"] = tmp[0];

        min = {};
        min["id"] = "min";
        min["value"] = tmp[1];

        for (let y = 1960; y < 2020; y++) {
            data[indicator][y].push(max);
            data[indicator][y].push(min);
        }
    })

    // Define aux variables with indicator codes
    neonatalCode = "E.SH.DYN.NMRT";
    under5Code = "D.SH.DYN.MORT";
    infantCode = "C.SP.DYN.IMRT.IN";
    adultCode = "B.SP.DYN.AMRT.P3";

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
        min: am4core.color("#FDF7DB"),//am4core.color("#00ff00"),
        max: am4core.color("#712807")//am4core.color("#ff0000")
    });

    var heatLegend = chart.chartContainer.createChild(am4maps.HeatLegend);
    heatLegend.series = polygonSeries;
    heatLegend.valign = "top";
    heatLegend.align = "right";
    heatLegend.padding(0, 65, 0, 0)
    heatLegend.height = am4core.percent(33);
    heatLegend.orientation = "vertical";

    polygonSeries.mapPolygons.template.events.on("over", event => {
        if (!isNaN(event.target.dataItem.value)) {
            heatLegend.valueAxis.showTooltipAt(event.target.dataItem.value, 65);
        } else {
            heatLegend.valueAxis.hideTooltip();
        }
    });

    polygonSeries.mapPolygons.template.events.on("out", event => {
        heatLegend.valueAxis.hideTooltip();
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

    // Create hover state and set alternative fill color
    let hs = polygonTemplate.states.create("hover");
    hs.properties.opacity = 0.55;
    // hs.properties.stroke = am4core.color("#000000");

    /* SCATTERPLOT RELATED */

    for (let key in data) {
        allIndicators.push(key)
    }

    for (let year in data[allIndicators[0]]) {
        for (let countryIdx in data[allIndicators[0]][year]) {
            allCountries.push(data[allIndicators[0]][year][countryIdx].id)
        }
        break
    }

    // Reformat the data: we need an array of arrays of {x, y} tuples
    let dataReady = allIndicators.map(function (grpName) { // .map allows to do something for each element of the list
        let values = []
        for (let year in data[grpName]) {
            for (let countryIdx in data[grpName][year]) {
                values.push({ time: parseInt(year), value: (data[grpName][year][countryIdx].value == null ? 0 : Math.log(data[grpName][year][countryIdx].value)) })
                break
            }
        }
        return {
            name: grpName,
            values: values
        };
    });

    // A color scale: one color for each group
    let myColor = d3.scaleOrdinal()
        .domain(allIndicators.concat(allCountries))
        //.range(d3.schemeSet2);
        .range(d3.schemeSpectral[11])

    // Add X axis
    let xDomain = [1960, 2019]
    let x = d3.scaleLinear()
        .domain(xDomain)
        .range([0, width]);
    let xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add Y axis
    let yDomain = [0, Math.log(getMaxValue(data))]
    let y = d3.scaleLinear()
        .domain(yDomain)
        .range([height, 0]);
    let yAxis = svg.append("g")
        .call(d3.axisLeft(y));
 
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 40)
        .text("Date (Years)");

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", 20)
        .text("log10(Population / 10^6)")


    svg.attr("transform", "translate(" + margin_left + "," + 10 + ")")

    // Add a legend (interactive)
    addFilters(svg, x, y, myColor, updateScatterPlot, data, dataReady)

    // let valueATmp = []
    // for (let idx in data) {
    //     valueATmp.push({ time: data[idx].time, value: data[idx].value })
    // }

    polygonTemplate.events.on("hit", function (ev) {
        // d3.selectAll(".country").property("checked", false)
        // d3.selectAll(".indicator").property("checked", false)
        // d3.selectAll(".points").remove()
        // d3.selectAll(".lines").remove()
        presentedCountries = []
        presentedIndicators = []
        d3.select("#" + ev.target.dataItem.dataContext.id).property("checked", true)
        updateScatterPlot(svg, x, y, myColor, { name: btnSelected }, data)
        document.getElementById("developmentindicators").scrollIntoView({ block: 'end', behavior: 'smooth' })
        ev.target.isActive = !ev.target.isActive;
    });

    // Add brushing
    let brush = d3.brushX()                   // Add the brush feature using the d3.brush function
        .extent([[0, 0], [width, height]])  // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .on("end", function () {
            // What are the selected boundaries?
            extent = d3.event.selection

            // If no selection, back to initial coordinate. Otherwise, update X axis domain
            if (!extent) {
                if (!IDLE_TIMEOUT) return IDLE_TIMEOUT = setTimeout(idled, 350); // This allows to wait a little bit
                x.domain(xDomain)
            } else {
                x.domain([x.invert(extent[0]), x.invert(extent[1])])
                svg.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
            }

            // Update axis and line position
            xAxis.transition().duration(1000).call(d3.axisBottom(x))

            let classControl = []

            svg.selectAll("circle")
                .transition()
                .duration(1000)
                .attr("cx", function (d) {
                    if (!classControl.includes(d.class)) {
                        classControl.push(d.class)
                    }
                    return x(d.time)
                })
                .attr("cy", function (d) { return y(d.value) })

            for (let classIdx in classControl) {
                svg.selectAll("path." + classControl[classIdx].replace(/\./g, "_")).transition().duration(1000).attr("d", function (d) {
                    let line = d3.line()
                        .x(function (d) { return x(+d.time) })
                        .y(function (d) { return y(+d.value) })
                    return line(d.values)
                })
            }
        })               // Each time the brush selection changes, trigger the 'updateChart' function

    svg1.append("g")
        .attr("class", "brush")
        .call(brush);

})

