import * as mysql from 'mysql';
import * as nodemailer from 'nodemailer';
import * as Sentry from '@sentry/node';
import * as jwt from 'jsonwebtoken';
import * as express from 'express';
import * as qs from 'qs';
import * as request from 'request';
import * as AWS from 'aws-sdk';
import * as fileType from 'file-type';
import * as uniqid from 'uuid/v4';
import axios from 'axios';
import * as crypto from 'crypto';
import * as currency from 'currency-formatter';
export function dbExeQuery(conn: mysql.Connection, query: string, $params = []) {
	return new Promise<any>((resolve, reject) => {
		conn['reportQuery'].push(query);
		conn['reportQueryObj'].push('null');
		conn.query(query, $params, function (err, rows, fields) {
			if (err) reject(err);
			else resolve(rows);
		});
	});
}
export function dbFindOne(conn: mysql.Connection, query: string, $params = []) {
	return new Promise<any>((resolve, reject) => {
		conn['reportQuery'].push(query);
		conn['reportQueryObj'].push('null');
		conn.query(query, $params, function (err, rows, fields) {
			if (err) reject(err);
			resolve(rows && rows[0] || null);
		});
	});
}
export function dbFindList(conn: mysql.Connection, query: string, $params = []) {
	return new Promise<Array<any>>((resolve, reject) => {
		conn['reportQuery'].push(query);
		conn['reportQueryObj'].push('null');
		conn.query(query, $params, function (err, rows, fields) {
			if (err) reject(err);
			else resolve(rows || []);
		});
	});
}
export function dbInsert(conn: mysql.Connection, table: string, obj: object) {
	return new Promise<any>((resolve, reject) => {
		let query = `INSERT INTO ${table} SET ?`;
		conn['reportQuery'].push(query);
		conn['reportQueryObj'].push(obj);
		conn.query(query, obj, function (err, rows, fields) {
			if (err) reject(err);
			else resolve(rows.insertId);
		});
	});
}
export function dbInsertDuplicateKeyUpdate(conn: mysql.Connection, table: string, obj: object) {
	return new Promise<any>((resolve, reject) => {
		let fields = Object.keys(obj).reduce((x, y) => x + ',' + y);
		let duplicate = '';
		Object.keys(obj).forEach((x) => duplicate += `${x}=VALUES(${x}),`);
		duplicate = duplicate.slice(0, -1);
		let values = '';
		Object.values(obj).forEach((x) => { if (x === null) values += `NULL,`; else values += `'${x}',`; });
		values = values.slice(0, -1);
		let query = `INSERT INTO ${table} (${fields}) VALUES(${values}) ON DUPLICATE KEY UPDATE ${duplicate}`;
		conn['reportQuery'].push(query);
		conn['reportQueryObj'].push(obj);
		conn.query(query, function (err, rows, fields) {
			if (err) reject(err);
			else resolve(rows);
		});
	});
}
export function dbUpdate(conn: mysql.Connection, table: string, where: string, obj: object, $params = []) {
	return new Promise<any>((resolve, reject) => {
		let query = `UPDATE ${table} SET ? ${where}`;
		conn['reportQuery'].push(query);
		conn['reportQueryObj'].push(obj);
		$params.unshift(obj);
		conn.query(query, $params, function (err, rows, fields) {
			if (err) reject(err);
			else resolve(rows);
		});
	});
}
export function dbDelete(conn: mysql.Connection, table: string, where: string, $params = []) {
	return new Promise<any>((resolve, reject) => {
		let query = `DELETE FROM ${table} ${where}`;
		conn['reportQuery'].push(query);
		conn['reportQueryObj'].push('null');
		conn.query(query, $params, function (err, rows, fields) {
			if (err) reject(err);
			else resolve(rows);
		});
	});
}
export function queryExe(conn: mysql.Connection, query: string) {
	return new Promise<any>((resolve, reject) => {
		conn.query(query, function (err, rows, fields) {
			if (err) reject(err);
			else resolve(rows);
		})
	});
}
export function emailHandler(smtp, body) {
	return new Promise<any>((resolve, reject) => {
		let transporter = nodemailer.createTransport({
			host: smtp.email_host,
			port: smtp.email_port,
			secure: (smtp.email_port == 465),
			auth: { user: smtp.email_padrao, pass: smtp.email_password }
		});
		transporter.sendMail(body, (error, info) => {
			if (error) reject(error);
			else resolve(info);
		});
	});
}
export function requestHandler(endPoint: (conn: mysql.Connection, req: express.Request, res: express.Response, body?: any, params?: any) => void) {
	return async (req: express.Request, res: express.Response) => {
		let conn: mysql.Connection;
		let body;
		let params;
		try {
			body = await getData(req);
			params = Object.assign(req.params, req.query);
			conn = await createConnection();
			await queryExe(conn, 'START TRANSACTION');
			await endPoint(conn, req, res, body, params);
			await queryExe(conn, 'COMMIT');
		} catch (e) {
			if (e.message?.includes('email_UNIQUE')) {
				res.status(400).send('Este email ja esta sendo usado');
			} else if (e.message?.includes('cpf_UNIQUE')) {
				res.status(400).send('Este CPF ja esta sendo usado');
			} else if (e != 'cancel') {
				if (process.env.NODE_ENV == 'production') {
					res.status(500).send('Ocorreu um erro inesperado. Tente novamente mais tarde.');
					Sentry.configureScope(scope => scope.setExtra('reportQuery', conn && conn['reportQuery'] || []));
					Sentry.configureScope(scope => scope.setExtra('reportQueryObj', conn && conn['reportQueryObj'] || []));
					Sentry.configureScope(scope => scope.setExtra('extra', { 'params': Object.assign(req.params, req.query), 'body': body, 'url': req.protocol + '://' + req.get('host') + req.originalUrl }));
					Sentry.captureException(e);
				} else {
					e.sql = e?.sql?.replace(/[\n\r\t]/g, ' ');
					res.status(500).send(e);
				}
			}
			if (process.env.NODE_ENV == 'development') console.error(e);
			conn && await queryExe(conn, 'ROLLBACK');
		} finally {
			conn && conn.end();
		}
	}
}
export function handlerCron(funcao: (conn: mysql.Connection) => void) {
	return async () => {
		let conn: mysql.Connection;
		try {
			conn = await createConnection();
			await queryExe(conn, 'START TRANSACTION');
			await funcao(conn);
			await queryExe(conn, 'COMMIT');
		} catch (e) {
			if (process.env.NODE_ENV == 'production') {
				Sentry.configureScope(scope => scope.setExtra('reportQuery', conn && conn['reportQuery'] || []));
				Sentry.configureScope(scope => scope.setExtra('reportQueryObj', conn && conn['reportQueryObj'] || []));
				Sentry.captureException(e);
			}
			console.error(e);
			conn && await queryExe(conn, 'ROLLBACK');
		} finally {
			conn && conn.end();
		}
	}
}
export function createConnection() {
	return new Promise<mysql.Connection>((resolve, reject) => {
		let mysql_conf: any = { 'host': process.env.DB_HOST, 'user': process.env.DB_USERNAME, 'password': process.env.DB_PASSWORD, 'database': process.env.DB_DATABASE, 'port': process.env.DB_PORT, 'multipleStatements': true, };
		let conn = mysql.createConnection(mysql_conf);
		conn.connect(async function (err) {
			if (err) reject(err);
			else {
				if (process.env.NODE_ENV == 'production') conn.query("SET sql_mode=''");
				conn['reportQuery'] = [];
				conn['reportQueryObj'] = [];
				return resolve(conn);
			}
		});
	});
}
export function getData(req: express.Request, json = true) {
	return new Promise<any>(resolve => {
		if (req.body) resolve(req.body);
		else {
			let body = '';
			req.on('data', (chunk: any) => body += chunk);
			req.on('end', () => {
				try {
					if (json && body) resolve(JSON.parse(body));
					else resolve(body);
				} catch (e) {
					if (body.indexOf('&') != -1 || body.indexOf('=') != -1) resolve(qs.parse(body))
					else resolve(body);
				}
			});
		}
	});
}
export async function formatDatabase(conn, tableName, obj, updateObject = {}) {
	let fieldsToChange = (await dbExeQuery(conn, `SHOW COLUMNS FROM ${tableName} WHERE Field != 'create_at'`)).map(x => x.Field);
	return formatObj(obj, fieldsToChange, updateObject);
}
export function formatObj(bodyObj_: Object, fieldsToChange: Array<string>, updateObject = {}): any {
	let bodyObj = Object.assign({}, bodyObj_);
	fieldsToChange.forEach(p => { if (!isEmpty(bodyObj[p]) && typeof bodyObj[p] != 'object') updateObject[p] = bodyObj[p]; });
	return updateObject;
}
export function isEmpty(obj) {
	if (typeof obj == 'number') return false;
	else if (typeof obj == 'string') return obj.length == 0;
	else if (Array.isArray(obj)) return obj.length == 0;
	else if (typeof obj == 'object') return obj == null || Object.keys(obj).length == 0;
	else if (typeof obj == 'boolean') return false;
	else return !obj;
}
export function createToken(id_pessoa) {
	return jwt.sign({ 'id_pessoa': id_pessoa }, 'H1br1d4', { expiresIn: '1y' });
}
export async function verifyToken(access_token, res): Promise<any> {
	try {
		if (!access_token) throw 'não autorizado';
		let decode = await new Promise<any>((resolve, reject) => jwt.verify(access_token, 'H1br1d4', (err, decoded) => err ? reject(err) : resolve(decoded)));
		Sentry.configureScope(scope => scope.setUser(decode));
		return decode;
	} catch (err) {
		res.status(401).send(err);
		throw 'cancel';
	}
}
export function dateToYMD(d) {
	return d.getFullYear() + "-" + ("00" + (d.getMonth() + 1)).slice(-2) + "-" + ("00" + d.getDate()).slice(-2) + " " + ("00" + d.getHours()).slice(-2) + ":" + ("00" + d.getMinutes()).slice(-2) + ":" + ("00" + d.getSeconds()).slice(-2);
}
export function formatDate(date) {
	let data = date.split('/');
	return data[2] + '-' + data[1] + '-' + data[0];
}
export async function getHeaderLeadsZapp(conn) {
	let result = await dbFindOne(conn, `SELECT * FROM hbrd_adm_integration`);
	return { headers: { 'X-API-KEY': result.leadszapp_token } } as any;
}
export async function sendLeadszApp(conn, id_pessoa, messagem) {
	let req = await getHeaderLeadsZapp(conn);
	let integracao = await dbFindOne(conn, `SELECT * FROM hbrd_adm_integration`);
	let pessoa = await dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa where id = ${id_pessoa}`);
	req.method = 'POST';
	req.url = 'https://hub.leadszapp.com/api/v1/whatsapp/send';
	req.json = { "bot": integracao.leadszapp_bot, "contact": { "first_name": pessoa.nome, "last_name": "", "mobile_phone": "55" + pessoa.telefone.replace(/[ ()-]/g, '') }, "messages": [messagem] };
	if (process.env.NODE_ENV == 'production') request(req, function (error, response, body) { });
}
export function BadRequest(res, msg) {
	res.status(400).send(msg);
	throw 'cancel';
}
function configS3() {
	return {
		endpoint: 'https://nyc3.digitaloceanspaces.com',
		region: 'nyc3',
		credentials: {
			accessKeyId: process.env.SPACES_ACCESS_KEY,
			secretAccessKey: process.env.SPACES_ACCESS_SECRET
		}
	}
};
export async function sendFileAws(fileBase64, folder?, key?) {
	var s3 = new AWS.S3(configS3());
	let hash = getHash(22);
	// ver o tipo
	var file = Buffer.from(fileBase64, 'base64');
	let type = fileType(file);
	let ext = type.ext;
	var keyName = 'aupet/' + hash + '.' + ext;
	if (key) await deleteObjectAWS(key);
	keyName = keyName.toLowerCase();
	return await new Promise((resolve, reject) => {
		s3.putObject({
			'ACL': 'public-read',
			'ContentType': type.mime,
			Bucket: 'aupetheinsten',
			Key: keyName,
			Body: file,
		}, function (err, data) { if (err) reject(err); else resolve(`https://aupetheinsten.nyc3.digitaloceanspaces.com/${keyName}`); })
	});
}
export async function sendFileAws2(input) {
	var s3 = new AWS.S3(configS3());
	let hash = getHash(22);
	// ver o tipo
	var file = Buffer.from(input.buffer)
	let type = fileType(file);
	let ext = type.ext;
	var keyName = 'aupet/' + hash + '.' + ext;
	keyName = keyName.toLowerCase();
	return await new Promise((resolve, reject) => {
		s3.putObject({
			'ACL': 'public-read',
			'ContentType': type.mime,
			Bucket: 'aupetheinsten',
			Key: keyName,
			Body: file,
		}, function (err, data) { if (err) reject(err); else resolve(`https://aupetheinsten.nyc3.digitaloceanspaces.com/${keyName}`); })
	});
}

export async function sendFileAws3(input) {
	var s3 = new AWS.S3(configS3());
	let hash = getHash(22);
	// ver o tipo
	var file = Buffer.from(input)
	let type = fileType(file);
	let ext = type.ext;
	var keyName = 'aupet/' + hash + '.' + ext;
	keyName = keyName.toLowerCase();
	return await new Promise((resolve, reject) => {
		s3.putObject({
			'ACL': 'public-read',
			'ContentType': type.mime,
			Bucket: 'aupetheinsten',
			Key: keyName,
			Body: file,
		}, function (err, data) { if (err) reject(err); else resolve(`https://aupetheinsten.nyc3.digitaloceanspaces.com/${keyName}`); })
	});
}

export async function sendFilePdf(obj, input) {
	var s3 = new AWS.S3(configS3());
	// ver o tipo
	var file = Buffer.from(input.buffer)
	let type = fileType(file);
	let ext = type.ext;
	var keyName = 'aupet/carterinha/' + obj.hash + '.' + ext;
	keyName = keyName.toLowerCase();
	return await new Promise((resolve, reject) => {
		s3.putObject({
			'ACL': 'public-read',
			'ContentType': type.mime,
			Bucket: 'aupetheinsten',
			Key: keyName,
			Body: file,
		}, function (err, data) { if (err) reject(err); else resolve(`https://aupetheinsten.nyc3.digitaloceanspaces.com/${keyName}`); })
	});
}
export async function deleteObjectAWS(keyName) {
	var s3 = new AWS.S3(configS3());
	keyName = keyName.toLowerCase();
	if (process.env.NODE_ENV != 'production') return;
	await new Promise<void>((resolve, reject) => { s3.deleteObject({ Bucket: 'aupetheinsten', Key: keyName }, function (err, data) { if (err) reject(err); else resolve(); }) });
}
export async function getObjectAws(key, folder?): Promise<any> {
	var s3 = new AWS.S3(configS3());
	var keyName = 'aupet/' + key;
	keyName = keyName.toLowerCase();
	return await new Promise((resolve, reject) => { s3.getObject({ Bucket: "aupetheinsten", Key: keyName, ResponseContentEncoding: '' }, function (err, data) { if (err) reject(err); else resolve(data.Body.toString()); }) });
}
export function base64RemoveHeader(base64) {
	if (typeof base64 == 'object') base64 = base64.changingThisBreaksApplicationSecurity || base64;
	return base64.toString().split(';base64,')[1];
}
export function getHash(size = 12) {
	return uniqid().replaceAll('-', '').substring(0, size);
}
export async function enviarNotificacao(conn, id_pessoa, mensagem, titulo = '', url = '') {
	const pessoa = await dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa WHERE id = ${id_pessoa}`);
	const registration_ids = await dbFindList(conn, `SELECT token FROM hbrd_app_pessoa_pushtoken WHERE id_pessoa = ${pessoa.id}`);
	if (!registration_ids) return;
	titulo = (titulo) ? titulo : `Olá ${pessoa.nome},`;
	let body = { "data": { "title": titulo, "body": mensagem, "url": url }, "registration_ids": registration_ids.map(x => x.token) };
	let header = { headers: { "Authorization": "key=AAAABIetYCo:APA91bF737bAtdDU21dQwllzr6Cn6DSM-P17n7GdsbJQ27QgBK9bi48IOdCncC7nW4p36JIOSBYWgOzBzoz4ZE-R2XID-KCDagJx4EmItd24onMCPW127t8qmiPnYNk8TF3uSayx4dVq", "Content-Type": "application/json" } }
	axios.post(`https://fcm.googleapis.com/fcm/send`, body, header);
}
export function formatCurrency(x) {
	try {
		return currency.format(String(x), { code: 'BRL' });
	} catch (e) {
		console.error(e);
		return x;
	}
}
//#region extension
declare global {
	interface String {
		replaceAll(search, replacement): string;
	}
	interface Object {
		entries(obj: any): any;
	}
	interface Number {
		arredonda(): Number;
	}
}
if (!('multidelete' in Object.prototype)) {
	Object.defineProperty(Object.prototype, 'multidelete', {
		value: function () {
			for (var i = 0; i < arguments.length; i++) {
				delete this[arguments[i]];
			}
		}
	});
}
String.prototype.replaceAll = function (search, replacement) {
	var target = this;
	return target.split(search).join(replacement);
}
Number.prototype.arredonda = function () {
	var num = this;
	return Number(Number(num).toFixed(2));
}
//#endregion extension
export enum user_table { consultor, indicador, vistoriador };
export function createSalt() {
	let min = Math.ceil(0);
	let max = Math.floor(2147483647);
	return Math.floor(Math.random() * (max - min)) + min;
}
export function createSenhaHash(senha, salt) {
	return crypto.createHash('sha512').update(salt + senha).digest('hex');
}
export function createHashMD5(string) {
	return crypto.createHash('md5').update(string).digest('hex');
}
