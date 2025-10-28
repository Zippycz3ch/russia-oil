# Russia Oil Facilities Tracker

## Quick Start

### Development (In-Memory Storage)

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Visit: http://localhost:3000  
Admin: http://localhost:3000/admin (username: `admin`, password: `admin123`)

### Production (Firebase + GitHub Pages)

See **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** for complete Firebase and GitHub Pages deployment instructions.

## Project Structure

```
russian-oil-facilities-map
├── backend
│   ├── src
│   │   ├── index.ts                # Entry point for the Express application
│   │   ├── routes
│   │   │   └── facilities.ts        # Routes for oil facilities
│   │   ├── controllers
│   │   │   └── facilitiesController.ts # Business logic for oil facilities
│   │   └── types
│   │       └── index.ts             # Type definitions for oil facilities
│   ├── package.json                  # Backend dependencies and scripts
│   └── tsconfig.json                 # TypeScript configuration for the backend
├── frontend
│   ├── src
│   │   ├── App.tsx                   # Main React component
│   │   ├── main.tsx                  # Entry point for the React application
│   │   ├── admin
│   │   │   └── Dashboard.tsx         # Admin panel for managing oil facilities
│   │   ├── components
│   │   │   └── Map.tsx               # Map component displaying oil facilities
│   │   └── types
│   │       └── index.ts              # Type definitions for the frontend
│   ├── package.json                   # Frontend dependencies and scripts
│   ├── tsconfig.json                  # TypeScript configuration for the frontend
│   └── index.html                     # Main HTML file for the React application
├── package.json                       # Root configuration for the project
└── README.md                          # Project documentation
```

## Setup Instructions

1. **Clone the repository**:

   ```
   git clone <repository-url>
   cd russian-oil-facilities-map
   ```

2. **Install dependencies**:

   - For the backend:
     ```
     cd backend
     npm install
     ```
   - For the frontend:
     ```
     cd frontend
     npm install
     ```

3. **Run the application**:
   - Start the backend server:
     ```
     cd backend
     npm start
     ```
   - Start the frontend development server:
     ```
     cd frontend
     npm run dev
     ```

## Features

- Interactive map displaying Russian oil facilities.
- Admin dashboard for managing facilities.
- RESTful API for CRUD operations on facilities.

## Usage Guidelines

- Access the admin dashboard at `/admin` after starting the frontend server.
- The map component will display the locations of oil facilities based on the data provided by the backend.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features you'd like to add.
