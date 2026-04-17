# LostNFound

## What is this repo about?
LostNFound is a full-stack web application designed to help users report, track, and find lost items within a community. It provides a platform to create posts for lost and found items, leave comments for updates, manage user authentication securely, and includes moderation tools to maintain community guidelines.

**Core Stack:**
- **Frontend:** React, Vite, Tailwind CSS, Radix UI
- **Backend:** Node.js, Express.js
- **Database:** SQLite (via `better-sqlite3`)

## What are the requirements of running it?
To run this project locally, ensure you have the following installed on your machine:
- **Node.js**: Version 18.x or higher is recommended.
- **Package Manager**: npm (comes with Node.js), pnpm, or yarn.

## How to set up

1. **Clone the repository:**
   Download or clone the repository to your local machine and navigate into the project directory:
   ```bash
   git clone <repository-url>
   cd S351F-LostNFound
   ```

2. **Install dependencies:**
   Install all the required frontend and backend packages using npm (or your preferred package manager):
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root of your project directory. Add any necessary variables to configure your application (e.g., `PORT`, `JWT_SECRET`):
   ```env
   PORT=3000
   # Add other required secrets here 
   ```

4. **Run the development server:**
   Start the application locally in development mode. This spins up both the Vite frontend and the Node.js Express backend:
   ```bash
   npm run dev
   ```
   You can now access the application at `http://localhost:3000` (or whatever port you specified).

5. **Building for Production (Optional):**
   If you wish to create a production-ready build and run it:
   ```bash
   # Build the Vite frontend
   npm run build
   
   # Start the production Node.js server
   npm run start
   ```
