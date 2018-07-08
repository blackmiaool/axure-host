const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.cached.Database("db");

db.serialize(function() {
    db.run(
        `CREATE TABLE project (
        id INTEGER PRIMARY KEY,
        Name TEXT             
        );
    `,
        function(e) {
        }
    );
});

function getNanoSecTime() {
    return Date.now() + (process.hrtime()[1] % 1000).toString();
}
function addProject({ name: $name }) {
    return new Promise(function(resolve, reject) {
        db.serialize(function() {
            db.run(
                `INSERT INTO project (Name) VALUES ($name);`,
                {
                    $name
                },
                function(e) {
                    if (e) {
                        console.log(e);
                        reject(e);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });
    });
}
function getProjectList() {
    return new Promise(function(resolve, reject) {
        db.serialize(function() {
            db.all(`SELECT id,Name as name FROM project;`, {}, function(
                e,
                result
            ) {
                if (e) {
                    console.log(e);
                    reject(e);
                } else {
                    if (!result) {
                        reject(true);
                    } else {
                        resolve(result);
                    }
                }
            });
        });
    });
}
function deleteProject(id) {
    return new Promise(function(resolve, reject) {
        db.run(
            `DELETE FROM project WHERE id=$id;`,
            {
                $id: id
            },
            function(e, result) {
                if (e) {
                    console.log(e);
                    reject(e);
                } else {
                    resolve(result);
                }
            }
        );
    });
}
module.exports = {
    addProject,
    getProjectList,
    deleteProject
};
