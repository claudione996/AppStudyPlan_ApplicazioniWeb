import {Card, Col, Row,} from 'react-bootstrap';
import { CircleFill,XCircleFill } from 'react-bootstrap-icons';
import './Legend.css';

function Legend() {
   return ( <Card className="legend shadow-lg py-0 h-auto mt-3 mx-4">
        <Card.Header>Row colour</Card.Header>
        <Card.Subtitle className='font mx-2 my-2'>For more information pass over the symbol ({<XCircleFill />})</Card.Subtitle>
        <Card.Body>
            <Row><Col><CircleFill className="red mx-2" /> Incompatible </Col></Row>
            <Row><Col><CircleFill className="yellow mx-2" /> Prerequesite </Col></Row>
            <Row><Col><CircleFill className="grey mx-2" /> Max student reached </Col></Row>
            <Row><Col><CircleFill className="green mx-2" /> Added </Col></Row>
            <Row><Col><CircleFill className="blue mx-2" /> Not enough CFU </Col></Row>
        </Card.Body>
    </Card>
   )
}
export { Legend }