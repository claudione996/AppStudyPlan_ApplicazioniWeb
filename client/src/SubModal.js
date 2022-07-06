import Modal from 'react-bootstrap/Modal'
import { Card, Container, Row, Col, Form, Alert, ToggleButtonGroup, ToggleButton, Button } from 'react-bootstrap';
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Cpu } from 'react-bootstrap-icons';

function SubModal(props) {

    const navigate = useNavigate();


    return (
        <>
            <div className='text-center'>
                <div> There is no study plan....</div>
                <Button className="" variant="primary" onClick={props.handleShow}>
                    + Add your study plan
                </Button>

                <Modal show={props.show} onHide={props.handleClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Choose your subscrition</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                            <ToggleButtonGroup type="radio" name="options">
                                <Col className='text-center'>
                                    <ToggleButton
                                        id="tbg-radio-1"
                                        size="lg"
                                        variant="outline-primary"
                                        value={1}
                                        onClick={() => {
                                            props.setSub('Full-Time');
                                            props.setCfu(80);
                                            props.setMin(60);
                                            props.handleClose();
                                            navigate('/mypage/edit');

                                        }}>
                                        Full-time
                                    </ToggleButton>
                                </Col>
                                <Col className='text-center'>
                                    <ToggleButton
                                        size="lg"
                                        id="tbg-radio-2"
                                        variant="outline-primary"
                                        value={2}
                                        onClick={() => {
                                            props.setSub('Part-Time');
                                            props.setCfu(40);
                                            props.setMin(20);
                                            navigate('/mypage/edit');
                                            props.handleClose();
                                        }}>
                                        Part-time
                                    </ToggleButton>
                                </Col>

                            </ToggleButtonGroup>
                        </Row>
                    </Modal.Body>

                </Modal>
            </div>
        </>
    );
}
export { SubModal };