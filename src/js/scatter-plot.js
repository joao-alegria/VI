// set the dimensions and margins of the graph
var margin = { top: 10, right: 100, bottom: 30, left: 30 },
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#scatter-plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
var svg1 = svg.append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")")


// Read the data
d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_connectedscatter.csv", function (data) {

    // List of groups (here I have one group per column)
    var allGroup = ["valueA", "valueB", "valueC"]

    // Reformat the data: we need an array of arrays of {x, y} tuples
    var dataReady = allGroup.map(function (grpName) { // .map allows to do something for each element of the list
        return {
            name: grpName,
            values: data.map(function (d) {
                return { time: d.time, value: +d[grpName] };
            })
        };
    });
    // console.log(dataReady)

    // A color scale: one color for each group
    var myColor = d3.scaleOrdinal()
        .domain(allGroup)
        .range(d3.schemeSet2);

    // Add X axis
    var x = d3.scaleLinear()
        .domain([0, 10])
        .range([0, width]);
    var xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 20])
        .range([height, 0]);
    var yAxis = svg.append("g")
        .call(d3.axisLeft(y));

    // Add the lines
    var line = d3.line()
        .x(function (d) { return x(+d.time) })
        .y(function (d) { return y(+d.value) })

    let lines = svg.selectAll("myLines")
        .data(dataReady)
        .enter()
        .append("path")
        .attr("class", function (d) { return d.name })
        .attr("d", function (d) { return line(d.values) })
        .attr("stroke", function (d) { return myColor(d.name) })
        .style("stroke-width", 4)
        .style("fill", "none")

    // Add a label at the end of each line
    svg
        .selectAll("myLabels")
        .data(dataReady)
        .enter()
        .append('g')
        .append("text")
        .attr("class", function (d) { return d.name })
        .datum(function (d) { return { name: d.name, value: d.values[d.values.length - 1] }; }) // keep only the last value of each time series
        .attr("transform", function (d) { return "translate(" + x(d.value.time) + "," + y(d.value.value) + ")"; }) // Put the text at the position of the last point
        .attr("x", 12) // shift the text a bit more right
        .text(function (d) { return d.name; })
        .style("fill", function (d) { return myColor(d.name) })
        .style("font-size", 15)

    // create a tooltip
    var Tooltip = d3.select("#scatter-plot")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function (d) {
        Tooltip
            .style("opacity", 1)
    }
    var mousemove = function (d) {
        let cursorX = event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
        let cursorY = event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
        Tooltip
            .html("Exact value: " + d.value)
            //.style("left", (d3.mouse(this)[0]+70) + "px")
            //.style("top", (d3.mouse(this)[1]) + "px")
            .style("left", (cursorX + 20) + "px")
            .style("top", (cursorY) + "px")
            .style("z-index", "10000")
    }
    var mouseleave = function (d) {
        Tooltip
            .style("opacity", 0)
    }

    // Add the points
    let points = svg
        // First we need to enter in a group
        .selectAll("myDots")
        .data(dataReady)
        .enter()
        .append('g')
        .style("fill", function (d) { return myColor(d.name) })
        .attr("class", function (d) { return d.name })
        // Second we need to enter in the 'values' part of this group
        .selectAll("myPoints")
        .data(function (d) { return d.values })
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d.time) })
        .attr("cy", function (d) { return y(d.value) })
        .attr("r", 5)
        .attr("stroke", "white")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

    // Add a legend (interactive)
    svg
        .selectAll("myLegend")
        .data(dataReady)
        .enter()
        .append('g')
        .append("text")
        .attr('x', function (d, i) { return 30 + i * 60 })
        .attr('y', 30)
        .text(function (d) { return d.name; })
        .style("fill", function (d) { return myColor(d.name) })
        .style("font-size", 15)
        .on("click", function (d) {
            // is the element currently visible ?
            currentOpacity = d3.selectAll("." + d.name).style("opacity")
            // Change the opacity: from 0 to 1 or from 1 to 0
            d3.selectAll("." + d.name).transition().style("opacity", currentOpacity == 1 ? 0 : 1)
        })


    // Add a clipPath: everything out of this area won't be drawn.
    var clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0);


    // Add brushing
    var brush = d3.brushX()                   // Add the brush feature using the d3.brush function
        .extent([[0, 0], [width, height]])  // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .on("end", updateChart)               // Each time the brush selection changes, trigger the 'updateChart' function


    // Add the brushing
    svg1
        .append("g")
        .attr("class", "brush")
        .call(brush);

    // A function that set idleTimeOut to null
    var idleTimeout
    function idled() { idleTimeout = null; }

    // A function that update the chart for given boundaries
    function updateChart() {

        // What are the selected boundaries?
        extent = d3.event.selection

        // If no selection, back to initial coordinate. Otherwise, update X axis domain
        if (!extent) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
            x.domain([4, 8])
        } else {
            x.domain([x.invert(extent[0]), x.invert(extent[1])])
            svg.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
        }

        // Update axis and line position
        xAxis.transition().duration(1000).call(d3.axisBottom(x))
        points
            .transition()
            .duration(1000)
            .attr("cx", function (d) { return x(d.time) })
            .attr("cy", function (d) { return y(d.value) })

        lines.transition().duration(1000).attr("d", function (d) { return line(d.values) })
    }



})

