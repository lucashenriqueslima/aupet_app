import * as express from 'express';
import * as util from './util';
import * as fileType from 'file-type';
import * as moment from 'moment';
export function routesClinica() {
	const route = express.Router();
	route.post('/criar', util.requestHandler(createClinica));
	route.get("/agendamentos", util.requestHandler(agendamentos));
	route.get("/agendamento/:id/especialidade/:id_especialidade", util.requestHandler(agendamento));
	route.get('/getImages', util.requestHandler(getImages));
	route.get('/findEspecialidades', util.requestHandler(findEspecialidades));
	route.put('/atualizar', util.requestHandler(atualizaClinica));
	route.put('/cancelaAgendamento', util.requestHandler(cancelarAgendamento));
	route.put('/confirmarAgendamento', util.requestHandler(confirmarAgendamento));
	route.put('/agendamentoRealizado', util.requestHandler(agendamentoRealizado));
	return route;
}
const hoje = new Date();
async function createClinica(conn, req, res, body) {
	let pessoa = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa WHERE email = ?`, [body.email]);
	if (!pessoa) {
		pessoa = await util.formatDatabase(conn, 'hbrd_app_pessoa', body);
		pessoa.salt = util.createSalt();
		pessoa.senha = util.createSenhaHash(pessoa.senha, pessoa.salt);
		body.id_pessoa = await util.dbInsert(conn, 'hbrd_app_pessoa', pessoa);
	} else {
		let credenciado = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_clinica WHERE id_pessoa = ${pessoa.id} AND delete_at IS NULL`, [body.email]);
		if (credenciado) util.BadRequest(res, "Você ja é credenciado")
		let body_pessoa = await util.formatDatabase(conn,'hbrd_app_pessoa', body);
		body_pessoa.salt = util.createSalt();
		body_pessoa.senha = util.createSenhaHash(body_pessoa.senha, body_pessoa.salt);
		if (!body_pessoa.foto) util.BadRequest(res, "Foto do perfil necessária");
		body_pessoa.foto = await util.sendFileAws(util.base64RemoveHeader(body_pessoa.foto));
		await util.dbUpdate(conn, 'hbrd_app_pessoa', ` WHERE id = ${pessoa.id}`, body_pessoa);
		body.id_pessoa = pessoa.id;
	}
	let clinica = await util.formatDatabase(conn, "hbrd_app_clinica", body);
	if (clinica.logo && !clinica.logo?.includes('com/aupet')) clinica.logo = await util.sendFileAws(util.base64RemoveHeader(clinica.logo));
	clinica.solicitado = 1;
	let id_clinica = await util.dbInsert(conn, `hbrd_app_clinica`, clinica);
	let espPromi = [];
	await util.dbDelete(conn, "hbrd_app_clinica_use_beneficio", " where id_clinica = ?", [id_clinica]);
	body.especialidades.forEach(x => {
		espPromi.push(util.dbInsert(conn, `hbrd_app_clinica_use_beneficio`, { 'id_clinica': id_clinica, 'id_beneficio': x.id }));
	});
	await Promise.all(espPromi);
	if (body.images) {
		for (let i = 0; i < body.images.length; i++) {
			if (body.images[i] != '') {
				body.images[i] = await util.sendFileAws(util.base64RemoveHeader(body.images[i]));
				await util.dbInsert(conn, `hbrd_app_clinica_fotos`, { 'id_clinica': id_clinica, 'url': body.images[i] });
			}
		}
	}
	res.status(200).send();
}
async function atualizaClinica(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa where id = ?`, [token.id_pessoa]);
	//ver se id do consultor pelo solicitante e atualizar dados
	let pessoa = await util.formatDatabase(conn, 'hbrd_app_pessoa', body);
	if (pessoa.foto != undefined && !pessoa.foto?.includes('com/aupet')) pessoa.foto = await util.sendFileAws(util.base64RemoveHeader(pessoa.foto));
	//verifica se foi enviada nova foto e salva na nuvem
	let clinica = await util.formatDatabase(conn, 'hbrd_app_clinica', body.clinica);
	if (clinica.logo != undefined && !clinica.logo?.includes('com/aupet')) clinica.logo = await util.sendFileAws(util.base64RemoveHeader(clinica.logo));
	//verifica se foi enviada nova foto e salva na nuvem
	delete pessoa.create_at;
	delete clinica.create_at;
	await util.dbUpdate(conn, 'hbrd_app_pessoa', `WHERE id = ${pessoa.id} `, pessoa);
	await util.dbUpdate(conn, 'hbrd_app_clinica', `WHERE id = ${clinica.id} `, clinica);
	//atualiza tabelas
	await util.dbDelete(conn, `hbrd_app_clinica_use_beneficio`, `WHERE id_clinica = ${clinica.id}`);
	if (body.especialidades) {
		for (let i = 0; i < body.especialidades.length; i++) {
			await util.dbInsert(conn, `hbrd_app_clinica_use_beneficio`, { 'id_clinica': clinica.id, 'id_beneficio': body.especialidades[i]['id'] });
		}
	}
	if (body.images) {
		for (let i = 0; i < body.images.length; i++) {
			if (body.images[i] != '') {
				body.images[i] = await util.sendFileAws(util.base64RemoveHeader(body.images[i]), req['nova_client'] + '/hbrd_cms_store');
				await util.dbInsert(conn, `hbrd_app_clinica_fotos`, { 'id_clinica': clinica.id, 'url': body.images[i] });
			}
		}
	}
	res.status(200).send();
}
async function agendamentos(conn, req, res, body) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let clinica = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_clinica A  WHERE A.id_pessoa = '${token.id_pessoa}'`);
	const agendamentos = await util.dbFindList(conn, `SELECT A.*, B.nome as pet , B.foto as  foto_pet , C.nome as servico FROM hbrd_app_pet_agendamento as A 
    INNER JOIN  hbrd_app_pet as B on(A.id_pet = B.id)  INNER JOIN  hbrd_app_plano_beneficio as C on(A.id_especialidade = C.id) WHERE A.id_clinica =  ${clinica.id}`);
	const exames = await util.dbFindList(conn, `SELECT A.*, B.nome as pet , B.foto as  foto_pet , C.nome as servico, A.data as data_agendamento, A.observacao descricao FROM hbrd_app_pet_exames as A 
    INNER JOIN  hbrd_app_pet as B on(A.id_pet = B.id)  INNER JOIN  hbrd_app_plano_beneficio as C on(A.id_especialidade = C.id) WHERE A.id_clinica =  ${clinica.id}`);
	const vacinas = await util.dbFindList(conn, `SELECT A.*, B.nome as pet , B.foto as  foto_pet , C.nome as servico, A.data_vacina as data_agendamento FROM hbrd_app_pet_vacinas as A 
    INNER JOIN  hbrd_app_pet as B on(A.id_pet = B.id)  INNER JOIN  hbrd_app_plano_beneficio as C on(A.id_especialidade = C.id) WHERE A.id_clinica =  ${clinica.id}`);
	const internacoes = await util.dbFindList(conn, `SELECT A.*, B.nome as pet , B.foto as  foto_pet , C.nome as servico, A.data_hora as data_agendamento FROM hbrd_app_pet_internacoes as A 
    INNER JOIN  hbrd_app_pet as B on(A.id_pet = B.id)  INNER JOIN  hbrd_app_plano_beneficio as C on(A.id_especialidade = C.id) WHERE A.id_clinica =  ${clinica.id}`);
	const cirurgias = await util.dbFindList(conn, `SELECT A.*, B.nome as pet , B.foto as  foto_pet , C.nome as servico, A.data_hora as data_agendamento FROM hbrd_app_pet_cirurgias as A 
    INNER JOIN  hbrd_app_pet as B on(A.id_pet = B.id)  INNER JOIN  hbrd_app_plano_beneficio as C on(A.id_especialidade = C.id) WHERE A.id_clinica =  ${clinica.id}`);
	if (exames.length !== 0) exames.forEach(exame => agendamentos.push(exame));
	if (vacinas.length !== 0) vacinas.forEach(vacina => agendamentos.push(vacina));
	if (internacoes.length !== 0) internacoes.forEach(internacao => agendamentos.push(internacao));
	if (cirurgias.length !== 0) cirurgias.forEach(cirurgia => agendamentos.push(cirurgia));
	res.status(200).send({ agendamentos: agendamentos });
}
async function getImages(conn, req, res, body) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let clinica_id = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_clinica where id_pessoa = ?`, token.id_pessoa);
	let data = await util.dbFindList(conn, `SELECT url FROM hbrd_app_clinica_fotos where id_clinica ='${clinica_id.id}'`);
	res.status(200).send(data);
}
async function findEspecialidades(conn, req, res, body) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let clinica_id = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_clinica where id_pessoa = ?`, token.id_pessoa);
	let data = await util.dbFindList(conn, `SELECT * FROM hbrd_app_plano_beneficio as A Inner join
	hbrd_app_clinica_use_beneficio as B on B.id_beneficio = A.id  WHERE B.id_clinica = '${clinica_id.id}'`);
	res.status(200).send(data);
}
async function agendamento(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let clinica = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_clinica A  WHERE A.id_pessoa = '${token.id_pessoa}'`);
	let agendamento;
	switch (params.id_especialidade) {
		case '3': case '10':
			agendamento = await util.dbFindOne(conn, `SELECT A.*, A.id as id_agendamento, A.status as status_agendamento, A.data as data_agendamento, B.* , C.nome as servico, D.titulo as especie , E.titulo as raca FROM hbrd_app_pet_exames as A 
			INNER JOIN  hbrd_app_pet as B on(A.id_pet = B.id) INNER JOIN  hbrd_app_plano_beneficio as C on(A.id_especialidade = C.id)
			INNER JOIN  hbrd_app_pet_especie as D on(B.id_especie = D.id) INNER JOIN hbrd_app_pet_raca as E on(B.id_raca = E.id) WHERE A.id =  ${params.id}`);
			break;
		case '4':
			agendamento = await util.dbFindOne(conn, `SELECT A.*,A.id as id_agendamento, A.status as status_agendamento, A.data_vacina as data_agendamento,  B.* , C.nome as servico, D.titulo as especie , E.titulo as raca FROM hbrd_app_pet_vacinas as A 
			INNER JOIN  hbrd_app_pet as B on(A.id_pet = B.id) INNER JOIN  hbrd_app_plano_beneficio as C on(A.id_especialidade = C.id)
			INNER JOIN  hbrd_app_pet_especie as D on(B.id_especie = D.id) INNER JOIN hbrd_app_pet_raca as E on(B.id_raca = E.id) WHERE A.id =  ${params.id}`);
			break;
		case '5':
			agendamento = await util.dbFindOne(conn, `SELECT A.*, A.id as id_agendamento, A.status as status_agendamento, B.* , C.nome as servico, D.titulo as especie , E.titulo as raca FROM hbrd_app_pet_internacoes as A 
			INNER JOIN  hbrd_app_pet as B on(A.id_pet = B.id) INNER JOIN  hbrd_app_plano_beneficio as C on(A.id_especialidade = C.id)
			INNER JOIN  hbrd_app_pet_especie as D on(B.id_especie = D.id) INNER JOIN hbrd_app_pet_raca as E on(B.id_raca = E.id) WHERE A.id =  ${params.id}`);
			break;
		case '6': case '7': case '9':
			agendamento = await util.dbFindOne(conn, `SELECT A.*, A.id as id_agendamento, A.status as status_agendamento, B.* , C.nome as servico, D.titulo as especie , E.titulo as raca FROM hbrd_app_pet_cirurgias as A 
			INNER JOIN  hbrd_app_pet as B on(A.id_pet = B.id) INNER JOIN  hbrd_app_plano_beneficio as C on(A.id_especialidade = C.id)
			INNER JOIN  hbrd_app_pet_especie as D on(B.id_especie = D.id) INNER JOIN hbrd_app_pet_raca as E on(B.id_raca = E.id) WHERE A.id =  ${params.id}`);
			break;
		default:
			agendamento = await util.dbFindOne(conn, `SELECT A.*, A.id as id_agendamento, A.status as status_agendamento, B.* , C.nome as servico, D.titulo as especie , E.titulo as raca FROM hbrd_app_pet_agendamento as A 
			INNER JOIN  hbrd_app_pet as B on(A.id_pet = B.id) INNER JOIN  hbrd_app_plano_beneficio as C on(A.id_especialidade = C.id)
			INNER JOIN  hbrd_app_pet_especie as D on(B.id_especie = D.id) INNER JOIN hbrd_app_pet_raca as E on(B.id_raca = E.id) WHERE A.id =  ${params.id}`);
			break;
	}
	let associado = await util.dbFindOne(conn, `SELECT  A.* , B.* FROM hbrd_app_associado as A INNER JOIN hbrd_app_pessoa as B on (A.id_pessoa = B.id) WHERE A.id = ${agendamento?.id_associado}`);
	agendamento.associado = associado;
	res.status(200).send({ agendamento: agendamento });
}
async function cancelarAgendamento(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let data_cancelado = hoje.getFullYear() + '-' + (hoje.getMonth() + 1) + '-' + hoje.getDate() + ' ' + hoje.getHours() + ':' + hoje.getMinutes() + ':' + '00';
	let associado;
	switch (body.id_especialidade) {
		case '3': case '10':
			await util.dbUpdate(conn, 'hbrd_app_pet_exames', `WHERE id = ${body.id_agendamento} `, { status: 'Cancelado', id_motivo_cancelamento: body.id_motivo, data_cancelado: data_cancelado });
			associado = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_pet A INNER JOIN hbrd_app_pet_exames B ON B.id_pet = A.id WHERE B.id = ${body.id_agendamento}`);
			await notificacaoCancelaAgendamento(conn, associado.id_associado);
			break;
		case '4':
			await util.dbUpdate(conn, 'hbrd_app_pet_vacinas', `WHERE id = ${body.id_agendamento} `, { status: 'Cancelado', id_motivo_cancelamento: body.id_motivo, data_cancelado: data_cancelado });
			associado = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_pet A INNER JOIN hbrd_app_pet_vacinas B ON B.id_pet = A.id WHERE B.id = ${body.id_agendamento}`);
			await notificacaoCancelaAgendamento(conn, associado.id_associado);
			break;
		case '5':
			await util.dbUpdate(conn, 'hbrd_app_pet_internacoes', `WHERE id = ${body.id_agendamento} `, { status: 'Cancelado', id_motivo_cancelamento: body.id_motivo, data_cancelado: data_cancelado });
			associado = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_pet A INNER JOIN hbrd_app_pet_internacoes B ON B.id_pet = A.id WHERE B.id = ${body.id_agendamento}`);
			await notificacaoCancelaAgendamento(conn, associado.id_associado);
			break;
		case '6': case '7': case '9':
			await util.dbUpdate(conn, 'hbrd_app_pet_cirurgias', `WHERE id = ${body.id_agendamento} `, { status: 'Cancelado', id_motivo_cancelamento: body.id_motivo, data_cancelado: data_cancelado });
			associado = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_pet A INNER JOIN hbrd_app_pet_cirurgias B ON B.id_pet = A.id WHERE B.id = ${body.id_agendamento}`);
			await notificacaoCancelaAgendamento(conn, associado.id_associado);
			break;
		default:
			await util.dbUpdate(conn, 'hbrd_app_pet_agendamento', `WHERE id = ${body.id_agendamento} `, { status: 'Cancelado', id_motivo_cancelamento: body.id_motivo, data_cancelado: data_cancelado });
			associado = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_pet A INNER JOIN hbrd_app_pet_agendamento B ON B.id_pet = A.id WHERE B.id = ${body.id_agendamento}`);
			await notificacaoCancelaAgendamento(conn, associado.id_associado);
			break;
	}
	// Salva Historico de Pessoa 
	res.status(200).send();
}
async function confirmarAgendamento(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let data_cancelado = hoje.getFullYear() + '-' + (hoje.getMonth() + 1) + '-' + hoje.getDate() + ' ' + hoje.getHours() + ':' + hoje.getMinutes() + ':' + '00';
	let associado;
	switch (body.id_especialidade) {
		case '3': case '10':
			await util.dbUpdate(conn, 'hbrd_app_pet_exames', `WHERE id = ${body.id_agendamento} `, { status: 'Agendado' });
			associado = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_pet A INNER JOIN hbrd_app_pet_exames B ON B.id_pet = A.id WHERE B.id = ${body.id_agendamento}`);
			await notificacaoConfirmaAgendamento(conn, associado.id_associado);
			break;
		case '4':
			await util.dbUpdate(conn, 'hbrd_app_pet_vacinas', `WHERE id = ${body.id_agendamento} `, { status: 'Agendado' });
			associado = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_pet A INNER JOIN hbrd_app_pet_vacinas B ON B.id_pet = A.id WHERE B.id = ${body.id_agendamento}`);
			await notificacaoConfirmaAgendamento(conn, associado.id_associado);
			break;
		case '5':
			await util.dbUpdate(conn, 'hbrd_app_pet_internacoes', `WHERE id = ${body.id_agendamento} `, { status: 'Agendado' });
			associado = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_pet A INNER JOIN hbrd_app_pet_internacoes B ON B.id_pet = A.id WHERE B.id = ${body.id_agendamento}`);
			await notificacaoConfirmaAgendamento(conn, associado.id_associado);
			break;
		case '6': case '7': case '9':
			await util.dbUpdate(conn, 'hbrd_app_pet_cirurgias', `WHERE id = ${body.id_agendamento} `, { status: 'Agendado' });
			associado = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_pet A INNER JOIN hbrd_app_pet_cirurgias B ON B.id_pet = A.id WHERE B.id = ${body.id_agendamento}`);
			await notificacaoConfirmaAgendamento(conn, associado.id_associado);
			break;
		default:
			await util.dbUpdate(conn, 'hbrd_app_pet_agendamento', `WHERE id = ${body.id_agendamento} `, { status: 'Agendado' });
			associado = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_pet A INNER JOIN hbrd_app_pet_agendamento B ON B.id_pet = A.id WHERE B.id = ${body.id_agendamento}`);
			await notificacaoConfirmaAgendamento(conn, associado.id_associado);
			break;
	}
	// Salva Historico de Pessoa 
	res.status(200).send();
}
async function agendamentoRealizado(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let data_cancelado = hoje.getFullYear() + '-' + (hoje.getMonth() + 1) + '-' + hoje.getDate() + ' ' + hoje.getHours() + ':' + hoje.getMinutes() + ':' + '00';
	let associado;
	switch (body.id_especialidade) {
		case 3: case 10:
			await util.dbUpdate(conn, 'hbrd_app_pet_exames', `WHERE id = ${body.id_agendamento} `, { status: 'Concluido', nome_medico: body.nome_medico, crv_medico: body.crv_medico });
			associado = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_pet A INNER JOIN hbrd_app_pet_exames B ON B.id_pet = A.id WHERE B.id = ${body.id_agendamento}`);
			// await notificacaoConfirmaAgendamento(conn, associado.id_associado);
			break;
		case 4:
			await util.dbUpdate(conn, 'hbrd_app_pet_vacinas', `WHERE id = ${body.id_agendamento} `, { status: 'Concluido', nome_medico: body.nome_medico, crv_medico: body.crv_medico, data_revacina: body.data_revacina });
			associado = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_pet A INNER JOIN hbrd_app_pet_vacinas B ON B.id_pet = A.id WHERE B.id = ${body.id_agendamento}`);
			// await notificacaoConfirmaAgendamento(conn, associado.id_associado);
			break;
		case 5:
			await util.dbUpdate(conn, 'hbrd_app_pet_internacoes', `WHERE id = ${body.id_agendamento} `, { status: 'Concluido', nome_medico: body.nome_medico, crv_medico: body.crv_medico });
			associado = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_pet A INNER JOIN hbrd_app_pet_internacoes B ON B.id_pet = A.id WHERE B.id = ${body.id_agendamento}`);
			// await notificacaoConfirmaAgendamento(conn, associado.id_associado);
			break;
		case 6: case 7: case 9:
			await util.dbUpdate(conn, 'hbrd_app_pet_cirurgias', `WHERE id = ${body.id_agendamento} `, { status: 'Concluido', nome_medico: body.nome_medico, crv_medico: body.crv_medico });
			associado = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_pet A INNER JOIN hbrd_app_pet_cirurgias B ON B.id_pet = A.id WHERE B.id = ${body.id_agendamento}`);
			// await notificacaoConfirmaAgendamento(conn, associado.id_associado);
			break;
		default:
			await util.dbUpdate(conn, 'hbrd_app_pet_agendamento', `WHERE id = ${body.id_agendamento} `, { status: 'Concluido', nome_medico: body.nome_medico, crv_medico: body.crv_medico });
			associado = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_pet A INNER JOIN hbrd_app_pet_agendamento B ON B.id_pet = A.id WHERE B.id = ${body.id_agendamento}`);
			// await notificacaoConfirmaAgendamento(conn, associado.id_associado);
			break;
	}
	// Salva Historico de Pessoa 
	res.status(200).send();
}
async function notificacaoConfirmaAgendamento(conn, id_pessoa) {
	let associado = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_associado A INNER JOIN hbrd_app_pessoa B ON A.id_pessoa = B.id WHERE A.id = ${id_pessoa}`);
	await util.enviarNotificacao(conn, associado.id_pessoa, 'Seu agendamento foi confimado');
	await util.sendLeadszApp(conn, associado.id_pessoa, 'Seu agendamento foi confimado');
}
async function notificacaoCancelaAgendamento(conn, id_pessoa) {
	let associado = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_associado A INNER JOIN hbrd_app_pessoa B ON A.id_pessoa = B.id WHERE A.id = ${id_pessoa}`);
	await util.enviarNotificacao(conn, associado.id_pessoa, 'Seu agendamento foi cancelado');
	await util.sendLeadszApp(conn, associado.id_pessoa, 'Seu agendamento foi cancelado');
}