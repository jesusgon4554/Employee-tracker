var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: "localhost",
    //port
    port: 3306,
    //username
    user: "root",
    //password
    password: "Sprinkles54",
    //database name
    database: "employeeTracker_db"
});

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
    });
}

function addDepartment() {
    inquirer.prompt([
        {
            type: "input",
            message: "Enter Department Name",
            name: "userInput"
        }
    ])
    .then(answer => {
        const { userInput } = answer; 

        inquirer.prompt([
            {
                type: "list",
                message: `You entered ${userInput}. Confirm:`,
                choices: [
                    "Yes",
                    "No"
                ],
                name: "userSelection"
            }
        ])
        .then(answer => {
            const { userSelection } = answer; 

            connection.query("INSERT INTO department SET ?", {
                name: userInput
            });
        return displayMenu()
        }); 
    }); 
}

function addRole() {

    //Get all departments.
    connection.query("SELECT department.name FROM department", function(err, res) {

        let departmentNames = []; 

        //For each department, save the name of the department. 
        res.forEach(department => {
            departmentNames.push(department.name); 
        }); 

        //Select the department to add the role to. 
        inquirer.prompt([
            {
                type: "list",
                message: "Select department to add role:",
                choices: [...departmentNames],
                name: "userSelection"
            }
        ])
        .then(answer => {
            const { userSelection } = answer; 

            //Get ID for the selected department. 
            connection.query("SELECT department.id FROM department WHERE department.name =?", [userSelection], function(err, res) {

                let departmentID = Number(res[0].id); 

                //Get the title and salary for the new role. 
                inquirer.prompt([
                    {
                        type: "input",
                        message: "Enter the role:",
                        name: "titleInput"
                    },
                    {
                        type: "input",
                        message: "Enter a salary for this role:",
                        name: "salaryInput"
                    }
                ])
                .then(answers => {
                    const { titleInput, salaryInput } = answers; 

                    //Insert new role. 
                    connection.query("INSERT INTO role SET ?", {
                        title: titleInput,
                        salary: salaryInput,
                        department_id: departmentID
                    });
                    return displayMenu(); 
                }); 
            }); 
        }); 
    }); 
}

function addEmployee() {
    inquirer.prompt([
        {
            type: "input",
            message: "Enter employee's first name:",
            name: "firstNameInput"
        },
        {
            type: "input",
            message: "Enter employee's last name:",
            name: "lastNameInput"
        }
    ])
    .then(answers => {
        const { firstNameInput, lastNameInput } = answers; 

        
        connection.query("SELECT role.id, role.title FROM role", function(err, res) {

            let allRoles = []; 
            let allRoleTitles = []; 

            res.forEach(role => {
                allRoles.push({
                    roleID: role.id,
                    roleTitle: role.title
                }); 

                allRoleTitles.push(role.title); 
            }); 

            inquirer.prompt([
                {
                    type: "list",
                    message: "Select this employee's role:",
                    choices: [
                        ...allRoleTitles
                    ],
                    name: "employeeRoleChoice"
                }
            ])
    
            .then(answer => {
                const { employeeRoleChoice } = answer; 

                //Get every manager to choose from.
                connection.query("SELECT * FROM employee", function(err, res) {

                    let allEmployees = []; 
                    let allEmployeeNames = []; 

                    res.forEach(employee => {
                        allEmployees.push({
                            employeeID: employee.id,
                            employeeName: `${employee.first_name} ${employee.last_name}`
                        }); 

                        allEmployeeNames.push(`${employee.first_name} ${employee.last_name}`); 
                    }); 

                    //find manager. 
                    inquirer.prompt([
                        {
                            type: "list",
                            message: "Who is this employee's manager?",
                            choices: [
                                "None",
                                ...allEmployeeNames
                            ], 
                            name: "employeeManagerChoice"
                        }
                    ])
                    .then(answer => {
                        const { employeeManagerChoice } = answer; 

                        let employeeRole; 
                        let employeeManager; 

                        for(let i = 0; i < allRoles.length; i++) {
                            if(allRoles[i].roleTitle === employeeRoleChoice) {
                                employeeRole = allRoles[i].roleID; 
                                break; 
                            }
                        }

                        for(let i = 0; i < allEmployees.length; i++) {
                            if(allEmployees[i].employeeName === employeeManagerChoice) {
                                employeeManager = allEmployees[i].employeeID; 
                                break; 
                            }
                        }

                        if(employeeManager === undefined) {
                            employeeManager = null; 
                        }

                        //Using the collected data, create the employee. 
                        connection.query("INSERT INTO employee SET ?", {
                            first_name: firstNameInput,
                            last_name: lastNameInput,
                            role_id: employeeRole,
                            manager_id: employeeManager
                        });    
                    }); 
                }); 
            }); 
        }); 
    }); 
}

function viewDep(){
    //display the departments table in the database
    let departments = [];  

    //Get the listing preference from the user. 
    inquirer.prompt([
        {
            type: "list",
            message: "Order By:",
            choices: [
                "ID",
                "Name"
            ],
            name: "orderChoice"
        }
    ])
    .then(answer => {
        const { orderChoice } = answer; 

        let query = ""; 

        //Adjust query depending on sorting option. 
        if(orderChoice === "ID") {
            query = "SELECT department.* from department ORDER BY department.id";
        } else if(orderChoice === "Name") {
            query = "SELECT department.* from department ORDER BY department.name";
        }

        connection.query(query, function(err, res) {
    
    
            //For each department, store the ID and name. 
            res.forEach((department, key, departmentArray) => {
                departments.push({
                    "ID": department.id,
                    "Name": department.name
                }); 
            });
        });
    });
}

function viewRoles(){
    let roles = []; 

    //Get the listing preference from the user. 
    inquirer.prompt([
        {
            type: "list",
            message: "Order By:",
            choices: [
                "ID",
                "Role Title",
                "Salary",
                "Department"
            ],
            name: "orderChoice"
        }
    ])
    .then(answer => {
        const { orderChoice } = answer; 

        let query = ""; 

        //Depending on sorting preference, retrieve job roles. 
        if(orderChoice === "ID") {
            query = "SELECT role.*, department.name FROM role LEFT JOIN department ON role.department_id = department.id ORDER BY role.id";
        } else if(orderChoice === "Role Title") {
            query = "SELECT role.*, department.name FROM role LEFT JOIN department ON role.department_id = department.id ORDER BY role.title";
        } else if(orderChoice === "Salary") {
            query = "SELECT role.*, department.name FROM role LEFT JOIN department ON role.department_id = department.id ORDER BY role.salary DESC";
        } else if(orderChoice === "Department") {
            query = "SELECT role.*, department.name FROM role LEFT JOIN department ON role.department_id = department.id ORDER BY department.name";
        }

        connection.query(query, function(err, res) {
    
    
            //For each role retrieved, create the table and headings. 
            res.forEach((role, key, roleArray) => {
                roles.push({
                    "ID": role.id,
                    "Title": role.title,
                    "Salary": role.salary,
                    "Department": role.name
                });
            });
        });
    });
}

function viewEmployees(){
    //display the employees table
    let employees = []; 

    //Get the sorting preference from the user. 
    inquirer.prompt([
        {
            type: "list",
            message: "Order By:",
            choices: [
                "ID",
                "Manager",
                "Department",
                "Salary",
                "Role Title",
                "First Name",
                "Last Name"
            ],
            name: "orderChoice"
        }
    ])
    .then(answer => {
        const { orderChoice } = answer; 

        let query = ""; 

        //Choose correct query depending on sorting preference. 
        if(orderChoice === "ID") {
            query = "SELECT employee.*, role.title, role.salary, department.name FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id ORDER BY employee.id"; 
        } else if(orderChoice === "Manager") {
            query = "SELECT employee.*, role.title, role.salary, department.name FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id ORDER BY employee.manager_id"; 
        } else if(orderChoice === "Department") {
            query = "SELECT employee.*, role.title, role.salary, department.name FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id ORDER BY department.name"; 
        } else if(orderChoice === "Salary") {
            query = "SELECT employee.*, role.title, role.salary, department.name FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id ORDER BY role.salary DESC"; 
        } else if(orderChoice === "Role Title") {
            query = "SELECT employee.*, role.title, role.salary, department.name FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id ORDER BY role.title"; 
        } else if(orderChoice === "First Name") {
            query = "SELECT employee.*, role.title, role.salary, department.name FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id ORDER BY employee.first_name"; 
        } else if(orderChoice === "Last Name") {
            query = "SELECT employee.*, role.title, role.salary, department.name FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id ORDER BY employee.last_name"; 
        }

        connection.query(query, function(err, res) {
    
    
            res.forEach((employee,key,employeeArray) => {
    
                //Get this employee's manager, if any. 
                const managerQuery = "SELECT employee.first_name, employee.last_name FROM employee WHERE id = ?"; 
                connection.query(managerQuery, [employee.manager_id],function(err, res) {
            
    
                    let thisManager; 
    
                    if(res.length > 0) {
                        thisManager = `${res[0].first_name} ${res[0].last_name}`; 
                    } else {
                        thisManager = `None`; 
                    }
    
                    //Prepare the table. 
                    employees.push({
                        "ID": employee.id,
                        "First Name": employee.first_name,
                        "Last Name": employee.last_name,
                        "Title": employee.title,
                        "Department": employee.name,
                        "Salary": employee.salary,
                        "Manager": thisManager
                    }); 
                });
            });
        });
    });
}

function updateRole(){
    // take employee role_id and change it 
    let roles = []; 

    //Get all roles.
    const query = "SELECT role.*, department.name FROM role LEFT JOIN department ON role.department_id = department.id ORDER BY role.id";

    connection.query(query, function(err, res) {


        //Output all the roles for the user to choose from. 
        res.forEach(role => {
            roles.push(`${role.id}. ${role.title} (${role.name} - $${role.salary})`); 
        }); 

        inquirer.prompt([
            {
                type: "list",
                message: "Which role do you want to modify.",
                choices: [
                    ...roles
                ],
                name: "roleChoice"
            }
        ])
        .then(answer => {
            const { roleChoice } = answer; 

            //Extract the ID. 
            const roleID = Number(roleChoice.slice(0, roleChoice.indexOf("."))); 

            inquirer.prompt([
                {
                    type: "list",
                    message: "What field do you want to update?",
                    choices: [
                        "title",
                        "salary",
                        "department_id"
                    ],
                    name: "fieldToUpdate"
                }
            ])
            .then(answer => {
                const { fieldToUpdate } = answer; 

                inquirer.prompt([
                    {
                        type: "input",
                        message: `Enter the new value for ${fieldToUpdate}.`,
                        name: "newValue"
                    }
                ])
                .then(answer => {
                    const { newValue } = answer; 
        
                    //Using the input information, pass along the information to update. 
                    updateFields("role", fieldToUpdate, newValue, roleID); 
                }); 
            }); 
        }); 
    }); 
}



connection.connect(function(err){
    if(err) throw err;
    console.log(`connected as id ${connection.threadID}`);
    
    connection.end();
});


displayMenu()