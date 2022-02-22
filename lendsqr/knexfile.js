require('dotenv').config()
// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  client: 'mysql2',
  connection: {
    host: '127.0.0.1',
    port: 3306,
    user: 'mysqluser',
    password: '',
    database: 'lendsqr'
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './models'
  }
};
