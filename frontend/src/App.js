import React, { useState } from "react";
import "./App.css";
import Header from "./components/Header";
import Upload from "./components/Upload";
import Start from "./components/Start";
import Preview from "./components/Preview";
import Review from "./components/Review";
import Analyze from "./components/Analyze";
import Chatbot from "./components/Chatbot";

import { Container } from "react-bootstrap";

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [visualization, setVisualization] = useState(null);
  const [labels, setLabels] = useState([]);
  const [currentStage, setCurrentStage] = useState('start'); // stages: start screen, upload dataset, preview dataset, review, results
  const [claudeData, setClaudeData] = useState(null);
  const [svmData, setSvmData] = useState(null);
  const [results, setResults] = useState(null);

  const handleSessionStart = (newSessionId) => {
    setSessionId(newSessionId);
  };

  const handleAdvanceStage = (stage) => {
    setCurrentStage(stage);
  };

  return (
    <div className="App">
      <Header />
      <Container>
        {currentStage === "start" && (
          <Start
            onSessionStart={handleSessionStart}
            onAdvanceStage={() => handleAdvanceStage('upload')}
          />
        )}

        {currentStage === "upload" && sessionId && (
          <Upload
            sessionId={sessionId}
            setDataset={setDataset} 
            setVisualization={setVisualization}
            onAdvanceStage={() => handleAdvanceStage('preview')} 
          />
        )}

        {currentStage === "preview" && sessionId && (
          <div>
            <Preview
              sessionId={sessionId}
              dataset={dataset}
              labels={labels}
              setLabels={setLabels}
              claudeData={claudeData}
              setClaudeData={setClaudeData}
              svmData={svmData}
              setSvmData={setSvmData}
              setDataset={setDataset}
              onAdvanceStage={() => handleAdvanceStage("review")}
            />
          </div>
        )}

        {currentStage === "review" && sessionId && (
          <div>
            <Review
              sessionId={sessionId}
              visualization={visualization}
              labels={labels}
              claudeData={claudeData}
              dataset={dataset}
              setDataset={setDataset}
              svmData={svmData}
              setResults={setResults}
              onAdvanceStage={() => handleAdvanceStage('results')} 
            />
          </div>
        )}

        {currentStage === "results" && sessionId && (
          <div>
            <Analyze
            results={results}
            sessionId={sessionId}
            onAdvanceStage={() => handleAdvanceStage('start')}
            />
          </div>
        )}
      </Container>
      <Chatbot />
    </div>
  );
}

export default App;
