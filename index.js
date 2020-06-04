const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { pool } = require('./config')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'  //to understand this see stackoverflow reference in readme.md

//get all employees
app.get('/employees', (request, response) => {
    let sql = "SELECT e.id, e.firstname, e.lastname, e.email, r.name AS role, d.name AS department FROM employee AS e JOIN role AS r ON e.emp_role_id = r.id JOIN department AS d ON e.emp_department_id = d.id";
    let query = pool.query(sql, (error, results) => {
        if (error) throw error;
        response.status(200).json(results.rows);
    });
});

//get employee with specific id
app.get('/employees/:id', (request, response) => {
    //contains a join query to fetch data from 3 tables employee, role and department
    let sql = "SELECT e.id, e.firstname, e.lastname, e.email, r.name AS role, d.name AS department FROM employee AS e JOIN role AS r ON e.emp_role_id = r.id JOIN department AS d ON e.emp_department_id = d.id WHERE e.id=" + request.params.id;
    pool.query(sql, (error,results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
    });
});

//create new employee
app.post('/addemployee', (request, response) => {
    response.setHeader("Content-Type","application/json");
    const { firstname, lastname, email, emp_role_id, emp_department_id } = request.body
    let sql = 'INSERT INTO employee (firstname, lastname, email, emp_role_id, emp_department_id) VALUES ($1, $2, $3, $4, $5)';
    pool.query(sql,[firstname, lastname, email, emp_role_id, emp_department_id], error => {
        if (error) {
            throw error
        }
        response.status(201).json({ status: 'success', message: 'employee added.' })
    })
});

// Start server
//process.env.PORT is added so that in production Heroku can supply its own port
//3000 will be used only on local machine
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server listening`)
})