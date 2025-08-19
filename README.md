# Auto Memory Dolls CRUD Application

A simple Node.js web application for managing Auto Memory Dolls, clients, and letters using Oracle Database.

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the application**:
   ```bash
   npm start
   ```

3. **Access your app**:
   - Main page: http://localhost:3002
   - Admin: http://localhost:3002/admin
   - Customer form: http://localhost:3002/customer

## What's Included

- **Client Management**: Add and view customers
- **Doll Management**: Create and view Auto Memory Dolls  
- **Letter Management**: Create letters and assign to dolls
- **Admin Dashboard**: Centralized management interface
- **Oracle Database**: Full CRUD operations with sequences and triggers

## Database Setup

Make sure your Oracle database has the tables from `Stuff/OracleDB/BabyDolls_DDL_script.sql`.

## Troubleshooting

- **Port conflicts**: The app uses port 3002 by default
- **Database errors**: Check console logs for connection issues
- **Oracle client**: Uses thin mode (no installation required)

## Project Structure

```
ProjectAutoMemoryDolls/
├── Server.js              # Main server
├── index.html             # Landing page (main page)
├── customer.html          # Customer registration form
├── admin.html             # Admin dashboard
├── addDoll.html          # Add doll form
├── addLetter.html         # Add letter form
├── seeDolls.html          # View all dolls
├── seeLetters.html        # View all letters
├── seeCustomers.html      # View all customers
├── styles.css             # Application styles
└── src/                   # Backend code
    ├── config/database.js # Database configuration
    ├── utils/database.js  # Database utilities
    └── routes/api.js      # API routes
```

## Navigation

- **All pages have return back buttons** for easy navigation
- **Customer form** returns to home page
- **Admin pages** return to admin dashboard
- **Consistent navigation** throughout the application
