import * as express from 'express';
import * as util from './util';
import * as fileType from 'file-type';
import * as moment from 'moment';
// /aupet
export function routesAupet() {

	const route = express.Router();

	route.get("/logout", util.requestHandler(logout));

	route.post('/tipo', util.requestHandler(tipo));
	route.post('/planos', util.requestHandler(planos));
	route.get('/getLeads', util.requestHandler(getLeads));
	route.get('/getPets/:id', util.requestHandler(getPetsProposta));
	route.get('/getPetsInfo/:id', util.requestHandler(getPetsInfo));
	route.get('/getCommunication', util.requestHandler(getCommunication));

    route.get('/getOngs', util.requestHandler(getOngs));
	route.get('/getOng/:id', util.requestHandler(getOng));
	route.get('/getImageOng/:id', util.requestHandler(getImageOng));

	route.get('/getCommunication/detail/:id', util.requestHandler(getCommunicationDetail));
	route.post('/changeInfoProposta', util.requestHandler(changeInfoProposta));
	route.post('/changeStatusProposta', util.requestHandler(changeStatusProposta));
	route.post('/create', util.requestHandler(createCliente));
	route.post('/newPet', util.requestHandler(newPet));
	route.post('/changeInfoPet', util.requestHandler(changeInfoPet));
	route.post('/setHistoricoProposta', util.requestHandler(setHistoricoProposta));
	route.get('/getHistoricoProposta/:id', util.requestHandler(getHistoricoProposta));	
	route.get('/status', util.requestHandler(getStatus));
	route.post('/petsProposta', util.requestHandler(petsProposta));
	route.get('/lead/:id', util.requestHandler(getLead));

	
	route.post('/getProposta', util.requestHandler(getProposta));
	route.post('/validarSaque', util.requestHandler(validarSaque));
	route.get('/getfile/:key', util.requestHandler(getfile));

	route.get('/getDatasLeadRelatorio', util.requestHandler(getDatasLeadRelatorio));
	route.get('/getDadosRelatorio/:data_inicial/:data_final', util.requestHandler(getDadosRelatorio));
	route.get('/getSaqueList/:status', util.requestHandler(getSaqueList));
	route.get('/getDadosSaque/:id_saque', util.requestHandler(getDadosSaque));
	route.get('/getIndicacoesSaque/:id_saque', util.requestHandler(getIndicacoesSaque));
	route.post("/agendar", util.requestHandler(agendar));
	route.get("/agendamentos", util.requestHandler(agendamentos));
	route.get("/agendamento/:id", util.requestHandler(getAgendamento));
	route.post("/updateAgendar/:id", util.requestHandler(updateAgendamento));
	route.post("/savePushNotificationToken", util.requestHandler(savePushNotificationToken));
	route.get('/:id', util.requestHandler(getConById));
	return route;
}
async function getConById(conn, req, res, body, params) {
	let result = await util.dbFindOne(conn, `SELECT * FROM hbrd_adm_user A WHERE A.id = '${params.id}'  AND A.desativado = 0`);
	if (result) res.status(200).send(result);
	else res.status(400).send('não encontrado');
}

async function createCliente(conn, req, res, body) {
	let result = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_user A WHERE A.email = '${body.email}'`);
	if (result) util.BadRequest(res, 'Email existente');
	// if (body.foto) body.foto = await util.sendFileAws(util.base64RemoveHeader(body.foto), req['nova_client'] + '/hbrd_adm_consultant');
	// if (body.cnh) body.cnh = await util.sendFileAws(util.base64RemoveHeader(body.cnh), req['nova_client'] + '/hbrd_adm_consultant');
	// if (body.rg_frente) body.rg_frente = await util.sendFileAws(util.base64RemoveHeader(body.rg_frente), req['nova_client'] + '/hbrd_adm_consultant');
	// if (body.rg_verso) body.rg_verso = await util.sendFileAws(util.base64RemoveHeader(body.rg_verso), req['nova_client'] + '/hbrd_adm_consultant');
	let obj = await util.formatDatabase(conn, 'hbrd_app_user', body);
	//obj.rua = body.endereco;
	obj.desativado = 0;
	let insert = await util.dbInsert(conn, `hbrd_app_user`, obj);
	// await util.dbInsert(conn, `hbrd_adm_consultant_has_team`, { 'id_equipe': body.id_equipe, 'id_consultor': insert.insertId });
	res.status(200).send();
}

async function planos(conn, req, res, body) {
	let data = await util.dbFindList(conn, 'SELECT * FROM hbrd_app_planos');
	res.status(200).send(data);
}

async function tipo(conn, req, res, body) {
	let data = await util.dbFindList(conn, 'SELECT * FROM hbrd_app_user_has_servicos WHERE hbrd_app_user_has_servicos.id_app_user=' + body.id);
	res.status(200).send(data);
}

async function getOngs(conn, req, res, body, params){
	let response = await util.dbFindList(conn, 'SELECT * FROM  hbrd_app_ong where stats = 1 AND delete_at IS NULL;'); 
	res.status(200).send(response);
}

async function getOng(conn, req, res, body, params){
	let response = await util.dbFindOne(conn, 'SELECT * FROM  hbrd_app_ong where id='+ params.id);
    response.campanhas = await util.dbFindList(conn, `SELECT  A.* FROM hbrd_app_campanha_doacoes A INNER JOIN  hbrd_app_ong_use_campanha B ON A.id = B.id_campanha WHERE B.id_ong = ${params.id} AND A.stats = 1 AND A.delete_at IS NULL`);
	res.status(200).send({ong: response});
}

async function getImageOng(conn, req, res, body, params){
	let response = await util.dbFindList(conn, 'SELECT * FROM  hbrd_app_ong_fotos where id_ong='+ params.id);
	res.status(200).send(response);
}

async function setHistoricoProposta(conn ,req, res, body){
		let post = {
			'id_app_proposta' : body.id_proposta,
			'acao'  : body.acao,
			'id_user' :body.id_user
	    	}		
		let response = await util.dbInsert(conn, `hbrd_app_proposta_hist`, post);		
 		res.status(200).send(response);	
}

async function getHistoricoProposta(conn, req, res, body, params) {
	// console.log(body);
	// let token = await util.verifyToken(body['access_token'], res);
let response = await util.dbFindList(conn, `SELECT A.*, DATE_FORMAT(data_hora, '%d/%m/%Y às %H:%i') data, IFNULL(B.nome, IFNULL(C.nome , A.usuario)) as nomeUsuario FROM hbrd_app_proposta_hist A LEFT JOIN hbrd_adm_consultant B ON (A.id_consultor = B.id) LEFT JOIN hbrd_cms_store C ON (A.id_store = C.id) WHERE A.id_app_proposta= ${params.id}`);
	res.status(200).send(response);
}

async function getStatus(conn, req, res, body, params) {
	let result = await util.dbFindList(conn, `SELECT A.* FROM hbrd_app_pet_proposta_status A WHERE A.delete_at IS NULL ORDER BY A.ordem`);
	res.status(200).send(result);
}

async function petsProposta(conn, req, res, body) {
	let token = await util.verifyToken(body['access_token'], res);
	let post = {
		'nome'        	 : body.nome,
		'porte'       	 : body.porte,
		'sexo'        	 : body.sexo,
		'id_app_raca' 	 : body.id_app_raca,
		'id_app_planos'  : body.id_app_planos,
		'id_app_especie' : body.id_app_especie
	};
	let response = await util.dbInsert(conn, `hbrd_app_pet_proposta`, post);
	let dados = {
		'id_app_pet'      : response.insertId,
		'id_app_proposta' : body.id
	};
	console.log(response.insertId);
	await util.dbInsert(conn, `hbrd_app_proposta_has_pet`, dados);
	res.status(200).send(response);
}

async function getPetsProposta(conn, req, res, body, params) {
	// console.log(body);
	// let token = await util.verifyToken(body['access_token'], res);
	let response = await util.dbFindList(conn, 'SELECT C.* ,D.id as id_plano,D.titulo FROM hbrd_app_proposta AS A INNER JOIN hbrd_app_proposta_has_pet AS B ON (B.id_app_proposta=A.id) INNER JOIN hbrd_app_pet_proposta AS C ON(C.id=B.id_app_pet) INNER JOIN hbrd_app_planos AS D ON (C.id_app_planos=D.id) WHERE B.id_app_proposta = ' + params.id);
	res.status(200).send(response);
}

//buscar informações do pet 
async function getPetsInfo(conn, req, res, body, params) {
	// console.log(body);
	// let token = await util.verifyToken(body['access_token'], res);
	let response = await util.dbFindList(conn, 'SELECT a.*,b.titulo AS raca,c.titulo AS especie,d.titulo AS plano ,d.valor AS valor_plano,d.clube,d.consultas,d.exames,d.vacinas,d.internacao,d.castracao,d.cirurgia,d.consulta,d.parto,d.tomografia , e.id_app_proposta FROM hbrd_app_pet_proposta AS a INNER JOIN hbrd_app_pet_raca AS b ON (b.id=a.id_app_raca) INNER JOIN hbrd_app_pet_especie AS c ON (c.id=a.id_app_especie) INNER JOIN hbrd_app_planos AS d ON (d.id=a.id_app_planos) INNER JOIN hbrd_app_proposta_has_pet AS e ON (a.id = e.id_app_pet) WHERE a.id=' + params.id);
	res.status(200).send(response);
}

//buscar todas as proposta
async function getProposta(conn, req, res, body, params) {
	let token = await util.verifyToken(body['access_token'], res);
	let response = await util.dbFindList(conn, 'SELECT a.*,COUNT(b.id_app_pet) AS quantidade , DATE_FORMAT(a.create_at, "%d/%m/%Y às %H:%i") data FROM hbrd_app_proposta AS a LEFT JOIN hbrd_app_proposta_has_pet AS b ON (b.id_app_proposta=a.id) WHERE a.id_consultor="'+ token.id_usuario +'" GROUP BY a.id');
	res.status(200).send(response);
}

//buscar proposta pelo id
async function getLead(conn, req, res, body, params) {
	// console.log(params);
	// let token = await util.verifyToken(body['access_token'], res);
	let response = await util.dbFindList(conn, 'SELECT * ,DATE_FORMAT(create_at, "%d/%m/%Y às %H:%i") data FROM hbrd_app_proposta WHERE hbrd_app_proposta.id=' + params.id);
	res.status(200).send(response);
}

//altera proposta 
async function changeInfoProposta(conn, req, res, body, params){
	let post = {
		'nome': body.nome,
		'telefone': body.telefone,
		'email' : body.email
	}
	let response = await util.dbUpdate(conn, `hbrd_app_proposta`, `WHERE id='${body.id}'`,post);
	if(body.id_consultor && body.id_consultor != '') await util.dbInsert(conn, 'hbrd_app_proposta_hist', {'id_app_proposta': body.id , 'acao':'Alterou os Dados do cliente', 'id_consultor': body.id_consultor });
	else if(body.id_store && body.id_store != '') await util.dbInsert(conn, 'hbrd_app_proposta_hist', {'id_app_proposta': body.id , 'acao':'Alterou os Dados do Cliente', 'id_store': body.id_store });
	res.status(200).send(response);
}

async function changeStatusProposta(conn, req, res, body, params){
	let post = {
	 'id_status': body.id_status
	}
    let response = await util.dbUpdate(conn, `hbrd_app_proposta`, `WHERE id='${body.id}'`,post);
	if(body.id_consultor && body.id_consultor != '') await util.dbInsert(conn, 'hbrd_app_proposta_hist', {'id_app_proposta': body.id , 'acao':`Validou a Etapa ${body.status}`, 'id_consultor': body.id_consultor });
	else if(body.id_store && body.id_store != '') await util.dbInsert(conn, 'hbrd_app_proposta_hist', {'id_app_proposta': body.id , 'acao':`Validou a Etapa ${body.status}`, 'id_store': body.id_store });
}	

async function newPet(conn, req, res, body, params){
	let post = {
		'nome'        	 : body.nome,
		'porte'       	 : body.porte,
		'sexo'        	 : body.sexo,
		'id_app_raca' 	 : body.id_app_raca,
		'id_app_planos'  : body.id_app_planos,
		'id_app_especie' : body.id_app_especie
	};
	let response = await util.dbInsert(conn, `hbrd_app_pet_proposta`, post);
	let dados = {
		'id_app_pet'      : response.insertId,
		'id_app_proposta' : body.id_app_proposta
	};
	await util.dbInsert(conn, `hbrd_app_proposta_has_pet`, dados);
	if(body.id_consultor && body.id_consultor != '') await util.dbInsert(conn, 'hbrd_app_proposta_hist', {'id_app_proposta': body.id_app_proposta , 'acao':`Adcionou o Pet ${body.nome} na proposta`, 'id_consultor': body.id_consultor });
	else if(body.id_store && body.id_store != '') await util.dbInsert(conn, 'hbrd_app_proposta_hist', {'id_app_proposta': body.id_app_proposta , 'acao':`Adcionou o Pet ${body.nome} na Proposta`, 'id_store': body.id_store });
	res.status(200).send(response);
}

async function changeInfoPet(conn, req, res, body, params){
	let post = {
		'nome'        	 : body.nome,
		'porte'       	 : body.porte,
		'sexo'        	 : body.sexo,
		'id_app_raca' 	 : body.id_app_raca,
		'id_app_planos'  : body.id_app_planos,
		'id_app_especie' : body.id_app_especie
	}
	let response = await util.dbUpdate(conn, `hbrd_app_pet_proposta`, `WHERE id='${body.id}'`,post);
	if(body.id_consultor && body.id_consultor != '') await util.dbInsert(conn, 'hbrd_app_proposta_hist', {'id_app_proposta': body.id_app_proposta , 'acao':`Alterou Dados do Pet ${body.nome} na proposta`, 'id_consultor': body.id_consultor });
	else if(body.id_store && body.id_store != '') await util.dbInsert(conn, 'hbrd_app_proposta_hist', {'id_app_proposta': body.id_app_proposta , 'acao':`Alterou Dados  do Pet ${body.nome} na Proposta`, 'id_store': body.id_store });
	res.status(200).send(response);
}


async function getfile(conn, req, res, body, params) {
	let base64;
	try {
		base64 = await util.getObjectAws(params.key, req['nova_client'] + '/hbrd_adm_consultant');
	} catch (e) {
		return res.status(404).send();
	}
	if (!base64) return res.status(200).send();
	var file = Buffer.from(base64, 'base64');
	let type = fileType(file);
	res.set('Content-Type', type.mime);
	res.set('Content-Length', file.length);
	res.set('Cache-Control', 'public, max-age=31536000');
	res.status(200).end(file);
}


async function getCommunicationDetail(conn, req, res, body, params) {
	let result = await util.dbFindOne(conn, `SELECT A.id, A.compartilhar, A.mensagem, A.titulo, A.html FROM hbrd_adm_communication A where A.id = ${params.id}`);
	let token = await util.verifyToken(req.headers['access_token'], res);
	let check = await util.dbFindOne(conn, `select * from hbrd_adm_readcommunication where id_consultant = ${token.id_usuario} And id_communication = ${params.id}`);
	if (!check) await util.dbInsert(conn, 'hbrd_adm_readcommunication', { 'id_communication': params.id, 'id_consultant': token.id_usuario });
	res.status(200).send(result);
}
async function getCommunication(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let consultant_has_team = await util.dbFindOne(conn, `SELECT * FROM hbrd_adm_consultant_has_team where id_consultor = ${token.id_usuario}`);
	if (!consultant_has_team) util.BadRequest(res, "Você precisa ser membro de uma equipe");
	let result = await util.dbFindList(conn, `SELECT A.id, A.compartilhar, A.mensagem, A.titulo, A.html, IF(B.id_consultant, 1, 0) lida, DATE_FORMAT(create_at, '%d/%m/%Y') criado_em FROM hbrd_adm_communication A LEFT JOIN hbrd_adm_readcommunication B ON B.id_communication = A.id AND B.id_consultant = ${token.id_usuario} LEFT JOIN hbrd_adm_consultant_has_team C ON C.id_consultor = ${token.id_usuario} WHERE A.stats = 1 AND ((A.agendar_entrada IS NULL AND A.agendar_saida IS NULL) OR (A.agendar_entrada <= NOW() AND A.agendar_saida >= NOW()) OR (A.agendar_entrada <= NOW() AND A.agendar_saida IS NULL) OR (A.agendar_entrada IS NULL AND A.agendar_saida >= NOW())) AND ((SELECT IF(count(*), 1, 0) FROM hbrd_app_communication_consultant WHERE id_comunicado = A.id AND id_consultor = ${token.id_usuario}) OR (SELECT IF(count(*), 1, 0) FROM hbrd_app_communication_team WHERE id_comunicado = A.id AND id_equipe = ${consultant_has_team.id_equipe}) or (SELECT IF(COUNT(*), 1, 0) FROM hbrd_app_communication_coordinator WHERE id_comunicado = A.id AND id_consultor = ${token.id_usuario})) ORDER BY A.create_at DESC`);
	res.status(200).send(result);
}
async function getLeads(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let indicacoes = await util.dbFindList(conn, `SELECT IFNULL((SELECT create_at FROM hbrd_adm_indication_history WHERE id_indicacao = A.id ORDER BY create_at DESC LIMIT 1), A.create_at) last_update, (SELECT acao FROM hbrd_adm_indication_history WHERE id_indicacao = A.id ORDER BY create_at DESC LIMIT 1) history_acao,  A.*, IFNULL(B.nome, (SELECT nome FROM hbrd_adm_status WHERE delete_at IS NULL ORDER BY ordem LIMIT 1)) status, B.id status_id, B.ordem status_ordem, C.nome indicador, D.nome categoria, E.nome origem, IF(F.id_consultant, 1, 0) lida FROM hbrd_adm_indication A LEFT JOIN hbrd_adm_status B ON A.id_status = B.id LEFT JOIN hbrd_adm_comissioned C ON A.id_comissionado = C.id LEFT JOIN hbrd_adm_category D ON A.id_categoria = D.id LEFT JOIN hbrd_adm_indication_source E ON E.id = A.id_origem LEFT JOIN hbrd_adm_readindication F ON F.id_consultant = A.id_consultor AND F.id_indication = A.id WHERE A.id_consultor = '${token.id_usuario}' GROUP BY A.id ORDER BY last_update DESC`);
	res.status(200).send(indicacoes);
}
async function getDatasLeadRelatorio(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	if (token.table == util.user_table.indicador) return;
	let consultor = await util.dbFindOne(conn, `SELECT * FROM hbrd_adm_consultant A WHERE A.id = '${token.id_usuario}'`);
	let result = await util.dbFindList(conn, `SELECT 
	(SELECT create_at FROM hbrd_adm_indication WHERE id_consultor = ${consultor.id} ORDER BY create_at LIMIT 1) as data_inicial,
	(SELECT create_at FROM hbrd_adm_indication WHERE id_consultor = ${consultor.id} ORDER BY create_at DESC LIMIT 1) as data_final
	FROM hbrd_adm_indication ORDER BY create_at LIMIT 1`);
	res.status(200).send(result[0]);
}
async function getDadosRelatorio(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	if (token.table == util.user_table.indicador) return;
	let consultor = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_adm_consultant A WHERE A.id = '${token.id_usuario}'`);
	let result = await util.dbFindList(conn, `
	SELECT count(id) as qtde FROM hbrd_adm_indication WHERE id_consultor = ${consultor.id} AND id_comissionado IS NOT NULL AND classificacao = 'pendente';
	SET lc_time_names = 'pt_BR'; 
	set @num = 0;
	SELECT @num := @num + 1 as ordem_1, 'Prospecção' AS name, count(id) as qtde, date_format(create_at, "%Y %M") as mes_ano FROM hbrd_adm_indication WHERE id_consultor = ${consultor.id} AND date_format(create_at, '%Y-%m-%d') BETWEEN date_format('${params.data_inicial}', '%Y-%m-%d') AND date_format('${params.data_final}', '%Y-%m-%d') group by date_format(create_at, "%Y %M") union 
	SELECT @num := @num + 1 as ordem_1, 'Ativado' AS name, count(id) as qtde, date_format(create_at, "%Y %M") as mes_ano FROM hbrd_adm_indication WHERE id_consultor = ${consultor.id} AND classificacao = 'ativada' AND date_format(create_at, '%Y-%m-%d') BETWEEN date_format('${params.data_inicial}', '%Y-%m-%d') AND date_format('${params.data_final}', '%Y-%m-%d') group by date_format(create_at, "%Y %M") union 
	SELECT @num := @num + 1 as ordem_1, 'Arquivado' AS name, count(id) as qtde, date_format(create_at, "%Y %M") as mes_ano FROM hbrd_adm_indication WHERE id_consultor = ${consultor.id} AND classificacao = 'arquivada' AND date_format(create_at, '%Y-%m-%d') BETWEEN date_format('${params.data_inicial}', '%Y-%m-%d') AND date_format('${params.data_final}', '%Y-%m-%d') group by date_format(create_at, "%Y %M") union 
	SELECT @num := @num + 1 as ordem_1, 'Vistoria' AS name, count(id) as qtde, date_format(create_at, "%Y %M") as mes_ano FROM hbrd_adm_indication WHERE id_consultor = ${consultor.id} AND id_inspection IS NOT NULL AND date_format(create_at, '%Y-%m-%d') BETWEEN date_format('${params.data_inicial}', '%Y-%m-%d') AND date_format('${params.data_final}', '%Y-%m-%d') group by date_format(create_at, "%Y %M") 
	ORDER BY ordem_1, mes_ano;
	SELECT count(id) as qtde FROM hbrd_adm_indication WHERE id_consultor = ${consultor.id} AND classificacao = 'pendente';
	SELECT count(id) as qtde FROM hbrd_adm_indication WHERE id_consultor = ${consultor.id} AND id_inspection IS NOT NULL AND classificacao = 'pendente';`);
	res.status(200).send(result);
}
async function getSaqueList(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let saqueList;
	if (params.status == 'aberto') {
		saqueList = await util.dbFindList(conn, `SELECT A.id, DATE_FORMAT(A.data, '%d/%m/%Y às %Hh%i') data, FORMAT(A.valor, 2, 'de_DE') valor, B.nome FROM hbrd_adm_paymentrequest A LEFT JOIN hbrd_adm_comissioned B ON A.id_comissionado = B.id LEFT JOIN hbrd_adm_consultant_has_adm_card C ON C.id_cartao = B.id_cartao LEFT JOIN hbrd_adm_consultant D ON D.id = C.id_consultor WHERE A.pago = 0 AND D.id = ${token.id_usuario}`);
	} else {
		saqueList = await util.dbFindList(conn, `SELECT A.id, DATE_FORMAT(A.data, '%d/%m/%Y às %Hh%i') data, FORMAT(A.valor, 2, 'de_DE') valor, B.nome FROM hbrd_adm_paymentrequest A LEFT JOIN hbrd_adm_comissioned B ON A.id_comissionado = B.id LEFT JOIN hbrd_adm_consultant_has_adm_card C ON C.id_cartao = B.id_cartao LEFT JOIN hbrd_adm_consultant D ON D.id = C.id_consultor WHERE A.pago = 1 AND D.id = ${token.id_usuario}`);
	}
	res.status(200).send(saqueList);
}
async function getDadosSaque(conn, req, res, body, params) {
	let response = await util.dbFindOne(conn, `SELECT DATE_FORMAT(A.data, '%d/%m/%Y às %Hh%i') data, format(A.valor, 2, 'de_DE') valor, B.nome, B.cpf, B.email, B.telefone, B.banco, B.agencia, B.conta, A.pago FROM hbrd_adm_paymentrequest A INNER JOIN hbrd_adm_comissioned B ON A.id_comissionado = B.id WHERE A.id = ${params.id_saque}`);
	res.status(200).send(response);
}
async function getIndicacoesSaque(conn, req, res, body, params) {
	let indicacoes = await util.dbFindList(conn, `SELECT A.id, DATE_FORMAT(IFNULL((SELECT create_at FROM hbrd_adm_indication_history WHERE id_indicacao = A.id ORDER BY create_at DESC LIMIT 1), A.create_at), '%d/%m/%Y às %Hh%i') data, (SELECT acao FROM hbrd_adm_indication_history WHERE id_indicacao = A.id ORDER BY create_at DESC LIMIT 1) history_acao, IFNULL(B.nome, (SELECT nome FROM hbrd_adm_status WHERE delete_at IS NULL ORDER BY ordem LIMIT 1)) status, A.nome FROM hbrd_adm_indication A LEFT JOIN hbrd_adm_status B ON A.id_status = B.id LEFT JOIN hbrd_adm_comissioned C ON A.id_comissionado = C.id WHERE A.id IN (SELECT indicacoes_ids FROM hbrd_adm_paymentrequest WHERE id = ${params.id_saque}) GROUP BY A.id ORDER BY data DESC`);
	let filer = indicacoes.filter(x => x.id_inspection && x.id_status == 3 && x.classificacao == 'pendente');
	if (filer.length)
		await new Promise(resolve => {
			let i = 0;
			filer.forEach(async item => {
				let items = await util.dbFindList(conn, `SELECT A.aproved, (1 ^ ISNULL(A.image)) AS image, B.required FROM hbrd_adm_inspection_item A LEFT JOIN hbrd_adm_inspection_model_item B ON B.id = A.id_model_item WHERE A.id_inspection = '${item.id_inspection}' AND B.required = 1`);
				if (items.every((x) => x.image == 1))
					item.inspectStatus = { msg: 'Vistoria em análise', class: 'pendente' };
				else
					item.inspectStatus = { msg: 'Aguardando envio das imagens', class: 'arquivada' };
				let rejeitadas = items.filter(x => x.aproved == 0).length;
				if (rejeitadas)
					item.inspectStatus = { msg: rejeitadas == 1 ? `${rejeitadas} foto rejeitada` : `${rejeitadas} fotos rejeitadas`, class: 'arquivada' };
				i++;
				if (i == filer.length) resolve();
			});
		});
	res.status(200).send(indicacoes);
}
async function validarSaque(conn, req, res, body) {
	await util.dbUpdate(conn, 'hbrd_adm_paymentrequest', ` where id = ${body.id_saque}`, { pago: 1 });
	let paymentrequess = await util.dbFindOne(conn, `SELECT * FROM hbrd_adm_paymentrequest WHERE id = '${body.id_saque}'`);
	let payment = {
		id_comissionado: paymentrequess.id_comissionado,
		id_cartao: paymentrequess.id_cartao,
		qtd_indicacoes: (paymentrequess.qtde_indicacoes, 0),
		valor: paymentrequess.valor,
		data_solicitacao: paymentrequess.data
	};
	let id_payment = await util.dbInsert(conn, 'hbrd_adm_payment', payment);
	let indicacoes_ids = paymentrequess.indicacoes_ids.split(',');
	for (var id in indicacoes_ids) {
		await util.dbUpdate(conn, 'hbrd_adm_indication', `where id = ${indicacoes_ids[id]}`, { id_pagamento_comissionado: id_payment.insertId, transacao: 1 });
	}
	res.status(200).send();
}
async function agendar(conn, req, res, body) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let post = {
		'titulo': body.titulo,
		'descricao': body.descricao,
		'data_hora': `${body.data} ${body.hora}`,
		'id_consultant': token.id_usuario,
		'id_indication': body.id_indication
	};
	await util.dbInsert(conn, `hbrd_adm_consultant_agenda`, post);
	res.status(200).send();
}
async function agendamentos(conn, req, res, body) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	const response = await util.dbFindList(conn, `SELECT B.nome, A.*, DATE_FORMAT(A.data_hora, '%d/%m/%Y às %Hh%i') data_hora FROM hbrd_adm_consultant_agenda A INNER JOIN hbrd_adm_consultant B ON B.id = A.id_consultant WHERE A.id_consultant = ${token.id_usuario}`);
	res.status(200).send(response);
}
async function getAgendamento(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	const response = await util.dbFindOne(conn, `SELECT B.nome, A.*, DATE_FORMAT(A.data_hora, '%d/%m/%Y às %Hh%i') data_hora FROM hbrd_adm_consultant_agenda A INNER JOIN hbrd_adm_consultant B ON B.id = A.id_consultant WHERE A.id_consultant = ${token.id_usuario} and A.id = ${params.id}`);
	res.status(200).send(response);
}
async function updateAgendamento(conn, req, res, body, params) {
	await util.dbUpdate(conn, `hbrd_adm_consultant_agenda`, ` WHERE id = '${params.id}'`, { status: 'cancelado' });
	res.status(200).send();
}
async function savePushNotificationToken(conn, req, res, body) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let consultor = await util.dbFindOne(conn, `SELECT * FROM hbrd_adm_consultant A WHERE A.id = '${token.id_usuario}'`);
	const device = req.headers['user-agent'];
	await util.dbInsertDuplicateKeyUpdate(conn, "hbrd_adm_consultant_pushtoken", { token: body.token, id_consultant: consultor.id, device: device, 'update_at': moment().format('YYYY-MM-DD HH:mm:ss'), 'plataforma': body.plataforma });
	res.status(200).send();
}
async function logout(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	const device = req.headers['user-agent'];
	await util.dbDelete(conn, 'hbrd_adm_consultant_pushtoken', `where device = '${device}' AND id_consultant = ${token.id_usuario}`);
	res.status(200).send();
}