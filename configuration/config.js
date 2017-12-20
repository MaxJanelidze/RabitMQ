require('dotenv').config();
/**
 * @param   {mixed}   key
 * @param   {mixed}   defaultValue
 * @returns {mixed}
 */
let _getEnv = (key, defaultValue) => process.env[key] || defaultValue;

const config = {
  AMQP_URL: _getEnv('AMQP_URL', '')
};

module.exports = config;
