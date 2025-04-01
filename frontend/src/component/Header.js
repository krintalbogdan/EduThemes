import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';

const Header = () => {
    return (
        <Navbar bg="primary" variant="dark" expand="lg" className="mb-4" style={{ height: '5vh'}}>
            <Container>
                <Navbar.Brand><b>EduThemes</b></Navbar.Brand>
            </Container>
        </Navbar>
    );
};

export default Header;
