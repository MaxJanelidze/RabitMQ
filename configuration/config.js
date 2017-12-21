require('dotenv').config();
const numCores = require('os').cpus();

/**
 * @param   {mixed}   key
 * @param   {mixed}   defaultValue
 * @returns {mixed}
 */
let _getEnv = (key, defaultValue) => process.env[key] || defaultValue;

const config = {
  amqpUrl: _getEnv('AMQP_URL', ''),
  processCount: _getEnv('PROECESS_COUNT', numCores)
};

module.exports = config;
