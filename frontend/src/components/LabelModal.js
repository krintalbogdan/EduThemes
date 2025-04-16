import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const LabelModal = ({ labels = [], setLabels }) => {
    const [newLabel, setNewLabel] = useState('');
    const [labelDescription, setLabelDescription] = useState('');
    const [selectedColor, setSelectedColor] = useState('#007bff');
    const [show, setShow] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [formMode, setFormMode] = useState('add');

    const toggleShow = () => setShow(!show);
 
    const addLabel = () => {
        if (newLabel.trim() === '' || 
            labels.some(label => label.name.toLowerCase() === newLabel.toLowerCase()) || 
            labels.length >= 10) return;

        setLabels([...labels, { 
            name: newLabel, 
            description: labelDescription, 
            color: selectedColor 
        }]);
        
        setNewLabel('');
        setLabelDescription('');
        setSelectedColor('#007bff');
    };

    const startEditLabel = (index) => {
        const label = labels[index];
        setNewLabel(label.name);
        setLabelDescription(label.description || '');
        setSelectedColor(label.color);
        setEditIndex(index);
        setFormMode('edit');
    };

    const updateLabel = () => {
        if (editIndex === null || newLabel.trim() === '') return;
        
        if (labels.some((label, idx) => 
            idx !== editIndex && 
            label.name.toLowerCase() === newLabel.toLowerCase()
        )) return;

        const updatedLabels = [...labels];
        updatedLabels[editIndex] = {
            name: newLabel,
            description: labelDescription,
            color: selectedColor
        };
        
        setLabels(updatedLabels);
        
        setNewLabel('');
        setLabelDescription('');
        setSelectedColor('#007bff');
        setEditIndex(null);
        setFormMode('add');
    };

    const cancelEdit = () => {
        setNewLabel('');
        setLabelDescription('');
        setSelectedColor('#007bff');
        setEditIndex(null);
        setFormMode('add');
    };

    const deleteLabel = (index) => {
        setLabels(labels.filter((_, idx) => idx !== index));
       
        if (editIndex === index) {
            cancelEdit();
        }
    };

    const fileLabel = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
            const text = e.target.result;
            const rows = text.split('\n');
            const newLabels = [];

            rows.forEach(row => {
                const [name, description] = row.split(',').map(item => item.trim());
                
                if (name && 
                    !(name.trim() === '' || 
                    labels.some(label => label.name.toLowerCase() === name.toLowerCase()) || 
                    (labels.length + newLabels.length >= 10))) {
                    
                    const color = '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
                    
                    newLabels.push({ 
                        name, 
                        description: description || "",
                        color 
                    });
                }
            });

            setLabels(prevLabels => [...prevLabels, ...newLabels]);
        };
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formMode === 'add') {
            addLabel();
        } else {
            updateLabel();
        }
    };

    return (
        <>
            <Button variant="primary" onClick={toggleShow}>Edit Themes</Button>

            <Modal show={show} onHide={toggleShow} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Manage Themes</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Theme Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter theme name"
                                value={newLabel}
                                onChange={(e) => setNewLabel(e.target.value)}
                                maxLength={30}
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="Enter theme description"
                                value={labelDescription}
                                onChange={(e) => setLabelDescription(e.target.value)}
                                maxLength={200}
                            />
                        </Form.Group>
                        
                        <div className="d-flex mb-3 align-items-center">
                            <Form.Group className="me-3">
                                <Form.Label>Theme Color</Form.Label>
                                <Form.Control
                                    type="color"
                                    value={selectedColor}
                                    onChange={(e) => setSelectedColor(e.target.value)}
                                    className="form-control-color"
                                />
                            </Form.Group>
                            
                            {formMode === 'add' ? (
                                <Button 
                                    variant="success" 
                                    onClick={addLabel}
                                    disabled={!newLabel.trim() || labels.length >= 10}
                                >
                                    Add Theme
                                </Button>
                            ) : (
                                <div className="d-flex">
                                    <Button 
                                        variant="primary" 
                                        onClick={updateLabel}
                                        className="me-2"
                                        disabled={!newLabel.trim()}
                                    >
                                        Update
                                    </Button>
                                    <Button variant="secondary" onClick={cancelEdit}>
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Form>
                    
                    <hr />
                    
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Current Themes ({labels.length}/10)</h5>
                        <Form.Group controlId="formFile">
                            <Form.Control 
                                type="file" 
                                accept=".txt,.csv" 
                                onChange={fileLabel}
                                disabled={labels.length >= 10}
                                size="sm"
                            />
                            <Form.Text className="text-muted">
                                Import themes from CSV or TXT
                            </Form.Text>
                        </Form.Group>
                    </div>
                    
                    <ListGroup>
                        {labels.length === 0 ? (
                            <p className="text-muted text-center py-3">
                                No themes defined yet. Add your first theme above.
                            </p>
                        ) : (
                            labels.map((label, index) => (
                                <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <div 
                                            style={{ 
                                                backgroundColor: label.color, 
                                                width: '20px', 
                                                height: '20px', 
                                                borderRadius: '50%', 
                                                display: 'inline-block',
                                                marginRight: '10px'
                                            }}
                                        ></div>
                                        <div>
                                            <div><strong>{label.name}</strong></div>
                                            {label.description && (
                                                <small className="text-muted">{label.description}</small>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <Button 
                                            variant="outline-secondary" 
                                            size="sm" 
                                            className="me-2"
                                            onClick={() => startEditLabel(index)}
                                        >
                                            Edit
                                        </Button>
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm" 
                                            onClick={() => deleteLabel(index)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </ListGroup.Item>
                            ))
                        )}
                    </ListGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={toggleShow}>Close</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default LabelModal;