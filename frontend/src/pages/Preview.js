import React from 'react';
import { Container, Button, Card, Row, Col } from 'react-bootstrap';
import LabelModal from '../component/LabelModal';

const Preview = ({ sessionId, onAdvanceStage }) => {


    const Analyze = () => {
        console.log("Analyze clicked");
        onAdvanceStage();
    }

    return (
        <Container fluid className="d-flex justify-content-center align-items-start p-0" style={{ padding: '0', height: '90vh' }}>
            <Row className="h-100 m-0 w-100 gap-3">
                <Col xs={3} className="p-2 bg-light border-end h-100">
                    <Card className="h-100">
                        <Card.Body className="border rounded d-flex justify-content-center align-items-center">
                            <p className="text-muted">
                                Details of selected entry will go here (full response text, assigned labels, allow user to assign labels)
                            </p>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={8} className="p-2 h-100 d-flex bg-light flex-column">
                    <Card className="flex-grow-1">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <LabelModal /> &nbsp;
                                <Button variant="outline-dark" disabled>Responses: 500</Button>
                            </div>
                            <Button
                                onClick={Analyze}
                            >Analyze</Button>
                        </Card.Header>
                        <Card.Body>
                            <h3>test_file.xlsx</h3>
                            <div 
                                className="bg-light border rounded d-flex justify-content-center align-items-center"
                                style={{ height: '95%' }}
                            >
                                <p className="text-muted">
                                    Scrollable dataset preview frame
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Preview;
