import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import 'bootstrap/dist/css/bootstrap.min.css';

const LabelModal = ({ labels = [], setLabels }) => {
    const [newLabel, setNewLabel] = useState('');
    const [selectedColor, setSelectedColor] = useState('#007bff');
    const [show, setShow] = useState(true);

    const toggleShow = () => setShow(!show);
 
    const singleLabel = () => {
        // ignore duplicates/blank labels
        if (newLabel.trim() === '' || labels.some(label => label.name.toLowerCase() === newLabel.toLowerCase())) return;

        setLabels([...labels, { name: newLabel, color: selectedColor }]);
        setNewLabel('');
    };

    const deleteLabel = (name) => {
        setLabels(labels.filter(label => label.name !== name));
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
                const [name] = row.split(',').map(item => item.trim());
                // setNewLabel(name);
                if (name && !(name.trim() === '' || labels.some(label => label.name.toLowerCase() === name.toLowerCase()))) {
                    newLabels.push({ name, color: ('#007bff') });
                }
            });

            setLabels(prevLabels => [...prevLabels, ...newLabels]);
        };
    };

    // TODO: allow users to recolor existing labels

    return (
        <>
            <Button variant="primary" onClick={toggleShow}>Edit Themes</Button>

            <Modal show={show} onHide={toggleShow} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Themes</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    
                    <Form className="mb-2 d-flex gap-2">
                        <Form.Control
                            type="text"
                            placeholder="Enter theme name"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    singleLabel();
                                }
                            }}
                        />
                        <Form.Control
                            type="color"
                            value={selectedColor}
                            onChange={(e) => setSelectedColor(e.target.value)}
                            className="form-control-color"
                        />
                        <Button variant="success" onClick={singleLabel}>+</Button>
                    </Form>
                    <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label>Upload from file</Form.Label>
                        <Form.Control type="file" accept=".txt" onChange={fileLabel} />
                        <Form.Text className="text-muted">Must be a line-separated text file</Form.Text>
                    </Form.Group>
                    <ListGroup>
                        {labels.map((label, index) => (
                            <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <span className="me-2" style={{ backgroundColor: label.color, width: '20px', height: '20px', borderRadius: '50%', display: 'inline-block' }}></span>
                                    {label.name}
                                </div>
                                <Button variant="outline-danger" size="sm" onClick={() => deleteLabel(label.name)}>×</Button>
                            </ListGroup.Item>
                        ))}
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
