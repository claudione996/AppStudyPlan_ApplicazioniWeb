/**
 * All the API calls
 */

const APIURL = new URL('http://localhost:3001/api/');  // Do not forget '/' at the end

async function getAllCourses() {
  // call: GET /api/courses
  const response = await fetch(new URL('courses', APIURL));
  const coursesJson = await response.json();
  if (response.ok) {
    return coursesJson.map((co) => ({
      code: co.code, name: co.name, CFU: co.CFU,
      studentEnrolled: co.studentEnrolled, maxStudent: co.maxStudent,
      incompatibility: co.incompatibility, prerequisite: co.prerequisite
    }));
  } else {
    throw coursesJson;  // an object with the error coming from the server
  }
}

async function getIncompatibility() {
  // call: GET /api/incompatibility
  const response = await fetch(new URL('incompatibility', APIURL));
  const incompatibilityJson = await response.json();
  if (response.ok) {
    return incompatibilityJson.map((co) => ({ codeA: co.codeA, codeB: co.codeB }));
  } else {
    throw incompatibilityJson;  // an object with the error coming from the server
  }
}

async function logIn(credentials) {
  let response = await fetch(new URL('sessions', APIURL), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetail = await response.json();
    throw errDetail.message;
  }
}

async function logOut() {
  await fetch(new URL('sessions/current', APIURL), { method: 'DELETE', credentials: 'include' });
}

async function getUserInfo() {
  const response = await fetch(new URL('sessions/current', APIURL), { credentials: 'include' });
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;  // an object with the error coming from the server
  }
}

async function addStudyPlan(myPlan) {
  // call: POST /api/exams
  return new Promise((resolve, reject) => {
    fetch(new URL('add/myplan', APIURL), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ courses: myPlan }),
    }).then((response) => {

      if (response.ok) {
        resolve(null);
      } else {
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) });
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}
async function getMyPlan() {
  // call: GET /api/myplan
  const response = await fetch(new URL('myplan', APIURL), { credentials: 'include' });
  const coursesJson = await response.json();
  if (response.ok) {
    return coursesJson.map((co) => ({
      code: co.code, name: co.name, CFU: co.CFU,
      maxStudent: co.maxStudent, incompatibility: co.incompatibility,
      prerequisite: co.prerequisite
    }));
  } else {
    throw coursesJson;
  }
}
function addSubscrition(sub) {
  // call: PUT /api/myplan/sub
  return new Promise((resolve, reject) => {
    fetch(new URL('myplan/sub', APIURL), {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscrition: sub }),
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error

        response.json()
          .then((obj) => { reject(obj); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) });
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}
function deleteStudyPlan() {
  // call: DELETE /api/myplan
  return new Promise((resolve, reject) => {
    fetch(new URL('myplan', APIURL), {
      method: 'DELETE',
      credentials: 'include'
    }).then((response) => {

      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}
function addEnroll() {
  // call: PUT
  return new Promise((resolve, reject) => {
    fetch(new URL('myplan/aEnroll', APIURL), {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        response.json()
          .then((obj) => { reject(obj); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}
function subEnroll() {
  // call: PUT 
  return new Promise((resolve, reject) => {
    fetch(new URL('myplan/dEnroll', APIURL), {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error

        response.json()
          .then((obj) => { reject(obj); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

const API = { getAllCourses, logIn, logOut, getUserInfo, addStudyPlan, getMyPlan, getIncompatibility, addSubscrition, deleteStudyPlan, subEnroll, addEnroll };
export default API;