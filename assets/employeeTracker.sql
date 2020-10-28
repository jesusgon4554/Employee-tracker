DROP DATABASE IF EXISTS employeeTracker_db;
CREATE DATABASE employeeTracker_db;
USE employeeTracker_db;

CREATE TABLE employee(
id INTEGER(10) AUTO_INCREMENT NOT NULL,
first_name VARCHAR(30),
last_name VARCHAR(30),
role_id INT,
manager_id INT,
PRIMARY KEY(id)
);

CREATE TABLE department(
id INTEGER(10) AUTO_INCREMENT NOT NULL,
name VARCHAR(30),
PRIMARY KEY(id)
);

CREATE TABLE role(
id INTEGER(10) AUTO_INCREMENT NOT NULL,
title VARCHAR(30),
salary DECIMAL,
department_id INT,
PRIMARY KEY(id)
);