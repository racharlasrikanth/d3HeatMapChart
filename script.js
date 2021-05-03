let url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
let req = new XMLHttpRequest();

let baseTemp;
let values = [];

let xScale;
let yScale;

let xAxis;
let yAxis;

let width = 1200;
let height = 600;
let padding = 60;

let svg = d3.select("svg");
let tooltip = d3.select("#tooltip");

let generateScales = () => {
  let minYear = d3.min(values, (item) => {
    return item["year"];
  });

  let maxYear = d3.max(values, (item) => {
    return item["year"];
  });

  xScale = d3
    .scaleLinear()
    .domain([minYear, maxYear + 1])
    .range([padding, width - padding]);

  yScale = d3
    .scaleTime()
    .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
    .range([padding, height - padding]);
};

let drawCanvas = () => {
  svg.attr("width", width);
  svg.attr("height", height);
};

let drawCells = () => {
  svg
    .selectAll("rect")
    .data(values)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("fill", (item) => {
      let variance = item["variance"];
      if (variance <= -1) {
        return "SteelBlue";
      } else if (variance <= 0) {
        return "LightSteelBlue";
      } else if (variance <= 1) {
        return "Orange";
      } else {
        return "Crimson";
      }
    })
    .attr("data-year", (item) => {
      return item["year"];
    })
    .attr("data-month", (item) => {
      return item["month"] - 1;
    })
    .attr("data-temp", (item) => {
      return baseTemp + item["variance"];
    })
    .attr("height", (item) => {
      return (height - 2 * padding) / 12;
    })
    .attr("y", (item) => {
      return yScale(new Date(0, item["month"] - 1, 0, 0, 0, 0, 0));
    })
    .attr("width", (item) => {
      let minYear = d3.min(values, (item) => {
        return item["year"];
      });

      let maxYear = d3.max(values, (item) => {
        return item["year"];
      });

      let yearCount = maxYear - minYear;

      return (width - 2 * padding) / yearCount;
    })
    .attr("x", (item) => {
      return xScale(item["year"]);
    })
    .on("mouseover", (item) => {
      tooltip.transition().style("visibility", "visible");

      let monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      tooltip.text(
        item["year"] +
          " " +
          monthNames[item["month"] - 1] +
          " : " +
          item["variance"]
      );

      tooltip.attr("data-year", item["year"]);
    })
    .on("mouseout", (item) => {
      tooltip.transition().style("visibility", "hidden");
    });
};

let generateAxes = () => {
  let xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

  let yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%B"));

  svg
    .append("g")
    .call(xAxis)
    .attr("id", "x-axis")
    .attr("transform", "translate(0, " + (height - padding) + ")");

  svg
    .append("g")
    .call(yAxis)
    .attr("id", "y-axis")
    .attr("transform", "translate(" + padding + ", 0)");
};

req.open("GET", url, true);
req.onload = () => {
  let data = JSON.parse(req.responseText);
  baseTemp = data.baseTemperature;
  values = data.monthlyVariance;
  console.log(baseTemp);
  console.log(values);
  drawCanvas();
  generateScales();
  drawCells();
  generateAxes();
};
req.send();
