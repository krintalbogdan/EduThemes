import React, { useState } from "react";
import { Button, Container } from "react-bootstrap";
import 'chart.js/auto';
import { Bar, Doughnut } from "react-chartjs-2";
import axios from "axios";
import "./Analyze.css";


const Analyze = ({ results, onAdvanceStage, sessionId }) => {
  const handleDownloadJSON = async () => {
    try {
      const response = await axios.get(`http://localhost:1500/session/${sessionId}/download-final-dataset`);
      const data = response.data;

      if (response.status === 200) {
        const blob = new Blob([JSON.stringify(data.final_dataset, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "final_dataset.json";
        link.click();
        URL.revokeObjectURL(url);
      } else {
        console.error("Error downloading dataset:", data.error);
      }
    } catch (error) {
      console.error("Error fetching dataset:", error);
    }
  };


  function getContrastingTextColor(hcolor){
    const color = hcolor.replace("#", "");

    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "black" : "white";
  }

  return (
    <div className="d-flex">
      <Container
        className="d-flex justify-content-center align-items-center rounded-5 gap-3 "
        style={{ height: "90vh", width: "180vw" }}
      >
        <div
          className="d-flex flex-column justify-content-between align-items-left"
          style={{ width: "40%", height: "90%" }}
        >
          <div
            className="flex-column bg-white rounded-5 d-flex justify-content-center align-items-center"
            style={{ width: "90%", height: "100%", gap: "30px" }}
          >
            <div className="d-flex justify-content-center align-items-center" style={{ width: "100%", height: "45%" }}>
              <Doughnut
                data={{
                  labels: results.map((item) => item.name),
                  datasets: [
                    {
                      label: "Count",
                      data: results.map((item) => item.frequency),
                      backgroundColor: results.map((item) => item.color),
                      borderColor: results.map((item) => item.color),
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: {
                      display: false,
                      position: "bottom",
                    },
                    title: {
                      display: true,
                      text: "Theme Breakdown",
                    },
                    cutout: "50%",
                  },
                }}
                width={50}
                height={50}
              />
            </div>
            <div className="d-flex justify-content-center align-items-center" style={{ width: "100%", height: "45%" }}>
              <Bar
                data={{
                  labels: results.map((item) => item.name),
                  datasets: [
                    {
                      label: "Count",
                      data: results.map((item) => item.frequency),
                      backgroundColor: results.map((item) => item.color),
                      borderColor: results.map((item) => item.color),
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: {
                      display: false,
                      position: "bottom",
                    },
                    title: {
                      display: false,
                      text: "Data - title",
                    },
                  },
                }}
              />
            </div>

          </div>
        </div>

        <div
          className="bg-light rounded-5 d-flex flex-column justify-content-center align-items-center p-4"
          style={{ width: "50%", height: "90%" }}
        >
          <div>
            Tags
          </div>
          
          <div
            fluid
            className="bg-dark rounded-5 p-5 mb-5 button-container"
            style={{ width: "90%", height: "80%" }}
          >
            {results.map((item, index) => (
              <button
                key={index}
                className="pill"
                style={{ 
                  backgroundColor: item.color,
                  color: getContrastingTextColor(item.color),
                
                }}
                type="button"
              >
                {item.name} - {item.frequency}
              </button>
            ))}
          </div>
          <div className="d-flex gap-5" style={{ width: "90%", height: "10%" }}>
            <Button className="rounded-5 w-50 h-10" onClick={handleDownloadJSON}>
              <span className="size-3">Download JSON</span>
            </Button>
            <Button className="rounded-5 w-50 h-10">
              <span>Return</span>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Analyze;
