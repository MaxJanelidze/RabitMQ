const fs = require('fs');
var events = require('events');

var eventEmitter = new events.EventEmitter();

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

const sendToExchange = function() {
  let info = null;
  setInterval(() => {
    fs.readFile("./package.json", (err, data) => {
      if(err) console.log(err.message);
      info = JSON.parse(data);
      publish("", "test", new Buffer(info.toString()));
    });
  }, 2000);
};

function closeOnErr(Connection, err) {
  if (!err) return false;
  console.error('[AMQP] error', err);
  Connection.close();
  return true;
}

eventEmitter.on('ready', sendToExchange);

module.exports = startPublisher;
