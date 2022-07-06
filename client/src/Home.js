import { Container, Row, Col } from 'react-bootstrap';
import { CourseTable } from './CourseTable'



function Home(props) {





    return (
        <Container>
            <Row className='my-4'>
                <Col>
                    <h1 >All courses</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    <CourseTable courses={props.courses} setCurrentCFU={props.setCurrentCFU} incompatibility={props.incompatibility} home={props.home}></CourseTable>
                </Col>
            </Row>
        </Container>
    );
}





export { Home };