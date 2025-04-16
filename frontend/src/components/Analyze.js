import React, { useState, useEffect } from "react";
import { Button, Container, Card, Row, Col, Tab, Tabs } from "react-bootstrap";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar, Doughnut } from "react-chartjs-2";
import axios from "axios";
import "./Analyze.css";
import ReactMarkdown from 'react-markdown';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Analyze = ({ results, onAdvanceStage, sessionId }) => {
  const [summary, setSummary] = useState("");
  
  useEffect(() => {
    if (results && results.summary) {
      setSummary(results.summary);
    } else {
      const fetchSummary = async () => {
        try {
          const response = await axios.get(`http://localhost:1500/session/${sessionId}/download-final-dataset`);
          if (response.data && response.data.summary) {
            setSummary(response.data.summary);
          }
        } catch (error) {
          console.error("Error fetching summary:", error);
        }
      };
      
      fetchSummary();
    }
  }, [results, sessionId]);

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
  
  const handleDownloadSummary = () => {
    if (summary) {
      const blob = new Blob([summary], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "qualitative_analysis_summary.txt";
      link.click();
      URL.revokeObjectURL(url);
    }
  };
  const themeData = results || [];
  
  return (
    <Container className="my-4">
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white">
          <h3 className="mb-0">Analysis Results</h3>
        </Card.Header>
      </Card>
      
      <Tabs defaultActiveKey="summary" className="mb-4">
        <Tab eventKey="summary" title="Summary">
          <Card className="shadow-sm">
            <Card.Body>
              <div className="mb-3 d-flex justify-content-end">
                <Button 
                  variant="outline-primary" 
                  onClick={handleDownloadSummary}
                  className="me-2"
                >
                  Download Summary
                </Button>
              </div>
              <div className="summary-content p-3">
                <ReactMarkdown>
                  {summary || "No summary available."}
                </ReactMarkdown>
              </div>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="visualization" title="Visualizations">
          <Row>
            <Col md={6}>
              <Card className="shadow-sm mb-4">
                <Card.Header>Theme Distribution</Card.Header>
                <Card.Body className="d-flex justify-content-center">
                  <div style={{ width: '100%', maxWidth: '400px' }}>
                    <Doughnut
                      data={{
                        labels: themeData.map((item) => item.name),
                        datasets: [
                          {
                            label: "Count",
                            data: themeData.map((item) => item.frequency),
                            backgroundColor: themeData.map((item) => item.color),
                            borderColor: themeData.map((item) => item.color),
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
                            text: "Theme Distribution",
                          },
                        },
                      }}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="shadow-sm mb-4">
                <Card.Header>Theme Frequency</Card.Header>
                <Card.Body>
                  <Bar
                    data={{
                      labels: themeData.map((item) => item.name),
                      datasets: [
                        {
                          label: "Response Count",
                          data: themeData.map((item) => item.frequency),
                          backgroundColor: themeData.map((item) => item.color),
                          borderColor: themeData.map((item) => item.color),
                        },
                      ],
                    }}
                    options={{
                      indexAxis: 'y',
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: 'Number of Responses'
                          }
                        }
                      }
                    }}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
        
        <Tab eventKey="themes" title="Theme List">
          <Card className="shadow-sm">
            <Card.Body>
              <div className="mb-3 d-flex justify-content-end">
                <Button 
                  variant="outline-primary" 
                  onClick={handleDownloadJSON}
                  className="me-2"
                >
                  Download Dataset (JSON)
                </Button>
              </div>
              
              <div className="themes-grid p-3">
                {themeData && themeData.length > 0 ? (
                  <div className="d-flex flex-wrap justify-content-center gap-3">
                    {themeData.map((item, index) => (
                      <div 
                        key={index}
                        className="theme-card p-3 rounded"
                        style={{ 
                          backgroundColor: item.color, 
                          color: isDarkColor(item.color) ? 'white' : 'black',
                          minWidth: '200px',
                          textAlign: 'center'
                        }}
                      >
                        <h5>{item.name}</h5>
                        <p className="mb-0">
                          <strong>{item.frequency}</strong> responses
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted">No themes available.</p>
                )}
              </div>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
      
      <div className="d-flex justify-content-end mt-4">
        <Button 
          variant="primary" 
          size="lg"
          onClick={() => onAdvanceStage()}
          style={{ marginBottom: '20px' }}
        >
          Start New Analysis
        </Button>
      </div>
    </Container>
  );
};

function isDarkColor(color) {
  let hex = color.replace('#', '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance < 0.5;
}

export default Analyze;