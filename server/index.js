'use strict'

const express = require('express');
const dao = require('./dao');
const morgan = require('morgan'); // logging middleware
const cors = require('cors');
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const passport = require('passport'); // auth middleware
const userDao = require('./user-dao'); // module for accessing the users in the DB
const { check, validationResult } = require('express-validator'); // validation middleware

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function (username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username and/or password.' });

      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});

// init express
const app = express();
const port = 3001;

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions)); // NB: Usare solo per sviluppo e per l'esame! Altrimenti indicare dominio e porta corretti


// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return next();

  return res.status(401).json({ error: 'not authenticated' });
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'a secret sentence not to share with anybody and anywhere, used to sign the session ID cookie',
  resave: false,
  saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());


/***  API courses  ***/

// GET /api/courses
app.get('/api/courses', (req, res) => {
  dao.listCourses()
    .then(courses => res.json(courses))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: `Database error while retrieving courses` }).end()
    });
});
// GET /api/courses
app.get('/api/incompatibility', (req, res) => {
  dao.listIncompatibility()
    .then(incompatibility => res.json(incompatibility))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: `Database error while retrieving incompatibility` }).end()
    });
});
//add studyplan
// POST /api/exams
app.post('/api/add/myplan', isLoggedIn, [
  check('courses').isArray(),
  check('courses.*.code').isString().isLength({ min: 7, max: 7 }),
  check('courses').custom((studyplan, { req }) => {
    return dao.listCourses().then(courses => {
      const sp = courses.filter(c => { // sp=studyplan
        return studyplan.some(s => { return c.code === s.code });
      })
      //controllo codici myplan
      if(sp.length !== studyplan.length )
      throw new Error("error in course's code");
      //controllo range cfu
      const currentCFU = sp.map(c => c.CFU).reduce((c1, c2) => (c1 + c2));
      if (req.user.subscrition === null) throw new Error("error subscription can not be null");
      const max = (req.user.subscrition === 'Full-Time') ? 80 : 40;
      const min = (req.user.subscrition === 'Full-Time') ? 60 : 20;
      if (min > currentCFU || max < currentCFU) {
        console.log(`Your currente cfu ${currentCFU} is not in the range of your cfu subscription ${min}-${max}`)
        throw new Error("error in cfu");
      }
      for (let course of sp) {

        //check maxstudent enrolled
        if (course.maxStudent !== null && course.studentEnrolled + 1 > course.maxStudent) {
          throw new Error(`Reached max student enrolled`);
        }

        //check propedeutic
        if (course.prerequisite !== null) {
          if (!sp.find(c => c.code === course.prerequisite)) {
            throw new Error(`The course ${course.code} must have a prerequiste`);
          }
        }
      }
    }
    )
  }
  ),
  check('courses').custom((studyplan) => {
    return dao.listIncompatibility().then(incompatibility => {
      for (const element of incompatibility) {
        if (studyplan.find(c => c.code === element.codeA) && studyplan.find(c => c.code === element.codeB)) {
          throw new Error(`There is an incompatible with ${element.codeB}`);
        }
      };

    })
  }
  )

], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const courses =
    req.body.courses;

  try {
    // You may want to check that the course code exists before doing the creation
    await dao.createStudyPlan(courses, req.user.id);   // It is WRONG to use something different from req.user.id
    // In case that a new ID is created and you want to use it, take it from await, and return it to client.
    res.status(201).end();
  } catch (err) {
    console.log(err);
    res.status(503).json({ error: `Database error during the creation of study plan .` });
  }
});
// GET /api/myplan
app.get('/api/myplan', isLoggedIn, async (req, res) => {
  try {
    const courses = await dao.listCoursesWithName(req.user.id);
    // setTimeout( ()=> res.json(courses), 1000);
    res.json(courses);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: `Database error while retrieving courses` }).end();
  }
});
// PUT subscrition
app.put('/api/myplan/sub', isLoggedIn, [check('subscrition').isIn(['Full-Time', 'Part-Time', null])], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const sub = req.body.subscrition;
  // you can also check here if the code passed in the URL matches with the code in req.body
  try {
    await dao.createSubscrition(sub, req.user.id);
    res.status(200).end();
  } catch (err) {
    console.log(err);
    res.status(503).json({ error: `Database error during the insert of subscrition` });
  }

});
// DELETE /api/myplan
app.delete('/api/myplan', isLoggedIn, async (req, res) => {

  try {
    await dao.deleteStudyPlan(req.user.id);
    res.status(204).end();
  } catch (err) {
    console.log(err);
    res.status(503).json({ error: `Database error during the deletion of studyplan.` });
  }
});

// PUT dec enroll
app.put('/api/myplan/dEnroll', isLoggedIn, [
  check().custom((val, { req }) => {
    return dao.listCoursesWithName(req.user.id).then(
      courses => {
        for (const c of courses)
          if (c.studentEnrolled - 1 < 0)
            throw new Error('errore iscritti');
      }
    )
  })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    await dao.subEnroll(req.user.id);
    res.status(200).end();
  } catch (err) {
    console.log(err);
    res.status(503).json({ error: `Database error during the insert of subscrition` });
  }

});
// PUT increment enroll
app.put('/api/myplan/aEnroll', isLoggedIn, [check().custom((val, { req }) => {
  return dao.listCoursesWithName(req.user.id).then(
    courses => {
      for (const c of courses)
        if ( c.maxStudent!=null && c.studentEnrolled + 1 > c.maxStudent)
          throw new Error('errore iscritti');
    }
  )
})], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    await dao.addEnroll(req.user.id);
    res.status(200).end();
  } catch (err) {
    console.log(err);
    res.status(503).json({ error: `Database error during the insert of subscrition` });
  }

});
/*** Users APIs ***/

// POST /sessions 
// login
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err)
        return next(err);

      // req.user contains the authenticated user, we send all the user info back
      // this is coming from userDao.getUser()
      return res.json(req.user);
    });
  })(req, res, next);
});


// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => { res.end(); });
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({ error: 'Unauthenticated user!' });;
});


// Activate the server
app.listen(port, () => {
  console.log(`react-score-server listening at http://localhost:${port}`);
});


