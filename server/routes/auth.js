import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'paperplane_auth_secret_key_12345';

// Resolve database file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE_PATH = path.join(__dirname, '../data/users.json');

// --- JSON Database Operations ---
const readUsers = () => {
  try {
    const dir = path.dirname(USERS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE_PATH)) {
      fs.writeFileSync(USERS_FILE_PATH, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(USERS_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to read users database:', err);
    return [];
  }
};

const writeUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Failed to write users database:', err);
  }
};

// --- Brute-Force Rate Limiting Middleware ---
const loginRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  message: { error: 'Too many login attempts. Please try again after 10 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- Middleware: Verify Auth Token ---
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Access Denied. Authorization token missing.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.warn('JWT verification failed:', err.message);
    return res.status(403).json({ error: 'Invalid or expired authentication token.' });
  }
};

// --- POST: REGISTER USER ---
router.post('/register', async (req, res) => {
  const { fullName, email, mobile, password } = req.body;

  // 1. Inputs validation
  if (!fullName || fullName.trim().length < 2) {
    return res.status(400).json({ error: 'Full name must be at least 2 characters.' });
  }
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }
  if (!mobile || mobile.trim().length < 8) {
    return res.status(400).json({ error: 'A valid mobile number is required.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    const users = readUsers();
    
    // Check if email already registered
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({ error: 'This email is already registered.' });
    }

    // Hash password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = {
      id: 'usr_' + Date.now() + Math.random().toString(36).substring(2, 9),
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      mobile: mobile.trim(),
      passwordHash,
      role: 'user', // Role-based access control
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeUsers(users);

    res.status(201).json({ 
      message: 'Registration successful!',
      userId: newUser.id 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// --- POST: LOGIN USER (with rate limiter) ---
router.post('/login', loginRateLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const users = readUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }

    // Compare bcrypt hashes
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }

    // Issue JWT Token (expires in 24 hours)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'user' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role || 'user',
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// --- GET: RETRIEVE USER PROFILE (Me) ---
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const users = readUsers();
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    res.status(200).json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role || 'user',
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Me endpoint error:', err);
    res.status(500).json({ error: 'Internal server error loading profile.' });
  }
});

// --- POST: UPDATE USER PROFILE ---
router.post('/update-profile', authenticateToken, async (req, res) => {
  const { fullName, mobile, newPassword } = req.body;

  if (fullName && fullName.trim().length < 2) {
    return res.status(400).json({ error: 'Full name must be at least 2 characters.' });
  }
  if (mobile && mobile.trim().length < 8) {
    return res.status(400).json({ error: 'A valid mobile number is required.' });
  }
  if (newPassword && newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    const users = readUsers();
    const index = users.findIndex(u => u.id === req.user.id);

    if (index === -1) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    // Update details
    if (fullName) users[index].fullName = fullName.trim();
    if (mobile) users[index].mobile = mobile.trim();
    
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      users[index].passwordHash = await bcrypt.hash(newPassword, salt);
    }

    writeUsers(users);

    res.status(200).json({
      message: 'Profile updated successfully!',
      user: {
        id: users[index].id,
        fullName: users[index].fullName,
        email: users[index].email,
        mobile: users[index].mobile,
        createdAt: users[index].createdAt
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Internal server error updating profile.' });
  }
});

// --- GET: LIST ALL USERS (for admin console) ---
router.get('/users', (req, res) => {
  try {
    const users = readUsers();
    const sanitized = users.map(u => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      mobile: u.mobile || '',
      subscription: u.subscription || 'free',
      createdAt: u.createdAt
    }));
    res.status(200).json({ users: sanitized });
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: 'Internal server error reading database.' });
  }
});

// --- POST: UPDATE SPECIFIC USER (for admin console) ---
router.post('/admin/update-user', async (req, res) => {
  const { userId, fullName, mobile, subscription, password } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }
  if (fullName && fullName.trim().length < 2) {
    return res.status(400).json({ error: 'Full name must be at least 2 characters.' });
  }
  if (mobile && mobile.trim().length < 8) {
    return res.status(400).json({ error: 'A valid mobile number is required.' });
  }
  if (password && password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    const users = readUsers();
    const index = users.findIndex(u => u.id === userId);

    if (index === -1) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    if (fullName) users[index].fullName = fullName.trim();
    if (mobile) users[index].mobile = mobile.trim();
    if (subscription) users[index].subscription = subscription;
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      users[index].passwordHash = await bcrypt.hash(password, salt);
    }

    writeUsers(users);
    res.status(200).json({ message: 'User account updated successfully!' });
  } catch (err) {
    console.error('Admin update user error:', err);
    res.status(500).json({ error: 'Internal server error updating user account.' });
  }
});

export default router;
