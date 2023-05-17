const express = require('express');
const { Client } = require('pg');

const client = new Client({
  user: 'ryanzambrano',
  host: 'testdb.ce4ejzotvcbi.us-east-2.rds.amazonaws.com',
  database: 'postgres',
  password: 'HoneymoonIsland587',
  port: 5432
});

const app = express();
app.use(express.json());

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

client.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Client is connected');
  }
});

app.get('/postgres/users', async (req, res) => {
  console.log('recieved get request');
  try {
    const result = await client.query('SELECT * FROM users');
    console.log('Query executed successfully');
    res.send(result.rows);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal Server Error');
  }
});

