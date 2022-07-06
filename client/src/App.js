import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import React from 'react';
import { Container, Alert } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Home } from './Home';
import API from './API';
import { MyNavbar } from './MyNavbar';
import { LoginPage } from './LoginPage';
import { useState, useEffect } from 'react';
import { MyPage } from './MyPage';


function App() {
  return (
    <Router>
      <App2 />
    </Router>
  )
}

function App2() {
  const [loggedIn, setLoggedIn] = useState(false);  // no user is logged in when app loads
  const [user, setUser] = useState({});
  const [message, setMessage] = useState('');
  const [courses, setCourses] = useState([]);
  const [incompatibility, setIncompatibility] = useState([]);
  const [dirty, setDirty] = useState(false);
  const navigate = useNavigate();

  function handleError(msg) {
    // console.log(err);
    setMessage(msg);
  }

  useEffect(() => {
    checkAuth();
    Promise.all([API.getAllCourses(), API.getIncompatibility()])
      .then(responses => {
        setCourses(responses[0]);
        setIncompatibility(responses[1]);
        setDirty(false);
      })
      .catch(err => handleError("Errore nel caricamento di dati dal database!"))
  }, [dirty]);


  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then(user => {
        setLoggedIn(true);
        setUser(user);
        setMessage('');
        navigate('/mypage');
      })
      .catch(err => {
        setMessage(err);
      }
      )
  }

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser({});
    navigate('/home');

  }
  const checkAuth = async () => {
    try {
      const user = await API.getUserInfo();
      setLoggedIn(true);
      setUser(user);
      setDirty(false);
    } catch (err) {
      // handleError(err);
    }
  };


  function setSubscrition(sub) {
    const newUser = { id: user.id, email: user.email, name: user.name, subscrition: sub };
    setUser(newUser);
  }
  return (
    <>
      <MyNavbar login={doLogIn} loggedIn={loggedIn} logout={doLogOut} user={user}></MyNavbar>

      <Container fluid className='below-nav' >
        {message ? <Alert variant='danger' onClose={() => setMessage('')} dismissible>{message}</Alert> : false}

        <Routes>
          <Route path='/' element={
            loggedIn ? (<Home courses={courses} incompatibility={incompatibility}></Home>)
              : <Navigate to='/home' />}>
          </Route>

          <Route path='*' element={<h1>Page not found</h1>}> </Route>
          <Route path='/login' element={loggedIn ? <Navigate to='/mypage' /> : <LoginPage login={doLogIn} updateMessage={setMessage} />} />
          <Route path='/home' element={<Home courses={courses} incompatibility={incompatibility} home={true} />} />
          <Route path='/mypage' element={loggedIn ?
            <MyPage courses={courses} loggedIn={loggedIn} incompatibility={incompatibility} setCourses={setCourses} edit={false}
              sub={user.subscrition} setSubscrition={setSubscrition} name={user.name} setDirty={setDirty} setMessage={setMessage}></MyPage>
            : <Navigate to='/login' />}> </Route>
          <Route path='/mypage/edit' element={loggedIn ?
            <MyPage courses={courses} loggedIn={loggedIn} incompatibility={incompatibility} setCourses={setCourses} edit={true}
              sub={user.subscrition} setSubscrition={setSubscrition} name={user.name} setDirty={setDirty} setMessage={setMessage} ></MyPage>
            : <Navigate to='/login' />}> </Route>

        </Routes>

      </Container>
    </>
  );
}
export default App;
