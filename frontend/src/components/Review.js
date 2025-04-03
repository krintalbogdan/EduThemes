import React, { useState } from 'react';
import { Container, Button, Card, Row, Col } from 'react-bootstrap';
import { FaCheck, FaTimes, FaUndo } from 'react-icons/fa';

const Review = ({ sessionId, onAdvanceStage }) => {
    const [actions, setActions] = useState(Array(15).fill(null)); 

    const handleAction = (index, action) => {
        const updatedActions = [...actions];
        updatedActions[index] = action;
        setActions(updatedActions);
    };

    const handleUndo = (index) => {
        const updatedActions = [...actions];
        updatedActions[index] = null;
        setActions(updatedActions);
    };

    const handleAcceptAll = () => {
        setActions(Array(15).fill('approve'));
    };

    const handleRejectAll = () => {
        setActions(Array(15).fill('deny'));
    };

    return (
        <Container fluid className="d-flex justify-content-center align-items-start p-0" style={{ padding: '0', height: '90vh' }}>
            <Row className="h-100 m-0 w-100 gap-3">
            <Col xs={3} className="p-2 bg-light border-end h-100">
                    <Card className="mb-2" style={{ height: '25%' }}>
                        <Card.Body className="border rounded d-flex flex-column">
                            <h5>Batch Revision</h5><hr/>
                            <p className="text-muted">
                                This page allows you to approve or reject the AI-generated codes for each entry. Responses were grouped by the SVM model and each group was coded by Claude.
                            </p>
                        </Card.Body>
                    </Card>
                    <Card className="flex-grow-1" style={{ overflowY: 'auto', height: '74%' }}>
                        <Card.Body className="border rounded d-flex flex-column" style={{ overflowY: 'auto'}}>
                            <p className="text-muted">
                                (Will add visualizations from SVM here)
                            </p>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={8} className="p-2 h-100 d-flex bg-light flex-column">
                    <Card className="flex-grow-1">
                        <Card.Header className="d-flex flex-column align-items-center">
                            <div className="d-flex justify-content-between w-100 mt-2 align-items-center">
                                <Button variant="primary" disabled onClick={handleRejectAll}>
                                    Back
                                </Button>
                                <h6>Group 1 of 10</h6>
                                <Button variant="primary" disabled onClick={handleRejectAll}>
                                    Next
                                </Button>
                            </div>
                        </Card.Header>
                        <div className="px-3 py-2 border-bottom d-flex justify-content-end">
                            <Button className="me-2" variant="success" size="sm" onClick={handleAcceptAll}>
                                Accept All
                            </Button>
                            <Button variant="danger" size="sm" onClick={handleRejectAll}>
                                Reject All
                            </Button>
                        </div>
                        <Card.Body style={{ height: '1px' }}>
                            <div 
                                style={{ overflowY: 'auto', width: '100%', padding: '10px', height: '100%' }}
                                className="bg-light border rounded"
                            >
                                {[...Array(15)].map((_, index) => (
                                    <div 
                                        key={index} 
                                        className={`p-2 border-bottom d-flex justify-content-between align-items-center`}
                                        style={{ 
                                            textAlign: 'left', 
                                            backgroundColor: actions[index] === 'approve' ? '#d4edda' : actions[index] === 'deny' ? '#f8d7da' : 'transparent' 
                                        }}
                                    >
                                        <span>{index + 1}: Some example text here.</span>
                                        <div 
                                            className="d-flex flex-column" 
                                            style={{ height: '60px', justifyContent: actions[index] === null ? 'space-between' : 'center' }}
                                        >
                                            {actions[index] === null && (
                                                <>
                                                    <Button 
                                                        variant="success" 
                                                        className="d-flex align-items-center" 
                                                        size="sm"
                                                        onClick={() => handleAction(index, 'approve')}
                                                    >
                                                        <FaCheck/>
                                                    </Button>
                                                    <Button 
                                                        variant="danger" 
                                                        className="d-flex align-items-center" 
                                                        size="sm"
                                                        onClick={() => handleAction(index, 'deny')}
                                                    >
                                                        <FaTimes/>
                                                    </Button>
                                                </>
                                            )}
                                            {actions[index] !== null && (
                                                <Button 
                                                    variant="secondary" 
                                                    className="d-flex align-items-center" 
                                                    size="sm"
                                                    onClick={() => handleUndo(index)}
                                                >
                                                    <FaUndo/>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Review;
