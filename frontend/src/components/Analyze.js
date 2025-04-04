import React, { useState } from "react";
import { Button, Container } from "react-bootstrap";
import { Chart as ChartJS, Title } from "chart.js/auto";
import { Bar, Doughnut, Radar } from "react-chartjs-2";
import "./Analyze.css";
import Chatbot from "./Chatbot";

const Analyze = ({ results }) => {
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
                    position: "bottom",
                  },
                  title: {
                    display: true,
                    text: "Theme Breakdown",
                  },
                  cutout: "50%",
                },
              }}
              width={100}
              height={100}
            />
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

        <div
          className="bg-light rounded-5 d-flex flex-column justify-content-center align-items-center p-4"
          style={{ width: "50%", height: "90%" }}
        >
          <div>
            Tags
          </div>
          
          <div
            fluid
            className="bg-dark rounded-5 p-5 mb-5 button-container
                "
            style={{ width: "90%", height: "80%" }}
          >
            {sourceData.map((item, index) => (
              <button key={index} class="pill" type="button">
                {item.label} - {item.value}

              </button>
            ))}

          </div>
          <div className="d-flex gap-5" style={{ width: "90%", height: "10%" }}>
            <Button className="rounded-5 w-50 h-10">
              <span className="size-3">Download CSV</span>
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
