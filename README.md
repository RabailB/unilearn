# UniLearn Platform

UniLearn is a comprehensive Learning Management System (LMS) inspired by Coursera. This platform allows students to browse courses, enroll, track progress, and provides administrators with tools to manage course content.

## Features

*   **User Authentication**: Secure login and registration with session management.
*   **Dashboard**: Dynamic display of courses with search and filtering capabilities.
*   **Course Details**: Comprehensive view of course information, enrollment status, and enrollment count.
*   **Enrollment System**: AJAX-based enrollment that updates the backend database.
*   **Progress Tracking**: "Mark as Completed" functionality using LocalStorage to persist user progress locally.
*   **Admin Panel**: Simple interface to upload new courses to the platform.
*   **Dark Mode**: A modern toggle to switch between light and dark themes.
*   **Responsive Design**: Fully responsive layout optimized for mobile and desktop.
*   **Contact Form**: Functional contact form storing messages in the database.
*   **Motivational Quotes**: API integration to display a new quote on every dashboard visit.
*   **Data Validation**: Robust client-side and backend validation for forms.

## Setup Instructions

1.  **Prerequisites**: Ensure you have Node.js installed on your machine.
2.  **Dependencies**:
    Run the following command in the project directory to install required packages:
    ```bash
    npm install
    ```
    (Dependencies: `express`, `body-parser`, `express-session`, `sqlite3`, `cors`)

3.  **Run the Server**:
    Start the application server:
    ```bash
    node server.js
    ```

4.  **Access the Application**:
    Open your browser and navigate to: [http://localhost:3000](http://localhost:3000)

## Database Schema

The project uses SQLite for ease of use and portability. The database is automatically created as `unilearn.db` upon the first run of the server. 

### Tables
*   **Users**: Stores user credentials (Name, Email, Roll No, Password).
*   **Courses**: Stores course metadata (Title, Instructor, Category, Duration, Description).
*   **Enrollments**: Links users to courses to track enrollment status.
*   **Messages**: Stores contact form submissions.

A SQL Export file `database.sql` is included in the root directory for reference or importing into other SQL databases.

## Testing Features

*   **Login**: Use the credentials `Roll No` and `Password` created during registration.
*   **Registration**: Create a new account via the "Register" link on the login page.
*   **Dark Mode**: Toggle the switch in the navbar to test the theme change.
*   **Forgot Password**: Enter a registered Roll No on the login page and click "Start Password Recovery" to (simulated) retrieve the password.
*   **Admin Upload**: Visit `/add_course.html` (link in dashboard) to add new courses.
