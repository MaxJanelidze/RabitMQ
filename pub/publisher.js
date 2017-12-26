const events = require('events');

const {result} = require('./Reader');
const config = require('../configuration/config');

const eventEmitter = new events.EventEmitter();

let pubChannel = null;
let offlinePubQueue = [];
const startPublisher = function (Connection) {
  Connection.createConfirmChannel((err, ch) => {
    if (closeOnErr(Connection, err)) return;
    ch.on('error', (err) => {
      console.error('[AMQP] channel error', err.message);
    });
    ch.on('close', () => {
      console.log('[AMQP] channel closed');
    });

    pubChannel = ch;
    eventEmitter.emit('ready');
    while (true) {
      let m = offlinePubQueue.shift();
      if (!m) break;
      publish(m[0], m[1], m[2]);
    }
  });
}

// method to publish a message, will queue messages internally if the connection is down and resend later
function publish(exchange, routingKey, content) {
  try {
    pubChannel.publish(exchange, routingKey, content, { persistent: true },
                       (err, ok) => {
                         if (err) {
                           console.error('[AMQP] publish', err);
                           offlinePubQueue.push([exchange, routingKey, content]);
                           pubChannel.connection.close();
                         }
                       });
  } catch (e) {
    console.error('[AMQP] publish2', e.message);
    offlinePubQueue.push([exchange, routingKey, content]);
  }
}


eventEmitter.on('ready', () => {
  let info = result;
  publish('', config.queue, new Buffer(info));
});

function closeOnErr(Connection, err) {
  if (!err) return false;
  console.error('[AMQP] error', err);
  Connection.close();
  return true;
}

module.exports = startPublisher;
