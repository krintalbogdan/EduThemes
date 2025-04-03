import React, { useState } from 'react';
import { Container, Spinner, Button, Card, Row, Col, Form, Table, Badge } from 'react-bootstrap';
import LabelModal from './LabelModal';
import axios from 'axios';

const Preview = ({ sessionId, dataset, setDataset, onAdvanceStage }) => {
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [labels, setLabels] = useState([]);

    const handleSelectEntry = (entry, index) => {
        if (index === selectedIndex) {
            return;
        }
        saveThemes();
        setSelectedIndex(index);
        setSelectedEntry(entry);
    };

    const handleThemeChange = (e) => {
        const newTheme = e.target.value;
        if (newTheme.trim() === '' || selectedEntry.themes?.some(theme => theme.name === newTheme)) return;

        const theme = labels.find(label => label.name === newTheme);
        if (theme) {
            setSelectedEntry((prev) => ({
                ...prev,
                themes: [...(prev.themes || []), theme],
            }));
            e.target.value = '';
            saveThemes();
        }
    };

    const saveThemes = () => {
        if (selectedEntry) {
            console.log("setting dataset");
            // update dataset with new themes
            const updatedEntry = { ...selectedEntry, themes: selectedEntry.themes };
            const updatedDataset = [...dataset];
            updatedDataset[selectedIndex] = updatedEntry;
            setDataset(updatedDataset);
        }
    };

    const removeTheme = (themeName) => {
        setSelectedEntry((prev) => ({
            ...prev,
            themes: prev.themes.filter((theme) => theme.name !== themeName),
        }));
    };

    const handleReview = async () => {
        setIsLoading(true);
        try {
            const manualCodings = dataset
                .map((entry, index) => ({
                    index,
                    themes: entry.themes || [],
                }))
                .filter((entry) => entry.themes.length > 0);

            const response = await axios.post(`http://localhost:1500/session/${sessionId}/submit-manual-coding`, {
                labels,
                manual_codings: manualCodings,
            });

            console.log(response.data.message);
            onAdvanceStage();
        } catch (error) {
            console.error("Error submitting manual coding:", error.response?.data || error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container fluid className="d-flex justify-content-center align-items-start p-0" style={{ padding: '0', height: '90vh' }}>
            <Row className="h-100 m-0 w-100 gap-3">
                <Col xs={3} className="p-2 bg-light h-100">
                    <Card className="mb-2" style={{ height: '25%' }}>
                        <Card.Body className="rounded d-flex flex-column">
                            <h5>Manual Coding</h5><hr/>
                            <p className="text-muted">
                                This page allows you to create themes and (optionally) create a manually coded sample to provide to the LLM.
                            </p>
                        </Card.Body>
                    </Card>
                    <Card className="flex-grow-1" style={{ overflowY: 'auto', height: '74%' }}>
                        <Card.Body className="rounded d-flex flex-column" style={{ overflowY: 'auto'}}>
                            {selectedEntry ? (
                                <>
                                    <h5>Selected Entry</h5>
                                    <hr />
                                    <p><strong>Original:</strong> {selectedEntry.original}</p>
                                    <p><strong>Cleaned:</strong> {selectedEntry.cleaned}</p>
                                    <hr />
                                    <Form.Group controlId="formThemes">
                                        {selectedEntry.themes?.length === 0 || selectedEntry.themes === undefined ? (
                                            <Form.Label className="text-muted">No themes assigned yet.</Form.Label>
                                        ) : null}
                                        <div className="mb-2">
                                            {selectedEntry.themes?.map((theme, index) => (
                                                <Badge
                                                    key={index}
                                                    bg={null}
                                                    style={{
                                                        backgroundColor: theme.color,
                                                        marginRight: '5px',
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() => removeTheme(theme.name)}
                                                >
                                                    {theme.name} ×
                                                </Badge>
                                            ))}
                                        </div>
                                        <Form.Control
                                            type="text"
                                            placeholder="Start typing..."
                                            list="theme-options"
                                            onChange={handleThemeChange}
                                        />
                                        <datalist id="theme-options">
                                            {labels.map((label, index) => (
                                                <option key={index} value={label.name} />
                                            ))}
                                        </datalist>
                                    </Form.Group>
                                </>
                            ) : (
                                <p className="text-muted">
                                    Select an entry to view details here.
                                </p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={8} className="p-2 h-100 d-flex bg-light flex-column">
                    <Card className="flex-grow-1">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <LabelModal labels={labels || []} setLabels={setLabels} />
                            </div>
                            <div className="d-flex align-items-center">
                                <Button variant="outline-dark" disabled>
                                    Coded: {dataset.filter((entry) => entry.themes?.length > 0).length}
                                </Button>
                                <Button variant="outline-dark" disabled style={{ margin: '10px' }}>
                                    Responses: {dataset.length}
                                </Button>
                                <Button 
                                    onClick={handleReview} 
                                    disabled={labels.length === 0 || !sessionId || isLoading}
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
                            'Review'
                        )}
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body style={{ height: '1px' }}>
                            <div 
                                className="bg-light border"
                                style={{ height: '100%', overflowY: 'auto' }}
                            >
                                {dataset && dataset.length > 0 ? (
                                    <Table striped hover bordered size="sm" className="m-0">
                                        <thead>
                                            <tr>
                                                <th 
                                                    className="text-center align-middle" 
                                                    style={{ width: '1%' }}
                                                >
                                                    #
                                                </th>
                                                <th className="text-center align-middle">Response</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dataset.map((entry, index) => (
                                                <tr 
                                                    key={index} 
                                                    onClick={() => handleSelectEntry(entry, index)}                                                     
                                                    style={{ cursor: 'pointer'}}
                                                >
                                                    <td 
                                                        className="text-center align-middle" 
                                                        style={{ fontWeight: 'bold', width: '1%' }}
                                                    >
                                                        {index + 1}
                                                    </td>
                                                    <td 
                                                        className="align-middle text-truncate" 
                                                        style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                                    >
                                                        <span 
                                                            style={{
                                                                display: 'inline-block',
                                                                width: '10px',
                                                                height: '10px',
                                                                borderRadius: '50%',
                                                                backgroundColor: entry.themes?.length > 0 ? '#28a745' : '#6c757d',
                                                                marginRight: '10px',
                                                            }}
                                                        ></span>
                                                        {entry.original}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                ) : (
                                    <p className="text-muted text-center m-3">
                                        No dataset available. Please upload a dataset.
                                    </p>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Preview;
