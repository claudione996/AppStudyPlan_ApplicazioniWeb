import { useState, useEffect } from "react";
import {
  Card, Col, Row, Form, Alert, Button,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { PersonCircle } from "react-bootstrap-icons";
import { CourseTable } from "./CourseTable";
import "./MyPage.css";
import { SubModal } from './SubModal';
import API from './API';
import { PencilFill, TrashFill } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { Legend } from "./Legend.js";



function MyPage(props) {
  const [cfu, setCfu] = useState(0);
  const [currentCFU, setCurrentCFU] = useState(0);
  const [myPlan, setMyPlan] = useState([]);
  const [exist, setExist] = useState(false);
  const [show, setShow] = useState(false);
  const [min, setMin] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [showAlertAdd, setShowAlertAdd] = useState(false);
  const [showAlertDelete, setShowAlertDelete] = useState(false);

  const handleClose = () => { setShow(false) };
  const handleShow = () => setShow(true);


  const navigate = useNavigate();

  function handleError(err) {
    props.setMessage("Errore nel server");
  }
  function addinMy(course) {

    if (currentCFU + course.CFU <= cfu) {
      props.setCourses(courses => courses.map(c => (c.code === course.code) ? {
        code: c.code,
        name: c.name,
        CFU: c.CFU,
        studentEnrolled: c.studentEnrolled + 1,
        maxStudent: c.maxStudent,
        prerequisite: c.prerequisite
      } : c));
      setMyPlan(oldMyPlan => [...oldMyPlan, course]);
      setCurrentCFU(oldCFU => oldCFU + course.CFU);
    }

  }
  function deleteinMy(course) {

    props.setCourses(courses => courses.map(c => (c.code === course.code) ? {
      code: c.code,
      name: c.name,
      CFU: c.CFU,
      studentEnrolled: c.studentEnrolled - 1,
      maxStudent: c.maxStudent,
      prerequisite: c.prerequisite
    } : c));

    setMyPlan(myPlan.filter(f => f.code !== course.code));
    setCurrentCFU(oldCFU => oldCFU - course.CFU);
  }
  const addStudyPlan = async () => {
    if (exist) {
      await API.subEnroll().catch(err => handleError(err));
      await API.deleteStudyPlan()
        .then(() => setExist(false))
        .catch(err => handleError(err));
    }


    await API.addSubscrition(props.sub)
      .catch(err => handleError(err));
    await API.addStudyPlan(myPlan)
      .then(() => API.addEnroll().catch(err => handleError(err)))
      .then(() => {
        setExist(true);
        setShowAlertAdd(true);
        setTimeout(() => {
          setShowAlertAdd(false);
        }, 3000)
      }
      )
      .catch(err => { handleError(err); setMyPlan([]) });

  }
  const deleteStudyPlan = async () => {
    setMyPlan([]);
    await API.subEnroll().then().catch(err => handleError(err));

    await API.deleteStudyPlan()
      .then(() => API.addSubscrition(null))
      .then(() => { props.setSubscrition(null); props.setDirty(true) })
      .catch(err => handleError(err));

  }
  function findPrerequisite(course) {
    let s = "";
    if (course.prerequisite === null) {
      return s;
    }
    else {
      if (myPlan.length !== 0) {
        for (const element of myPlan) {
          if (element.code === course.prerequisite) {
            return s;
          }
        }
        s = course.prerequisite;
        return s;
      }
      else {
        return course.prerequisite;
      }
    }

  }

  useEffect(() => {
    setMyPlan([]);

    API.getMyPlan()
      .then(myPlan => {
        setMyPlan(myPlan);
        if (myPlan.length) {
          setExist(true);
          setCurrentCFU(myPlan.map(c => c.CFU).reduce((c1, c2) => (c1 + c2)));
          if (props.sub === "Full-Time") {
            setCfu(80);
            setMin(60);
          }
          else { setCfu(40); setMin(20); }
        }
        else {
          setExist(false);
          setCurrentCFU(0);
        }
      })
      .catch(err => handleError(err))
  }, [dirty, props.sub]);

  return (


    <>
      {(showAlertAdd) ?

        <Alert key='success' variant='success' className="ale" onClose={() => setShowAlertAdd(false)} dismissible >
          Your study plan is added!
        </Alert> : false}
      {(showAlertDelete) ?

        <Alert key='danger' variant='danger' className="ale" onClose={() => setShowAlertDelete(false)} dismissible >
          Your study plan is deleted!
        </Alert> : false}
      <Row>
        <Col lg={3}>
          <Card className="product-card shadow-lg py-0 h-auto mt-3 mx-4">
            <div className="product-img-div my-3">
              <PersonCircle width="100%" height="100%" />
            </div>

            <Card.Body className="p-3 w-100 text-center">
              <Card.Title className="font-medium text-black">Welcome!</Card.Title>
              <OverlayTrigger
                placement={'top'}
                overlay={<Tooltip id={`tooltip-top`}>{props.name}</Tooltip>}/*popup con il cursore sopra scheda*/
              >
                <Card.Text className="text-sm product-desc">Nome: <strong>{props.name}</strong></Card.Text>
              </OverlayTrigger>
              <Card.Text>     Subscrition:  <strong>{(props.sub === null) ? 'N/A' :
                (props.sub)}</strong>



              </Card.Text>
            </Card.Body>
            {(exist) ?
              (props.edit === false && props.sub !== null) ?
                <Card.Footer className="w-100 text-center bg-white border-0 pb-3">
                  <Button variant="primary" onClick={() => { navigate('/mypage/edit') }}>
                    <PencilFill></PencilFill> Edit your study plan</Button>
                  <Button className="my-3 " variant="danger" onClick={() => {
                    deleteStudyPlan(); setShowAlertDelete(true); setTimeout(() => {
                      setShowAlertDelete(false);
                    }, 3000);
                  }}>
                    <TrashFill></TrashFill> Delete your study plan</Button>
                </Card.Footer> : false : false}
          </Card>
          {props.edit ? <Legend />
            : false}
        </Col>
        <Col lg={9}>

          <div className="flex-grow mt-4 lg:mt-0">
            <Card className="box2 flex flex-column items-center h-full mb-2"  >


              {(myPlan.length) ? <><h1 className="text-danger">
                <Card.Header> Your study plan </Card.Header>
              </h1>
                <Card.Body>
                  <Row>
                    <Col xs={3}>
                      CFU:
                      <Form.Control
                        type="text"
                        placeholder={currentCFU}
                        disabled
                        readOnly
                      />
                      (min: {min} , max: {cfu} )
                    </Col>
                  </Row>

                  <CourseTable courses={myPlan} incompatibility={props.incompatibility}
                    deleteinMy={deleteinMy} plan={true} exist={exist}
                    edit={props.edit} sub={props.sub}></CourseTable>
                </Card.Body></> :
                (props.sub === null) ?
                  <Card.Body>
                    <SubModal setSub={props.setSubscrition} setCfu={setCfu} show={show}
                      handleClose={handleClose} handleShow={handleShow} setMin={setMin} >
                    </SubModal>
                  </Card.Body> : false}
            </Card>
            <Card className="box2 flex flex-column items-center h-full mb-5">
              <h1><Card.Header>All courses</Card.Header></h1>
              <Card.Body>
                <CourseTable courses={props.courses} myPlan={myPlan}
                  incompatibility={props.incompatibility} addinMy={addinMy}
                  deleteinMy={deleteinMy} plan={false}
                  edit={props.edit} sub={props.sub} findPrerequisite={findPrerequisite}
                  currentCFU={currentCFU} cfu={cfu}
                ></CourseTable>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>

      {props.edit ?
        <>
          <Button
            variant='danger'
            className='discard'
            onClick={() => {
              props.setDirty(true);
              if (dirty === false) setDirty(true); // usato per riprendere i pds dal server
              else setDirty(false);
              setCurrentCFU(0);
              navigate('/mypage');
            }}>
            Discard
          </Button>
          <Button
            variant='success'
            className='save'
            disabled={(currentCFU > min) ? false : true}
            onClick={() => {
              addStudyPlan();

              navigate('/mypage');
            }}>
            Confirm
          </Button> </> :
        false
      }




    </>
  );
}

export { MyPage };
