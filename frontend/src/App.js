import React, { useState } from 'react';
import './App.css';
import Header from "./component/Header";
import Upload from "./pages/Upload";
import Start from "./pages/Start";
import Preview from "./pages/Preview";
import Analyze from "./pages/Analyze";
import { Container } from 'react-bootstrap';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [currentStage, setCurrentStage] = useState('start'); // stages: start screen, upload dataset, preview dataset & labeling, results

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
      {currentStage === 'start' && (
          <Start 
            onSessionStart={handleSessionStart}
            onAdvanceStage={() => handleAdvanceStage('upload')} 
          />
        )}

        {currentStage === 'upload' && sessionId && (
          <Upload 
            sessionId={sessionId}
            onAdvanceStage={() => handleAdvanceStage('preview')} 
          />
        )}

        {currentStage === 'preview' && sessionId && (
          <div>
            <Preview 
              sessionId={sessionId}
              onAdvanceStage={() => handleAdvanceStage('analyze')} 
            />
          </div>
        )}

        {currentStage === 'analyze' && sessionId && (
          <div>
            <Analyze 
              sessionId={sessionId}
              onAdvanceStage={() => handleAdvanceStage('start')} 
            />
          </div>
        )}


      </Container>
    </div>
  );
}

export default App;
