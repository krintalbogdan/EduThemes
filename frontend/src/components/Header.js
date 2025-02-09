import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';

const Header = () => {
    return (
        <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
            <Container>
                <Navbar.Brand><b>EduThemes</b></Navbar.Brand>
            </Container>
        </Navbar>
    );
};

export default Header;
