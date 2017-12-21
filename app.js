const cluster = require('cluster');

if (cluster.isMaster) {
  const {Fork} = require('./workLoader/forker');

  Fork(cluster);
} else {
  console.log(`Child: ${process.pid}`);
  const {Start} = require('./amqp/amqpStarter');

  Start();
}
