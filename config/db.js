const { Pool } = require('pg');
const env = require('./environment') // Load environment variables from config

const pool = new Pool({
    user: env.username,
    host: env.url,
    database: env.dbName,
    password: env.dbPassword,
    port: env.dbPort, // Use the dedicated database port
});


pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Test the database connection and log success
pool.connect()
    .then(client => {
        console.log('Connected to database');
        client.release();
    })
    .catch(err => {
        console.error('Error connecting to the database', err);
        process.exit(-1);
    });

module.exports = pool;
