import { Form, Button, Container, Col, Row, Card } from 'react-bootstrap';
import { useState } from 'react';
import './LoginPage.css';

function LoginPage(props) {
  const [username, setUsername] = useState('test@polito.it');
  const [password, setPassword] = useState('password');
  const [validated, setValidated] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();

    props.updateMessage("");

    const credentials = { username, password };

    const form = event.currentTarget;

    if (!form.checkValidity()) {
      setValidated(true);
    }
    else if (username === '' || password === '') {
      props.updateMessage("Email and password cannot be empty ");
      setValidated(false);
    }
    else {
      props.login(credentials);
    }
  };


  return (
    <Container className='text-center'>
      <Col>
        <Row>
          <Card id='login-form-root'>

            <Card.Title id='login-title'><h1>Login</h1></Card.Title>
            <Card.Body>
              <Form noValidate validated={validated}>
                <Form.Group className='m-4' controlId='username'>
                  <Form.Label>email</Form.Label>
                  <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} />
                </Form.Group>
                <Form.Group className='m-4' controlId='password'>
                  <Form.Label>Password</Form.Label>
                  <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
                </Form.Group>
                <Button type='submit' id='btn-form-login' className='my-3 ' onClick={handleSubmit}>Login</Button>
              </Form>
            </Card.Body>
          </Card>
        </Row>
      </Col>
    </Container>

  )
}

function LogoutButton(props) {
  return (
    <Col>
      <span>User: {props.user?.name}</span>{' '}<Button variant="outline-primary" onClick={props.logout}>Logout</Button>
    </Col>
  )
}

export { LoginPage, LogoutButton };