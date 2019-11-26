//GLOBAL letIABLES
let ALL_GROUP = ["valueA", "valueB", "valueC"]
let PRESENTED_GROUP = []
let IDLE_TIMEOUT


function idled() { IDLE_TIMEOUT = null; }

function addLines(svg, x, y, myColor, newData) {
    let line = d3.line()
        .x(function (d) { return x(+d.time) })
        .y(function (d) { return y(+d.value) })
    svg.selectAll("myLines")
        .data(newData)
        .enter()
        .append("path")
        .attr("class", function (d) { return d.name })
        .attr("d", function (d) { return line(d.values) })
        .attr("stroke", function (d) { return myColor(d.name) })
        .style("stroke-width", 4)
        .style("fill", "none")
}

function addPoints(svg, x, y, myColor, newData) {
    // create a tooltip
    let Tooltip = d3.select("#scatter-plot")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
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
        Tooltip
            .html(d.class + ": " + d.value)
            //.style("left", (d3.mouse(this)[0]+70) + "px")
            //.style("top", (d3.mouse(this)[1]) + "px")
            .style("left", (cursorX + 70) + "px")
            .style("top", (cursorY) + "px")
    }
    let mouseleave = function (d) {
        Tooltip
            .style("opacity", 0)
    }


    svg.selectAll("myDots")
        // First we need to enter in a group
        .data(newData)
        .enter()
        .append('g')
        .style("fill", function (d) { return myColor(d.name) })
        .attr("class", function (d) { return d.name })
        // Second we need to enter in the 'values' part of this group
        .selectAll("myPoints")
        .data(function (d) {
            return d.values.map(function (a) {
                return {
                    time: a.time,
                    value: a.value,
                    class: d.name
                }
            })
        })
        .enter()
        .append("circle")
        .attr("class", function (d) { return d.class })
        .attr("cx", function (d) { return x(d.time) })
        .attr("cy", function (d) { return y(d.value) })
        .attr("r", 5)
        .attr("stroke", "white")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
}

function addLegend(svg, x, y, myColor, updateScatterPlot, originalData, newData) {
    d3.select("#indicators").selectAll("myLegend")
        .data(newData)
        .enter()
        .append('div')
        .attr("class", "row")
        .append("label")
        .style("cursor", "pointer")
        .style("font-size", "18px")
        .text(function (d) { return d.name; })
        .append("input")
        .attr("type", "checkbox")
        .attr("id", function (d) { return d.name; })
        .style("margin-left", "4px")
        .on("click", function (d) {
            updateScatterPlot(svg, x, y, myColor, d, originalData)
        })
}

function updateScatterPlot(svg, x, y, myColor, d, data) {
    if (PRESENTED_GROUP.includes(d.name)) {
        PRESENTED_GROUP.splice(PRESENTED_GROUP.indexOf(d.name));
        dataPresented = PRESENTED_GROUP.map(function (grpName) { // .map allows to do something for each element of the list
            return {
                name: grpName,
                values: data.map(function (d) {
                    return { time: d.time, value: +d[grpName] };
                })
            };
        });
        d3.select("svg").selectAll("circle").remove();
        svg.selectAll("." + d.name).remove()
    } else {
        PRESENTED_GROUP.push(d.name)
        dataPresented = PRESENTED_GROUP.map(function (grpName) { // .map allows to do something for each element of the list
            return {
                name: grpName,
                values: data.map(function (d) {
                    return { time: d.time, value: +d[grpName] };
                })
            };
        });
        newData = [d.name].map(function (grpName) { // .map allows to do something for each element of the list
            return {
                name: grpName,
                values: data.map(function (d) {
                    return { time: d.time, value: +d[grpName] };
                })
            };
        });
        addLines(svg, x, y, myColor, newData)
        addPoints(svg, x, y, myColor, newData)
        d3.select("#" + d.name).property("checked", "true")
    }
}


// MAIN SCRIPT
// set the dimensions and margins of the graph
let width = parseFloat(d3.select("#scatter-plot").style("width").substring(0, d3.select("#scatter-plot").style("width").length - 2)) * 0.9,
    height = parseFloat(d3.select("#scatter-plot").style("height").substring(0, d3.select("#scatter-plot").style("height").length - 2));
let margin_left = 20;


// append the svg object to the body of the page
let svg = d3.select("#scatter-plot")
    .append("svg")
    .attr("id", "mySVG")
    .attr("width", width + 100)
    .attr("height", height + 50)
    .append("g")

let svg1 = svg.append("g")


//Read the data
d3.csv("../../dataset/tmp.csv", function (data) {

    // Reformat the data: we need an array of arrays of {x, y} tuples
    let dataReady = ALL_GROUP.map(function (grpName) { // .map allows to do something for each element of the list
        return {
            name: grpName,
            values: data.map(function (d) {
                return { time: d.time, value: +d[grpName] };
            })
        };
    });

    // A color scale: one color for each group
    let myColor = d3.scaleOrdinal()
        .domain(ALL_GROUP)
        .range(d3.schemeSet2);

    // Add X axis
    let xDomain = [0, 10]
    let x = d3.scaleLinear()
        .domain(xDomain)
        .range([0, width]);
    let xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add Y axis
    let yDomain = [0, 18]
    let y = d3.scaleLinear()
        .domain(yDomain)
        .range([height, 0]);
    let yAxis = svg.append("g")
        .call(d3.axisLeft(y));

    svg.attr("transform", "translate(" + margin_left + "," + 10 + ")")

    // Add a legend (interactive)
    addLegend(svg, x, y, myColor, updateScatterPlot, data, dataReady)

    let valueATmp = []
    for (let idx in data) {
        valueATmp.push({ time: data[idx].time, value: data[idx].value })
    }

    updateScatterPlot(svg, x, y, myColor, { name: "valueA", values: valueATmp }, data)


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
                svg.selectAll("path." + classControl[classIdx]).transition().duration(1000).attr("d", function (d) {
                    let line = d3.line()
                        .x(function (d) { return x(+d.time) })
                        .y(function (d) { return y(+d.value) })
                    return line(d.values)
                })
            }
        })               // Each time the brush selection changes, trigger the 'updateChart' function


    // Add the brushing
    svg1
        .append("g")
        .attr("class", "brush")
        .call(brush);

})

