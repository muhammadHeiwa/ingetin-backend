const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Todo Reminder Project...\n');

// Step 1: Check if .env exists
console.log('1. Checking environment variables...');
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ Created .env file from .env.example');
        console.log('⚠️  Please update .env with your database credentials!');
    } else {
        console.log('⚠️  .env.example not found. Please create .env manually.');
    }
} else {
    console.log('✅ .env file already exists');
}

// Step 2: Create required directories
console.log('\n2. Creating required directories...');
const directories = [
    'src/config',
    'src/controllers',
    'src/middlewares',
    'src/models',
    'src/routes',
    'src/services',
    'src/utils',
    'src/validators',
    'src/database/migrations',
    'src/database/seeds',
    'logs'
];

directories.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
    } else {
        console.log(`✓ Directory exists: ${dir}`);
    }
});

// Step 3: Check required files
console.log('\n3. Checking required files...');
const requiredFiles = {
    'server.js': 'Server entry point',
    'src/config/app.js': 'App configuration',
    'src/config/database.js': 'Database configuration',
    'src/config/cron.js': 'Cron configuration',
    'src/routes/index.js': 'Main routes',
    'src/routes/authRoutes.js': 'Auth routes',
    'src/controllers/authController.js': 'Auth controller',
    'src/middlewares/authMiddleware.js': 'Auth middleware',
    'src/middlewares/errorHandler.js': 'Error handler',
    'src/models/User.js': 'User model',
    'src/validators/authValidator.js': 'Auth validator',
    'src/utils/response.js': 'Response utility',
    'src/utils/logger.js': 'Logger utility'
};

let missingFiles = [];
Object.entries(requiredFiles).forEach(([file, description]) => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
        console.log(`❌ Missing: ${file} (${description})`);
        missingFiles.push(file);
    } else {
        console.log(`✅ Found: ${file}`);
    }
});

// Step 4: Check dependencies
console.log('\n4. Checking dependencies...');
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const requiredDeps = [
        'express',
        'mysql2',
        'node-cron',
        'dotenv',
        'bcryptjs',
        'jsonwebtoken',
        'cors'
    ];
    
    const installedDeps = Object.keys(packageJson.dependencies || {});
    const missingDeps = requiredDeps.filter(dep => !installedDeps.includes(dep));
    
    if (missingDeps.length > 0) {
        console.log('❌ Missing dependencies:', missingDeps.join(', '));
        console.log('Run: npm install');
    } else {
        console.log('✅ All required dependencies installed');
    }
} else {
    console.log('❌ package.json not found. Run: npm init -y');
}

// Step 5: Summary
console.log('\n' + '='.repeat(50));
console.log('📋 SETUP SUMMARY');
console.log('='.repeat(50));

if (missingFiles.length > 0) {
    console.log('\n❌ Missing files:');
    missingFiles.forEach(file => console.log(`   - ${file}`));
    console.log('\n⚠️  Please create these files before running the server!');
} else {
    console.log('\n✅ All required files are present!');
}

console.log('\n📝 Next steps:');
console.log('1. Update .env with your database credentials');
console.log('2. Create database: mysql -u root -p < src/database/migrations/init.sql');
console.log('3. Run server: npm run dev');
console.log('\n✨ Setup complete!\n');