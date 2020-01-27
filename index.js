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

app.get('/', (req, res) => {
	return res.send('listening...');
});

app.get('/add-client', async (req, res) => {
	const { pesel, name, surname, province, city, street, houseNumber, phone } = req.query;

	const options = { autoCommit: true };

	const INSERT_CLIENT =
		`BEGIN
			 :ret := klient_add(:p1,:p2,:p3,:p4,:p5,:p6,:p7,:p8);
		 END;`;

	const binds = {
		p1:  name,
		p2:  surname,
		p3:  pesel,
		p4:  phone,
		p5:  province,
		p6:  city,
		p7:  street,
		p8:  houseNumber,
		ret:  { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 40 }
	};

	const result = await connection.execute(INSERT_CLIENT, binds, options);

	console.log('result', result);
	return res.send(result);
});

app.get('/get-city', async (req, res) => {
	const VIEW = `Select * From City`;
	const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };

	const result = await connection.execute(VIEW, {}, options);

	console.log('result', result);
	return res.send(result.rows);
});
app.get('/get-pilot', async (req, res) => {
	const VIEW = `Select * From Pilot`;
	const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };

	const result = await connection.execute(VIEW, {}, options);

	console.log('result', result);
	return res.send(result.rows);
});

app.get('/add-app', async (req, res) => {
	const { from, to, distance, flight_date, flight_time, sell_tickets, plane_id, pilot_id } = req.query;

	const options = { autoCommit: true };

	const INSERT_APP =
		`BEGIN
			 :ret := zgloszenie_add(:p1);
		 END;`;

	const binds = {
		p1:  pesel,
		ret:  { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 40 }
	};

	let result = await connection.execute(INSERT_APP, binds, options);
	const idZgloszenie = result.outBinds.ret;
	console.log('idZgloszenie', idZgloszenie);

	const bindsIns = {
		p1: idZgloszenie,
		p2: company,
		p3: category,
		p4: name,
		p5: description,
		p6: model
	};

	const bindsMiejsce = {
		p1: idZgloszenie,
		p2: province1,
		p3: city1,
		p4: street1,
		p5: houseNumber1
	};

	const bindsOdb = {
		p1: idZgloszenie,
		p2: province2,
		p3: city2,
		p4: street2,
		p5: houseNumber2
	};

	const INSTRUMENT_ADD =
		`BEGIN
			 instrument_add(:p1, :p2, :p3, :p4, :p5, :p6);
		 END;`;

	const MIEJSCE_ADD =
		`BEGIN
			 miejsce_add(:p1, :p2, :p3, :p4, :p5);
		 END;`;

	const ODBIOR_ADD =
		`BEGIN
			 odbior_add(:p1, :p2, :p3, :p4, :p5);
		 END;`;

	result = await connection.execute(INSTRUMENT_ADD, bindsIns, options);
	console.log('result1', result);
	result = await connection.execute(MIEJSCE_ADD, bindsMiejsce, options);
	console.log('result2', result);
	result = await connection.execute(ODBIOR_ADD, bindsOdb, options);
	console.log('result3', result);

	return res.send(result);
});

app.get('/add-repair', async (req, res) => {
	const { idApplication, worker, cost, time, description } = req.query;

	const options = { autoCommit: true };

	const INSERT_REPAIR =
		`BEGIN
			 zgloszenie_naprawy_add(:p1, :p2, :p3, :p4, :p5);
		 END;`;

	const binds = {
		p1:  idApplication,
		p2:  worker,
		p3:  cost,
		p4:  time,
		p5:  description
	};

	let result = await connection.execute(INSERT_REPAIR, binds, options);

	console.log('result', result);
	return res.send(result);
});

app.get('/view-workers', async (req, res) => {
	const VIEW_WORKERS = `Select * From p_pracownik`;
	const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };

	const result = await connection.execute(VIEW_WORKERS, {}, options);

	console.log('result', result);
	return res.send(result.rows);
});

app.get('/view-app', async (req, res) => {
	const VIEW_APP = `
		Select flight_id, distance, flight_date, flight_time, sell_tickets, plane_id,
			cityname citynameFrom, cityname citynameTo, firstname,
			lastname
			From Flight f, City c, Pilot p 
			Where f.from_city_id = c.city_id
			AND f.pilot_id = p.pilot_id
	`;
	const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };

	const result = await connection.execute(VIEW_APP, {}, options);

	console.log('result', result);
	return res.send(result.rows);
});

app.get('/view-all-tickets', async (req, res) => {
	const { idFlight } = req.query;

	console.log('idFlight', idFlight);
	console.log('data', typeof idFlight);

	const VIEW_APP = `Select * From Tickets Where flight_id = :p1`;
	const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };

	const binds = {
		p1: idFlight
	};

	const result = await connection.execute(VIEW_APP, binds, options);

	console.log('result', result);
	return res.send(result.rows);
});

app.get('/view-all-apps', async (req, res) => {
	const VIEW_APPS = `Select * From p_zgloszenie z, p_zgloszenie_naprawy n Where z.id_zgloszenie = n.id_zgloszenie`;
	const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };

	const result = await connection.execute(VIEW_APPS, {}, options);

	console.log('result', result);
	return res.send(result.rows);
});

app.get('/delete-app', async (req, res) => {
	const { idApplication } = req.query;

	const options = { autoCommit: true };

	const DELETE_APP = `Delete From p_zgloszenie Where id_zgloszenie = :p1`;

	const binds = {
		p1:  idApplication
	};

	const result = await connection.execute(DELETE_APP, binds, options);
	console.log('result', result);

	const VIEW_APP = `Select * From p_zgloszenie`;
	const opt = { outFormat: oracledb.OUT_FORMAT_OBJECT };

	const r = await connection.execute(VIEW_APP, {}, opt);
	return res.send(r.rows);
});

app.get('/delete-repair', async (req, res) => {
	const { idRepair } = req.query;

	const options = { autoCommit: true };

	const DELETE_APP = `Delete From p_zgloszenie_naprawy Where id_zgloszenie_naprawy = :p1`;

	const binds = {
		p1:  idRepair
	};

	const result = await connection.execute(DELETE_APP, binds, options);
	console.log('result', result);

	const VIEW_APP = `Select * From p_zgloszenie z, p_zgloszenie_naprawy n Where z.id_zgloszenie = n.id_zgloszenie`;
	const opt = { outFormat: oracledb.OUT_FORMAT_OBJECT };

	const r = await connection.execute(VIEW_APP, {}, opt);
	return res.send(r.rows);
});

app.get('/end-repair', async (req, res) => {
	const { idRepair } = req.query;

	const options = { autoCommit: true };

	const END_APP = `Update p_zgloszenie_naprawy Set czy_zrealizowane = 'TAK' Where id_zgloszenie_naprawy = :p1`;

	const binds = {
		p1:  idRepair
	};

	const result = await connection.execute(END_APP, binds, options);
	console.log('result', result);

	return res.send(result.rows);
});

// kup bilet
app.get('/pay-app', async (req, res) => {
	const { idApp } = req.query;

	const options = { autoCommit: true };

	const PAY_APP = `
		INSERT INTO Tickets(name, type, price, count, flight_id)
		VALUES('normalny', 'p', 250.0, 150, :p1)
	`;

	const binds = {
		p1:  idApp
	};

	const result = await connection.execute(PAY_APP, binds, options);
	console.log('result', result);

	return res.send(result.rows);
});

async function connectToDatabase() {
	connection = await oracledb.getConnection(dbConfig);
}

connectToDatabase();
