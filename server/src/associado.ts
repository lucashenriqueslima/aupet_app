import * as express from 'express';
import * as util from './util';
import * as fileType from 'file-type';
import * as moment from 'moment';
import { send } from 'process';
//Associado 
export function routesAssociado() {
	const route = express.Router();
	route.get("/logout", util.requestHandler(logout));
	
	route.post('/atualizar', util.requestHandler(atualizarAssociado));
	route.post('/createPet', util.requestHandler(createPet));
	route.get("/getPet/:id", util.requestHandler(getPet));
	route.post('/solicitarAdesao', util.requestHandler(solicitarAdesao));
	route.get("/getPets", util.requestHandler(getPets));
	route.get('/getDadosConsultor', util.requestHandler(getDadosConsultor));
	route.get('/getCommunication', util.requestHandler(getCommunication));
	route.get('/clinicas', util.requestHandler(getClinicas));
	route.get('/clinica/:id', util.requestHandler(getClinica));
	route.get('/Imagensclinicas/:id', util.requestHandler(getImagesClinica));
	route.get('/especialidadesClinicas/:id', util.requestHandler(getEspecialidadesClinicas));
	route.get('/getCommunication/detail/:id', util.requestHandler(getCommunicationDetail));
	route.post('/novo', util.requestHandler(createAssociado));
	route.post('/validarSaque', util.requestHandler(validarSaque));
	route.get('/findEquipe/:access_company', util.requestHandler(findEquipe));
	route.get('/getfile/:key', util.requestHandler(getfile));
	route.get('/indicator/:id_indicador', util.requestHandler(getInfoIndicador));
	route.get('/getDatasLeadRelatorio', util.requestHandler(getDatasLeadRelatorio));
	route.get('/getDadosRelatorio/:data_inicial/:data_final', util.requestHandler(getDadosRelatorio));
	route.get('/getSaqueList/:status', util.requestHandler(getSaqueList));
	route.get('/getDadosSaque/:id_saque', util.requestHandler(getDadosSaque));
	route.get('/getIndicacoesSaque/:id_saque', util.requestHandler(getIndicacoesSaque));
	route.post("/savePushNotificationToken", util.requestHandler(savePushNotificationToken));
	route.get('/:id', util.requestHandler(getConById));
	route.get('/getAssinatura/:id_associado/:id_pet',util.requestHandler(getAssinatura));
	route.get('/getAssinaturaId/:id_pet',util.requestHandler(getAssinaturaId));
	route.get('/getMensalidades/:id',util.requestHandler(getMensalidades));
	route.post('/setSenha/:id', util.requestHandler(setAccessPassword));

	return route;
}
const table = 'hbrd_app_associado';
async function getConById(conn, req, res, body, params) {
	let result = await util.dbFindOne(conn, `SELECT * FROM ${table} A WHERE A.id = '${params.id}'  AND A.stats = 1`);
	if (result) res.status(210).send(result);
	else res.status(400).send('não encontrado');
}

async function createAssociado(conn, req, res, body) {
	let pessoa = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa WHERE email = ?`, [body.email]);
	if (!pessoa) {
		pessoa = await util.formatDatabase(conn, 'hbrd_app_pessoa', body);
		pessoa.salt = util.createSalt();
		pessoa.senha = util.createSenhaHash(pessoa.senha, pessoa.salt);
		if (pessoa.foto && !pessoa.foto?.includes('com/aupet')) pessoa.foto = await util.sendFileAws(util.base64RemoveHeader(pessoa.foto));
		body.id_pessoa = await util.dbInsert(conn, 'hbrd_app_pessoa', pessoa);
		pessoa.id = body.id_pessoa;
	} else {
		let associado = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_associado WHERE id_pessoa = ${pessoa.id}`);
		if (associado) util.BadRequest(res, "Você ja é associado");
		let body_pessoa = await util.formatDatabase(conn,'hbrd_app_pessoa', body);
		await util.dbUpdate(conn, 'hbrd_app_pessoa', ` WHERE id = ${pessoa.id}`, body_pessoa);
		body.id_pessoa = pessoa.id;
	}
	let associado = await util.formatDatabase(conn, "hbrd_app_associado", body);
	associado.id = await util.dbInsert(conn, 'hbrd_app_associado', associado);
	pessoa.associado = associado;
	let token = util.createToken(pessoa.id);
	res.status(200).send({ "data": pessoa, "token": token });
}
async function solicitarAdesao(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa where id = ?`, [token.id_pessoa]);
	body.id_pessoa = token.id_pessoa;
	let proposta = await util.formatDatabase(conn, "hbrd_app_proposta", body);
	proposta.id = await util.dbInsert(conn, 'hbrd_app_proposta', proposta);
	body.id_proposta = proposta.id;
	let pet = await util.formatDatabase(conn, "hbrd_app_pet", body);
	await util.dbUpdate(conn, 'hbrd_app_pet', `WHERE id = ${body.id_pet} `, pet);
	await util.dbInsert(conn, 'hbrd_app_proposta_hist', { 'id_proposta': proposta.id, 'atividade': `Solicitou Adesão `, 'id_pessoa': solicitante.id, 'nome': solicitante.nome });
	res.status(200).send({ id_proposta: proposta.id });	
}	
async function createPet(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	if (body.foto) body.foto = await util.sendFileAws(util.base64RemoveHeader(body.foto), req['nova_client'] + '/hbrd_adm_associado');
	let post = {
		'nome': body.nome,
		'peso': body.peso,
		'cor': body.cor,
		'porte': body.porte,
		'sexo': body.sexo,
		'id_app_raca': body.id_app_raca,
		'id_app_planos': body.id_app_planos,
		'id_app_especie': body.id_app_especie,
		'foto': body.foto
	};
	let response = await util.dbInsert(conn, `hbrd_app_pet_associado`, post);
	let dados = {
		'id_pet_associado': response.insertId,
		'id_associado': token.id_usuario
	};
	// console.log(response.insertId);
	await util.dbInsert(conn, `hbrd_app_associado_has_pet`, dados);
	res.status(200).send(response);
}
async function getDadosConsultor(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let data = await util.dbFindOne(conn, 'SELECT *,DATE_FORMAT(A.create_at, "%d/%m/%Y às %H:%i") data_criacao FROM hbrd_adm_consultant A WHERE A.id_user= "' + token.id_usuario + '" AND A.status = 1');
	res.status(200).send(data);
}
async function findEquipe(conn, req, res, body) {
	let data = await util.dbFindList(conn, `SELECT * FROM hbrd_adm_team where delete_at is null and stats = 1`);
	res.status(200).send(data);
}
async function atualizarAssociado(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa where id = ?`, [token.id_pessoa]);
	let pessoa = await util.formatDatabase(conn, 'hbrd_app_pessoa', body);
	if (body.senhaAtual && util.createSenhaHash(body.senhaAtual, solicitante.salt) != solicitante.senha) util.BadRequest(res, "senha atual não confere");
	else if (body.senhaAtual && body.novaSenha) {
		pessoa.salt = util.createSalt();
		pessoa.senha = util.createSenhaHash(body.novaSenha, pessoa.salt);
	} else {
		delete pessoa.salt;
		delete pessoa.senha;
	}
	if (pessoa.foto && !pessoa.foto?.includes('com/aupet')) pessoa.foto = await util.sendFileAws(util.base64RemoveHeader(pessoa.foto));
	let associado = await util.formatDatabase(conn, 'hbrd_app_associado', body.associado);
	delete pessoa.create_at;
	delete associado.create_at;
	await util.dbUpdate(conn, 'hbrd_app_pessoa', `WHERE id = ${pessoa.id} `, pessoa);
	await util.dbUpdate(conn, 'hbrd_app_associado', `WHERE id = ${associado.id} `, associado);
	res.status(200).send({ "pessoa": pessoa });
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
async function getClinicas(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let clinicas = await util.dbFindList(conn, `SELECT *, B.id as id_clinica FROM hbrd_app_pessoa A INNER JOIN hbrd_app_clinica B on(A.id = B.id_pessoa)
	Where 	A.stats = 1 AND B.stats =1 AND B.solicitado = 0 AND B.delete_at IS NULL
	order by A.id `);
	for (const clinica of clinicas) {
		clinica.especialidades = await util.dbFindList(conn, `SELECT * FROM hbrd_app_plano_beneficio as A Inner join
			hbrd_app_clinica_use_beneficio as B on B.id_beneficio = A.id  WHERE B.id_clinica = ${clinica.id_clinica}`);
		clinica.imagens = await util.dbFindList(conn, `SELECT url FROM hbrd_app_clinica_fotos where id_clinica = ${clinica.id_clinica}`);
	}
	res.status(200).send({ clinicas: clinicas });
}
async function getClinica(conn, req, res, body, params) {
	var clinica = await util.dbFindOne(conn, ` SELECT * , B.id as id_clinica FROM hbrd_app_pessoa  A Inner join
	hbrd_app_clinica B on(A.id = B.id_pessoa) WHERE B.id=${params.id}`);
	clinica.especialidades = await util.dbFindList(conn, `SELECT * FROM hbrd_app_plano_beneficio as A Inner join
	hbrd_app_clinica_use_beneficio as B on B.id_beneficio = A.id  WHERE B.id_clinica ='${params.id}'`);
	clinica.imagens = await util.dbFindList(conn, `SELECT url, legenda FROM hbrd_app_clinica_fotos where id_clinica ='${params.id}'`);
	res.status(200).send({ clinica: clinica });
}
async function getImagesClinica(conn, req, res, body, params) {
	let data = await util.dbFindList(conn, `SELECT url FROM hbrd_cms_store_fotos where id_store ='${params.id}'`);
	res.status(200).send(data);
}
async function getEspecialidadesClinicas(conn, req, res, body, params) {
	let data = await util.dbFindList(conn, `SELECT * FROM hbrd_cms_especialidade as A Inner join
	hbrd_cms_store_has_especialidade as B on B.id_especialidade = A.id  WHERE B.id_store = '${params.id}'`);
	res.status(200).send(data);
}
async function getInfoIndicador(conn, req, res, body, params) {
	let response = await util.dbFindOne(conn, ` SELECT A.*, B.bonificacao, COUNT(CASE WHEN C.classificacao = 'Ativada' THEN 1 END) ativadas, COUNT(CASE WHEN C.classificacao = 'Pendente' THEN 1 END) pendentes, COUNT(CASE WHEN C.classificacao = 'Arquivada' THEN 1 END) arquivadas, SUM(CASE WHEN C.classificacao = 'Pendente' THEN B.bonificacao END) saldo_negociacao, SUM(CASE WHEN C.classificacao = 'Ativada' AND C.id_pagamento_comissionado is null AND C.transacao = 0 THEN B.bonificacao END) saldo_disponivel, SUM(CASE WHEN C.classificacao = 'Ativada' AND C.id_pagamento_comissionado is null AND C.transacao = 1 THEN B.bonificacao END) saldo_transacao,
	(SELECT sum(valor)  FROM hbrd_adm_payment WHERE id_comissionado = '${params.id_indicador}') total_sacado FROM hbrd_adm_comissioned A LEFT JOIN hbrd_adm_card B ON A.id_cartao = B.id LEFT JOIN hbrd_adm_indication C ON A.id_cartao = C.id_cartao WHERE A.id = '${params.id_indicador}'`);
	res.status(200).send(response);
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
		await new Promise<void>(resolve => {
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
async function getPets(conn, req, res, body, params) {
	await util.queryExe(conn, "SET lc_time_names = 'pt_BR'");
	let token = await util.verifyToken(req.headers['access_token'], res);
	let associado = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_associado A WHERE A.id_pessoa = ${token.id_pessoa}`);
	const response = await util.dbFindList(conn, `SELECT C.*, E.titulo AS especie, (SELECT titulo FROM hbrd_app_planos WHERE id = C.id_plano) AS plano 
	FROM hbrd_app_associado AS A 
	INNER JOIN hbrd_app_pet AS C ON (C.id_associado = A.id) 
	INNER JOIN hbrd_app_pet_especie AS E ON (C.id_especie = E.id) 
	WHERE A.id = ${associado.id} AND C.delete_at IS NULL `);
	let items = response;
	let i = 0;
	await new Promise<void>(async (resolve, reject) => {
		try {
			if (items.length == 0) return resolve();
			let funSync = async () => {
				let item = items[i];
				await util.queryExe(conn, "SET lc_time_names = 'pt_BR'");
				item.exames = await util.dbFindList(conn, `SELECT * , CONCAT(MONTHNAME(data), ' ', YEAR(data)) mes FROM hbrd_app_pet_exames A WHERE A.id_pet =${item.id} `);
				item.medicamentos = await util.dbFindList(conn, `
					SELECT A.* , B.tratamento , CONCAT(MONTHNAME(A.dt_inicio), ' ', YEAR(A.dt_inicio)) mes 
					FROM hbrd_app_pet_medicamentos A
					INNER JOIN  hbrd_app_pet_tipo_tratamento B on (A.id_tipo_tratamento = B.id) 
					WHERE A.id_pet =${item.id} `);
				item.vermifungos = await util.dbFindList(conn, `SELECT *, CONCAT(MONTHNAME(A.data_vermifungo), ' ', YEAR(A.data_vermifungo)) mes FROM hbrd_app_pet_vermifugos A WHERE A.id_pet = ${item.id} ORDER BY A.data_vermifungo`);
				item.banhos = await util.dbFindList(conn, `SELECT *, CONCAT(MONTHNAME(A.data_banho), ' ', YEAR(A.data_banho)) mes FROM hbrd_app_pet_banhos A WHERE A.id_pet = ${item.id} ORDER BY A.data_banho`);
				item.vacinas = await util.dbFindList(conn, `SELECT *, CONCAT(MONTHNAME(A.data_vacina), ' ', YEAR(A.data_vacina)) mes FROM hbrd_app_pet_vacinas A WHERE A.id_pet = ${item.id} ORDER BY A.data_vacina`);
				item.consultas = await util.dbFindList(conn, `
					SELECT A.*, CONCAT(MONTHNAME(A.data_hora), ' ', YEAR(A.data_hora)) mes, B.nome_fantasia clinica, A.descricao 
					FROM hbrd_app_pet_agendamento A   
					INNER JOIN hbrd_app_clinica B ON A.id_clinica = B.id 
					WHERE A.id_pet = ${item.id} ORDER BY A.data_hora`);
				item.cirurgias = await util.dbFindList(conn, `
					SELECT A.*, CONCAT(MONTHNAME(A.data_hora), ' ', YEAR(A.data_hora)) mes, B.nome_fantasia clinica, A.descricao 
					FROM hbrd_app_pet_cirurgias A 
					INNER JOIN hbrd_app_clinica B ON A.id_clinica = B.id 
					WHERE A.id_pet = ${item.id} ORDER BY A.data_hora`);
				item.internacoes = await util.dbFindList(conn, `
					SELECT A.*, CONCAT(MONTHNAME(A.data_hora), ' ', YEAR(A.data_hora)) mes, B.nome_fantasia clinica, A.descricao 
					FROM hbrd_app_pet_internacoes A 
					INNER JOIN hbrd_app_clinica B ON A.id_clinica = B.id 
					WHERE A.id_pet = ${item.id} ORDER BY A.data_hora`);
				i++;
				if (i == items.length) resolve();
				else funSync();
			}
			funSync();
		} catch (e) { reject(e); }
	});
	res.status(200).send(response);
}
async function getPet(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	const response = await util.dbFindOne(conn, `SELECT a.*, b.titulo AS raca, c.titulo AS especie, p.titulo AS plano 
	FROM hbrd_app_pet AS a 
	LEFT JOIN hbrd_app_pet_raca AS b ON (b.id = a.id_raca) 
	LEFT JOIN hbrd_app_pet_especie AS c ON (c.id = a.id_especie) 
	LEFT JOIN hbrd_app_planos AS p ON (a.id_plano = p.id) 
	WHERE a.id = ${params.id}`);
	res.status(200).send(response);
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
async function getMensalidades(conn, req, res, body, params){
	let mensalidades = await util.dbFindList(conn, `SELECT  A.* , B.*, A.status status_fatura, A.valor valor_mensalidade
	FROM hbrd_app_mensalidades A LEFT JOIN  hbrd_app_assinatura B ON A.id_associado = B.id_associado WHERE A.id_associado =  ${params.id} ORDER BY A.data_fatura DESC`);
	res.status(200).send({mensalidades: mensalidades});
}
async function getAssinatura(conn, req, res, body, params){
	let assinatura = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_assinatura A WHERE A.id_associado = ${params.id_associado} AND A.id_pet = ${params.id_pet} AND  deleted_at IS NULL`);
	if(assinatura) res.status(200).send({assinatura: assinatura});
	else res.status(200).send({ message: 'assinatura não encontrada' });
}
async function getAssinaturaId(conn, req, res, body, params){
	let assinatura = await util.dbFindOne(conn, `SELECT A.id FROM hbrd_app_assinatura A WHERE A.id_pet = ${params.id_pet} AND  deleted_at IS NULL`);
	res.status(200).send({assinatura: assinatura});
}
async function setAccessPassword(conn, req, res, body, params){
	try {
		let token = await util.verifyToken(req.headers['access_token'], res);
		let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa WHERE id = ?`, [token.id_pessoa]);

		let proposta = await util.dbFindOne(conn, `
			SELECT 
				C.*,
				CASE 
					WHEN (C.indicador = 'consultor') THEN (SELECT CONCAT('{','"nome":','"' ,A.nome,'"' ,', "telefone":','"' ,A.telefone, '"' ,'}') FROM hbrd_app_pessoa A INNER JOIN hbrd_app_consultor B ON B.id_pessoa = A.id WHERE B.id = C.id_consultor)
					WHEN (C.indicador = 'associado') THEN (SELECT CONCAT('{','"nome":','"' ,A.nome,'"' ,', "telefone":','"' ,A.telefone, '"' ,'}') FROM hbrd_app_pessoa A INNER JOIN hbrd_app_associado B ON B.id_pessoa = A.id WHERE B.id = C.id_consultor) 
    				WHEN (C.indicador = 'clinica') THEN (SELECT CONCAT('{','"nome":','"' ,A.nome,'"' ,', "telefone":','"' ,A.telefone, '"' ,'}') FROM hbrd_app_pessoa A INNER JOIN hbrd_app_clinica B ON B.id_pessoa = A.id WHERE B.id = C.id_consultor)  
				END indicador
			FROM hbrd_app_proposta C 
			WHERE C.id = ?
		`, [params.id]);
		let pessoa = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa WHERE id = ?`, [proposta.id_pessoa]);

		// Cria primeira senha de acesso

		pessoa.salt = util.createSalt();
		let password = Math.random().toString(36).slice(-8);
		pessoa.senha = util.createSenhaHash(password,pessoa.salt); 

		await util.dbUpdate(conn, 'hbrd_app_pessoa', `WHERE id = ${pessoa.id} `, pessoa);

		body.id_pessoa = pessoa.id;

		// Verifica se já assiste associado relacionado a pessoa e atualiza dados na proposta

		let associado = await util.dbFindOne(conn,`SELECT * FROM hbrd_app_associado WHERE id_pessoa = ?`,[body.id_pessoa] );

		if(!associado){
			associado = await util.formatDatabase(conn, "hbrd_app_associado", body);
			associado.id = await util.dbInsert(conn, 'hbrd_app_associado', associado);
			let tokenAssociado = util.createToken(pessoa.id);
	
			let pet = {
				id_associado: associado.id
			};
	
			await util.dbUpdate(conn,'hbrd_app_pet', `WHERE id_proposta =  ${params.id}`, pet);
		}

		// Prepara mensagens de envio pelo whats

		let template = await util.dbFindOne(conn,'SELECT A.* FROM hbrd_app_notificacao A WHERE A.id = 14');

		let pet = await util.dbFindOne(conn,`
			SELECT A.*, B.titulo especie, C.titulo raca
			FROM hbrd_app_pet A 
			INNER JOIN hbrd_app_pet_especie B ON B.id = A.id_especie
			INNER JOIN hbrd_app_pet_raca C ON C.id = A.id_raca 
			WHERE A.id_associado = ${associado.id}`);

		let plano = await util.dbFindOne(conn,`
			SELECT
				C.*,
				(SELECT GROUP_CONCAT(A.nome) FROM hbrd_app_plano_beneficio A LEFT JOIN hbrd_app_plano_use_beneficio B ON A.id = B.id_beneficio WHERE B.id_plano = C.id) beneficios_virgula
				FROM hbrd_app_planos C 
			WHERE C.id = ${pet.id_plano}
		`);

		let mensagem = String(template.mensagem).replace('{[assos_nome]}',(pessoa.nome || '').trim());
		mensagem = mensagem.replace('{[assos_telefone]}', pessoa.telefone || '');
		mensagem = mensagem.replace('{[assos_password]}', password || '');
		mensagem = mensagem.replace('{[assos_email]}', pessoa.email || '');
		mensagem = mensagem.replace('{[pet_nome]}', pet.nome || '');
		mensagem = mensagem.replace('{[pet_especie]}', pet.especie || '');
		mensagem = mensagem.replace('{[pet_raca]}', pet.raca || '');
		mensagem = mensagem.replace('{[pet_cor]}', pet.cor || '');
		mensagem = mensagem.replace('{[pet_porte]}', pet.porte || '');

		mensagem = mensagem.replace('{[pet_plano_nome]}', plano.titulo || '');
		mensagem = mensagem.replace('{[pet_plano_valor]}', util.formatCurrency(plano.valor) || '');

		mensagem = mensagem.replace('{[beneficios]}', plano.beneficios_virgula.replaceAll(',', '\n') || '');
		mensagem = mensagem.replace('{[beneficios_virgula]}', plano.beneficios_virgula || '');

		mensagem = mensagem.replace('{[indicador_nome]}', JSON.parse(proposta.indicador).nome || '');
		mensagem = mensagem.replace('{[indicador_telefone]}', JSON.parse(proposta.indicador).telefone || '');

		await util.sendLeadszApp(conn, pessoa.id,mensagem); // Envio de mensagem por whatsapp

		let smtp = await util.dbFindOne(conn, 'SELECT A.* FROM hbrd_main_smtp A');

		// Prepara template de envio de email

		let email = String(template.template_email).replace('{[assos_nome]}',(pessoa.nome || '').trim());
		email = email.replace('{[assos_telefone]}', pessoa.telefone || '');
		email = email.replace('{[assos_password]}', password || '');
		email = email.replace('{[assos_email]}', pessoa.email || '');
		email = email.replace('{[pet_nome]}', pet.nome || '');
		email = email.replace('{[pet_especie]}', pet.especie || '');
		email = email.replace('{[pet_raca]}', pet.raca || '');
		email = email.replace('{[pet_cor]}', pet.cor || '');
		email = email.replace('{[pet_porte]}', pet.porte || '');

		email = email.replace('{[pet_plano_nome]}', plano.titulo || '');
		email = email.replace('{[pet_plano_valor]}', util.formatCurrency(plano.valor) || '');

		email = email.replace('{[beneficios]}', plano.beneficios_virgula.replaceAll(',', '<br>') || '');
		email = email.replace('{[beneficios_virgula]}', plano.beneficios_virgula || '');

		email = email.replace('{[indicador_nome]}', JSON.parse(proposta.indicador).nome || '');
		email = email.replace('{[indicador_telefone]}', JSON.parse(proposta.indicador).telefone || '');

		let mailOptions = {
			from: '"Aupet Heinsten" <' + smtp.email_padrao + '>',
			to: pessoa.email,
			subject: "Aupet Heinsten - Primeiro Login",
			text: '',
			html: email
		};

		if(template.envia_email) await util.emailHandler(smtp, mailOptions); // Envio de mensagem por email

		return res.status(200).send();
	} catch (error) {
	}
}