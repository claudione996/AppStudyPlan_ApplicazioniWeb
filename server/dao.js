'use strict'

const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('StudyPlan.db', (err) => {
    if (err) throw err;
});

// get all courses
exports.listCourses = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM course ORDER BY name'
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const courses = rows.map((co) => ({
                code: co.code, name: co.name, CFU: co.CFU,
                studentEnrolled: co.studentEnrolled, maxStudent: co.maxStudent,
                incompatibility: co.incompatibility, prerequisite: co.prerequisite
            }));
            resolve(courses);
        });
    });
};
// add a new studyplan
exports.createStudyPlan = (myPlan, userId) => {
    return new Promise((resolve, reject) => {
        for (const x of myPlan) {
            const sql = 'INSERT INTO studyplan(code, id) VALUES(?,?)';
            db.run(sql, [x.code, userId], function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(true);
            });
        }
    })

};
// get all course with name (get my plan)
exports.listCoursesWithName = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM course JOIN studyplan ON studyplan.code = course.code WHERE id = ?';

        db.all(sql, [userId], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            const courses = rows.map((co) => ({
                code: co.code, name: co.name, CFU: co.CFU,
                studentEnrolled: co.studentEnrolled, maxStudent: co.maxStudent, incompatibility: co.incompatibility, prerequisite: co.prerequisite
            }));


            resolve(courses);
        });
    });
};
//get incompatibility
exports.listIncompatibility = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM incompatibility';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const incompatibility = rows.map((co) => ({ codeA: co.codeA, codeB: co.codeB }));
            resolve(incompatibility);
        });
    });
};
exports.createSubscrition = (sub, userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE user SET subscrition=? WHERE id = ?';
        db.run(sql, [sub, userId], function (err) {
            if (err) {
                console.log("errore qui");
                reject(err);
                return;
            }
            resolve(null);
        });
    });
};

// delete an existing study plan
exports.deleteStudyPlan = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM studyplan WHERE id = ?';
        db.run(sql, [userId], (err) => {
            if (err) {
                reject(err);
                return;
            } else
                resolve(null);
        });
    });
}

exports.subEnroll = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE course SET studentEnrolled=studentEnrolled-1 WHERE code IN (SELECT code from studyplan WHERE id=?)';
        db.run(sql, [userId], function (err) {
            if (err) {
                console.log("errore qui");
                reject(err);
                return;
            }
            resolve(this.id);
        });
    });
};
exports.addEnroll = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE course SET studentEnrolled=studentEnrolled+1 WHERE code IN (SELECT code from studyplan WHERE id=?)';
        db.run(sql, [userId], function (err) {
            if (err) {
                console.log("errore qui");
                reject(err);
                return;
            }
            resolve(this.id);
        });
    });
};
