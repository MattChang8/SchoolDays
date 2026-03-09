const { spawn } = require('child_process');

function spawnTask(command, args) {
  const child = spawn(command, args, {
    shell: true,
    stdio: 'inherit'
  });

  child.on('error', (error) => {
    console.error(`[dev] Failed to start ${command}:`, error.message);
  });

  return child;
}

const apiProcess = spawnTask('npm', ['run', 'start:api']);
const webProcess = spawnTask('npm', ['run', 'start']);

function shutdown() {
  if (!apiProcess.killed) {
    apiProcess.kill();
  }
  if (!webProcess.killed) {
    webProcess.kill();
  }
}

apiProcess.on('exit', (code) => {
  if (code !== 0) {
    shutdown();
    process.exit(code || 1);
  }
});

webProcess.on('exit', (code) => {
  if (code !== 0) {
    shutdown();
    process.exit(code || 1);
  }
});

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});
