// Additional sample databases for later lessons.

export const schoolSchema = `
CREATE TABLE students (
  student_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  grade INTEGER,
  city TEXT
);
CREATE TABLE teachers (
  teacher_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT
);
CREATE TABLE courses (
  course_id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  teacher_id INTEGER REFERENCES teachers(teacher_id),
  credits INTEGER
);
CREATE TABLE enrollments (
  enrollment_id INTEGER PRIMARY KEY,
  student_id INTEGER REFERENCES students(student_id),
  course_id INTEGER REFERENCES courses(course_id),
  grade_value REAL
);

INSERT INTO students VALUES
 (1,'Alice Johnson',11,'Boston'),(2,'Bob Chen',12,'New York'),
 (3,'Carol White',11,'Boston'),(4,'Dan Kim',10,'Chicago'),
 (5,'Eva Novak',12,'Boston'),(6,'Frank Ruiz',11,'Chicago');

INSERT INTO teachers VALUES
 (1,'Mr. Adams','Math'),(2,'Ms. Baker','Science'),
 (3,'Mr. Cruz','History'),(4,'Ms. Diaz','English');

INSERT INTO courses VALUES
 (1,'Algebra II',1,4),(2,'Biology',2,3),(3,'World History',3,3),(4,'Literature',4,2);

INSERT INTO enrollments VALUES
 (1,1,1,92.5),(2,1,2,88.0),(3,2,1,75.5),(4,2,3,81.0),
 (5,3,2,95.0),(6,4,3,67.0),(7,5,4,89.5),(8,5,1,84.0),
 (9,6,2,72.0),(10,6,4,78.5),(11,1,3,90.0),(12,3,4,86.0);
`;

export const shopSchema = `
CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  joined TEXT
);
CREATE TABLE products (
  product_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  price REAL,
  stock INTEGER
);
CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(customer_id),
  order_date TEXT,
  status TEXT
);
CREATE TABLE order_items (
  item_id INTEGER PRIMARY KEY,
  order_id INTEGER REFERENCES orders(order_id),
  product_id INTEGER REFERENCES products(product_id),
  quantity INTEGER
);

INSERT INTO customers VALUES
 (1,'Olivia Stone','New York','2022-02-10'),(2,'Liam Carter','Boston','2022-05-21'),
 (3,'Emma Wright','Chicago','2023-01-05'),(4,'Noah Scott','New York','2023-03-18'),
 (5,'Ava Bell','Boston','2023-07-30');

INSERT INTO products VALUES
 (1,'Laptop','Electronics',1200.00,15),
 (2,'Headphones','Electronics',150.00,40),
 (3,'Desk Chair','Furniture',220.00,25),
 (4,'Notebook','Stationery',4.50,200),
 (5,'Coffee Maker','Appliances',85.00,30),
 (6,'Monitor','Electronics',320.00,20);

INSERT INTO orders VALUES
 (1,1,'2024-01-12','shipped'),(2,2,'2024-01-20','shipped'),
 (3,1,'2024-02-03','delivered'),(4,3,'2024-02-14','pending'),
 (5,4,'2024-03-01','cancelled'),(6,5,'2024-03-09','shipped'),(7,3,'2024-03-15','delivered');

INSERT INTO order_items VALUES
 (1,1,1,1),(2,1,2,2),(3,2,6,1),(4,3,4,10),(5,3,5,1),
 (6,4,3,2),(7,5,2,1),(8,6,6,2),(9,6,4,5),(10,7,1,1),(11,7,2,1);
`;

export const librarySchema = `
CREATE TABLE authors (
  author_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT
);
CREATE TABLE books (
  book_id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  author_id INTEGER REFERENCES authors(author_id),
  year INTEGER,
  genre TEXT
);
CREATE TABLE members (
  member_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  joined TEXT
);
CREATE TABLE borrowings (
  borrow_id INTEGER PRIMARY KEY,
  book_id INTEGER REFERENCES books(book_id),
  member_id INTEGER REFERENCES members(member_id),
  borrowed_on TEXT,
  returned_on TEXT
);

INSERT INTO authors VALUES
 (1,'George Orwell','UK'),(2,'Jane Austen','UK'),(3,'Haruki Murakami','Japan'),
 (4,'Toni Morrison','USA'),(5,'Gabriel Garcia Marquez','Colombia');

INSERT INTO books VALUES
 (1,'1984',1,1949,'Dystopian'),(2,'Animal Farm',1,1945,'Satire'),
 (3,'Pride and Prejudice',2,1813,'Romance'),(4,'Kafka on the Shore',3,2002,'Fiction'),
 (5,'Beloved',4,1987,'Historical'),(6,'One Hundred Years of Solitude',5,1967,'Magical Realism');

INSERT INTO members VALUES
 (1,'Hannah Lee','2023-01-15'),(2,'Peter Fox','2023-04-02'),
 (3,'Grace Kim','2023-06-11'),(4,'Sam Ortiz','2024-01-20');

INSERT INTO borrowings VALUES
 (1,1,1,'2024-01-10','2024-01-24'),(2,3,2,'2024-02-01',NULL),
 (3,4,3,'2024-02-15','2024-03-10'),(4,5,1,'2024-03-01',NULL),
 (5,6,4,'2024-03-05','2024-04-01'),(6,2,2,'2024-03-20',NULL),
 (7,1,3,'2024-04-02',NULL);
`;
