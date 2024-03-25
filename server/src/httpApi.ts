import * as express from 'express';
import { dbFindOne, requestHandler, dbFindList, dbExeQuery, emailHandler } from './util';
import * as util from './util';
import * as cripto from './cripto';
import { server_conf } from './';
import { convert } from 'convert-svg-to-png';
import moment = require('moment');
export function routesHttp() {
	const route = express.Router();
	route.post('/savePNT', requestHandler(savePushNotificationtoken));
	route.post('/convertSVG', convertSVG);
	route.get('/verifyVersion', verifyVersion);
	route.get('/getStates', requestHandler(getStates));
	route.get('/getEquipes', requestHandler(getEquipes));
	route.get('/getRaca/:id_especie', requestHandler(getRaca));
	route.get('/getPlanos', requestHandler(getPlanos));
	route.get('/getPlano/:id', requestHandler(getPlano));
	route.get('/getPlanoPagamento/:id', requestHandler(getPlanoPagamento));
	route.get('/getEspecies', requestHandler(getEspecies));
	route.get('/getCities/:id_estado', requestHandler(getCities));
	route.get('/getMotivosCancelamento', requestHandler(getMotivosCancelamento));
	route.get('/getMotivosArquivamento', requestHandler(getMotivosArquivamento));
	route.post('/esqueciSenha', requestHandler(forgotPass));
	route.get('/getBeneficios', requestHandler(getBeneficios));
	route.get('/getPlanoBeneficios/:id', requestHandler(getPlanoBeneficios));
	route.get('/getSituacoes', util.requestHandler(getSituacoes));
	route.get('/getEspecialidades', util.requestHandler(getEspecialidades));
	route.get('/getTipoTratamentos/:id_especie', util.requestHandler(getTipoTratamentos));
	route.get('/getTexto/:id', util.requestHandler(getTexto));
	route.get('/getTermo/:id', util.requestHandler(getTermo));
	route.get('/getKeyPublic', requestHandler(getKeyPublic));
	route.post("/login", requestHandler(login));
	route.post("/reativarUsuario",requestHandler(reactiveUser));
	return route;
}
async function convertSVG(req, res) {
	try {
		let body = await util.getData(req, false);
		let params = Object.assign(req.params, req.query);
		if (!body || !params.h || !params.w) return res.status(400).send('Parametros inválidos');
		const png = await convert(body, { height: params.h, width: params.w });
		let a = png.toString('base64');
		res.send(a);
	} catch (e) {
		res.status(500).send(e);
	}
}
async function verifyVersion(req, res) {
	res.status(200).send({ version: server_conf.appVersion });
}
async function getStates(conn, req, res, body) {
	let result = await dbFindList(conn, 'SELECT * FROM hbrd_main_util_state ORDER BY estado');
	res.status(200).send(result);
}
async function getEquipes(conn, req, res, body) {
	let result = await dbFindList(conn, 'SELECT * FROM hbrd_app_equipe where stats=1 ORDER BY id');
	res.status(200).send(result);
}
async function getRaca(conn, req, res, body, params) {
	let where = params.id_especie != 0 ? `WHERE id_especie = '${params.id_especie}'` : '';
	let result = await dbFindList(conn, `SELECT * FROM hbrd_app_pet_raca ${where} ORDER BY titulo`);
	res.status(200).send(result);
}
async function getEspecies(conn, req, res, body) {
	let result = await dbFindList(conn, 'SELECT * FROM hbrd_app_pet_especie');
	res.status(200).send(result);
}
async function getPlanos(conn, req, res, body) {
	// let result = await dbFindList(conn, 'SELECT * FROM hbrd_app_planos WHERE delete_at IS NULL AND stats = 1 ORDER BY valor');
	let result = await dbFindList(conn, 'SELECT A.*, (SELECT GROUP_CONCAT(id_beneficio) FROM hbrd_app_plano_use_beneficio WHERE id_plano = A.id) as beneficios FROM hbrd_app_planos A WHERE A.delete_at IS NULL AND A.stats = 1 ORDER BY A.ordem');
	res.status(200).send(result);
}
async function getPlano(conn, req, res, body, params) {
	// let result = await dbFindList(conn, 'SELECT * FROM hbrd_app_planos WHERE delete_at IS NULL AND stats = 1 ORDER BY valor');
	let result = await dbFindList(conn, `SELECT 
		A.*, (SELECT GROUP_CONCAT(id_beneficio) 
		FROM hbrd_app_plano_use_beneficio WHERE id_plano = A.id) as beneficios 
		FROM hbrd_app_planos A 
		WHERE A.delete_at IS NULL AND A.stats = 1 AND A.id = ${params.id} ORDER BY valor`);
	res.status(200).send(result);
}
async function getPlanoPagamento(conn, req, res, body, params) {
	let plano = await dbFindOne(conn, `SELECT * FROM hbrd_app_planos A WHERE  A.id= ${params.id}`);
	plano.beneficios = await dbFindList(conn, `SELECT  A.* FROM   hbrd_app_plano_beneficio A  INNER JOIN hbrd_app_plano_use_beneficio B on (A.id = B.id_beneficio) WHERE B.id_plano = ${plano.id}`);
	res.status(200).send({ plano: plano });
}
async function getTipoTratamentos(conn, req, res, body, params) {
	let result = await dbFindList(conn, `SELECT * FROM hbrd_app_pet_tipo_tratamento WHERE stats = 1 AND id_especie = ${params.id_especie}`);
	res.status(200).send({ tratamentos: result });
}
async function getBeneficios(conn, req, res, body) {
	let result = await dbFindList(conn, 'SELECT * FROM hbrd_app_plano_beneficio WHERE delete_at IS NULL AND stats = 1 ORDER BY ordem');
	res.status(200).send(result);
}
async function getEspecialidades(conn, req, res, body) {
	let result = await dbFindList(conn, 'SELECT * FROM hbrd_app_plano_beneficio where stats=1');
	res.status(200).send(result);
}
async function getCities(conn, req, res, body, params) {
	let where = params.id_estado != 0 ? `WHERE id_estado = '${params.id_estado}'` : '';
	let result = await dbFindList(conn, `SELECT * FROM hbrd_main_util_city ${where} ORDER BY cidade`);
	res.status(200).send(result);
}
async function forgotPass(conn, req, res, body) {
	let user = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_pessoa A WHERE A.email = ?`, [body.email]);
	if (!user) return res.status(400).send('Usuario não encontrado');
	let smtp = await dbFindOne(conn, 'SELECT A.* FROM hbrd_main_smtp A');
	if (util.isEmpty(smtp)) return res.status(400).send(`SMTP padrão não cadastrado`);
	let vencimento = moment().add(2, 'days').format('YYYY-MM-DD');
	let code = cripto.encrypt(JSON.stringify({ "vencimento": vencimento, "id_pessoa": user.id }));
	let link = (process.env.NODE_ENV != 'production') ? `http://localhost:8080/sistema/main/login/alterarSenhaApp?code=${code}` : `https://aupetheinsten.com.br/sistema/main/login/alterarSenhaApp?code=${code}`;
	let html = `<p>Olá ${user.nome}, o link para sua alteração de senha é<br><br><strong>${link}</strong></p>`;
	let mailOptions = {
		from: '"Aupet Heinsten" <' + smtp.email_padrao + '>',
		to: user.email,
		subject: "Aupet Heinsten - Alteração de senha",
		text: '',
		html: html
	};
	await emailHandler(smtp, mailOptions);
	res.status(200).send();
}
async function getMotivosCancelamento(conn, req, res, body) {
	let motivos = await dbFindList(conn, 'SELECT * FROM hbrd_app_motivo_cancelamento_agendamento as A WHERE  A.stats = 1 Order by  A.id');
	res.status(200).send({ motivos: motivos });
}
async function getMotivosArquivamento(conn, req, res, body) {
	let motivos = await dbFindList(conn, 'SELECT * FROM hbrd_app_motive as A WHERE  A.stats = 1 Order by  A.id');
	res.status(200).send({ motivos: motivos });
}
async function getSituacoes(conn, req, res, body, params) {
	let result = await util.dbFindList(conn, `SELECT id , titulo FROM hbrd_app_pet_proposta_status where delete_at is null ORDER BY id `);
	res.status(200).send(result);
}
async function login(conn, req, res, body, params) {
	let id_pessoa;
	let response;
	let consultor = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_consultor A INNER JOIN hbrd_app_pessoa B ON B.id = A.id_pessoa WHERE B.email = ? AND A.delete_at is null AND A.solicitado = 0`, [body.email]);
	if (consultor) id_pessoa = consultor.id_pessoa;
	let associado = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_associado A INNER JOIN hbrd_app_pessoa B ON B.id = A.id_pessoa WHERE B.email = ? AND A.delete_at is null`, [body.email]);
	if (associado) id_pessoa = associado.id_pessoa;
	let clinica = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_clinica A INNER JOIN hbrd_app_pessoa B ON B.id = A.id_pessoa WHERE B.email = ? AND A.delete_at is null AND A.solicitado = 0`, [body.email]);
	if (clinica) id_pessoa = clinica.id_pessoa;
	if (id_pessoa) {
		response = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_pessoa A WHERE A.id = ?`, [id_pessoa]);
		if (process.env.NODE_ENV == 'production' // em desenvolvimento logar em qlq conta
		 && util.createSenhaHash(body.senha, response.salt) != response.senha) return res.status(400).send("Senha não confere"); 
		response.consultor = (consultor?.stats == 1) ? consultor : null;
		response.associado = (associado?.stats == 1) ? associado : null;
		response.clinica = (clinica?.stats == 1) ? clinica : null;
		if(response.consultor == null && response.associado == null && response.clinica == null) return res.status(460).send("Usuário desativado!");
	} else util.BadRequest(res, "Usuario não encontrado");
	let token = util.createToken(response.id);
	res.status(200).send({ 'data': response, 'token': token });
}
async function reactiveUser(conn, req, res, body, params) {
	let id_pessoa;
	let response;
	let consultor = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_consultor A INNER JOIN hbrd_app_pessoa B ON B.id = A.id_pessoa WHERE B.email = ? AND A.delete_at is null AND A.solicitado = 0`, [body.email]);
	if (consultor) id_pessoa = consultor.id_pessoa;
	let associado = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_associado A INNER JOIN hbrd_app_pessoa B ON B.id = A.id_pessoa WHERE B.email = ? AND A.delete_at is null`, [body.email]);
	if (associado) id_pessoa = associado.id_pessoa;
	let clinica = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_clinica A INNER JOIN hbrd_app_pessoa B ON B.id = A.id_pessoa WHERE B.email = ? AND A.delete_at is null AND A.solicitado = 0`, [body.email]);
	if (clinica) id_pessoa = clinica.id_pessoa;

	if(associado?.stats == 0) await util.dbUpdate(conn,'hbrd_app_associado', `WHERE id = ${associado.id}`,{ stats : 1 });
	if(consultor?.stats == 0) await util.dbUpdate(conn,'hbrd_app_consultor', `WHERE id = ${consultor.id}`,{ reativar : 1 });
	if(clinica?.stats == 0) await util.dbUpdate(conn,'hbrd_app_clinica', `WHERE id = ${consultor.id}`,{ reativar : 1 });

	if(id_pessoa){
		response = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_pessoa A WHERE A.id = ?`, [id_pessoa]);
		response.associado = (associado.stats == 1) ? associado : null;
	}

	let token = util.createToken(response.id);
	res.status(200).send({ 'data': response, 'token': token });
}
async function getPlanoBeneficios(conn, req, res, body, params) {
	// let result = await dbFindList(conn, 'SELECT * FROM hbrd_app_planos WHERE delete_at IS NULL AND stats = 1 ORDER BY valor');
	let result = await dbFindList(conn, `SELECT A.* 
		FROM 
			hbrd_app_plano_beneficio A
			LEFT JOIN 
			hbrd_app_plano_use_beneficio B ON B.id_beneficio = A.id
			LEFT JOIN
			hbrd_app_planos C ON B.id_plano = C.id
		WHERE C.id = ${params.id}`);
	res.status(200).send(result);
}
async function savePushNotificationtoken(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa where id = ?`, [token.id_pessoa]);
	const device = req.headers['user-agent'];
	await util.dbInsertDuplicateKeyUpdate(conn, "hbrd_app_pessoa_pushtoken", { "token": body.token, "id_pessoa": solicitante.id, "device": device, 'update_at': moment().format('YYYY-MM-DD HH:mm:ss'), 'plataforma': body.plataforma });
	res.status(200).send();
}

async function getTexto(conn, req, res, body, params){
	let response = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_textos_app A WHERE A.id = ${params.id}`);
	let termo = await dbFindOne(conn,`SELECT A.template, A.titulo FROM hbrd_app_termo A LEFT JOIN hbrd_app_plano_has_termo B ON A.id = B.id_termo WHERE B.id_plano = ${params.id}`);
	res.status(200).send({texto: termo});
}

async function getTermo(conn, req, res, body, params){
	let response = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_textos_app A WHERE A.id = ${params.id}`);
	res.status(200).send({texto: response});
}

async function getKeyPublic(conn, req, res, body, params){
	let response = await util.dbFindOne(conn, `SELECT A.public_key FROM hbrd_adm_integration A WHERE A.id = 1`);
	res.status(200).send( response.public_key);
}