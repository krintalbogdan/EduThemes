import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';

const Header = () => {
    const defLink = `${import.meta.env.FRONT_URL}`
    return (
        <Navbar bg="primary" variant="dark" expand="lg" className="mb-4"  style={{ height: '5vh'}}>
            <Container>
                <Navbar.Brand style={{ marginLeft: '1vh' }} href={defLink}><b>EduThemes</b></Navbar.Brand>
            </Container>
        </Navbar>
    );
};

export default Header;