const { Pool } = require('pg');

const pool = new Pool({
    user: '',
    host: 'localhost',
    database: 'reviews',
    password: '',
    port: 5432,
});

pool.connect().then(console.log('database connected using Pool')).catch((error) => {
    console.error(error.message);
});

module.exports = pool;