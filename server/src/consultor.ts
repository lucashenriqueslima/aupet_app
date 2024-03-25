import * as express from 'express';
import * as util from './util';
import * as currency from 'currency-formatter';
import * as fileType from 'file-type';
import * as multer from 'multer';
import * as Jimp from 'jimp';
import * as Sentry from '@sentry/node';
import * as request from 'request';
import * as moment from 'moment';
const storage = multer.memoryStorage();
const upload = multer({ storage });
'/consultor'
export function routesConsultor() {
	const route = express.Router();
	route.get('/equipes', util.requestHandler(obterEquipes));
	route.put('/atualizar', util.requestHandler(atualizarConsultor));
	route.post('/cadastroexterno', util.requestHandler(cadastroFomularioExterno));
	return route;
}
async function atualizarConsultor(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa where id = ?`, [token.id_pessoa]);
	//ver se solicitante pode alterar consultor
	let pessoa = await util.formatDatabase(conn, 'hbrd_app_pessoa', body);
	if (pessoa.foto != undefined && !pessoa.foto?.includes('com/aupet')) pessoa.foto = await util.sendFileAws(util.base64RemoveHeader(pessoa.foto));
	if (body.senhaAtual && util.createSenhaHash(body.senhaAtual, solicitante.salt) != solicitante.senha) util.BadRequest(res, "senha atual não confere");
	else if (body.senhaAtual && body.novaSenha) {
		pessoa.salt = util.createSalt();
		pessoa.senha = util.createSenhaHash(body.novaSenha, pessoa.salt);
	} else {
		delete pessoa.salt;
		delete pessoa.senha;
	}
	let consultor = await util.formatDatabase(conn, 'hbrd_app_consultor', body.consultor);
	if (!consultor.cnh_frente?.includes('com/aupet')) consultor.cnh_frente = await util.sendFileAws(util.base64RemoveHeader(consultor.cnh_frente));
	if (!consultor.cnh_verso?.includes('com/aupet')) consultor.cnh_verso = await util.sendFileAws(util.base64RemoveHeader(consultor.cnh_verso));
	if (!consultor.rg_frente?.includes('com/aupet')) consultor.rg_frente = await util.sendFileAws(util.base64RemoveHeader(consultor.rg_frente));
	if (!consultor.rg_verso?.includes('com/aupet')) consultor.rg_verso = await util.sendFileAws(util.base64RemoveHeader(consultor.rg_verso));
	await util.dbUpdate(conn, 'hbrd_app_pessoa', `WHERE id = ${pessoa.id} `, pessoa);
	await util.dbUpdate(conn, 'hbrd_app_consultor', `WHERE id = ${consultor.id} `, consultor);
	res.status(200).send();
}
async function cadastroFomularioExterno(conn, req, res, body, params) {
	let pessoa = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa WHERE email = ?`, [body.email]);
	if (!pessoa) {
		pessoa = await util.formatDatabase(conn, 'hbrd_app_pessoa', body);
		pessoa.salt = util.createSalt();
		pessoa.senha = util.createSenhaHash(pessoa.senha, pessoa.salt);
		if (!pessoa.foto) util.BadRequest(res, "Foto do perfil necessária")
		pessoa.foto = await util.sendFileAws(util.base64RemoveHeader(pessoa.foto));
		body.id_pessoa = await util.dbInsert(conn, 'hbrd_app_pessoa', pessoa);
	} else {
		let consultor = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_consultor WHERE id_pessoa = ${pessoa.id}`, [body.email]);
		if (consultor) util.BadRequest(res, "Você ja é consultor")
		let body_pessoa = await util.formatDatabase(conn,'hbrd_app_pessoa', body);
		body_pessoa.salt = util.createSalt();
		body_pessoa.senha = util.createSenhaHash(body_pessoa.senha, body_pessoa.salt);
		if (!body_pessoa.foto) util.BadRequest(res, "Foto do perfil necessária");
		body_pessoa.foto = await util.sendFileAws(util.base64RemoveHeader(body_pessoa.foto));
		await util.dbUpdate(conn, 'hbrd_app_pessoa', ` WHERE id = ${pessoa.id}`, body_pessoa);
		body.id_pessoa = pessoa.id;
	}
	let consultor = await util.formatDatabase(conn, "hbrd_app_consultor", body);
	consultor.solicitado = 1;
	if (consultor.cnh_frente != undefined) consultor.cnh_frente = await util.sendFileAws(util.base64RemoveHeader(consultor.cnh_frente)); else throw 'Por favor envie foto da frente da cnh!'
	if (consultor.cnh_verso != undefined) consultor.cnh_verso = await util.sendFileAws(util.base64RemoveHeader(consultor.cnh_verso));else throw 'Por favor envie foto de trás da cnh!'
	if (consultor.rg_frente != undefined) consultor.rg_frente = await util.sendFileAws(util.base64RemoveHeader(consultor.rg_frente));else throw 'Por favor envie foto da frente do rg!'
	if (consultor.rg_verso != undefined) consultor.rg_verso = await util.sendFileAws(util.base64RemoveHeader(consultor.rg_verso));else throw 'Por favor envie foto de trás do rg!'
	let id_consultor = await util.dbInsert(conn, 'hbrd_app_consultor', consultor);
	res.status(200).send({ id_consultor: id_consultor });
}
async function obterEquipes(conn, req, res, body, params) {
	let equipes = await util.dbFindList(conn, `SELECT * FROM hbrd_app_equipe A WHERE delete_at IS NULL AND stats = 1`);
	res.status(200).send({ equipes: equipes });
}