import React, { useState, useEffect, useRef } from "react";
import { exportComponentAsJPEG } from "react-component-export-image";
import * as d3 from "d3";
import styles from "./chart.module.css";

const Chart = ({ data }) => {
  const myRef = useRef(null);
  const imgRef = useRef(null);
  const [dateRange, setDateRange] = useState("1M");
  const [status, setStatus] = useState({});
  const ranges = { "1M": 30, "3M": 90, "6M": 180, "1Y": 365, ALL: -1 };
  const divNum = { "1M": 3, "3M": 6, "6M": 9, "1Y": 20, ALL: 40 };

  const showStatus = (data) => {
    setStatus(data);
  };

  useEffect(() => {
    drawChart();
  }, [data, dateRange]);

  const drawChart = () => {
    let width = "100%";
    let height = 500;
    d3.select(myRef.current).select("svg").remove();
    let svg = d3
      .select(myRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);
    let clientWidth = myRef.current?.clientWidth;
    let range = ranges[dateRange];
    if (range === -1) range = data.length;
    const rangedData = data.slice(0, range);

    setStatus(rangedData[0]);

    const displayData = rangedData.map(
      (row) => Math.floor(row.total_rev * 100 + 0.5) / 100
    );

    let dateData = rangedData.filter(
      (row, index) => index % divNum[dateRange] === 0
    );
    dateData = dateData.map((data) => data.date);

    let rect_width = (clientWidth - 90) / displayData.length;

    let max = (Math.max.apply(null, displayData) * 5) / 4;

    let min = (Math.min.apply(null, displayData) * 4) / 5;

    let scaleY = height / (max - min);

    svg
      .selectAll("rect")
      .data(displayData)
      .enter()
      .append("rect")
      .attr(
        "transform",
        "translate(" +
          (rect_width > 15 ? (rect_width - 15) / 2 + 50 : 50) +
          ", -50)"
      )
      .attr("x", (d, i) => i * rect_width)
      .attr("y", (d) => height - (d - min) * scaleY)
      .attr("width", rect_width > 15 ? 15 : rect_width)
      .attr("height", (d) => (d - min) * scaleY)
      .attr("class", styles.bar);

    d3.selectAll("rect").on("mouseover", (d, i) => {
      let index = displayData.indexOf(i);
      showStatus(rangedData[index]);
    });
    // X-Axis
    var x = d3
      .scaleBand()
      .domain(dateData)
      .range([10, myRef.current?.clientWidth - 80]);
    svg
      .append("g")
      .attr("transform", "translate(40,450)")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,10)rotate(-45)")
      .style("fill", "white")
      .selectAll("path")
      .style("fill", "white");
    // Y-Axis
    var y = d3
      .scaleBand()
      .domain([Math.floor(min), Math.ceil(max)])
      .range([10, 450]);
    svg
      .append("g")
      .attr("transform", "translate(50,0)")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .attr("transform", "translate(-5,-5)rotate(-45)")
      .style("fill", "white")
      .selectAll("path")
      .style("fill", "white");
  };

  const exportImage = () => {
    exportComponentAsJPEG(imgRef);
  };

  window.addEventListener("resize", drawChart);

  let dateKeys = Object.keys(ranges);

  return (
    <div ref={imgRef} className={styles.chartRoot}>
      <div className={styles.chartContainer}>
        <div className={styles.toolBar}>
          <div className={styles.buttons}>
            {dateKeys.map((key, index) => {
              return (
                <button
                  key={index}
                  onClick={() => setDateRange(key)}
                  className={dateRange === key ? styles.active : ""}
                >
                  {key}
                </button>
              );
            })}
          </div>
          <div>
            <button onClick={() => exportImage()}>Export as JPEG</button>
          </div>
          <div className={styles.statusInfo}>
            <p>Date: {status?.date}</p>
            <p>Total Receive: {status?.total_rev}</p>
            <p>Total Volume: {status?.total_vol}</p>
          </div>
        </div>
        <div ref={myRef}></div>
      </div>
    </div>
  );
};

export default Chart;
