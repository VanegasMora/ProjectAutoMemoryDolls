# Auto Memory Doll - Application Documentation

##What is this application?

This is a **web application** that helps manage a service where people can request letters to be written for them. Think of it like a digital system for a letter-writing service where:

- **Clients** can register and request letters
- **Dolls** (the letter writers) are assigned to write letters
- **Letters** are created and tracked through different stages

## How the application is organized

The application has **3 main parts**:

### 1. **Frontend **

- HTML files that create the user interface
- CSS file that makes everything look nice
- JavaScript that makes the pages interactive

### 2. **Backend **

- `Server.js` - The main server that handles all requests
- Connects to an Oracle database to store information

### 3. **Database (Information storage)**

- Stores all the data about clients, dolls, and letters

## 📁 File Structure

```
ProjectAutoMemoryDolls/
├── HTML Files (User Interface)
│   ├── landing.html          - Welcome page
│   ├── index.html            - Client registration form
│   ├── admin.html            - Admin dashboard
│   ├── addDoll.html          - Add new doll form
│   ├── addLetter.html        - Add new letter form
│   ├── seeCustomers.html     - View and manage clients
│   ├── seeDolls.html         - View and manage dolls
│   └── seeLetters.html       - View and manage letters
├── Server.js                 - Main server file
├── styles.css                - Design and styling
├── package.json              - Project configuration
└── Stuff/
    └── OracleDB/             - Database setup files
```

## Main Features

### **For Clients (Regular Users)**

1. **Register** - Fill out a form with their information
2. **Request Letters** - Ask for letters to be written

### **For Administrators**

1. **Manage Clients** - View, edit, and delete client information
2. **Manage Dolls** - Add, edit, and delete letter-writing dolls
3. **Manage Letters** - Track letter progress and status

## How to Start the Application

### **Step 1: Install Dependencies**

```bash
npm install
```

### **Step 2: Start the Server**

```bash
npm start
```

### **Step 3: Open in Browser**

Go to: `http://localhost:3000`

## 📊 Database Tables

The application uses **3 main tables**:

### **CLIENT Table**

Stores information about people who request letters:

- `id` - Unique identifier
- `name` - Client's full name
- `phone` - Phone number
- `city` - City where they live
- `email` - Email address
- `address` - **Actually stores the reason for the letter** (we reused this field)

### **AUTO_MEMORY_DOLL Table**

Stores information about the letter writers:

- `id` - Unique identifier
- `name` - Doll's name
- `age` - Doll's age
- `doll_status_id` - Current status (1 = Available)

### **LETTER Table**

Stores information about letters:

- `id` - Unique identifier
- `letter_date` - When the letter was requested
- `content_summary` - Brief description of what the letter should say
- `client_id` - Which client requested it
- `auto_memory_doll_id` - Which doll is writing it
- `letter_status_id` - Current status (1 = Draft, 2 = In Progress, 3 = Completed)

## 🌐 How the Application Works

### **1. Client Registration Process**

```
User fills form → Server receives data → Data saved to CLIENT table → Success message
```

**What happens:**

1. User goes to the registration page (`index.html`)
2. Fills out their information (name, phone, city, email, letter reason)
3. Clicks submit
4. Server saves this information to the database
5. User gets a success message

### **2. Letter Creation Process**

```
Client requests letter → System finds available doll → Letter created → Doll assigned
```

**What happens:**

1. Client fills out letter request form (`addLetter.html`)
2. System looks for a doll that has less than 5 letters assigned
3. Creates a new letter record
4. Assigns the letter to an available doll
5. Client gets confirmation with doll ID

### **3. Admin Management Process**

```
Admin views tables → Can edit/delete records → Changes saved to database → Page refreshes
```

**What happens:**

1. Admin goes to management pages (seeCustomers, seeDolls, seeLetters)
2. Views all records in organized tables
3. Can click edit to modify information
4. Can click delete to remove records
5. All changes are immediately saved to the database

## 🔒 Security Features

### **Letter Deletion Protection**

- **Only Draft letters can be deleted** (status = 1)
- **In Progress or Completed letters cannot be deleted**
- This prevents accidentally deleting important work

### **Form Validation**

- All required fields must be filled
- Email format is checked
- Phone numbers are validated

## 💻 Technical Details (Simplified)

### **Server Technology**

- **Node.js** - The programming language that runs the server
- **Express.js** - A framework that makes it easy to handle web requests
- **Oracle Database** - Where all the information is stored

### **Frontend Technology**

- **HTML** - Creates the structure of the pages
- **CSS** - Makes everything look beautiful and organized
- **JavaScript** - Makes the pages interactive (forms, buttons, tables)

## API Endpoints (What the server can do)

### **Client Management**

- `POST /submit-form` - Create new client
- `GET /api/customers` - Get all clients
- `PUT /api/customers/:id` - Update client information
- `DELETE /api/customers/:id` - Delete client

### **Doll Management**

- `POST /add-doll` - Create new doll
- `GET /api/dolls` - Get all dolls
- `PUT /api/dolls/:id` - Update doll information
- `DELETE /api/dolls/:id` - Delete doll

### **Letter Management**

- `POST /add-letter` - Create new letter
- `GET /api/letters` - Get all letters
- `PUT /api/letters/:id` - Update letter information
- `DELETE /api/letters/:id` - Delete letter (only if Draft status)

## 🎨 User Interface Features

### **Responsive Design**

- Works on computers, tablets, and phones
- Clean, modern look with good spacing
- Easy-to-read fonts and colors

### **Interactive Elements**

- **Modals** - Pop-up windows for editing information
- **Tables** - Organized display of all information
- **Forms** - Easy input of new information
- **Buttons** - Clear actions for users to take

### **Navigation**

- **Back buttons** - Easy way to return to previous pages
- **Admin dashboard** - Central hub for all management tasks
- **Consistent layout** - Same design across all pages

## 🔍 Common User Scenarios

### **Scenario 1: New Client Wants a Letter**

1. Client visits the website
2. Clicks "Register" or goes to registration form
3. Fills out their information and letter reason
4. Submits the form
5. Gets confirmation that they're registered
6. Can now request letters

### **Scenario 2: Admin Managing the System**

1. Admin logs into the system
2. Views current clients, dolls, and letters
3. Adds new dolls if needed
4. Monitors letter progress
5. Edits information if there are mistakes
6. Deletes old or incorrect records

### **Scenario 3: Letter Processing**

1. Client requests a letter
2. System automatically finds an available doll
3. Letter is created with "Draft" status
4. Doll can start working on the letter
5. Status changes to "In Progress"
6. When complete, status changes to "Completed"

## 🛠️ Troubleshooting

### **Common Issues and Solutions**

#### **Server won't start**

- Make sure you have Node.js installed
- Check that all dependencies are installed (`npm install`)
- Verify the database connection details

#### **Database connection errors**

- Check if the Oracle database is running
- Verify username and password are correct
- Make sure the network connection is working

#### **Forms not submitting**

- Check that all required fields are filled
- Make sure the server is running
- Check browser console for error messages

#### **Tables not loading data**

- Verify the database has data
- Check that the server is running
- Look for error messages in the browser console
