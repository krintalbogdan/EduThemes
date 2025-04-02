import React, { useState } from 'react';
import { Container, Button, Card, Badge, Col } from 'react-bootstrap';

const Review = ({ sessionId, onAdvanceStage }) => {
    return (
        <Container fluid className="d-flex justify-content-center align-items-start p-0" style={{ padding: '0', height: '90vh' }}>
                <Col xs={8} className="p-2 h-100 d-flex bg-light flex-column">
                    <Card className="flex-grow-1">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <h5>Group 1 of 10</h5>
                            </div>
                            <Button>Analyze</Button>
                        </Card.Header>
                        <Card.Body style={{ height: '1px' }}>
                                <div 
                                    style={{ overflowY: 'auto', width: '100%', padding: '10px', height: '100%' }}
                                    className="bg-light border rounded"
                                >
                                    {[...Array(15)].map((_, index) => (
                                        <div 
                                            key={index} 
                                            className="p-2 border-bottom d-flex flex-column"
                                            style={{ textAlign: 'left' }}
                                        >
                                            <span>{index + 1}: Some example text here.</span>
                                            <span>
                                                <Badge 
                                                    pill 
                                                    className="mt-1 d-inline-flex align-items-center gap-1"
                                                    style={{ maxWidth: 'fit-content', margin: '3px'}}
                                                >
                                                    <Button 
                                                        size="sm" 
                                                        style={{ padding: '2px 5px', fontSize: '10px', lineHeight: '1' }}
                                                    >
                                                        <b>x</b>
                                                    </Button>
                                                    <span>access to info</span>
                                                </Badge>
                                                <Badge 
                                                    pill 
                                                    className="mt-1 d-inline-flex align-items-center gap-1"
                                                    style={{ maxWidth: 'fit-content', margin: '3px' }}
                                                >
                                                    <Button 
                                                        size="sm" 
                                                        style={{ padding: '2px 5px', fontSize: '10px', lineHeight: '1' }}
                                                    >
                                                        <b>x</b>
                                                    </Button>
                                                    <span>teaching</span>
                                                </Badge>
                                                <Badge 
                                                    pill 
                                                    className="mt-1 d-inline-flex align-items-center gap-1"
                                                    style={{ maxWidth: 'fit-content', margin: '3px' }}
                                                >
                                                    <Button 
                                                        size="sm" 
                                                        style={{ padding: '2px 5px', fontSize: '10px', lineHeight: '1' }}
                                                    >
                                                        <b>+</b>
                                                    </Button>
                                                </Badge>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                        </Card.Body>
                    </Card>
                </Col>
        </Container>
    );
};

export default Review;
