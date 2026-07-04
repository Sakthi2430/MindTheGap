import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { createUser, getUserByEmail, createAnalysis, getAnalysesByUserId, getAnalysisById, checkDuplicateJobTitle } from './src/server-db.js';
import { analyzeSkillGap, explainSkillPriority } from './src/analyzer.js';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-123456';

app.use(express.json({ limit: '10mb' }));

// Middleware to verify JWT token
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token is missing' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }
    req.userId = (decoded as { userId: string }).userId;
    next();
  });
};

// Authentication Endpoints
app.post('/api/auth/register', async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required' });
    return;
  }

  try {
    const existing = await getUserByEmail(email);
    if (existing) {
      res.status(400).json({ error: 'Email is already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ name, email, passwordHash });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Analyses Endpoints
app.post('/api/analyses', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { resumeText, jdText, jobTitle, resumeFile } = req.body;
  const userId = req.userId!;

  if (!resumeText || !jdText || !jobTitle) {
    res.status(400).json({ error: 'Resume text, job description text, and job title are required' });
    return;
  }

  try {
    const isDuplicate = await checkDuplicateJobTitle(jobTitle, userId);
    if (isDuplicate) {
      res.status(400).json({ 
        error: `Authorship Protection: Another user in the system has already registered an active competency project under the title "${jobTitle}". To protect intellectual integrity and prevent overlap or plagiarism, please specify a unique, personalized role or project title (e.g., "${jobTitle} - Custom Assessment" or "${jobTitle} (My Profile)") to submit your analysis.` 
      });
      return;
    }

    const rawAnalysis = await analyzeSkillGap(resumeText, jdText, jobTitle, userId, resumeFile);
    const savedAnalysis = await createAnalysis(rawAnalysis);
    res.status(201).json(savedAnalysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to perform skill gap analysis: ' + (error as Error).message });
  }
});

app.get('/api/analyses', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  try {
    const list = await getAnalysesByUserId(userId);
    res.json(list);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to retrieve analysis history' });
  }
});

app.get('/api/analyses/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const id = req.params.id;

  try {
    const analysis = await getAnalysisById(id, userId);
    if (!analysis) {
      res.status(404).json({ error: 'Analysis not found' });
      return;
    }
    res.json(analysis);
  } catch (error) {
    console.error('Error fetching detail:', error);
    res.status(500).json({ error: 'Failed to retrieve analysis details' });
  }
});

app.post('/api/explain-priority', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { skillName, jobTitle, priority, reasonContext } = req.body;

  if (!skillName || !jobTitle || !priority) {
    res.status(400).json({ error: 'skillName, jobTitle, and priority are required' });
    return;
  }

  try {
    const explanation = await explainSkillPriority(skillName, jobTitle, priority, reasonContext || '');
    res.json({ explanation });
  } catch (error) {
    console.error('Explanation error:', error);
    res.status(500).json({ error: 'Failed to generate explanation: ' + (error as Error).message });
  }
});

// Initialize dev server or production static serving
async function seedDefaultUsers() {
  try {
    const defaultUser = await getUserByEmail('user@example.com');
    if (!defaultUser) {
      const passwordHash = await bcrypt.hash('user123', 10);
      await createUser({
        name: 'Demo User',
        email: 'user@example.com',
        passwordHash
      });
      console.log('Seeded default user account');
    }

    const defaultAdmin = await getUserByEmail('admin@example.com');
    if (!defaultAdmin) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await createUser({
        name: 'Demo Admin',
        email: 'admin@example.com',
        passwordHash
      });
      console.log('Seeded default admin account');
    }
  } catch (err) {
    console.error('Error seeding default users:', err);
  }
}

async function bootstrap() {
  await seedDefaultUsers();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
});
