// Script to fix specific ESLint issues
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
// Removed unused import
// const { execSync } = require('child_process');

// Get all TypeScript and JavaScript files in the project
const getAllFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.next')) {
      getAllFiles(filePath, fileList);
    } else if (
      stat.isFile() &&
      (filePath.endsWith('.js') ||
        filePath.endsWith('.jsx') ||
        filePath.endsWith('.ts') ||
        filePath.endsWith('.tsx') ||
        filePath.endsWith('.mjs'))
    ) {
      fileList.push(filePath);
    }
  });

  return fileList;
};

const fixSpecificFile = filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changed = false;

    // Fix: Replace `(config)` with `config` in arrow functions
    if (content.match(/\(\s*config\s*\)\s*=>/)) {
      content = content.replace(/\(\s*config\s*\)\s*=>/g, 'config =>');
      changed = true;
    }

    // Fix: Replace double quotes with single quotes
    if (content.includes("'script-loader'")) {
      content = content.replace(/\'script-loader\'/g, "'script-loader'");
      changed = true;
    }

    // Removed problematic quote fixing section

    if (changed && content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
};

// Get all files
const rootDir = process.cwd();
console.log('Scanning for files...');
const allFiles = getAllFiles(rootDir);
console.log(`Found ${allFiles.length} files to check.`);

// Fix files
let fixedCount = 0;
allFiles.forEach(file => {
  if (fixSpecificFile(file)) {
    fixedCount++;
  }
});

console.log(`Completed! Fixed ${fixedCount} files.`);

// We're not running Prettier automatically as it might cause issues
console.log('\nTo run Prettier manually, use: npx prettier --write "**/*.{js,jsx,ts,tsx,mjs}"');
console.log('Or run: npm run lint -- --fix');
