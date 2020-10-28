var mysql = require('mysql');
var inquirer = require('inquirer');
var cTable = require("console.table");

var connection = mysql.createConnection({
    host: "localhost",
    //port
    port: 3306,
    //username
    user: "root",
    //password
    password: "",
    //database name
    database: "employeeTracker_db"
});

function addDepartment(){
    //add department "name" to database
}

function addRole(){
    //add role "title", "salary", and its department_id
}

function addEmployee(){
    //add employee first_name, last_name, role_id, manager_id
}

function viewDep(){
    //display the departments table in the database
}

function viewRoles(){
    //display the role table
}

function viewEmployees(){
    //display the employees table
}

function updateRoles(){
    // take employee role_id and change it 
}

function displayMenu(){
    inquirer.prompt([
        {
        type: "list",
        message: "What would you like to do",
        name: "chosenActivity",
        choices: [
            "Add a Department",
            "Add a Role",
            "Add a new Employee",
            "View Departments",
            "View Roles",
            "View Employees",
            "Update Employee roles"
        ]
        }
    ]).then(answer =>{
        let choice = answer.chosenActivity;
        switch(choice){
            case "Add a Department":
                return addDepartment();
            case "Add a Role":
                return addRole();
            case "Add a new Employee":
                return addEmployee();
            case "View Departments":
                return viewDep();
            case "View Roles":
                return viewRoles();
            case "View Employees":
                return viewEmployees();
            case "Update Employee roles":
                return updateRoles();
        }
    })
}

connection.connect(function(err){
    if(err) throw err;
    console.log(`connected as id ${connection.threadID}`);
    displayMenu();
    connection.end();
})
