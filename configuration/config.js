require('dotenv').config();
const numCores = require('os').cpus();

/**
 * @param   {mixed}   key
 * @param   {mixed}   defaultValue
 * @returns {mixed}
 */
let _getEnv = (key, defaultValue) => process.env[key] || defaultValue;

const host = _getEnv('HOST', '');
const user = _getEnv('USER', '');
const password = _getEnv('PASSWORD', '');

const amqpUrl = 'amqp://' + user + ':' + password + '@' + host + '/' + user;

const config = {
  amqpUrl: amqpUrl,
  processCount: _getEnv('PROECESS_COUNT', numCores)
};

module.exports = config;
