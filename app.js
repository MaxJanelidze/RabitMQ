const amqp = require('amqplib/callback_api');

// if the connection is closed or fails to be established at all, we will reconnect
let startWorker = null;
let startPublisher = null;
let amqpConn = null;
function Start() {
  amqp.connect('amqp://isnysdjb:DIQSzqFCJVM2PW43nEunRUCF6lxv48qr@spider.rmq.cloudamqp.com/isnysdjb', (err, conn) => {
    if (err) {
      console.error('[AMQP]', err.message);
      return setTimeout(Start, 1000);
    }
    conn.on('error', (err) => {
      if (err.message !== 'Connection closing') {
        console.error('[AMQP] conn error', err.message);
      }
    });
    conn.on('close', () => {
      console.error('[AMQP] reconnecting');
      return setTimeout(Start, 1000);
    });

    console.log('[AMQP] connected');
    amqpConn = conn;

    startWorker = require('./cons/consumer')(amqpConn);
    startPublisher = require('./pub/publisher')(amqpConn);
    whenConnected(startPublisher, startWorker);
  });
}

function whenConnected(start, work) {
  start;
  work;
}

Start();
