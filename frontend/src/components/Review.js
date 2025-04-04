import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Row, Col, Modal, Badge } from 'react-bootstrap';
import { FaCheck, FaTimes, FaUndo } from 'react-icons/fa';
import axios from 'axios';

const Review = ({ sessionId, labels, setResults, dataset, setDataset, visualization, claudeData, svmData, onAdvanceStage }) => {
    const [groupActions, setGroupActions] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [rejectedEntries, setRejectedEntries] = useState([]);
    const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [reassignThemes, setReassignThemes] = useState({});

    const groupKeys = svmData ? Object.keys(svmData) : [];
    if (!svmData || !claudeData || groupKeys.length === 0) {
        console.log("svmData or claudeData is missing or empty:", { svmData, claudeData }); // debugging log
    }
    const currentGroup = groupKeys[currentGroupIndex];
    const currentThemes = claudeData ? claudeData[currentGroup] : [];
    const currentIndices = svmData ? svmData[currentGroup] : [];
    const currentActions = groupActions[currentGroup] || Array(currentIndices.length).fill(null);

    useEffect(() => {
        if (!groupActions[currentGroup]) {
            setGroupActions((prev) => ({
                ...prev,
                [currentGroup]: Array(currentIndices.length).fill(null),
            }));
        }
    }, [currentGroup, currentIndices, groupActions]);

    const handleAction = (index, action) => {
        const updatedActions = [...currentActions];
        updatedActions[index] = action;
        setGroupActions((prev) => ({
            ...prev,
            [currentGroup]: updatedActions,
        }));
    };

    const handleUndo = (index) => {
        const updatedActions = [...currentActions];
        updatedActions[index] = null;
        setGroupActions((prev) => ({
            ...prev,
            [currentGroup]: updatedActions,
        }));
    };

    const handleAcceptAll = () => {
        setGroupActions((prev) => ({
            ...prev,
            [currentGroup]: Array(currentIndices.length).fill('approve'),
        }));
    };

    const handleRejectAll = () => {
        setGroupActions((prev) => ({
            ...prev,
            [currentGroup]: Array(currentIndices.length).fill('deny'),
        }));
    };

    const handleSaveReassignThemes = () => {
        // console.log("Reassigned themes:", reassignThemes);
        console.log(dataset);
        handleAcceptAll();
        setShowReassignModal(false);
        setCurrentGroupIndex(currentGroupIndex + 1);
    };

    const handleNextGroup = async () => {
        const rejectedIndices = currentActions
            .map((action, idx) => (action === 'deny' ? currentIndices[idx] : null))
            .filter((index) => index !== null);

        if (rejectedIndices.length > 0) {
            setRejectedEntries(rejectedIndices);
            setShowReassignModal(true);
        } else if (currentGroupIndex < groupKeys.length - 1) {
            setCurrentGroupIndex(currentGroupIndex + 1);
        } else {
            try {
                const response = await axios.post(`http://localhost:1500/session/${sessionId}/submit-final-dataset`, { dataset });
                if (response.status === 200) {
                    console.log(response.data);
                    setResults(response.data.themes);
                    onAdvanceStage('results');
                } else {
                    console.error('Error submitting final dataset:', response.data.error);
                }
            } catch (error) {
                console.error('Error submitting final dataset:', error);
            }
        }
    };

    const allActionsCompleted = currentActions.every((action) => action !== null);

    return (
        <Container fluid className="d-flex justify-content-center align-items-start p-0" style={{ padding: '0', height: '90vh' }}>
            <Row className="h-100 m-0 w-100 gap-3">
                <Col xs={3} className="p-2 bg-light h-100">
                    <Card className="mb-2" style={{ height: '25%' }}>
                        <Card.Body className="rounded d-flex flex-column">
                            <h5>Batch Revision</h5><hr/>
                            <p className="text-muted">
                                This page allows you to approve or reject the AI-generated codes for each entry. Responses were grouped by the SVM model and each group was coded by Claude.
                            </p>
                        </Card.Body>
                    </Card>
                    <Card className="mb-2" style={{ height: '39%' }}>
                        <Card.Body className="rounded d-flex flex-column">
                            <strong>Assigned Themes</strong><hr/>
                            {currentThemes.length > 0 ? (
                                <ul>
                                    {currentThemes.map((theme, index) => (
                                        <li key={index}>{theme}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted">No themes assigned for this group.</p>
                            )}
                        </Card.Body>
                    </Card>
                    <Card className="flex-grow-1" style={{ overflowY: 'auto', height: '34%' }}>
                        <Card.Body className="rounded d-flex flex-column" style={{ overflowY: 'auto'}}>
                            <strong>SVM Clusters</strong><hr/>
                            {visualization && (
                                <img 
                                    src={`data:image/png;base64,${visualization}`} 
                                    alt="Visualization" 
                                    style={{ width: '100%', height: 'auto', cursor: 'pointer' }} 
                                    onClick={() => setShowModal(true)}
                                />
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={8} className="p-2 h-100 d-flex bg-light flex-column">
                    <Card className="flex-grow-1">
                        <Card.Header className="d-flex flex-column align-items-center">
                            <div className="d-flex justify-content-between w-100 mt-2 align-items-center">
                                <h5>
                                    Group {groupKeys.length > 0 ? currentGroupIndex + 1 : 0} of {groupKeys.length}
                                </h5>
                                <Button 
                                    variant="primary" 
                                    onClick={handleNextGroup} 
                                    disabled={!allActionsCompleted}
                                >
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
                                {currentIndices.length > 0 ? (
                                    currentIndices.map((index, idx) => (
                                        <div 
                                            key={index} 
                                            className={`p-2 border-bottom d-flex justify-content-between align-items-center`}
                                            style={{ 
                                                textAlign: 'left', 
                                                backgroundColor: currentActions[idx] === 'approve' ? '#d4edda' : currentActions[idx] === 'deny' ? '#f8d7da' : 'transparent' 
                                            }}
                                        >
                                            <span>
                                                {dataset[index]?.original || "No text available"}
                                            </span>
                                            <div 
                                                className="d-flex flex-column" 
                                                style={{ height: '60px', justifyContent: currentActions[idx] === null ? 'space-between' : 'center' }}
                                            >
                                                {currentActions[idx] === null && (
                                                    <>
                                                        <Button 
                                                            variant="success" 
                                                            className="d-flex align-items-center" 
                                                            size="sm"
                                                            onClick={() => handleAction(idx, 'approve')}
                                                        >
                                                            <FaCheck/>
                                                        </Button>
                                                        <Button 
                                                            variant="danger" 
                                                            className="d-flex align-items-center" 
                                                            size="sm"
                                                            onClick={() => handleAction(idx, 'deny')}
                                                        >
                                                            <FaTimes/>
                                                        </Button>
                                                    </>
                                                )}
                                                {currentActions[idx] !== null && (
                                                    <Button 
                                                        variant="secondary" 
                                                        className="d-flex align-items-center" 
                                                        size="sm"
                                                        onClick={() => handleUndo(idx)}
                                                    >
                                                        <FaUndo/>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted">No entries in this group.</p>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>SVM Clusters</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex justify-content-center">
                    {visualization && (
                        <img 
                            src={`data:image/png;base64,${visualization}`} 
                            alt="Decision Boundary" 
                            style={{ width: '100%', height: 'auto' }} 
                        />
                    )}
                </Modal.Body>
            </Modal>

            <Modal show={showReassignModal} onHide={() => setShowReassignModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Reassign Themes</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {rejectedEntries.length > 0 ? (
                        rejectedEntries.map((entryIndex, idx) => (
                            <div key={idx} className="mb-3">
                                <strong>Entry:</strong>
                                <p>{dataset[entryIndex]?.original || "No text available"}</p>
                                <div className="mb-2">
                                    {dataset[entryIndex]?.themes?.map((theme, index) => (
                                        <Badge
                                            key={index}
                                            bg={null}
                                            style={{
                                                backgroundColor: labels.find(label => label.name === theme.name)?.color || '#0d6efd',
                                                marginRight: '5px',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => {
                                                const updatedThemes = dataset[entryIndex].themes.filter((t) => t.name !== theme.name);
                                                const updatedDataset = [...dataset];
                                                updatedDataset[entryIndex].themes = updatedThemes;
                                                setDataset(updatedDataset);
                                            }}
                                        >
                                            {theme.name} ×
                                        </Badge>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter new theme"
                                    value={reassignThemes[entryIndex] || ""}
                                    onChange={(e) => {
                                        const newThemeName = e.target.value.trim();
                                        const label = labels.find((label) => label.name === newThemeName);
                                        if (label && !dataset[entryIndex].themes?.some((t) => t.name === newThemeName)) {
                                            const newTheme = { name: newThemeName, color: label.color };
                                            const updatedDataset = [...dataset];
                                            updatedDataset[entryIndex].themes = [
                                                ...(updatedDataset[entryIndex].themes || []),
                                                newTheme,
                                            ];
                                            setDataset(updatedDataset);
                                            setReassignThemes((prev) => ({ ...prev, [entryIndex]: "" }));
                                        } else {
                                            setReassignThemes((prev) => ({ ...prev, [entryIndex]: newThemeName }));
                                        }
                                    }}
                                    list="theme-options"
                                />
                                <datalist id="theme-options">
                                    {labels.map((label, index) => (
                                        <option key={index} value={label.name} />
                                    ))}
                                </datalist>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted">No rejected entries to reassign themes for.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowReassignModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveReassignThemes}>
                        Next Group
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Review;
