/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex)
{
    return knex.schema.createTable('transaction', table =>
    {
        table.increments('id')
        table.bigInteger('amount').defaultTo(0)
        table.integer('status').unsigned().defaultTo(0)
        table.integer('type').notNullable()
        table.string('narration').notNullable()
        table.string('reference').notNullable()
        table.integer('user').unsigned().notNullable()
        table.integer('recipient').unsigned().nullable()
        table.timestamps({ defaultToNow: true, useCamelCase: true })

        table.foreign('user').references('users.id').onDelete('NO ACTION').onUpdate('NO ACTION')
        table.foreign('recipient').references('users.id').onDelete('NO ACTION').onUpdate('NO ACTION')
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex)
{
    return knex.schema
        .dropTable('transaction');
};
