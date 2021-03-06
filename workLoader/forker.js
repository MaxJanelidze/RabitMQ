const config = require('../configuration/config');

const numCores = config.processCount;

function Fork(cluster) {
  console.log(`Master: ${process.pid}`);
  for (let i = 0; i < numCores; i++) cluster.fork();

  // if a worker crashes, start a new one
  cluster.on('exit', (worker, code, signal) => {
    if (code !== 0 && !worker.exitedAfterDisconnect) {
      console.log(`Worker ${worker.id} crashed. Starting new worker...`);
      cluster.fork();
    }
  });

  process.on('SIGUSR2', () => {
    const workers = Object.values(cluster.workers);

    function restartWorker(idx) {
      const worker = workers[idx];
      if (!worker) return;

      worker.on('exit', () => {
        if (worker.exitedAfterDisconnect) {
          console.log(
            `Worker ${worker.id} (pid: ${
              worker.process.pid
            }) has been taken down. Starting new child process...`
          );
          cluster.fork().on('listening', () => {
            restartWorker(++idx);
          });
        }
      });
      worker.disconnect();
    }

    restartWorker(0);
  });
}

module.exports = {Fork};