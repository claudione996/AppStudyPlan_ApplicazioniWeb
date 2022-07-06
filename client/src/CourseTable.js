import { Table, Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { useState } from "react";
import { ChevronBarDown, ChevronBarUp, XCircleFill, PlusCircleFill } from 'react-bootstrap-icons';
import './CourseTable.css';


function CourseTable(props) {


    return (
        <>
            <Table>
                <thead>
                    <tr>

                        {((props.edit)) ? <th></th> : false}
                        <th>code</th>
                        <th>course</th>
                        <th>CFU</th>
                        {(props.plan) ? false : <><th>StudentEnrolled</th><th>maxStudent</th></>}

                    </tr>
                </thead>
                <tbody>
                    {

                        props.courses.map((co) =>
                            <CourseRow course={co} courses={props.courses} myPlan={props.myPlan}
                                incompatibility={props.incompatibility} key={co.code} addinMy={props.addinMy}
                                deleteinMy={props.deleteinMy} plan={props.plan}
                                edit={props.edit} sub={props.sub} findPrerequisite={props.findPrerequisite} handlleShowError={props.handleShowError}
                                setShowAlert={props.setShowAlert} currentCFU={props.currentCFU} cfu={props.cfu} home={props.home} />)

                    }

                </tbody>

            </Table>

        </>
    );
}
function CourseRow(props) {
    let statusClass = null;
    const [show, setShow] = useState(false);


    switch (props.course.status) {
        case 'added':
            statusClass = 'table-success';
            break;
        case 'incompatible':
            statusClass = 'table-danger';
            break;
        case 'prerequisite':
            statusClass = 'table-warning';
            break;
        case 'reached':
            statusClass = 'table-active';
            break;
        case 'full':
            statusClass = 'table-primary';
            break;
        default: statusClass = null
            break;
    }


    function handleShow() {
        if (show === false)
            setShow(true);
        else setShow(false);

    }

    function findIncompatibility(code) {
        let s = [];
        for (const element of props.incompatibility.filter(x => x.codeA === code)) {
            s.push(element.codeB);
        };
        return s;

    }
    function findIncompatibilityInMyPlan(code) {
        let s = [];

        if (props.courses.length !== 0) {
            for (const element of props.incompatibility.filter(x => x.codeA === code)) {
                for (const c of props.myPlan) {
                    if (c.code === element.codeB)
                        s.push(element.codeB);
                }
            };
        }
        return s;

    }
    function typeError() {

        if (props.myPlan.find((c) => c.code === props.course.code)) {
            props.course.status = 'added';

            return 3;
        }
        else if (props.currentCFU + props.course.CFU > props.cfu) {
            props.course.status = 'full';
            return 5;
        }
        else if (findIncompatibilityInMyPlan(props.course.code).length !== 0) {
            props.course.status = 'incompatible';
            return 1;
        }
        else if (props.findPrerequisite(props.course) !== "") {
            props.course.status = 'prerequisite';
            return 2;
        }
        else if (props.course.maxStudent !== null && props.course.studentEnrolled >= props.course.maxStudent) {
            props.course.status = 'reached';
            return 4;
        }
        props.course.status = null;
        return 0;
    }
    function findPreInMy(course) {
        let s = "";
        for (let c of props.courses) {
            if (course.code === c.prerequisite)
                s = c.code;
        }
        return s;

    }

    return (
        <>
            <tr className={((props.edit === true && props.plan === true) || props.home
                || props.plan === true || (props.plan === false && props.edit === false)) ? null : statusClass}>

                {(!props.plan) ? //courses sarebbe myplan // se entro sei nella tabella all courses
                    (
                        (!props.edit) ? false :
                            ((typeError() || props.sub === "") ?
                                <td>
                                    <OverlayTrigger
                                        key={'left'}
                                        placement={'left'}
                                        overlay={
                                            <Popover id={`popover-positioned-left`} className="popover">
                                                <Popover.Header as="h3" className=''><strong>Warning!</strong></Popover.Header>
                                                <Popover.Body>
                                                    {(typeError() === 3) ? "You have already added this course" :
                                                        (typeError() === 2) ? <> Prerequesite: to add this course you have to insert in your study plan the course <strong>{props.findPrerequisite(props.course)}</strong> </> :
                                                            (typeError() === 1) ? <>Incompatibile with:  <strong>{findIncompatibilityInMyPlan(props.course.code).toString()}</strong> </> : (typeError() === 4)
                                                                ? 'Reached the maximum number of students' : (typeError() === 5) ?
                                                                    'it is not possible to add the course because the number of credits allowed exceed ' : null}
                                                </Popover.Body>
                                            </Popover>
                                        }
                                    >
                                        <PlusCircleFill />

                                    </OverlayTrigger>


                                </td> :
                                <td><PlusCircleFill className='green'
                                    onClick={() => {
                                        props.addinMy(props.course);
                                    }
                                    } /></td>
                            ))
                    : (!props.edit) ? false :
                        (findPreInMy(props.course)) ?
                            <td><OverlayTrigger
                                key={'left'}
                                placement={'left'}
                                overlay={
                                    <Popover id={`popover-positioned-left`} className="popover">
                                        <Popover.Header as="h3" className=''><strong>Warning!</strong></Popover.Header>
                                        <Popover.Body>
                                            Impossible to remove. This is a prerequesite of the course <strong>{findPreInMy(props.course)}</strong>, delete it first!
                                        </Popover.Body>
                                    </Popover>
                                }
                            >
                                <XCircleFill />

                            </OverlayTrigger></td>
                            : <td><XCircleFill className='red' onClick={() => {
                                props.deleteinMy(props.course);
                            }}></XCircleFill></td>}


                <CourseData course={props.course} plan={props.plan} />

                <CourseAction code={props.code} handleShow={handleShow} show={show}></CourseAction>
            </tr>
            {
                (show) ?
                    <>
                        <tr>
                            <td className="fw-bolder">incompatibility:</td>
                            <td>{(findIncompatibility(props.course.code).length === 0) ? 'N/A' :
                                findIncompatibility(props.course.code).toString()}</td>
                        </tr>
                        <tr>
                            <td className="fw-bolder">prerequisite:</td>
                            <td>{(props.course.prerequisite === null) ? 'N/A' : props.course.prerequisite}</td>
                        </tr>
                    </>
                    :
                    false

            }


        </>
    );
}

function CourseData(props) {
    return (
        <>
            <td>{props.course.code}</td>
            <td>{props.course.name}</td>
            <td>{props.course.CFU}</td>
            {(props.plan) ? false :
                <><td>{props.course.studentEnrolled}</td>
                    <td>{props.course.maxStudent}</td></>}




        </>
    );
}
function CourseAction(props) {



    return (
        <td>

            <Button variant="outline-secondary " onClick={props.handleShow} >
                {(!props.show) ? <ChevronBarDown /> : <ChevronBarUp />}

            </Button>

        </td>);
}
export { CourseTable };