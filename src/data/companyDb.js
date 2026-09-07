// Sample databases. Each has a SQL schema+seed script executed by the engine.
// company_db: main learning database with rich relationships.

export const companySchema = `
CREATE TABLE departments (
  department_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  budget INTEGER
);
CREATE TABLE employees (
  employee_id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  department_id INTEGER REFERENCES departments(department_id),
  hire_date TEXT,
  salary INTEGER,
  manager_id INTEGER REFERENCES employees(employee_id)
);
CREATE TABLE projects (
  project_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department_id INTEGER REFERENCES departments(department_id),
  start_date TEXT,
  end_date TEXT,
  budget INTEGER
);
CREATE TABLE salaries (
  salary_id INTEGER PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(employee_id),
  effective_date TEXT,
  amount INTEGER
);
CREATE TABLE employee_projects (
  employee_id INTEGER REFERENCES employees(employee_id),
  project_id INTEGER REFERENCES projects(project_id),
  role TEXT,
  PRIMARY KEY (employee_id, project_id)
);

INSERT INTO departments VALUES
 (1,'Engineering','New York',1200000),
 (2,'Sales','Chicago',600000),
 (3,'Marketing','New York',450000),
 (4,'Human Resources','Remote',300000),
 (5,'Finance','Chicago',500000);

INSERT INTO employees VALUES
 (1,'John','Smith','john.smith@corp.com',1,'2018-03-15',95000,NULL),
 (2,'Maria','Garcia','maria.garcia@corp.com',1,'2019-06-01',88000,1),
 (3,'David','Lee','david.lee@corp.com',1,'2020-01-20',72000,1),
 (4,'Sarah','Johnson','sarah.j@corp.com',2,'2017-11-05',61000,NULL),
 (5,'James','Brown','james.brown@corp.com',2,'2021-02-14',54000,4),
 (6,'Emily','Davis','emily.davis@corp.com',3,'2019-09-30',58000,NULL),
 (7,'Michael','Wilson','michael.w@corp.com',3,'2022-04-11',47000,6),
 (8,'Anna','Taylor','anna.taylor@corp.com',4,'2016-08-22',52000,NULL),
 (9,'Robert','Martinez','robert.m@corp.com',5,'2020-07-19',67000,NULL),
 (10,'Linda','Anderson','linda.a@corp.com',5,'2015-05-03',72000,9),
 (11,'Tom','Clark','tom.clark@corp.com',1,'2023-01-09',48000,2),
 (12,'Nina','Patel','nina.patel@corp.com',2,'2022-10-17',51000,4);

INSERT INTO projects VALUES
 (1,'Website Redesign',1,'2023-01-10','2023-08-30',150000),
 (2,'CRM Migration',2,'2023-03-01','2024-01-15',220000),
 (3,'Brand Campaign',3,'2023-05-20','2023-11-30',90000),
 (4,'Payroll System',5,'2022-09-01','2023-04-28',120000),
 (5,'Mobile App',1,'2023-06-15','2024-06-01',300000);

INSERT INTO employee_projects VALUES
 (1,1,'Lead'),(2,1,'Developer'),(3,1,'Developer'),
 (4,2,'Lead'),(5,2,'Analyst'),(12,2,'Analyst'),
 (6,3,'Lead'),(7,3,'Designer'),
 (9,4,'Lead'),(10,4,'Analyst'),
 (2,5,'Architect'),(3,5,'Developer'),(11,5,'Junior Developer');

INSERT INTO salaries VALUES
 (1,1,'2023-01-01',95000),(2,2,'2023-01-01',88000),(3,3,'2023-01-01',72000),
 (4,4,'2023-01-01',61000),(5,5,'2023-01-01',54000),(6,6,'2023-01-01',58000),
 (7,7,'2023-01-01',47000),(8,8,'2023-01-01',52000),(9,9,'2023-01-01',67000),
 (10,10,'2023-01-01',72000),(11,11,'2023-01-01',48000),(12,12,'2023-01-01',51000),
 (13,1,'2024-01-01',99000),(14,2,'2024-01-01',91000),(15,6,'2024-01-01',62000);
`;
