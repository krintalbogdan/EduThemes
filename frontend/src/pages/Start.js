import React, { useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import axios from 'axios';

const Start = ({ onSessionStart, onAdvanceStage }) => {
    const [sessionId, setSessionId] = useState(null);

    const startSession = async () => {
        try {
            const response = await axios.post('http://localhost:1500/session/start');
            console.log(response.data); // remove this
            setSessionId(response.data.session_id);
            onSessionStart(response.data.session_id);
            onAdvanceStage();
        } catch (error) {
            console.error('Session start error:', error.response || error);
        }
    };

    return (
        <>
            <Container
                className="d-flex flex-column justify-content-center align-items-center position-relative"
                style={{ height: '80vh' }}
            >  
                
                <p
                className='text-white'>
                    Welcome to Eduthemes!<br/>
                    This program is used to help label datasets.<br/> 
                    To begin start by downloading this Excel file and checkout the labels at the top.<br/>
                </p>
                

                {/* Make sure to actually make this a file example of what they would need to upload irt*/}
                <a href="/assets/Example.xlsx" download>
                    <Button 
                        variant="secondary" 
                        className="mb-5 rounded-pill" 
                        style={{ height: '80px', width: '150px' }} 
                    >
                        Download File
                    </Button>
                </a>

                <p
                className='text-white'>
                    Once you have your file formated like the file above, click the button below to start a new session.<br/>
                </p>


                <Button 
                    variant="secondary" 
                    onClick={startSession} 
                    className="mb-5 rounded-pill "
                    style={{ height: '80px', width: '150px' }} 
                >
                    Start New Session
                </Button>
            </Container>
        
        </>
        
    );
};

export default Start;
