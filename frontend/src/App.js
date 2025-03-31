import React, { useState } from 'react';
import './App.css';
import LabelModal from "./components/LabelModal";
import Header from "./components/Header";
import Upload from "./components/Upload";
import Start from "./components/Start";
import Preview from "./components/Preview";
import Review from "./components/Review";
import { Container } from 'react-bootstrap';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [currentStage, setCurrentStage] = useState('start'); // stages: start screen, upload dataset, preview dataset, review, results

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
              onAdvanceStage={() => handleAdvanceStage('review')} 
            />
          </div>
        )}

        {currentStage === 'review' && sessionId && (
          <div>
            <Review 
              sessionId={sessionId}
              onAdvanceStage={() => handleAdvanceStage('results')} 
            />
          </div>
        )}

      </Container>
    </div>
  );
}

export default App;
