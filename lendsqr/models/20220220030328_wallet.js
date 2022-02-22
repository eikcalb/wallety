/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex)
{
    return knex.schema.createTable('wallet', table =>
    {
        table.increments('id')
        table.bigInteger('balance').defaultTo(0)
        table.bigInteger('previousBalance').defaultTo(0)
        table.boolean('active').defaultTo(true)
        table.string('lastTransactionReference').nullable()
        table.integer('userID').unsigned().notNullable().unique()
        table.timestamps({ defaultToNow: true, useCamelCase: true })

        table.foreign('userID').references('users.id').onDelete('RESTRICT').onUpdate('NO ACTION')
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex)
{
    return knex.schema
        .dropTable('wallet');
};
