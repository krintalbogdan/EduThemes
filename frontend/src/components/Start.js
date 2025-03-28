import React, { useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import axios from 'axios';

const Start = ({ onSessionStart, onAdvanceStage }) => {
    const [sessionId, setSessionId] = useState(null);

    const startSession = async () => {
        try {
            const response = await axios.post('/session/start');
            console.log(response.data); // remove this
            setSessionId(response.data.session_id);
            onSessionStart(response.data.session_id);
            onAdvanceStage();
        } catch (error) {
            console.error('Session start error:', error.response || error);
        }
    };

    return (
        <Container
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ height: '80vh' }}
        >
            <Button 
                variant="secondary" 
                onClick={startSession} 
                className="mb-3"
            >
                Start New Session
            </Button>
        </Container>
    );
};

export default Start;