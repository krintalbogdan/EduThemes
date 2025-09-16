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

    {/* 
 
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
                                
                                
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">What is your name?</legend>
                                    <input type="text" className="input" placeholder="Type here" />
                                    <p className="label">Optional</p>
                                </fieldset>
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
        </div>*/}

    return (
       
        <div className="bg-slate-50 min-h-screen grid grid-cols-1 justify-items-center p-4 sm:p-8">
            <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 my-10">
                    Upload Dataset & Project Details
                </h1>
            </div>

            <div className="mockup-window bg-base-100 border border-base-300 w-full max-w-4xl shadow-2xl">
                <div className="p-8 md:p-12">
                    {/* -- Alert -- */}
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}
                    
                    <form>
                        {/* -- Research Question -- */}
                        <div className="mb-8">
                            <fieldset className="border border-gray-300 p-4 rounded-lg">
                                <legend className="px-2 text-base font-semibold text-gray-700">Research Question <span className="text-red-500">*</span></legend>
                                <input
                                    className="textarea textarea-info textarea-lg w-full"
                                    type="text"
                                    placeholder="What do you want to learn from this data?"
                                    value={researchQuestion}
                                    onChange={(e) => setResearchQuestion(e.target.value)}
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-2">Example: "How do students perceive AI tools in education?"</p>
                            </fieldset>
                        </div>

                        {/* -- Project Description -- */}
                        <div className="mb-8">
                            <label htmlFor="projectDescription" className="block text-base font-semibold text-gray-700 mb-2">
                                Project Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="projectDescription"
                                rows="3"
                                placeholder="Briefly describe your project"
                                value={projectDescription}
                                onChange={(e) => setProjectDescription(e.target.value)}
                                className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                required
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Explain the context and goals of your research to help the system better understand your data.
                            </p>
                        </div>

                        {/* -- Two-Column Layout for Optional Fields -- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            {/* -- Additional Context -- */}
                            <div>
                                <label htmlFor="additionalContext" className="block text-base font-semibold text-gray-700 mb-2">
                                    Additional Context <span className="font-normal text-gray-500">(Optional)</span>
                                </label>
                                <textarea
                                    id="additionalContext"
                                    rows="3"
                                    placeholder="Any additional details about the data or participants"
                                    value={additionalContext}
                                    onChange={(e) => setAdditionalContext(e.target.value)}
                                    className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>
                            {/* -- API Key -- */}
                            <div>
                                <label htmlFor="apiKey" className="block text-base font-semibold text-gray-700 mb-2">
                                    Anthropic API Key
                                </label>
                                <input
                                    id="apiKey"
                                    type="password"
                                    placeholder="Enter your Anthropic API key"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                                 <p className="mt-2 text-sm text-gray-500">
                                    Your key is sent directly to the API and not stored on our servers.
                                </p>
                            </div>
                        </div>

                        {/* -- File Upload -- */}
                        <div className="mb-8">
                            <label htmlFor="fileUpload" className="block text-base font-semibold text-gray-700 mb-2">
                                Upload File <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="fileUpload"
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileChange}
                                required
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Upload an Excel or CSV file. The first column should contain the responses to analyze.
                            </p>
                        </div>
                        
                        {/* -- Submit Button -- */}
                        <div className="flex justify-end mt-10">
                            <button
                                type="button"
                                onClick={uploadDataset}
                                disabled={!file || !sessionId || !projectDescription || !researchQuestion || isLoading}
                                className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    'Upload & Continue'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Upload;