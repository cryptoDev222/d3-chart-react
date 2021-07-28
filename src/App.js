import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
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
    const columns = headers.map((c) => ({
      name: c,
      selector: c,
    }));

    setData(list);
    setColumns(columns);
  };

  return (
    <>
      <h2 className="taCenter">Chart Demo</h2>
      <Chart data={data} />
      <DataTable pagination highlightOnHover columns={columns} data={data} />
    </>
  );
}

export default App;
