require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const { db, storageMode } = require('./firebaseConfig');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'jiohotstar-secret-key-2026';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================================
// CATALOG DATA (JioHotstar Movies, Shows, Specials & Live Sports)
// ============================================================================
const CATALOG = [
  {
    id: 'hs-1',
    title: 'IND vs AUS: Border-Gavaskar Trophy Live',
    category: 'Sports',
    row: 'live-sports',
    year: 'LIVE',
    rating: 'U/A 7+',
    language: 'Hindi / English',
    duration: '5th Test • Day 4',
    badge: 'LIVE',
    description: 'Catch every ball of the high-voltage clash between India and Australia live in 4K Dolby Atmos with multi-cam views.',
    poster: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=85',
    backdrop: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1800&q=85',
    videoPreview: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  },
  {
    id: 'hs-2',
    title: 'Deadpool & Wolverine',
    category: 'Movies',
    row: 'latest-releases',
    year: '2024',
    rating: 'A',
    language: 'English • Hindi • Tamil • Telugu',
    duration: '2h 8m',
    badge: '4K Dolby Vision',
    description: 'Deadpool\'s peaceful existence comes crashing down when the Time Variance Authority recruits him to help safeguard the multiverse alongside Wolverine.',
    poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=85',
    backdrop: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=1800&q=85',
    videoPreview: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
  },
  {
    id: 'hs-3',
    title: 'Taaza Khabar: Season 2',
    category: 'Specials',
    row: 'hotstar-specials',
    year: '2024',
    rating: 'U/A 16+',
    language: 'Hindi • 7 Languages',
    duration: '2 Seasons • 14 Episodes',
    badge: 'Hotstar Specials',
    description: 'Vasya\'s magical boon turns into his darkest curse when a ruthless kingpin corners him, forcing him to risk everything he loves.',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=85',
    backdrop: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1800&q=85',
    videoPreview: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
  },
  {
    id: 'hs-4',
    title: 'House of the Dragon',
    category: 'Shows',
    row: 'latest-releases',
    year: '2024',
    rating: 'A',
    language: 'English • Hindi',
    duration: '2 Seasons • HBO Original',
    badge: 'HBO Original',
    description: 'The reign of House Targaryen begins: set 200 years before the events of Game of Thrones, Targaryen civil war erupts across Westeros.',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=85',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1800&q=85',
    videoPreview: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
  },
  {
    id: 'hs-5',
    title: 'Munjya',
    category: 'Movies',
    row: 'top-10',
    rank: 1,
    year: '2024',
    rating: 'U/A 16+',
    language: 'Hindi',
    duration: '2h 3m',
    badge: 'Blockbuster',
    description: 'A young man\'s visit to his native village unveils a family secret and a vengeful spirit, Munjya, who wants to get married.',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=85',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1800&q=85'
  },
  {
    id: 'hs-6',
    title: 'The Legend of Hanuman',
    category: 'Specials',
    row: 'top-10',
    rank: 2,
    year: '2024',
    rating: 'U/A 7+',
    language: 'Hindi • Tamil • Telugu',
    duration: '5 Seasons',
    badge: 'Hotstar Specials',
    description: 'When the power-hungry Ravan tore through the world to unleash evil, in his way stood a humble vanar awoken to his divinity to become an immortal legend.',
    poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=85',
    backdrop: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1800&q=85'
  },
  {
    id: 'hs-7',
    title: 'Premier League: Arsenal vs Man City',
    category: 'Sports',
    row: 'live-sports',
    year: '2026',
    rating: 'U',
    language: 'English • Hindi',
    duration: 'Full Match Replay & Highlights',
    badge: 'Premier League',
    description: 'Relive the thrilling title showdown at the Emirates Stadium as Arsenal and Manchester City battle for top spot.',
    poster: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=85',
    backdrop: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1800&q=85'
  },
  {
    id: 'hs-8',
    title: 'Special Ops 2.0',
    category: 'Specials',
    row: 'hotstar-specials',
    year: '2025',
    rating: 'U/A 16+',
    language: 'Hindi • Tamil • Telugu',
    duration: 'New Season',
    badge: 'Hotstar Specials',
    description: 'Himmat Singh returns to spearhead a covert cyber-intelligence operation across four continents before a global financial collapse.',
    poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=85',
    backdrop: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1800&q=85'
  },
  {
    id: 'hs-9',
    title: 'Aavesham',
    category: 'Movies',
    row: 'top-10',
    rank: 3,
    year: '2024',
    rating: 'U/A 16+',
    language: 'Malayalam • Hindi • Tamil',
    duration: '2h 38m',
    badge: 'Superhit',
    description: 'Three college freshmen in Bengaluru befriend a flamboyant local gangster named Ranga to seek revenge on their seniors.',
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=85',
    backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1800&q=85'
  },
  {
    id: 'hs-10',
    title: 'Criminal Justice: Broken Behind Closed Doors',
    category: 'Specials',
    row: 'hotstar-specials',
    year: '2024',
    rating: 'U/A 16+',
    language: 'Hindi • 6 Languages',
    duration: '3 Seasons',
    badge: 'Hotstar Specials',
    description: 'Advocate Madhav Mishra takes on his most twisted courtroom battle yet when a high-profile celebrity case unravels dark secrets.',
    poster: 'https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?auto=format&fit=crop&w=800&q=85',
    backdrop: 'https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?auto=format&fit=crop&w=1800&q=85'
  },
  {
    id: 'hs-11',
    title: 'TATA IPL Classics: CSK vs MI Final',
    category: 'Sports',
    row: 'live-sports',
    year: '2025',
    rating: 'U',
    language: 'Hindi • English • Tamil • Telugu',
    duration: 'Highlights • 45m',
    badge: 'TATA IPL',
    description: 'Last-ball drama at its finest! Watch how the El Clasico of cricket went down to the final delivery in front of 100,000 roaring fans.',
    poster: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=85',
    backdrop: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1800&q=85'
  },
  {
    id: 'hs-12',
    title: 'Guardians of the Galaxy Vol. 3',
    category: 'Movies',
    row: 'latest-releases',
    year: '2023',
    rating: 'U/A 13+',
    language: 'English • Hindi • Tamil • Telugu',
    duration: '2h 30m',
    badge: 'Marvel Studios',
    description: 'Still reeling from the loss of Gamora, Peter Quill rallies his team to defend the universe and protect Rocket\'s life.',
    poster: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=85',
    backdrop: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1800&q=85'
  },
  {
    id: 'hs-13',
    title: 'Kill',
    category: 'Movies',
    row: 'top-10',
    rank: 4,
    year: '2024',
    rating: 'A',
    language: 'Hindi • English',
    duration: '1h 45m',
    badge: 'Action Thriller',
    description: 'When army commando Amrit finds out his true love Tulika is engaged against her will, he boards a New Delhi-bound train in a daring quest.',
    poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=85',
    backdrop: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1800&q=85'
  },
  {
    id: 'hs-14',
    title: 'Shōgun',
    category: 'Shows',
    row: 'latest-releases',
    year: '2024',
    rating: 'A',
    language: 'English • Japanese',
    duration: '1 Season • 10 Episodes',
    badge: 'Emmy Winner',
    description: 'In Japan in the year 1600, Lord Yoshii Toranaga is fighting for his life as his enemies on the Council of Regents unite against him.',
    poster: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=85',
    backdrop: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1800&q=85'
  }
];

// ============================================================================
// JWT AUTHENTICATION MIDDLEWARE
// ============================================================================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired session. Please log in again.' });
    }
    req.user = decoded;
    next();
  });
}

// ============================================================================
// 1. AUTHENTICATION ROUTES (Sign Up & Log In with bcryptjs + Firestore)
// ============================================================================

/**
 * POST /api/auth/signup
 * Creates a new user account in Firestore `users` collection with a bcrypt-hashed password
 */
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, phone, password, plan } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userRef = db.collection('users').doc(normalizedEmail);
    const existingDoc = await userRef.get();

    if (existingDoc.exists) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    }

    // Hash password securely using bcryptjs (10 salt rounds)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : '+91 9876543210',
      plan: plan || 'JioHotstar Premium 4K',
      passwordHash, // Stored securely as bcrypt hash ($2a$10$...)
      watchlist: ['hs-2', 'hs-3'], // Pre-seed 2 items so new user immediately sees how Watchlist works
      watchHistory: [],
      createdAt: new Date().toISOString()
    };

    await userRef.set(newUser);

    const token = jwt.sign(
      { email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        plan: newUser.plan,
        watchlist: newUser.watchlist,
        createdAt: newUser.createdAt
      }
    });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ error: 'Internal server error during sign up.' });
  }
});

/**
 * POST /api/auth/login
 * Authenticates a user against the bcrypt password hash stored in Firestore
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userDoc = await db.collection('users').doc(normalizedEmail).get();

    if (!userDoc.exists) {
      return res.status(401).json({ error: 'No account found with this email. Please sign up first.' });
    }

    const userData = userDoc.data();

    // Verify password against stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, userData.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    const token = jwt.sign(
      { email: userData.email, name: userData.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Logged in successfully!',
      token,
      user: {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        plan: userData.plan || 'JioHotstar Super',
        watchlist: userData.watchlist || [],
        createdAt: userData.createdAt
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

/**
 * GET /api/auth/me
 * Returns the currently logged-in user's profile and saved watchlist from Firestore
 */
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.email).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const userData = userDoc.data();
    res.json({
      user: {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        plan: userData.plan || 'JioHotstar Premium 4K',
        watchlist: userData.watchlist || [],
        createdAt: userData.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

/**
 * PUT /api/auth/profile
 * Updates user profile details (Name / Subscription Plan) in Firestore
 */
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, plan } = req.body;
    const userRef = db.collection('users').doc(req.user.email);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const current = userDoc.data();
    const updated = {
      name: name ? name.trim() : current.name,
      phone: phone ? phone.trim() : current.phone,
      plan: plan || current.plan
    };

    await userRef.update(updated);
    const fresh = (await userRef.get()).data();

    res.json({
      message: 'Profile updated in Firestore!',
      user: {
        name: fresh.name,
        email: fresh.email,
        phone: fresh.phone,
        plan: fresh.plan,
        watchlist: fresh.watchlist || []
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// ============================================================================
// 2. EXTRA CRUD FEATURES BEYOND AUTHENTICATION (Watchlist + Reviews + Catalog)
// ============================================================================

/**
 * GET /api/catalog
 * Returns all JioHotstar movies, shows, specials, and live sports (supports search & category filter)
 */
app.get('/api/catalog', (req, res) => {
  const { category, search } = req.query;
  let results = [...CATALOG];

  if (category && category !== 'All') {
    results = results.filter(
      (item) => item.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    results = results.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.language.toLowerCase().includes(q)
    );
  }

  res.json({ catalog: results, storageMode });
});

/**
 * GET /api/watchlist
 * Retrieves the logged-in user's saved Watchlist items from Firestore
 */
app.get('/api/watchlist', authenticateToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.email).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    const watchlistIds = userDoc.data().watchlist || [];
    const items = CATALOG.filter((movie) => watchlistIds.includes(movie.id));
    res.json({ watchlistIds, items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load watchlist.' });
  }
});

/**
 * POST /api/watchlist/toggle
 * Adds or removes a movie/show from the user's Firestore Watchlist
 */
app.post('/api/watchlist/toggle', authenticateToken, async (req, res) => {
  try {
    const { movieId } = req.body;
    if (!movieId) {
      return res.status(400).json({ error: 'movieId is required' });
    }

    const userRef = db.collection('users').doc(req.user.email);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const currentList = Array.isArray(userData.watchlist) ? [...userData.watchlist] : [];
    const index = currentList.indexOf(movieId);

    let action = 'added';
    if (index > -1) {
      currentList.splice(index, 1);
      action = 'removed';
    } else {
      currentList.unshift(movieId);
    }

    await userRef.update({ watchlist: currentList });

    const items = CATALOG.filter((movie) => currentList.includes(movie.id));
    res.json({
      message: action === 'added' ? 'Added to My Watchlist' : 'Removed from My Watchlist',
      action,
      watchlistIds: currentList,
      items
    });
  } catch (err) {
    console.error('Watchlist Toggle Error:', err);
    res.status(500).json({ error: 'Failed to update watchlist.' });
  }
});

/**
 * GET /api/reviews
 * Fetches community reviews stored in Firestore `reviews` collection
 */
app.get('/api/reviews', async (req, res) => {
  try {
    const { movieId } = req.query;
    const snapshot = await db.collection('reviews').get();
    let reviews = [];
    snapshot.docs.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });

    if (movieId) {
      reviews = reviews.filter((r) => r.movieId === movieId);
    }

    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load reviews.' });
  }
});

/**
 * POST /api/reviews
 * Creates a new movie/show review in Firestore `reviews` collection
 */
app.post('/api/reviews', authenticateToken, async (req, res) => {
  try {
    const { movieId, movieTitle, rating, comment } = req.body;
    if (!movieId || !comment) {
      return res.status(400).json({ error: 'Movie and review comment are required.' });
    }

    const reviewData = {
      movieId,
      movieTitle: movieTitle || 'JioHotstar Title',
      userEmail: req.user.email,
      userName: req.user.name,
      rating: Number(rating) || 5,
      comment: comment.trim(),
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('reviews').add(reviewData);
    res.status(201).json({
      message: 'Review posted to Firestore!',
      review: { id: docRef.id, ...reviewData }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save review.' });
  }
});

/**
 * DELETE /api/reviews/:id
 * Deletes a user's own review from Firestore
 */
app.delete('/api/reviews/:id', authenticateToken, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const reviewRef = db.collection('reviews').doc(reviewId);
    const doc = await reviewRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Review not found.' });
    }
    if (doc.data().userEmail !== req.user.email) {
      return res.status(403).json({ error: 'You can only delete your own reviews.' });
    }

    await reviewRef.delete();
    res.json({ message: 'Review deleted from Firestore.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review.' });
  }
});

// ============================================================================
// PAGE ROUTES (3 Required Pages: Home, Sign Up, Log In)
// ============================================================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 JioHotstar Full-Stack Server running at http://localhost:${PORT}`);
  console.log(`📦 Database Mode: ${storageMode}`);
});
