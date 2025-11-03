/**
 * Script untuk debug routes
 * Run: node debug-routes.js
 */

console.log('🔍 Checking routes structure...\n');

// Utility untuk dynamic import dengan penanganan error
async function safeImport(label, path, extraCheck = null) {
  console.log(`${label}...`);
  try {
    const module = await import(path);
    console.log(`✅ ${label} loaded`);
    const exported = module.default ?? module;
    if (typeof exported === 'object') {
      console.log('   Functions:', Object.keys(exported));
    } else {
      console.log('   Type:', typeof exported);
    }

    if (extraCheck && typeof extraCheck === 'function') {
      extraCheck(exported);
    }
  } catch (error) {
    console.error(`❌ Error loading ${label}:`, error.message);
    console.error('   Stack:', error.stack);
  }
  console.log('');
}

(async () => {
  // 1. Check authController
  await safeImport('1. Checking authController', './src/controllers/authController.js');

  // 2. Check authMiddleware
  await safeImport('2. Checking authMiddleware', './src/middlewares/authMiddleware.js');

  // 3. Check authRoutes
  await safeImport('3. Checking authRoutes', './src/routes/authRoutes.js', (authRoutes) => {
    if (authRoutes && authRoutes.stack) {
      console.log(
        '   Routes:',
        authRoutes.stack.map((r) => ({
          path: r.route?.path,
          methods: r.route?.methods,
        }))
      );
    }
  });

  // 4. Check main routes
  await safeImport('4. Checking main routes', './src/routes/index.js');

  // 5. Check app config
  await safeImport('5. Checking app config', './src/config/app.js');

  console.log('\n✨ Debug completed!');
})();
