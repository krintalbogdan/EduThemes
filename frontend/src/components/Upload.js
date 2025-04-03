import React, { useState } from 'react';
import { Button, Form, Alert, Container, Card, Spinner } from 'react-bootstrap';
import axios from 'axios';

const Upload = ({ sessionId, onAdvanceStage, setDataset }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
            'application/vnd.ms-excel'
        ];
        
        if (selectedFile && allowedTypes.includes(selectedFile.type)) {
            setFile(selectedFile);
            setError(null);
        } else {
            setFile(null);
            setError('Please upload a valid Excel file (.xlsx, .xls)');
        }
    };

    const uploadDataset = async () => {
        if (!file || !sessionId) {
            setError('Please select a file and start a session first');
            return;
        }

        const formData = new FormData();
        formData.append('dataset', file);

        setIsLoading(true);
        try {
            const response = await axios.post(`http://localhost:1500/session/${sessionId}/upload-dataset`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Dataset uploaded:', response.data);
            setDataset(response.data.preprocessed_dataset);
            onAdvanceStage();
        } catch (err) {
            setError('Failed to upload dataset');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ height: '80vh' }}
        >
            <Card className="w-50 mx-auto" style={{textAlign: 'center'}}>
                <Card.Header>Upload Dataset</Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form.Group controlId="formFile" className="mb-3">
                        <Form.Control 
                            type="file" 
                            accept=".xlsx,.xls" 
                            onChange={handleFileChange} 
                        />
                    </Form.Group>

                    <Button 
                        variant="primary" 
                        onClick={uploadDataset} 
                        disabled={!file || !sessionId || isLoading}
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
                            'Upload Dataset'
                        )}
                    </Button>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Upload;
