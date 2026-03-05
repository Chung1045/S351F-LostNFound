import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Import route managers (using .cjs extension as they are CommonJS)
// Using createRequire to import CJS modules in ESM context if needed, 
// but standard import should work with .cjs extension in Node.
import authRouter from './public/server/route-manager/authRouteManager.cjs';
import postRouter from './public/server/route-manager/postRouteManager.cjs';
import commentRouter from './public/server/route-manager/commentRouteManager.cjs';
import reportRouter from './public/server/route-manager/reportRouteManager.cjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app : any = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes
  // Mount auth routes
  app.use('/api', authRouter);
  
  // Mount post routes
  app.use('/api', postRouter);
  
  // Mount comment routes
  app.use('/api', commentRouter);
  
  // Mount report routes
  app.use('/api', reportRouter);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    } else {
      console.warn('Production build not found in dist/. Please run npm run build.');
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
