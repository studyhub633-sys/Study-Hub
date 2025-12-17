const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Remove existing api directory if it's not a symlink
if (fs.existsSync('api')) {
  try {
    const stats = fs.lstatSync('api');
    if (!stats.isSymbolicLink()) {
      console.log('Removing existing api directory...');
      fs.rmSync('api', { recursive: true, force: true });
    } else {
      console.log('api is a symlink, removing it...');
      fs.unlinkSync('api');
    }
  } catch (error) {
    console.log('Error checking api:', error.message);
  }
}

// Copy Backend/api to api
if (fs.existsSync('Backend/api')) {
  console.log('Copying Backend/api to api...');
  copyDir('Backend/api', 'api');
  console.log('✅ API files copied successfully');
} else {
  console.error('❌ Backend/api directory not found!');
  process.exit(1);
}
