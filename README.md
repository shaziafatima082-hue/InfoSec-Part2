# Information Security - Practical Assignment 2 (Part 2)

## Use Case: Education Portal
This is a full-stack web application built for an Education Portal where students and admins can log in, search for users, post comments, and update their profiles.

## Tech Stack
- Backend: Node.js, Express.js
- Frontend: EJS (Embedded JavaScript templates), HTML/CSS
- Database: SQLite3

## Project Structure
- /vulnerable - Contains the intentionally vulnerable version of the application.
- /safe - Contains the hardened, secure version of the application.

## How to Run

### 1. Run the Vulnerable Version
cd vulnerable
npm install
node database.js
node app.js

### 2. Run the Safe Version
cd safe
npm install
node database.js
node app.js

## Implemented Vulnerabilities & Fixes

### 1. Cross-Site Scripting (XSS)
- Reflected XSS: The /welcome?name= route reflects unescaped input. Fix: HTML escaping applied.
- Stored XSS: Comments section stores and renders unescaped HTML. Fix: Output encoding used.
- DOM-based XSS: Client-side JavaScript uses unsafe methods. Fix: textContent used instead of innerHTML.

### 2. Cross-Site Request Forgery (CSRF)
- Vulnerable: Profile update endpoint lacks CSRF protection. Fix: Added unique CSRF tokens validated on POST requests.

### 3. SQL Injection
- Easy/Advanced: Login and Search fields are vulnerable to SQLi. Fix: Parameterized queries used.

## Seed Data
Use seed-data.sql to populate the database schema.
