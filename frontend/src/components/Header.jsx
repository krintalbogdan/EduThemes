import React from 'react';
//import Navbar from 'react-bootstrap/Navbar';
//import Container from 'react-bootstrap/Container';

const Header = () => {
    return (
        <div className="navbar bg-neutral text">
            <button className="btn btn-ghost text-xl text-white font-extrabold">eduThemes</button>
        </div>
    );
};

/*
        <Navbar bg="primary" variant="dark" expand="lg" className="mb-4"  style={{ height: '5vh'}}>
            <Container>
                <Navbar.Brand style={{ marginLeft: '-200px' }}><b>EduThemes</b></Navbar.Brand>
            </Container>
        </Navbar>
        */

export default Header;
