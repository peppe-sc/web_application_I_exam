import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useNavigate } from 'react-router-dom';
import API from '../API';


function TitleBar(props) {
    const navigate = useNavigate();
    return (
        <Navbar bg="warning" expand="lg">
            <Container>
                <Navbar.Brand >{props.name}</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link onClick={(event)=>{props.setReaload(true);navigate('/');}} >Home</Nav.Link>
                        <Nav.Link onClick={(event)=>{if(!props.loggedIn){navigate('/login');return;}else{ navigate('/backoffice');}}}>BackOffice</Nav.Link>
                        {props.loggedIn?<Nav.Link onClick={(event)=>{props.setReaload(true);navigate('/');props.doLogOut();}}>Logout</Nav.Link>:<Nav.Link onClick={(event)=>{navigate('/login')}}>Login</Nav.Link>}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default TitleBar;