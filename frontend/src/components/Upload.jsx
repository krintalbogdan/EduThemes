import React, { useState } from 'react';
import { Button, Form, Alert, Container, Card, Spinner, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const Upload = ({ sessionId, onAdvanceStage, setDataset, setVisualization, setProjectMetadata }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [projectDescription, setProjectDescription] = useState('');
    const [researchQuestion, setResearchQuestion] = useState('');
    const [additionalContext, setAdditionalContext] = useState('');
    const [apiKey, setApiKey] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
            'application/vnd.ms-excel',
            'text/csv'
        ];
        
        if (selectedFile && (
            allowedTypes.includes(selectedFile.type) || 
            selectedFile.name.endsWith('.csv')
        )) {
            setFile(selectedFile);
            setError(null);
        } else {
            setFile(null);
            setError('Please upload a valid Excel or CSV file (.xlsx, .xls, .csv)');
        }
    };

    const uploadDataset = async () => {
        if (!file || !sessionId) {
            setError('Please select a file and start a session first');
            return;
        }

        if (!researchQuestion) {
            setError('Please enter a research question');
            return;
        }

        if (!projectDescription) {
            setError('Please enter a project description');
            return;
        }

        const formData = new FormData();
        formData.append('dataset', file);
        formData.append('projectDescription', projectDescription);
        formData.append('researchQuestion', researchQuestion);
        formData.append('additionalContext', additionalContext);
        formData.append('apiKey', apiKey);

        setIsLoading(true);
        try {
            const response = await axios.post(`http://localhost:1500/session/${sessionId}/upload-dataset`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Dataset uploaded:', response.data);

            setProjectMetadata({
                researchQuestion,
                projectDescription,
                additionalContext,
                apiKey
            });

            setDataset(response.data.preprocessed_dataset);
            setVisualization(response.data.visualization_image);
            onAdvanceStage();
        } catch (err) {
            console.error('Failed to upload dataset:', err);
            setError('Failed to upload dataset: ' + (err.response?.data?.error || err.message));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        
 
        <div class="grid grid-cols-1 justify-items-center p-8">
             <h1 className="my-10">Upload Dataset & Project Details</h1>
        <div className="mockup-window bg-base-100 border border-base-300 min-w-4xl">
            <Card className="w-100 mx-auto shadow-sm m-10 ">

                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Row className="mb-4">
                        <Col>
                            <Form.Group controlId="formResearchQuestion" className="mb-3">

                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">Research Question</legend>
                                    <input className="textarea textarea-info textarea-lg"
                                    type="text" 
                                    placeholder="What do you want to learn from this data?" 
                                    value={researchQuestion} 
                                    onChange={(e) => setResearchQuestion(e.target.value)} 
                                    required
                                    />
                                    <p className="label">Example: "How do students perceive AI tools in education?"</p>
                                </fieldset>
                                
                                {/*
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">What is your name?</legend>
                                    <input type="text" className="input" placeholder="Type here" />
                                    <p className="label">Optional</p>
                                </fieldset>*/}
                            </Form.Group>

                            <Form.Group controlId="formProjectDescription" className="mb-3">
                                <Form.Label className="text-start fw-bold w-100">Project Description <span className="text-danger">*</span></Form.Label>
                                <Form.Control 
                                    as="textarea"
                                    rows={3}
                                    placeholder="Briefly describe your project" 
                                    value={projectDescription} 
                                    onChange={(e) => setProjectDescription(e.target.value)} 
                                    style={{ resize: 'none' }}
                                    required
                                />
                                <Form.Text className="text-muted">
                                    Explain the context and goals of your research to help the system better understand your data.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col md={6}>
                            <Form.Group controlId="formAdditionalContext" className="mb-3">
                                <Form.Label className="text-start fw-bold w-100">Additional Context (Optional)</Form.Label>
                                <Form.Control 
                                    as="textarea" 
                                    rows={3}
                                    placeholder="Any additional details about the data or participants" 
                                    value={additionalContext} 
                                    onChange={(e) => setAdditionalContext(e.target.value)} 
                                    style={{ resize: 'none' }}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="formApiKey" className="mb-3">
                                <Form.Label className="text-start fw-bold w-100">Anthropic API Key </Form.Label>
                                <Form.Control 
                                    type="password" 
                                    placeholder="Enter your Anthropic API key for Claude" 
                                    value={apiKey} 
                                    onChange={(e) => setApiKey(e.target.value)} 
                                />
                                <Form.Text className="text-muted">
                                    Enter API key here.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-start fw-bold w-100">Upload File <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                            type="file" 
                            accept=".xlsx,.xls,.csv" 
                            onChange={handleFileChange} 
                            required
                        />
                        <Form.Text className="text-muted">
                            Upload an Excel or CSV file containing your response data. The first column should contain the responses to analyze.
                        </Form.Text>
                    </Form.Group>

                    <div className="d-flex justify-content-end mt-4">
                        <Button 
                            variant="primary" 
                            onClick={uploadDataset} 
                            disabled={!file || !sessionId || !projectDescription || !researchQuestion || isLoading}
                            size="lg"
                        >
                            {isLoading ? (
                                <>
                                    <Spinner 
                                        as="span" 
                                        animation="border" 
                                        size="sm" 
                                        role="status" 
                                        aria-hidden="true" 
                                    /> 
                                    &nbsp;&nbsp;Processing...
                                </>
                            ) : (
                                'Upload & Continue'
                            )}
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </div>
        </div>
    );
};

export default Upload;