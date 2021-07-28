import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import file from "./assets/aggregated_stock_exchange.csv";
import Chart from "./components/chart";
import "./App.css";
function App() {
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    const load = async () => {
      let dataString = await fetchCsv(file);
      const wb = XLSX.read(dataString, { type: "string" });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const csvData = XLSX.utils.sheet_to_csv(ws, { header: 1 });
      processData(csvData);
    };
    load();
  }, []);

  async function fetchCsv(path) {
    const response = await fetch(path);
    const reader = response.body.getReader();
    const result = await reader.read();
    const decoder = new TextDecoder("utf-8");
    const csv = decoder.decode(result.value);
    return csv;
  }

  // process CSV data
  const processData = (dataString) => {
    const dataStringLines = dataString.split(/\r\n|\n/);
    const headers = dataStringLines[0].split(
      /,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/
    );

    const list = [];
    for (let i = 1; i < dataStringLines.length; i++) {
      const row = dataStringLines[i].split(
        /,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/
      );
      if (headers && row.length === headers.length) {
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
          let d = row[j];
          if (d.length > 0) {
            if (d[0] === '"') d = d.substring(1, d.length - 1);
            if (d[d.length - 1] === '"') d = d.substring(d.length - 2, 1);
          }
          if (headers[j]) {
            obj[headers[j]] = d;
          }
        }

        // remove the blank rows
        if (Object.values(obj).filter((x) => x).length > 0) {
          list.push(obj);
        }
      }
    }

    // prepare columns list from headers
    const columns = [
      {
        name: "Date",
        selector: "date",
        sortable: true,
      },
      {
        name: "Total Receive",
        selector: "total_rev",
        sortable: true,
      },
      {
        name: "Total Volume",
        selector: "total_vol",
        sortable: true,
      },
    ];

    let stockData = list.map((set) => {
      let dates = set.date.split("/");
      if (dates[0].length === 1) dates[0] = "0" + dates[0];
      if (dates[1].length === 1) dates[1] = "0" + dates[1];
      let dateStr = `20${dates[2]}-${dates[0]}-${dates[1]}`;
      set.date = dateStr;
      return set;
    });

    setData(stockData);
    setColumns(columns);
  };

  return (
    <>
      <h2 className="taCenter">Chart Demo</h2>
      <Chart data={data} />
      <div className="tableContainer">
        <CSVLink className="export-csv" filename="test.csv" data={data}>
          Export CSV
        </CSVLink>
        <DataTable
          sortable
          pagination
          highlightOnHover
          columns={columns}
          data={data}
        />
      </div>
    </>
  );
}

export default App;
