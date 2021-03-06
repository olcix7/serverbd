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
app.get('/get-planes', async (req, res) => {
	const VIEW = `Select * From Plane`;
	const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };

	const result = await connection.execute(VIEW, {}, options);

	console.log('result', result);
	return res.send(result.rows);
});

app.get('/add-app', async (req, res) => {
	const { idCityFrom, idCityTo, distance, flight_date, flight_time, idPlane, idPilot } = req.query;

	const options = { autoCommit: true };

	const INSERT_APP =
		`BEGIN
			 :ret := AddFlight2(:p1, :p2, :p3, TO_DATE(:p4, 'DD-MM-YYYY'), :p5, :p6, :p7);
		 END;`;

	const binds = {
		p1:  idCityFrom,
		p2:  idCityTo,
		p3:  distance,
		p4:  flight_date,
		p5:  flight_time,
		p6:  idPlane,
		p7:  idPilot,
		ret:  { dir: oracledb.BIND_OUT, type: oracledb.NUMBER, maxSize: 40 }
	};

	let result = await connection.execute(INSERT_APP, binds, options);
	console.log('result', result);

	return res.send(result.outBinds);
});

app.get('/add-reservation', async (req, res) => {
	const { idTicket, name, price } = req.query;

	const options = { autoCommit: true };

	const INSERT_REPAIR =
		`BEGIN
			 ADDRESERVATION1(:p1, :p2, :p3, :p4, :p5, :p6, :p7);
		 END;`;

	const binds = {
		p1:  price,
		p2:  0,
		p3:  name,
		p4:  '33b',
		p5:  idTicket,
		p6:  null,
		p7:  1
	};

	let result = await connection.execute(INSERT_REPAIR, binds, options);

	console.log('result', result);
	return res.send(result);
});

app.get('/view-all-res', async (req, res) => {
	const VIEW = `Select * From Reservation Where USER_ID = 1`;
	const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };

	const result = await connection.execute(VIEW, {}, options);

	console.log('result', result);
	return res.send(result.rows);
});
app.get('/view-all-users-res', async (req, res) => {
	const VIEW = `Select * From PASSENGER_DETAILS`;
	const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };

	const result = await connection.execute(VIEW, {}, options);

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
	const { idFlight } = req.query;

	const options = { autoCommit: true };

	const DELETE_APP = `Delete From Flight Where FLIGHT_ID = :p1`;

	const binds = {
		p1:  idFlight
	};

	const result = await connection.execute(DELETE_APP, binds, options);
	console.log('result', result);

	const VIEW_APP = `
			Select flight_id, distance, flight_date, flight_time, sell_tickets, plane_id,
			cityname citynameFrom, cityname citynameTo, firstname,
			lastname
			From Flight f, City c, Pilot p 
			Where f.from_city_id = c.city_id
			AND f.pilot_id = p.pilot_id
	`;
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

app.get('/pay-client', async (req, res) => {
	const { firstname } = req.query;

	const options = { autoCommit: true };

	const SQL = `
		Update passenger_details
		Set paid = 1
		Where firstname = :p1
	`;

	const binds = {
		p1:  firstname
	};

	const result = await connection.execute(SQL, binds, options);
	console.log('result', result);

	return res.send(result.rows);
});

async function connectToDatabase() {
	connection = await oracledb.getConnection(dbConfig);
}

connectToDatabase();
