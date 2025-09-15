import React from 'react';
//import Navbar from 'react-bootstrap/Navbar';
//import Container from 'react-bootstrap/Container';

const Header = ({ themeFunc }) => {
    return (

        <div className="navbar bg-base-100 shadow-sm">
            <div className="flex-1 navbar-start">
                <a className="btn btn-ghost text-base-content text-xl">eduThemes</a>
            </div>
            <div className="flex-none navbar-center">
                <input type="checkbox" value="synthwave" className="toggle theme-controller" onClick={(e) => {

                        if (e.target.checked){
                            themeFunc("dark")
                        } else{
                            themeFunc("light")
                        }

                }} />
            </div>

            
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
