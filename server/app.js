const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');
const { errorHandler } = require('./middleware/errorMiddleware');

const sentryEnabled = Boolean(process.env.SENTRY_DSN);
if (sentryEnabled) Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [nodeProfilingIntegration()],
  sendDefaultPii: false,
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
  profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE || 0.1),
});

const app = express();
if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);

// 2. Security Headers & CORS
app.use(helmet());
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:8080').split(',').map(value => value.trim());
app.use(cors({ origin: allowedOrigins }));

// 3. Request Logging
if (process.env.NODE_ENV !== 'test') app.use(morgan('combined'));

// 4. Upload Limits (5mb to support vision/meal photo feature without memory exhaustion)
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: false, limit: '5mb' }));

// 5. Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Limit each IP to 150 requests per window
  skip: req => req.path === '/health',
  message: { error: 'Too many requests from this IP, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 auth requests per hour
  message: { error: 'Too many authentication attempts.' }
});

app.use('/api/', globalLimiter);
app.use('/api/auth/', authLimiter);

// 6. Deployment Health Check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const isHealthy = dbStatus === 1;
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 7. Core Routes
for (const name of ['auth', 'chat', 'profile', 'diet', 'dashboard', 'vision', 'exercises', 'workouts']) {
  app.use('/api/' + name, require('./routes/' + name));
}

app.get('/', (req, res) => res.json({ status: 'ok' }));
app.use((req, res) => res.status(404).json({ error: 'Endpoint not found' }));

// 8. Error Tracking & Handling
if (sentryEnabled) Sentry.setupExpressErrorHandler(app);
app.use(errorHandler);

module.exports = app;
