const knex = require("knex");
const knexConfig = require("../knexfile");

class Database
{
    constructor()
    {
        this.db = knex(knexConfig)
    }
}

module.exports = new Database()