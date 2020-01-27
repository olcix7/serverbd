const express = require('express');
const cors = require('cors');
const app = express();

const oracledb = require('oracledb');
const dbConfig = require('./dbconfig.js');

app.use(cors());

app.listen(4000, () => {
	console.log('listening on port 4000');
});

let connection;
const TEST = 'SELECT * From no_example';

app.get('/', (req, res) => {
	return res.send('listening...');
});

async function connectToDatabase() {
	connection = await oracledb.getConnection(dbConfig);
}
connectToDatabase();
