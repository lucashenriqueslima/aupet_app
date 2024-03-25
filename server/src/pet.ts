import * as express from 'express';
import * as util from './util';
import * as currency from 'currency-formatter';
import * as fileType from 'file-type';
import * as multer from 'multer';
import * as Jimp from 'jimp';
import * as Sentry from '@sentry/node';
import * as request from 'request';
import * as moment from 'moment';
import * as pdf from 'html-pdf';
import * as ejs from 'ejs';
import * as mercadopago from 'mercadopago';
import { stat } from 'fs';
const storage = multer.memoryStorage();
const upload = multer({ storage });
'pet/'
export function routesPet() {
	const route = express.Router();
	route.put('/atualizar', util.requestHandler(atualizarPet));
	route.post('/adicionar', util.requestHandler(adicionarPet));
	route.put('/arquivar', util.requestHandler(arquivarPet));  
	route.put('/desarquivar', util.requestHandler(desarquivarPet));
	route.put('/excluir', util.requestHandler(excluirPet));
	route.get('/proposta/:id', util.requestHandler(obterDetalhePet));
	route.get("/getPet/:id", util.requestHandler(getPet));
	route.get("/getClinicasByPlanoPet/:id", util.requestHandler(getClinicasByPlanoPet));
	route.post('/adcionarExame', util.requestHandler(adcionarExame));
	route.get('/getExames/:id', util.requestHandler(getExames));
	route.post('/adcionarMedicamento', util.requestHandler(adcionarMedicamento));
	route.get('/getMedicamentos/:id', util.requestHandler(getMedicamentos));
	route.post('/adicionarBanho', util.requestHandler(adicionarBanho));
	route.get('/banhos/:id_pet', util.requestHandler(getBanhos));
	route.post('/adicionarVacina', util.requestHandler(adicionarVacina));
	route.get('/vacinas/:id_pet', util.requestHandler(getVacinas));
	route.get('/status/:id_pet', util.requestHandler(statusPet));
	route.post('/adicionarVermifungo', util.requestHandler(adicionarVermifungo));
	route.get('/vermifungos/:id_pet', util.requestHandler(getVermifungos));
	route.get('/montarCarterinha/:hash', util.requestHandler(montarCarterinha));
	route.post("/verificarAgenda", util.requestHandler(verificarAgenda));
	route.post("/agendar", util.requestHandler(agendar));
	route.post('/mudarStatus', util.requestHandler(mudarStatusPet));

	return route;
}
async function obterDetalhePet(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa WHERE id = ?`, [token.id_pessoa]);
	// ver se solicitante tem acesso ao params.ambiente e ao lead 
	let pet = await util.dbFindOne(conn, `SELECT A.*, B.titulo plano, C.titulo especie, D.titulo raca, A.hash FROM hbrd_app_pet A INNER JOIN hbrd_app_planos B ON B.id = A.id_plano LEFT JOIN hbrd_app_pet_especie C ON C.id = A.id_especie LEFT JOIN hbrd_app_pet_raca D ON D.id = A.id_raca LEFT JOIN hbrd_app_proposta E ON E.id = A.id_proposta WHERE A.id = ?`, [params.id]);
	pet.plano_beneficios = await util.dbFindList(conn, `SELECT A.* FROM hbrd_app_plano_beneficio as A INNER JOIN hbrd_app_plano_use_beneficio as B on( A.id = B.id_beneficio) Where B.id_plano = ? `, [pet.id_plano]);
	let plano = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_planos A WHERE A.id = ?`, [pet.id_plano]);
	res.status(200).send({ pet: pet, plano: plano });
}
async function atualizarPet(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa WHERE id = ?`, [token.id_pessoa]);
	// ver se solicitante tem acesso ao params.ambiente e ao lead 
	delete body?.create_at;
	let pet = await util.formatDatabase(conn, "hbrd_app_pet", body);
	if (pet.foto) if (!pet.foto?.includes('com/aupet')) pet.foto = await util.sendFileAws(util.base64RemoveHeader(pet.foto));
	pet = await util.formatDatabase(conn, "hbrd_app_pet", pet);
	if (!pet.hash) {
		pet.hash = util.createHashMD5(String(util.createSalt()) + String(util.createSalt()));
	}
	await util.dbUpdate(conn, 'hbrd_app_pet', `WHERE id = ${pet.id}`, pet);
	await util.dbInsert(conn, 'hbrd_app_proposta_hist', { 'id_proposta': pet.id_proposta, 'atividade': `Alterou os dados do pet ${pet.nome}`, 'id_pessoa': solicitante.id, 'nome': solicitante.nome });
	res.status(200).send();
}
async function arquivarPet(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa WHERE id = ?`, [token.id_pessoa]);
	let associado = await util.dbFindOne(conn,"SELECT * FROM hbrd_app_associado WHERE id_pessoa = ?",[token.id_pessoa]);

	// ver se solicitante tem acesso ao params.ambiente e ao lead 
	delete body?.create_at;
	let pet = await util.formatDatabase(conn, "hbrd_app_pet", body);
	let valorPlano = await util.dbFindOne(conn,"SELECT B.valor, B.titulo FROM hbrd_app_pet A LEFT JOIN hbrd_app_planos B ON B.id = A.id_plano WHERE A.id = ?", [pet.id]);

	await util.dbUpdate(conn, 'hbrd_app_pet', `WHERE id = ${pet.id}`, pet);
	await util.dbInsert(conn, 'hbrd_app_proposta_hist', { 'id_proposta': pet.id_proposta, 'atividade': `Arquivou o pet ${pet.nome}`, 'id_pessoa': solicitante.id, 'nome': solicitante.nome });
	

	res.status(200).send();
}

async function excluirPet(conn, req, res, body, params){
	let token = await util.verifyToken(req.headers['access_token'], res);
    let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa A LEFT JOIN hbrd_main_util_city B ON A.id_cidade = B.id LEFT JOIN hbrd_main_util_state C ON A.id_estado = C.id  where A.id = ?`, [token.id_pessoa]);

	await util.dbUpdate(conn,'hbrd_app_pet',`WHERE id = ${body.id_pet}`,{ delete_at: new Date().toISOString() });

	if(body.assinatura){
		let access_token = await util.dbFindOne(conn, 'SELECT access_token FROM hbrd_adm_integration');
	    mercadopago.configurations.setAccessToken(access_token.access_token);

		await mercadopago.preapproval.findById(body.assinatura.assinatura)
			.then(async (signature) => {
				await mercadopago.preapproval.cancel(body.assinatura.assinatura)
					.then(async (signature) => {
						let data = {
							status: "cancelled", 
							deleted_at: new Date().toISOString(),
							cancelado_em: new Date().toISOString()
						}

						await util.dbUpdate(conn,'hbrd_app_assinatura',`WHERE id = ${body.assinatura.id}`,data);

						let template = await util.dbFindOne(conn,'SELECT A.* FROM hbrd_app_notificacao A WHERE A.id = 18');

						if(template.desativado == '0'){
							let pet = await util.dbFindOne(conn,` SELECT A.*, B.titulo especie, C.titulo raca FROM hbrd_app_pet A INNER JOIN hbrd_app_pet_especie B ON B.id = A.id_especie INNER JOIN hbrd_app_pet_raca C ON C.id = A.id_raca WHERE A.id = ${body.id_pet}`);
							let plano = await util.dbFindOne(conn,` SELECT C.*, (SELECT GROUP_CONCAT(A.nome) FROM hbrd_app_plano_beneficio A LEFT JOIN hbrd_app_plano_use_beneficio B ON A.id = B.id_beneficio WHERE B.id_plano = C.id) beneficios_virgula FROM hbrd_app_planos C WHERE C.id = ${pet.id_plano} `);

							let mensagem = replaceTemplate(template,solicitante,plano,pet);

							await util.sendLeadszApp(conn,token.id_pessoa,mensagem);

							if(template.envia_email){
                                let smtp = await util.dbFindOne(conn, 'SELECT A.* FROM hbrd_main_smtp A');
                                let email = replaceTemplateEmail(template,solicitante,plano,pet);
        
                                let mailOptions = {
                                    from: '"Aupet Heinsten" <' + smtp.email_padrao + '>',
                                    to:  (process.env.NODE_ENV == 'production') ? solicitante.email : 'suporte@ileva.com.br',
                                    subject: replaceTemplateEmailAssunto(template,solicitante,plano,pet),
                                    text: '',
                                    html: email
                                };
        
                                await util.emailHandler(smtp, mailOptions);
                            }

						}

						return res.status(200).send({ messsage: 'Assinatura cancelada com sucesso!' });
					})
					.catch((signature) => {
						return res.status(400).send({ messsage: 'Erro ao cancelar assinatura! Por favor tente novamente' });
					});
			})
			.catch((signature) => {
				return res.status(404).send({ message: 'Assinatura não encontrada! Por favor tente novamente.' });
			});
	}

	res.status(200).send();
}

async function desarquivarPet(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa WHERE id = ?`, [token.id_pessoa]);
	// ver se solicitante tem acesso ao params.ambiente e ao lead 
	delete body?.create_at;
	let pet = await util.formatDatabase(conn, "hbrd_app_pet", body);
	
	pet.arquivado_em = null;

	await util.dbUpdate(conn, 'hbrd_app_pet', `WHERE id = ${pet.id}`, pet);
	await util.dbInsert(conn, 'hbrd_app_proposta_hist', { 'id_proposta': pet.id_proposta, 'atividade': `Desarquivou o pet ${pet.nome}`, 'id_pessoa': solicitante.id, 'nome': solicitante.nome });
	res.status(200).send();
}

async function adicionarPet(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa WHERE id = ?`, [token.id_pessoa]);
	// ver se solicitante tem acesso ao params.ambiente e ao lead 
	let pet = await util.formatDatabase(conn, "hbrd_app_pet", body);
	let plano = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_planos where id = ?`, [pet.id_plano]);
	if (pet.foto != undefined && !pet.foto?.includes('com/aupet')) pet.foto = await util.sendFileAws(util.base64RemoveHeader(pet.foto));
	if (plano != undefined) pet.valor = plano.valor;
	pet = await util.formatDatabase(conn, "hbrd_app_pet", pet);
	pet.hash = util.createHashMD5(String(util.createSalt()) + String(util.createSalt()));
	let response = await util.dbInsert(conn, 'hbrd_app_pet', pet);
	await util.dbInsert(conn, 'hbrd_app_proposta_hist', { 'id_proposta': pet.id_proposta, 'atividade': `Adicionou o pet ${pet.nome} a proposta`, 'id_pessoa': solicitante.id, 'nome': solicitante.nome });
	res.status(200).send({ insertId: response });
}
async function messagemCompartilhamentoPet(conn, id_pet) {
	try {
		let data = await util.dbFindOne(conn, `SELECT DISTINCT
			A.*,
			DATE_FORMAT(A.create_at, '%d/%m/%Y') dt_proposta,
			 (SELECT nome FROM hbrd_app_pessoa WHERE id = A.id_pessoa) nome,
			(SELECT email FROM hbrd_app_pessoa WHERE id = A.id_pessoa) email,
			(SELECT telefone FROM hbrd_app_pessoa WHERE id = A.id_pessoa) telefone,
			B.nome pet_nome,B.porte pet_porte,B.sexo pet_sexo,
			C.shared_msg, C.shared_pdf,
			C.titulo pet_plano_nome,C.valor pet_plano_valor,
			Z.titulo pet_raca, Y.titulo pet_especie,
			F.nome indicador_nome,
			F.telefone indicador_telefone,
			(SELECT GROUP_CONCAT(A.nome) FROM hbrd_app_plano_beneficio A LEFT JOIN hbrd_app_plano_use_beneficio B ON A.id = B.id_beneficio WHERE B.id_plano = C.id) beneficios_virgula
		FROM
			hbrd_app_proposta A
			LEFT JOIN hbrd_app_pet B ON B.id_proposta = A.id   
			LEFT JOIN hbrd_app_pet_raca Z ON B.id_raca = Z.id
			LEFT JOIN hbrd_app_pet_especie Y ON B.id_especie = Y.id	
			LEFT JOIN hbrd_app_planos C ON C.id = B.id_plano
			LEFT JOIN hbrd_app_consultor E ON E.id = A.id_consultor
			LEFT JOIN hbrd_app_pessoa F ON F.id = E.id_pessoa
			WHERE B.id = '${id_pet}'`);
		let msg = String(data.shared_msg).replace('{[nome]}', (data.nome || '').trim());
		msg = msg.replace('{[dt_proposta]}', data.dt_proposta || '');
		msg = msg.replace('{[email]}', data.email || '');
		msg = msg.replace('{[telefone]}', data.telefone || '');
		msg = msg.replace('{[pet_nome]}', data.pet_nome || '');
		msg = msg.replace('{[pet_especie]}', data.pet_especie || '');
		msg = msg.replace('{[pet_raca]}', data.pet_raca || '');
		msg = msg.replace('{[pet_sexo]}', data.pet_sexo || '');
		msg = msg.replace('{[pet_porte]}', data.pet_porte || '');
		msg = msg.replace('{[pet_plano_nome]}', data.pet_plano_nome || '');
		msg = msg.replace('{[pet_plano_valor]}', util.formatCurrency(data.pet_plano_valor) || '');
		msg = msg.replace('{[beneficios_virgula]}', data.beneficios_virgula || '');
		msg = msg.replace('{[beneficios]}', data.beneficios_virgula.replaceAll(',', '\n') || '');
		msg = msg.replace('{[indicador_nome]}', data.indicador_nome || '');
		msg = msg.replace('{[indicador_telefone]}', data.indicador_telefone || '');
		// msg = await varBeneficios(conn, id_pet, msg);
		return msg;
	} catch (e) {
		Sentry.captureException(e);
	}
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
async function getClinicasByPlanoPet(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	const clinicas = await util.dbFindList(conn, `SELECT A.*, B.id AS id_clinica, B.nome_fantasia, F.titulo AS planos 
	FROM hbrd_app_pessoa A 
	INNER JOIN hbrd_app_clinica B ON (A.id = B.id_pessoa) 
	INNER JOIN hbrd_app_equipe C ON B.id_equipe = C.id 
	INNER JOIN hbrd_app_regional D ON C.id_regional = D.id 
	INNER JOIN hbrd_app_plano_in_regional E ON E.id_regional = D.id 
	INNER JOIN hbrd_app_planos F ON E.id_plano = F.id 
	INNER JOIN hbrd_app_pet G ON G.id_plano = F.id 
	WHERE A.stats = 1 AND B.stats = 1 AND B.solicitado = 0 AND F.stats = 1 AND F.delete_at IS NULL AND G.id = ${params.id} 
	ORDER BY A.id` );
	for (const clinica of clinicas) {
		clinica.especialidades = await util.dbFindList(conn, `SELECT * FROM hbrd_app_plano_beneficio as A Inner join
			hbrd_app_clinica_use_beneficio as B on B.id_beneficio = A.id  WHERE B.id_clinica = ${clinica.id_clinica}`);
	}
	res.status(200).send({ clinicas: clinicas });
}
async function adcionarExame(conn, req, res, body, params) {
	// if (!body.anexo?.includes('com/aupet')) body.anexo = await util.sendFileAws(util.base64RemoveHeader(body.anexo));
	let Exame = await util.formatDatabase(conn, "hbrd_app_pet_exames", body);
	let response = await util.dbInsert(conn, 'hbrd_app_pet_exames', Exame);
	await enviaNotificacaoAgendamento(conn, body.id_clinica);
	res.status(200).send({ insertId: response });
}
async function getExames(conn, req, res, body, params) {
	await util.queryExe(conn, "SET lc_time_names = 'pt_BR'");
	let exames = await util.dbFindList(conn, `SELECT * , CONCAT(MONTHNAME(data), ' ', YEAR(data)) mes FROM hbrd_app_pet_exames A WHERE A.id_pet =${params.id} `);
	res.status(200).send({ exames: exames });
}
async function adcionarMedicamento(conn, req, res, body, params) {
	let medicamento = await util.formatDatabase(conn, "hbrd_app_pet_medicamentos", body);
	let response = await util.dbInsert(conn, 'hbrd_app_pet_medicamentos', medicamento);
	res.status(200).send({ insertId: response });
}
async function getMedicamentos(conn, req, res, body, params) {
	await util.queryExe(conn, "SET lc_time_names = 'pt_BR'");
	let medicamentos = await util.dbFindList(conn, `SELECT A.* , B.tratamento , CONCAT(MONTHNAME(A.dt_inicio), ' ', YEAR(A.dt_inicio)) mes FROM hbrd_app_pet_medicamentos A
	INNER JOIN  hbrd_app_pet_tipo_tratamento B on (A.id_tipo_tratamento = B.id) 
	WHERE A.id_pet =${params.id} `);
	res.status(200).send({ medicamentos: medicamentos });
}
async function adicionarBanho(conn, req, res, body, params) {
	// if (!body.anexo?.includes('com/aupet')) body.anexo = await util.sendFileAws(util.base64RemoveHeader(body.anexo));
	let banho = await util.formatDatabase(conn, "hbrd_app_pet_banhos", body);
	let response = await util.dbInsert(conn, 'hbrd_app_pet_banhos', banho);
	res.status(200).send({ insertId: response });
}
async function getBanhos(conn, req, res, body, params) {
	await util.queryExe(conn, "SET lc_time_names = 'pt_BR'");
	let banhos = await util.dbFindList(conn, `SELECT *, CONCAT(MONTHNAME(data_banho), ' ', YEAR(data_banho)) mes FROM hbrd_app_pet_banhos A WHERE A.id_pet = ${params.id_pet} ORDER BY A.data_banho`);
	res.status(200).send(banhos);
}
async function adicionarVacina(conn, req, res, body, params) {
	// if (!body.anexo?.includes('com/aupet')) body.anexo = await util.sendFileAws(util.base64RemoveHeader(body.anexo));
	let vacina = await util.formatDatabase(conn, "hbrd_app_pet_vacinas", body);
	let response = await util.dbInsert(conn, 'hbrd_app_pet_vacinas', vacina);
	await enviaNotificacaoAgendamento(conn, body.id_clinica);
	res.status(200).send({ insertId: response });
}
async function getVacinas(conn, req, res, body, params) {
	await util.queryExe(conn, "SET lc_time_names = 'pt_BR'");
	let vacinas = await util.dbFindList(conn, `SELECT *, CONCAT(MONTHNAME(data_vacina), ' ', YEAR(data_vacina)) mes FROM hbrd_app_pet_vacinas A WHERE A.id_pet = ${params.id_pet} ORDER BY A.data_vacina`);
	res.status(200).send(vacinas);
}
async function adicionarVermifungo(conn, req, res, body, params) {
	// if (!body.anexo?.includes('com/aupet')) body.anexo = await util.sendFileAws(util.base64RemoveHeader(body.anexo));
	let vermifungo = await util.formatDatabase(conn, "hbrd_app_pet_vermifugos", body);
	let response = await util.dbInsert(conn, 'hbrd_app_pet_vermifugos', vermifungo);
	res.status(200).send({ insertId: response });
}
async function getVermifungos(conn, req, res, body, params) {
	await util.queryExe(conn, "SET lc_time_names = 'pt_BR'");
	let vermifugos = await util.dbFindList(conn, `SELECT *, CONCAT(MONTHNAME(data_vermifungo), ' ', YEAR(data_vermifungo)) mes FROM hbrd_app_pet_vermifugos A WHERE A.id_pet = ${params.id_pet} ORDER BY A.data_vermifungo`);
	res.status(200).send(vermifugos);
}
async function verificarAgenda(conn, req, res, body) {
	var mensagem;
	var oldAgendaClin;
	var autPlano;
	var oldAgenda;
	let token = await util.verifyToken(req.headers['access_token'], res);
	let petBeneficios = await util.dbFindList(conn, `SELECT A.*  fROM hbrd_app_plano_beneficio as A  INNER JOIN  hbrd_app_plano_use_beneficio as B on ( B.id_beneficio = A.id) WHERE B.id_plano = ${body.id_plano}`);
	let agendaClinica = await util.dbFindList(conn, `SELECT * , DATE_FORMAT(data_hora, '%Y/%m/%d %Hh%i') data_hora FROM hbrd_app_pet_agendamento WHERE id_clinica = ${body.id_clinica}`);
	let agendapet = await util.dbFindList(conn, `SELECT * , DATE_FORMAT(data_hora, '%Y/%m/%d %Hh%i') data_hora FROM hbrd_app_pet_agendamento WHERE id_pet = ${body.id_pet}`);
	if (petBeneficios.length > 0) {
		autPlano = petBeneficios.filter(x => x.id == body.id_especialidade);
		if (!autPlano) mensagem = 'Plano não Autorizado';
	}
	if (agendapet.length > 0) {
		oldAgenda = agendapet.find(x => x.data_hora == `${body.data} ${body.hora}` && x.status == 'Pendente');
		if (oldAgenda) mensagem = 'Voçê já tem um agendamento nessa data';
	}
	if (agendaClinica.length > 0) {
		oldAgendaClin = agendaClinica.find(x => x.data_hora == `${body.data}${body.hora}` && x.status == 'Pendente');
		if (oldAgendaClin) mensagem = 'Agendamento nessa data não Disponivel';
	}
	res.status(200).send(mensagem);
}
async function agendar(conn, req, res, body) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	body.data_hora = `${body.data} ${body.hora}`;
	body.clinica = await util.dbFindList(conn, `SELECT nome_fantasia FROM hbrd_app_clinica WHERE id = ${body.id_clinica}`);
	let post, response;
	switch (body.id_especialidade) {
		case '3': case '10':
			post = {
				'id_clinica': body.id_clinica,
				'clinica': body.clinica[0].nome_fantasia,
				'id_especialidade': body.id_especialidade,
				'nome': body.descricao,
				'data': body.data_hora,
				'id_pet': body.id_pet,
			};
			response = await util.dbInsert(conn, `hbrd_app_pet_exames`, post);
			await enviaNotificacaoAgendamento(conn, body.id_clinica);
			break;
		case '4':
			post = {
				'id_clinica': body.id_clinica,
				'data_vacina': body.data_hora,
				'id_pet': body.id_pet,
				'nome_vacina': body.nome_vacina,
				'id_especialidade': body.id_especialidade,
				'nome_clinica': body.clinica[0].nome_fantasia,
			};
			response = await util.dbInsert(conn, `hbrd_app_pet_vacinas`, post);
			await enviaNotificacaoAgendamento(conn, body.id_clinica);
			break;
		case '5':
			post = {
				'id_pet': body.id_pet,
				'id_clinica': body.id_clinica,
				'descricao': body.descricao,
				'observacao': body.observacao,
				'data_hora': `${body.data} ${body.hora}`,
				'id_especialidade': body.id_especialidade,
			};
			response = await util.dbInsert(conn, `hbrd_app_pet_internacoes`, post);
			await enviaNotificacaoAgendamento(conn, body.id_clinica);
			break;
		case '6': case '7': case '9':
			post = {
				'id_clinica': body.id_clinica,
				'data_hora': `${body.data} ${body.hora}`,
				'id_pet': body.id_pet,
				'descricao': body.descricao,
				'observacao': body.observacao,
				'id_especialidade': body.id_especialidade,
			};
			response = await util.dbInsert(conn, `hbrd_app_pet_cirurgias`, post);
			await enviaNotificacaoAgendamento(conn, body.id_clinica)
			break;
		default:
			post = await util.formatDatabase(conn, 'hbrd_app_pet_agendamento', body);
			response = await util.dbInsert(conn, `hbrd_app_pet_agendamento`, post);
			await enviaNotificacaoAgendamento(conn, body.id_clinica);
			break;
	}
	res.status(200).send({ id_agendamento: response });
}
async function enviaNotificacaoAgendamento(conn, id_clinica) {
	let clinica = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_clinica A INNER JOIN hbrd_app_pessoa B ON A.id_pessoa = B.id WHERE A.id = ${id_clinica}`);
	await util.enviarNotificacao(conn, clinica.id_pessoa, 'Você tem uma nova solicitação de agendamento');
	await util.sendLeadszApp(conn, clinica.id_pessoa, 'Você tem uma nova solicitação de agendamento');
}
async function montarCarterinha(conn, req, res, body, params) {
	await util.queryExe(conn, "SET lc_time_names = 'pt_BR'");
	// let token = await util.verifyToken(req.headers['access_token'], res);
	const pet = await util.dbFindOne(conn, `SELECT a.*, b.titulo AS raca, c.titulo AS especie, p.titulo AS plano , ASSOC.id_pessoa
	FROM hbrd_app_pet AS a 
	LEFT JOIN hbrd_app_pet_raca AS b ON (b.id = a.id_raca) 
	LEFT JOIN hbrd_app_pet_especie AS c ON (c.id = a.id_especie) 
	LEFT JOIN hbrd_app_planos AS p ON (a.id_plano = p.id) 
	LEFT JOIN hbrd_app_associado ASSOC ON ASSOC.id = a.id_associado
	WHERE a.hash = '${params.hash}'`);
	if (!pet?.id_pessoa) util.BadRequest(res, "Associado não encontrado");
	const associado = await util.dbFindOne(conn, `SELECT A.id as id_associado , A.* , B.id as id_pessoa, B.* , C.cidade , D.estado FROM hbrd_app_associado A  
       INNER JOIN hbrd_app_pessoa B on(A.id_pessoa = B.id)
       INNER JOIN hbrd_main_util_city C on(B.id_cidade = C.id)
       INNER JOIN hbrd_main_util_state D on(B.id_estado = D.id)
	   WHERE B.id = ${pet.id_pessoa}`);
	pet.vacinas = await util.dbFindList(conn, `SELECT *, DATE_FORMAT(data_vacina, '%d/%m/%Y ')  data_v ,  DATE_FORMAT(data_revacina, '%d/%m/%Y ')  data_r FROM hbrd_app_pet_vacinas A WHERE A.id_pet = ${pet.id} AND A.status='Concluido'  ORDER BY A.data_vacina`);
	let html = await new Promise((resolve, reject) => {
		ejs.renderFile("./templates/carterinha.ejs", { pet: pet, associado: associado }, (err, html) => {
			if (err) reject(err)
			else resolve(html);
		});
	});
	const options = { type: 'pdf', width: '1190px', height: '1017px', orientation: 'landscape' };
	let file = await new Promise<Buffer>((resolve, reject) => {
		pdf.create(html, options).toBuffer(function (err, buf) {
			if (err) reject(err)
			else resolve(buf);
		});
	});
	let type = fileType(file);
	res.set('Content-Type', type.mime);
	res.set('Content-Length', file.length);
	res.status(200).end(file);
}
async function statusPet(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa where id = ?`, [token.id_pessoa]);
	// ver se solicitante tem acesso ao params.ambiente e o lead é dele
	let pet = await util.dbFindOne(conn, `SELECT A.*, B.id id_vistoria, B.status status_vistoria, C.status status_termo FROM hbrd_app_pet A LEFT JOIN hbrd_app_pet_vistoria B ON B.id_pet = A.id LEFT JOIN hbrd_app_pet_termo C ON C.id_pet = A.id WHERE A.id = ?`, [params.id_pet]);
	let proposta = await util.dbFindOne(conn, `SELECT B.*, A.*, A.id id_proposta FROM hbrd_app_proposta A INNER JOIN hbrd_app_pessoa B ON B.id = A.id_pessoa WHERE A.id = ?`, [pet.id_proposta]);
	let status = await util.dbFindList(conn, `SELECT id, titulo, ordem, vistoria, contrato, dados FROM hbrd_app_pet_proposta_status WHERE delete_at IS NULL ORDER BY ordem`);
	let vistoriaOk = pet?.status_vistoria == 'Aprovada';
	let contrato = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_pet_termo A WHERE A.id_pet = ${params.id_pet}`);
	let termoOk = (contrato?.status == 'aprovada' || contrato?.contrato_tipo == 'Manuscrito');
	let itemsVistoria = await util.dbFindList(conn, `SELECT A.*, B.required FROM hbrd_app_pet_vistoria_item A LEFT JOIN hbrd_app_vistoria_modelo_item B ON B.id = A.id_modelo_item WHERE A.id_vistoria = ${pet.id_vistoria}`);
	pet.vistoriaEnviada = (itemsVistoria.length && itemsVistoria.filter(x => x.required).every(x => x.imagem !== null && x.aprovado !== 0));
	if (contrato?.assinatura) pet.termoEnviado = true;
	else pet.termoEnviado = false;
	let dadosOk = true;
	let required_fields = ['nome', 'telefone', 'email', 'telefone2', 'cpf', 'rg', 'orgao_exp', 'cep', 'rua', 'numero', 'id_estado', 'id_cidade', 'bairro', 'data_nascimento'];
	required_fields.forEach((field) => {
		if (proposta.hasOwnProperty(field) && !proposta[field]) {
			dadosOk = false;
			return;
		}
	});
	res.status(200).send({ "status": status, "proposta": proposta, "pet": pet, "vistoriaOk": vistoriaOk, "dadosOk": dadosOk, "termoOk": termoOk });
}
async function mudarStatusPet(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa where id = ?`, [token.id_pessoa]);
	// ver se solicitante tem acesso ao params.ambiente e o lead é dele
	let pet = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_pet A WHERE A.id = ?`, [body.id_pet]);
	let proposta = await util.dbFindOne(conn, `SELECT A.* FROM hbrd_app_proposta A INNER JOIN hbrd_app_pessoa B ON B.id = A.id_pessoa WHERE A.id = ?`, [pet.id_proposta]);
	let status_atual = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pet_proposta_status WHERE id = ?`, [pet.id_status]);
	let status = await util.dbFindList(conn, `SELECT id, titulo, ordem, vistoria, contrato, dados FROM hbrd_app_pet_proposta_status WHERE delete_at IS NULL ORDER BY ordem`);
	let iAtual = status.map(x => x.id).findIndex(x => x == status_atual.id);
	let status_novo = status[iAtual + 1];
	if (!status_novo) {
		await util.dbUpdate(conn, `hbrd_app_pet`, `where id = ?`, { status_final: 1 }, [pet.id]);
		await util.dbInsert(conn, 'hbrd_app_proposta_hist', { 'id_proposta': proposta.id, 'atividade': `Finalizou todos os status da proposta`, 'id_pessoa': solicitante.id, 'nome': solicitante.nome });
	} else {
		await util.dbUpdate(conn, `hbrd_app_pet`, `where id = ?`, { id_status: status_novo.id }, [pet.id]);
		await util.dbInsert(conn, 'hbrd_app_proposta_hist', { 'id_proposta': proposta.id, 'atividade': `Alterou o status da proposta para '${status[iAtual + 1].titulo}'`, 'id_pessoa': solicitante.id, 'nome': solicitante.nome });
	}
	// inserir registro no histórico de lead
	// envia whatsapp se mensagem e whatsapp do status for igual a 1
	res.status(200).send();
}
// Alterar variaveis de template

function replaceTemplate(template,pessoa,plano,pet){
    let mensagem = String(template.mensagem).replace('{[assos_nome]}',(pessoa.nome || '').trim());
    mensagem = mensagem.replace('{[assos_telefone]}', pessoa.telefone || '');
    mensagem = mensagem.replace('{[pet_nome]}', pet.nome || '');
    mensagem = mensagem.replace('{[pet_especie]}', pet.especie || '');
    mensagem = mensagem.replace('{[pet_raca]}', pet.raca || '');

    mensagem = mensagem.replace('{[pet_plano_nome]}', plano.titulo || '');
    mensagem = mensagem.replace('{[pet_plano_valor]}', util.formatCurrency(plano.valor) || '');

    mensagem = mensagem.replace('{[beneficios]}', plano.beneficios_virgula.replaceAll(',', '\n') || '');
    mensagem = mensagem.replace('{[beneficios_virgula]}', plano.beneficios_virgula || '');

    return mensagem;
}

function replaceTemplateEmail(template,pessoa,plano,pet){
    let mensagem = String(template.template_email).replace('{[assos_nome]}',(pessoa.nome || '').trim());
    mensagem = mensagem.replace('{[assos_telefone]}', pessoa.telefone || '');
    mensagem = mensagem.replace('{[pet_nome]}', pet.nome || '');
    mensagem = mensagem.replace('{[pet_especie]}', pet.especie || '');
    mensagem = mensagem.replace('{[pet_raca]}', pet.raca || '');

    mensagem = mensagem.replace('{[pet_plano_nome]}', plano.titulo || '');
    mensagem = mensagem.replace('{[pet_plano_valor]}', util.formatCurrency(plano.valor) || '');

    mensagem = mensagem.replace('{[beneficios]}', plano.beneficios_virgula.replaceAll(',', '\n') || '');
    mensagem = mensagem.replace('{[beneficios_virgula]}', plano.beneficios_virgula || '');

    return mensagem;
}

function replaceTemplateEmailAssunto(template,pessoa,plano,pet){
    let mensagem = String(template.assunto).replace('{[assos_nome]}',(pessoa.nome || '').trim());
    mensagem = mensagem.replace('{[assos_telefone]}', pessoa.telefone || '');
    mensagem = mensagem.replace('{[pet_nome]}', pet.nome || '');
    mensagem = mensagem.replace('{[pet_especie]}', pet.especie || '');
    mensagem = mensagem.replace('{[pet_raca]}', pet.raca || '');

    mensagem = mensagem.replace('{[pet_plano_nome]}', plano.titulo || '');
    mensagem = mensagem.replace('{[pet_plano_valor]}', util.formatCurrency(plano.valor) || '');

    mensagem = mensagem.replace('{[beneficios]}', plano.beneficios_virgula.replaceAll(',', '\n') || '');
    mensagem = mensagem.replace('{[beneficios_virgula]}', plano.beneficios_virgula || '');

    return mensagem;
}