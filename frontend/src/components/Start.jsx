import React, { useState } from 'react';
//import { Button, Container } from 'react-bootstrap';
import axios from 'axios';
import { FaFileAlt, FaSyncAlt, FaListUl, FaLightbulb } from 'react-icons/fa';
import { MdHeight } from 'react-icons/md';

const Start = ({ onSessionStart, onAdvanceStage, setLabels }) => {

    const startSession = async () => {
        try {
            setLabels([]);
            const response = await axios.post('http://localhost:1500/session/start');
            onSessionStart(response.data.session_id);
            onAdvanceStage();
        } catch (error) {
            console.error('Session start error:', error.response || error);
        }
    };

    const containerStyle = {
        height: '105vh',
        display: 'flex',
        /*backgroundColor: '#FFAAAA',*/
        justifyContent: 'center',
        alignItems: 'flex-start',
        fontFamily: 'sans-serif',
    };

    const windowStyle = {
        //border: '4px solid black',
        width: '300vh',
        height: '220vh',
        //padding: '35px'
        //borderRadius: '12px',
        //boxShadow: '8px 8px 0 black',
    };

    const titleStyle = {
        fontSize: '48px',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '10px',
        fontFamily: 'Montserrat, sans-serif',
    };

    const sectionTitleStyle = {
        fontSize: '28px',
        fontWeight: '600',
        marginTop: '20px',
        textAlign: 'center',
    };

    const paragraphStyle = {
        fontSize: '16px',
        textAlign: 'center',
        marginBottom: '20px',
    };

    const featuresStyle = {
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        marginTop: '10px',
    };

    const featureItemStyle = {
        textAlign: 'center',
        margin: '20px',
    };

    const iconStyle = {
        fontSize: '40px',
        marginBottom: '10px',
    };

    return (
        
        <div style={containerStyle} className="bg-base-200">
            
            <div style={windowStyle}>
                {/*
                <div style={titleStyle}>EduThemes</div>

                <div style={{
                    fontSize: '16px',
                    textAlign: 'center',
                    marginTop: '10px',
                    marginBottom: '30px',
                    lineHeight: '1.6',
                    maxWidth: '700px',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                }}>
                    EduThemes helps you discover the main ideas and themes from your survey responses.
                    It uses AI to group similar answers together and summarize them into clear insights,
                    so you can understand your data faster and make informed decisions.
                </div>*/}

                <div className="hero bg-base-200 min-h-80">
                <div className="hero-content text-center">
                    <div className="max-w-md">
                    <h1 className="text-5xl font-bold" style = {titleStyle}>EduThemes</h1>
                    <p className="py-6 text-lg">
                        Harness the power of AI, extract actionable data.
                    </p>
                    <button className="btn btn-primary text-xl" onClick={startSession}>Start Analysis</button>
                    </div>
                </div>
                </div>

                <div className="container bg-base-200 mx-auto px-4 py-16">
                    <h2 className="text-4xl font-bold text-center m-10">Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 m-16 mt-13">
                        <div className="card bg-base-100 shadow-xl border border-base-300">
                            <div className="card-body items-center text-center">
                                <div className="text-4xl text-primary">📄</div>
                                <h3 className="card-title mt-2">Upload Data</h3>
                                <p>Easily upload your text responses in a single CSV or Excel file.</p>
                            </div>
                        </div>
                        <div className="card bg-base-100 shadow-xl border border-base-300">
                            <div className="card-body items-center text-center">
                                <div className="text-4xl text-primary">🔄</div>
                                <h3 className="card-title mt-2">Preprocess Data</h3>
                                <p>AI will clean and prepare your data for analysis automatically.</p>
                            </div>
                        </div>
                        <div className="card bg-base-100 shadow-xl border border-base-300">
                            <div className="card-body items-center text-center">
                                <div className="text-4xl text-primary">💡</div>
                                <h3 className="card-title mt-2">Retrieve Themes</h3>
                                <p>Identify and summarize the core themes present in your responses.</p>
                            </div>
                        </div>
                        <div className="card bg-base-100 shadow-xl border border-base-300">
                            <div className="card-body items-center text-center">
                                <div className="text-4xl text-primary">📈</div>
                                <h3 className="card-title mt-2">Gain Insights</h3>
                                <p>Understand your data faster and make more informed decisions.</p>
                            </div>
                        </div>
                    </div>
                </div>


                


                <div className="hero bg-base-200 min-h-screen">
                    <div className="hero-content flex-col lg:flex-row-reverse">
                        <section className="px-8 my-16 overflow-y-auto max-h-96">
                            <ul className="steps steps-vertical  w-full content-center">
                                <li className="step step-primary" data-content="1">Start an Analysis</li>{/*ong> Click the "Start Analysis" button to begin.</li>*/}
                                <li className="step" data-content="2">Upload Your Dataset</li>{/*ong> Upload your file of text responses.</li>*/}
                                <li className="step" data-content="3">Edit Labels</li>{/*ong> Review or modify the preprocessed data (optional).</li>*/}
                                <li className="step" data-content="4">Run the Analysis</li>{/*ong> AI will group similar responses into themes.</li>*/}
                                <li className="step" data-content="5">View Results</li>{/*ong> Explore the key themes in your data.</li>*/}
                                <li className="step" data-content="6">Take Action</li>{/*ong> Get suggestions based on the findings.</li>*/}
                            </ul>
                        </section>
                        <div>
                        <h1 className="text-5xl font-bold">Qualitative Research Insights on Demand!</h1>
                        <p className="py-6 max-w-lg">
                            The speed and power of Artificial Intelligence, plus Standard qualitative research methods, equals feedback in minutes, not days.
                        </p>
                        {/*<button className="btn btn-primary">Get Started</button>*/}
                        </div>
                    </div>
                </div>

                
            </div>
        </div>
    );
};

export default Start;
