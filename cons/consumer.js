const worker = require('./worker');

const config = require('../configuration/config');

// A worker that acks messages only if processed succesfully
const startWorker = function (Connection) {
  Connection.createChannel(function(err, ch) {
    if (closeOnErr(Connection, err)) return;
    ch.on('error', function(err) {
      console.error('[AMQP] channel error', err.message);
    });
    ch.on('close', function() {
      console.log('[AMQP] channel closed');
    });
    ch.prefetch(1);
    ch.assertQueue('test', { durable: true }, function(err, _ok) {
      if (closeOnErr(err)) return;
      ch.consume(config.queue, processMsg, { noAck: false });
      console.log('Worker is started');
    });

    function processMsg(msg) {
      worker(msg, function(ok) {
        try {
          if (ok)
            ch.ack(msg);
          else {
            ch.reject(msg, true);
          }
        } catch (e) {
          closeOnErr(e);
        }
      });
    }
  });
}

function closeOnErr(Connection, err) {
  if (!err) return false;
  console.error('[AMQP] error', err);
  Connection.close();
  return true;
}

module.exports = startWorker;
