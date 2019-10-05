// @TODO: YOUR CODE HERE!
// John Goodale D3-Challenge

// Automatically resize chart
function makeResponsive() {

    var svgArea = d3.select("body").select("svg");
  
    // Clear SVG
    if (!svgArea.empty()) {
      svgArea.remove();
    }
    
    // Parameters/Dimensions
    var svgWidth = 980;
    var svgHeight = 600;
  
    // SVG Margins
    var margin = {
      top: 20,
      right: 40,
      bottom: 90,
      left: 100
    };
  
    // Define Dimensions
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;
  
    // Create an SVG Element/Wrapper
    var svg = d3
      .select("#scatter")
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight);
  
    // Append group element & set margins - translate/shift by left and top margins using transform
    var chartGroup = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
    // Initial parameters
    var chosenXAxis = "poverty";
    var chosenYAxis = "healthcare";
  
    // Function for updating xScale on Axis Label
    function xScale(acsData, chosenXAxis) {
      
      var xLinearScale = d3.scaleLinear()
        .domain([d3.min(acsData, d => d[chosenXAxis]) * 0.8,
          d3.max(acsData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);
      return xLinearScale;
    }
  
    // Function for updating yScale upon click on axis label
    function yScale(acsData, chosenYAxis) {
      
      var yLinearScale = d3.scaleLinear()
        .domain([d3.min(acsData, d => d[chosenYAxis]) * 0.8,
          d3.max(acsData, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);
      return yLinearScale;
    }
  
    // Function for updating xAxis upon click on axis label
    function renderXAxes(newXScale, xAxis) {
      var bottomAxis = d3.axisBottom(newXScale);
      xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
      return xAxis;
    }
  
    // Function for updating yAxis upon click on axis label
    function renderYAxes(newYScale, yAxis) {
      var leftAxis = d3.axisLeft(newYScale);
      yAxis.transition()
        .duration(1000)
        .call(leftAxis);
      return yAxis;
    }
  
    // Function for updating circles group transition
    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  
      circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
      return circlesGroup;
    }
  
    // Function for updating text group with a transition to new text
    function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  
      textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]))
        .attr("text-anchor", "middle");
  
      return textGroup;
    }
  
    // Function for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup) {
  
      if (chosenXAxis === "poverty") {
        var xLabel = "Poverty (%)";
      }
      else if (chosenXAxis === "age") {
        var xLabel = "Age (Median)";
      }
      else {
        var xLabel = "Household Income (Median)";
      }
      if (chosenYAxis === "healthcare") {
        var yLabel = "Lacks Healthcare (%)";
      }
      else if (chosenYAxis === "obesity") {
        var yLabel = "Obese (%)";
      }
      else {
        var yLabel = "Smokes (%)";
      }
  
      // Initialize tooltip
      var toolTip = d3.tip()
        .attr("class", "tooltip d3-tip")
        .offset([90, 90])
        .html(function(d) {
          return (`<strong>${d.abbr}</strong><br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
        });
      // Create circles tooltip in the chart
      circlesGroup.call(toolTip);
      // Create event listeners to display and hide the circles tooltip
      circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
      })
        // Mouseout event
        .on("mouseout", function(data) {
          toolTip.hide(data);
        });
      // Create the text tooltip in the chart
      textGroup.call(toolTip);
      // Create event listeners to display and hide the text tooltip
      textGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
      })
        // Mouseout event
        .on("mouseout", function(data) {
          toolTip.hide(data);
        });
      return circlesGroup;
    }
  
    // Import data from the data.csv
    d3.csv("assets/data/data.csv")
      .then(function(acsData) {
  
      // Format/Parse data
      acsData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
      });
  
      // Create xLinearScale & yLinearScale chart functions
      var xLinearScale = xScale(acsData, chosenXAxis);
      var yLinearScale = yScale(acsData, chosenYAxis);
  
      // Create axis chart functions
      var bottomAxis = d3.axisBottom(xLinearScale);
      var leftAxis = d3.axisLeft(yLinearScale);
  
      // Append xAxis
      var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
  
      // Append yAxis
      var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);
  
      // Create and append initial chart circles
      var circlesGroup = chartGroup.selectAll(".stateCircle")
        .data(acsData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("class", "stateCircle")
        .attr("r", 15)
        .attr("opacity", ".75");
  
      // Append the text to circles
      var textGroup = chartGroup.selectAll(".stateText")
        .data(acsData)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]*.98))
        .text(d => (d.abbr))
        .attr("class", "stateText")
        .attr("font-size", "12px")
        .attr("text-anchor", "middle")
        .attr("fill", "white");
  
      // Create group for three xAxis labels
      var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
      // Append xAxis
      var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // this is the value to grab for event listener
        .classed("active", true)
        .text("Poverty (%)");
  
      var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // this is the value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");
  
      var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // this is the value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");
  
      // Create Group for three yAxis labels
      var yLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(-25, ${height / 2})`);
      // Append yAxis
      var healthcareLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -30)
        .attr("x", 0)
        .attr("value", "healthcare")
        .attr("dy", "1em")
        .classed("axis-text", true)
        .classed("active", true)
        .text("Lacks Healthcare (%)");
  
      var smokesLabel = yLabelsGroup.append("text") 
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", 0)
        .attr("value", "smokes")
        .attr("dy", "1em")
        .classed("axis-text", true)
        .classed("inactive", true)
        .text("Smokes (%)");
  
      var obesityLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -70)
        .attr("x", 0)
        .attr("value", "obesity")
        .attr("dy", "1em")
        .classed("axis-text", true)
        .classed("inactive", true)
        .text("Obese (%)");
  
      // update tooltip function
      var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);
  
      // xAxis labels event listener
      xLabelsGroup.selectAll("text")
        .on("click", function() {
          // Get value of selected
          var value = d3.select(this).attr("value");
          if (value !== chosenXAxis) {
            // Replaces chosenXAxis with value
            chosenXAxis = value;
            // Updates xScale for the new data
            xLinearScale = xScale(acsData, chosenXAxis);
            // Updates xAxis with the transition
            xAxis = renderXAxes(xLinearScale, xAxis);
            // Updates circles with the new data
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            // Updates text with the new data
            textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
            // Updates tooltips with the new data
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);
            // Changes classes to change bold text
            if (chosenXAxis === "poverty") {
              povertyLabel
                .classed("active", true)
                .classed("inactive", false);
              ageLabel
                .classed("active", false)
                .classed("inactive", true);
              incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (chosenXAxis === "age") {
              povertyLabel
                .classed("active", false)
                .classed("inactive", true);
              ageLabel
                .classed("active", true)
                .classed("inactive", false);
              incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else {
              povertyLabel
                .classed("active", false)
                .classed("inactive", true);
              ageLabel
                .classed("active", false)
                .classed("inactive", true);
              incomeLabel
                .classed("active", true)
                .classed("inactive", false);
            }
          }
        });
      
        // yAxis Labels event listener
      yLabelsGroup.selectAll("text")
        .on("click", function() {
          // Get value of selected
          var value = d3.select(this).attr("value");
          if (value !== chosenYAxis) {
            // Replaces chosenYAxis with value
            chosenYAxis = value;
            // Updates yScale for the new data
            yLinearScale = yScale(acsData, chosenYAxis);
            // Updates yAxis with transition
            yAxis = renderYAxes(yLinearScale, yAxis);
            // Updates circles with the new data
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            // Updates text with the new data
            textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
            // Updates tooltips with the new data
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);
            // Changes classes to change bold text
            if (chosenYAxis === "healthcare") {
              healthcareLabel
                .classed("active", true)
                .classed("inactive", false);
              obesityLabel
                .classed("active", false)
                .classed("inactive", true);
              smokesLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (chosenYAxis === "obesity") {
              healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
              obesityLabel
                .classed("active", true)
                .classed("inactive", false);
              incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else {
              healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
              obesityLabel
                .classed("active", false)
                .classed("inactive", true);
              smokesLabel
                .classed("active", true)
                .classed("inactive", false);
            }
          }
        });
    });
  }
  // When the browser loads makeResponsive is called
  makeResponsive();
  
  // When browser window is resized, makeResponsive is called
  d3.select(window).on("resize", makeResponsive);