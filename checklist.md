# 📋 Project Files Checklist

Gunakan checklist ini untuk memastikan semua file sudah dibuat dengan benar.

## ✅ Root Directory Files

- [ ] `server.js` - Entry point aplikasi
- [ ] `package.json` - NPM dependencies
- [ ] `.env` - Environment variables (dari .env.example)
- [ ] `.env.example` - Template environment variables
- [ ] `.gitignore` - Git ignore rules
- [ ] `README.md` - Project documentation
- [ ] `setup.js` - Setup script
- [ ] `debug-routes.js` - Debug routes script
- [ ] `quick-fix.js` - Quick fix script

---

## 📁 src/config/

- [ ] `app.js` - Express app configuration
- [ ] `database.js` - MySQL connection pool
- [ ] `cron.js` - Node-cron configuration

---

## 📁 src/controllers/

- [ ] `authController.js` - Authentication controller
  - register
  - login
  - getProfile
  - updateProfile
  - updatePassword
  - deleteAccount

---

## 📁 src/middlewares/

- [ ] `authMiddleware.js` - JWT authentication
  - authenticate
  - optionalAuth
- [ ] `errorHandler.js` - Global error handler

---

## 📁 src/models/

- [ ] `User.js` - User model
  - create
  - findByEmail
  - findByUsername
  - findById
  - verifyPassword
  - update
  - delete
  - emailExists
  - usernameExists

---

## 📁 src/routes/

- [ ] `index.js` - Main router
- [ ] `authRoutes.js` - Authentication routes

---

## 📁 src/validators/

- [ ] `authValidator.js` - Input validation
  - validateRegister
  - validateLogin
  - validatePasswordUpdate

---

## 📁 src/utils/

- [ ] `response.js` - Standard response format
  - successResponse
  - errorResponse
  - paginationResponse
- [ ] `logger.js` - Logging utility
  - error
  - warn
  - info
  - debug

---

## 📁 src/database/migrations/

- [ ] `init.sql` - Database schema
  - users table
  - todos table (untuk nanti)
  - todo_history table (untuk nanti)
  - user_statistics table (untuk nanti)

---

## 📁 logs/

- [ ] `error.log` - Error logs (akan dibuat otomatis)
- [ ] `combined.log` - All logs (akan dibuat otomatis)

---

## 🧪 Testing Files

- [ ] `AUTH_TESTING.md` - API testing documentation

---

## ✅ Verification Commands

Jalankan command berikut untuk verify:

```bash
# 1. Check file structure
node setup.js

# 2. Debug routes
node debug-routes.js

# 3. Quick fix
node quick-fix.js

# 4. Test server
npm run dev
```

---

## 📝 Content Verification

### server.js
```javascript
✓ require('dotenv').config()
✓ require('./src/config/app')
✓ require('./src/config/cron')
✓ require('./src/utils/logger')
✓ app.listen()
✓ process error handlers
```

### src/config/app.js
```javascript
✓ const express = require('express')
✓ const routes = require('../routes')
✓ app.use('/api', routes)
✓ errorHandler middleware
✓ module.exports = app
```

### src/routes/index.js
```javascript
✓ const express = require('express')
✓ const authRoutes = require('./authRoutes')
✓ router.use('/auth', authRoutes)
✓ module.exports = router
```

### src/routes/authRoutes.js
```javascript
✓ const express = require('express')
✓ const authController = require('../controllers/authController')
✓ const { authenticate } = require('../middlewares/authMiddleware')
✓ router.post('/register', authController.register)
✓ router.post('/login', authController.login)
✓ router.get('/profile', authenticate, authController.getProfile)
✓ router.put('/profile', authenticate, authController.updateProfile)
✓ router.put('/password', authenticate, authController.updatePassword)
✓ router.delete('/account', authenticate, authController.deleteAccount)
✓ module.exports = router
```

---

## 🚨 Common Issues

### Issue 1: "Cannot find module"
**Solution:** Check file path and name spelling

### Issue 2: "handler must be a function"
**Solution:** Check `module.exports = router` exists

### Issue 3: Database connection error
**Solution:** 
1. Check MySQL is running
2. Verify .env credentials
3. Create database: `mysql -u root -p < src/database/migrations/init.sql`

### Issue 4: JWT errors
**Solution:** Check JWT_SECRET in .env

---

## ✅ Ready to Run Checklist

Before running `npm run dev`, make sure:

- [ ] All files created
- [ ] npm install completed
- [ ] .env configured
- [ ] Database created
- [ ] MySQL running
- [ ] No syntax errors in files

---

## 🎯 Success Indicators

When server runs successfully, you should see:

```
[timestamp] [INFO] 🚀 Server running on port 3000 in development mode
[timestamp] [INFO] 📡 API Base URL: http://localhost:3000/api
[timestamp] [INFO] ✅ Database connected successfully
[timestamp] [INFO] ⏰ Cron jobs initialized
[timestamp] [INFO] ✅ Reminder cron scheduled: */5 * * * *
[timestamp] [INFO] ✅ Scheduler cron scheduled: */1 * * * *
[timestamp] [INFO] ✅ All cron jobs initialized successfully
```

Test with:
```bash
curl http://localhost:3000/health
```

Should return:
```json
{
  "success": true,
  "status": "OK",
  "timestamp": "2025-11-03T...",
  "uptime": 12.345
}
```