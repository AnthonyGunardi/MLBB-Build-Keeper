# MLBB Build Keeper

**MLBB Build Keeper** is a responsive, self-hosted web application designed for Mobile Legends players to store, manage, and publicly showcase hero build images. It emphasizes visual clarity and simplicity, treating builds as images rather than complex data structures.

## 🚀 Features

- **Visual Build Management**: Upload screenshots of your builds.
- **Strict Constraints**: Enforces a 3-build limit per hero to prevent clutter.
- **Public Access**: Read-only views for sharing builds with the community without requiring login.
- **Drag-and-Drop Reordering**: Easily organize your top 3 builds using a mobile-friendly drag-and-drop interface.
- **AI Coach**: Integrated "Virtual Coach" powered by Google Gemini to provide real-time advice on builds, counters, and gameplay strategy.
- **Image Optimization**: Automatic resizing and compression of uploaded images.
- **Security**: Rate limiting, localized file storage, and secure authentication.
- **Hero Seeding**: Admins can populate the database with heroes and images via [ridwaanhall/api-mobilelegends](https://github.com/ridwaanhall/api-mobilelegends) (unofficial MLBB API).

## 🛠️ Tech Stack

**Frontend**

- React (Vite)
- CSS Modules
- @dnd-kit (Drag & Drop)

**Backend**

- Node.js & Express
- Sequelize ORM & MySQL
- Multer (File Uploads)
- Sharp (Image Processing)
- Google GenAI SDK (AI Integration)
- JWT Authentication
- Helmet
- Express-Rate-Limit
- Winston (Logging)

## 📖 API Documentation

Detailed documentation for all API endpoints, including request/response examples, can be found in [API-Documentation.md](./API-Documentation.md).

## 📋 Prerequisites

- Node.js (v18+ recommended)
- MySQL Server
- Google Gemini API Key

## ⚙️ Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/AnthonyGunardi/MLBB-Build-Keeper.git
    cd MLBB-Build-Keeper
    ```

2.  **Install Dependencies**
    We have a convenience script to install dependencies for both root, client, and server.

    ```bash
    npm run install-all
    ```

3.  **Database Setup**
    - Create a MySQL database (e.g., `ml_build_keeper`).
    - Ensure your MySQL server is running.

4.  **Environment Configuration**
    Create a `.env` file in the `server/` directory:

    ```env
    PORT=5000
    NODE_ENV=development

    # Database Configuration
    DB_HOST=127.0.0.1
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=ml_build_keeper

    # Security
    JWT_SECRET=your_super_secret_jwt_key
    CORS_ORIGIN=http://localhost:5173

    # AI Configuration
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

## ▶️ Running the Application

To run both the Frontend (Client) and Backend (Server) concurrently:

```bash
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:5000`

## 🧪 Running Tests

Run unit and integration tests for both client and server:

```bash
npm test
```

## 📂 Project Structure

```
ml-build-keeper/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── api/            # Axios instance and interceptors
│   │   ├── assets/         # Static assets (images, icons)
│   │   ├── components/     # Reusable UI components (TechCard, TechButton)
│   │   ├── context/        # React Context (AuthContext)
│   │   ├── layouts/        # Page layouts (MainLayout)
│   │   ├── pages/          # Application pages (HomePage, Dashboard)
│   │   ├── services/       # API integration services (authService, heroService)
│   │   ├── styles/         # Global styles and design system
│   │   └── tests/          # Unit and integration tests
├── server/                 # Express Backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middlewares/    # Auth, upload, and error handling middlewares
│   │   ├── models/         # Sequelize models (User, Hero, HeroBuild)
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic layer
│   │   ├── utils/          # Utilities (Logger)
│   │   └── logs/           # Application logs
│   └── uploads/            # Local image storage
└── package.json            # Root orchestration scripts
```

## 📜 License

ISC
