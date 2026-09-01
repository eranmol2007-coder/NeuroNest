const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const BACKEND_PORT = 5000;
const FRONTEND_PORT = 5175;
const MAX_WAIT = 30000; // 30 seconds max wait

let backendProcess;
let frontendProcess;

function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, () => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForServer(port, name, maxWait = MAX_WAIT) {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWait) {
    if (await checkPort(port)) {
      console.log(`✅ ${name} is ready!`);
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  return false;
}

async function startBackend() {
  console.log('🔧 Starting backend...');
  backendProcess = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, '..', 'backend'),
    shell: true,
    stdio: 'pipe'
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`[Backend] ${data.toString().trim()}`);
  });

  return waitForServer(BACKEND_PORT, 'Backend');
}

async function startFrontend() {
  console.log('🎨 Starting frontend...');
  frontendProcess = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, '..', 'frontend'),
    shell: true,
    stdio: 'pipe'
  });

  frontendProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    console.log(`[Frontend] ${output}`);
  });

  return waitForServer(FRONTEND_PORT, 'Frontend');
}

function openBrowser() {
  const url = `http://localhost:${FRONTEND_PORT}`;
  console.log(`\n🌐 Opening ${url}...\n`);
  
  const { exec } = require('child_process');
  const platform = process.platform;
  
  const command = platform === 'win32' ? `start ${url}` :
                  platform === 'darwin' ? `open ${url}` :
                  `xdg-open ${url}`;
  
  exec(command);
}

async function start() {
  console.log('\n========================================');
  console.log('      🧠 Starting NeuroNest');
  console.log('========================================\n');

  try {
    const backendReady = await startBackend();
    if (!backendReady) {
      throw new Error('Backend failed to start');
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    const frontendReady = await startFrontend();
    if (!frontendReady) {
      throw new Error('Frontend failed to start');
    }

    console.log('\n========================================');
    console.log('      ✅ NeuroNest is Ready!');
    console.log('========================================\n');
    console.log(`Frontend: http://localhost:${FRONTEND_PORT}`);
    console.log(`Backend:  http://localhost:${BACKEND_PORT}\n`);

    await new Promise(resolve => setTimeout(resolve, 1000));
    openBrowser();

    console.log('\nPress Ctrl+C to stop the servers.\n');

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    cleanup();
    process.exit(1);
  }
}

function cleanup() {
  console.log('\n🛑 Shutting down...');
  if (backendProcess) backendProcess.kill();
  if (frontendProcess) frontendProcess.kill();
}

process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

start();
