import * as express from 'express';
import * as util from './util';
import * as currency from 'currency-formatter';
import * as fileType from 'file-type';
import * as multer from 'multer';
import * as Jimp from 'jimp';
import * as Sentry from '@sentry/node';
import * as request from 'request';
import * as moment from 'moment';
import { stat } from 'fs';
const storage = multer.memoryStorage();
const upload = multer({ storage });
'/proposta'
export function routesProposta() {
	const route = express.Router();
	route.put("/dadosAssociado", util.requestHandler(updateDadosAssociado));
	route.put("/dadosAdicionais", util.requestHandler(upadateDadosAdicionais));
	route.post('/criarVistoria', util.requestHandler(criarVistoria));
	route.post('/addPet', util.requestHandler(addPetProposta));
	route.post('/criar', util.requestHandler(criarproposta));
	route.post('/vistoria/item', upload.single('imagem'), util.requestHandler(itemVistoria));
	route.post('/vistoria/anexo', upload.single('anexo'), util.requestHandler(vistoriaAnexo));
	route.post('/setassinatura/:id_pet', upload.single('assinatura'), util.requestHandler(setassinatura));
	route.post('/vistoria/observacao', util.requestHandler(observacaoVistoria));
	route.get('/termo/variaveis/:id_pet', util.requestHandler(planVariables));
	route.post('/termo/setvariables/:id_pet', util.requestHandler(setVariables));
	route.post('/settipocontrato/:id_pet', util.requestHandler(settipocontrato));
	route.post('/setcontrato/:id_pet', util.requestHandler(setcontrato));
	route.get('/historico/:id', util.requestHandler(historicoProposta));
	route.get('/vistoria/modelos', util.requestHandler(modelosVistoria));
	route.get('/vistoria/:id_vistoria', util.requestHandler(detalheVistoria));
	route.get('/propostas', util.requestHandler(listaPropostas));
	route.get('/termo/:id_pet', util.requestHandler(contratoLead));
	route.get('/planos', util.requestHandler(getPlanos));
	route.get('/detalhe/:id', util.requestHandler(obterDetalheProposta));
	route.get('/dadosassociado/:id_proposta', util.requestHandler(dadosassociado));
	route.get('/verificaExisteAssociado/:email', util.requestHandler(verificaExisteAssociado));

	return route;
}
async function criarproposta(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa where id = ?`, [token.id_pessoa]);
	//ver se solicitante tem permissões enviadas em `body.indicador`
	let pessoa = await util.formatDatabase(conn, "hbrd_app_pessoa", body);

	let id_pessoa = await util.dbFindOne(conn,'SELECT id FROM hbrd_app_pessoa WHERE email like ?',[pessoa.email]);
	if(!id_pessoa) body.id_pessoa = await util.dbInsert(conn, 'hbrd_app_pessoa', pessoa);
	else { 
		await util.dbUpdate(conn,'hbrd_app_pessoa',`WHERE id = ${id_pessoa.id}`,pessoa);
		body.id_pessoa = id_pessoa.id;
	}
	let primeiro_status = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pet_proposta_status WHERE delete_at IS NULL ORDER BY ordem`);
	let proposta = await util.formatDatabase(conn, "hbrd_app_proposta", body);
	proposta.id = await util.dbInsert(conn, 'hbrd_app_proposta', proposta);
	let items = body.pets;
	let i = 0;
	await new Promise<void>(async (resolve, reject) => {
		try {
			if (items.length == 0) return resolve();
			let funSync = async () => {
				let pet = await util.formatDatabase(conn, "hbrd_app_pet", items[i]);
				pet.id_proposta = proposta.id;
				pet.id_status = primeiro_status.id;
				pet.hash = util.createHashMD5(String(util.createSalt()) + String(util.createSalt()));
				let plano = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_planos where id = ?`, [pet.id_plano]);
				pet.valor = plano.valor;
				if(id_pessoa) {
					let id_associado =  await util.dbFindOne(conn,`SELECT id FROM hbrd_app_associado WHERE id_pessoa = ?`,[id_pessoa.id]);
					pet.id_associado = id_associado.id;
				}
				pet = await util.formatDatabase(conn, "hbrd_app_pet", pet);
				await util.dbInsert(conn, 'hbrd_app_pet', pet);
				i++;
				if (i == items.length) resolve();
				else funSync();
			}
			funSync();
		} catch (e) { reject(e); }
	});
	await util.dbInsert(conn, 'hbrd_app_proposta_hist', { 'id_proposta': proposta.id, 'atividade': `Criou a Proposta`, 'id_pessoa': solicitante.id, 'nome': solicitante.nome });
	res.status(200).send({ id: proposta.id });
}
async function obterDetalheProposta(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa WHERE id = ?`, [token.id_pessoa]);
	// ver se solicitante tem acesso ao params.ambiente e o lead é dele
	let lead: any = {};
	lead.proposta = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_proposta WHERE id = ?`, [params.id]);
	lead.pessoa = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa WHERE id = ?`, [lead.proposta.id_pessoa]);
	lead.pets = await util.dbFindList(conn, `SELECT A.*, B.titulo plano FROM hbrd_app_pet A INNER JOIN hbrd_app_planos B ON B.id = A.id_plano WHERE A.id_proposta = ? AND A.delete_at IS NULL`, [params.id]);
	let items = lead.pets;
	let i = 0;
	await new Promise<void>(async (resolve, reject) => {
		try {
			if (items.length == 0) return resolve();
			let funSync = async () => {
				let pet = items[i];
				if (!pet.hash) {
					pet.hash = util.createHashMD5(String(util.createSalt()) + String(util.createSalt()));
					await util.dbUpdate(conn, 'hbrd_app_pet', ` WHERE id = ${pet.id}`, { 'hash': pet.hash })
				}
				pet.msg_shared = await messagemCompartilhamentoPet(conn, pet.id);
				pet.plano = await util.dbFindOne(conn, `SELECT shared_msg_status, shared_pdf_status, titulo FROM hbrd_app_planos WHERE id = ?`, [pet.id_plano]);
				i++;
				if (i == items.length) resolve();
				else funSync();
			}
			funSync();
		} catch (e) { reject(e); }
	});
	res.status(200).send({ lead: lead });
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
async function listaPropostas(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa WHERE id = ?`, [token.id_pessoa]);
	// ver se solicitante tem acesso ao req.headers['ambiente'] e o lead é dele
	let leads;
	if (req.headers['ambiente'] == 'consultor') {
		leads = await util.dbFindList(conn, `
		SELECT A.id, B.nome associado, A.create_at, A.create_at, 
        COUNT(E.id_proposta) as quantidade , E.bonificacao ,
         E.activated_at , E.id_status , E.classificacao
            FROM hbrd_app_proposta A
			INNER JOIN hbrd_app_pessoa B ON A.id_pessoa = B.id
			INNER JOIN hbrd_app_consultor C ON A.id_consultor = C.id
			INNER JOIN hbrd_app_pessoa D ON C.id_pessoa = D.id
            INNER JOIN hbrd_app_pet E ON E.id_proposta = A.id
			WHERE D.id = ${token.id_pessoa}
			GROUP BY A.id ORDER BY A.create_at DESC
		`);
		res.status(200).send({ leads: leads });
	} else if (req.headers['ambiente'] == 'clinica') {
		leads = await util.dbFindList(conn, `
		SELECT A.id, B.nome associado, A.create_at, A.create_at, 
        COUNT(E.id_proposta) as quantidade , E.bonificacao ,
         E.activated_at , E.id_status , E.classificacao
            FROM hbrd_app_proposta A
			INNER JOIN hbrd_app_pessoa B ON A.id_pessoa = B.id
			INNER JOIN hbrd_app_clinica C ON A.id_clinica = C.id
			INNER JOIN hbrd_app_pessoa D ON C.id_pessoa = D.id
            INNER JOIN hbrd_app_pet E ON E.id_proposta = A.id
			WHERE D.id = ${token.id_pessoa}
			GROUP BY A.id ORDER BY A.create_at DESC
		`);
		res.status(200).send({ leads: leads });
	} else
		res.status(200).send({});
}
async function updateDadosAssociado(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa where id = ?`, [token.id_pessoa]);
	// ver se solicitante tem acesso ao params.ambiente e o lead é dele
	let pessoa = await util.formatDatabase(conn, "hbrd_app_pessoa", body);
	// if(pessoa.data_nascimento) pessoa.data_nascimento = util.formatDate(pessoa.data_nascimento);

	await util.dbUpdate(conn, `hbrd_app_pessoa`, `WHERE id = ?`, pessoa, [pessoa.id]);
	await util.dbInsert(conn, 'hbrd_app_proposta_hist', { 'id_proposta': body.id_proposta, 'atividade': `Alterou os dados Pessoais da Proposta`, 'id_pessoa': solicitante.id, 'nome': solicitante.nome });
	res.status(200).send();
}
async function upadateDadosAdicionais(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa where id = ?`, [token.id_pessoa]);
	// ver se solicitante tem acesso ao params.ambiente e o lead é dele
	let pessoa = await util.formatDatabase(conn, "hbrd_app_pessoa", body);
	// if(pessoa.data_nascimento) pessoa.data_nascimento = util.formatDate(pessoa.data_nascimento);
	await util.dbUpdate(conn, `hbrd_app_pessoa`, `WHERE id = ?`, pessoa, [pessoa.id]);
	await util.dbInsert(conn, 'hbrd_app_proposta_hist', { 'id_proposta': body.id_proposta, 'atividade': `Alterou os dados Pessoais da Proposta`, 'id_pessoa': solicitante.id, 'nome': solicitante.nome });
	res.status(200).send();
}
async function historicoProposta(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa where id = ?`, [token.id_pessoa]);
	// ver se solicitante tem acesso ao params.ambiente e o lead é dele
	let historico = await util.dbFindList(conn, `SELECT * FROM hbrd_app_proposta_hist WHERE id_proposta = ? ORDER BY create_at DESC`, [params.id]);
	res.status(200).send({ historico: historico });
}
async function modelosVistoria(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa where id = ?`, [token.id_pessoa]);
	// ver se solicitante tem acesso ao params.ambiente
	let modelos = await util.dbFindList(conn, `SELECT * FROM hbrd_app_vistoria_modelo WHERE delete_at IS NULL ORDER BY ordem`);
	res.status(200).send({ modelos: modelos });
}
async function criarVistoria(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa where id = ?`, [token.id_pessoa]);
	// ver se solicitante tem acesso ao req.headers['ambiente']
	let modelo = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_vistoria_modelo WHERE id = ?`, [body.id_modelo]);
	let id_vistoria = await util.dbInsert(conn, `hbrd_app_pet_vistoria`, { "id_pet": body.pet.id, "id_modelo": body.id_modelo });
	let items = await util.dbFindList(conn, `SELECT * FROM hbrd_app_vistoria_modelo_item WHERE id_modelo = ${modelo.id} AND delete_at IS NULL ORDER BY ordem`);
	let i = 0;
	await new Promise<void>(async (resolve, reject) => {
		try {
			if (items.length == 0) return resolve();
			let funSync = async () => {
				let modeloItem = items[i];
				let vistoriaItem = {
					id_vistoria: id_vistoria,
					id_modelo_item: modeloItem.id,
					ordem: modeloItem.ordem,
				}
				await util.dbInsert(conn, 'hbrd_app_pet_vistoria_item', vistoriaItem);
				i++;
				if (i == items.length) resolve();
				else funSync();
			}
			funSync();
		} catch (e) {
			reject(e);
		}
	});
	res.status(200).send({ id_vistoria: id_vistoria });
}
async function addPetProposta(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let criador = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa WHERE id = ?`, [token.id_pessoa]);
	let pet = body;
	let plano = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_planos where id = ?`, [pet.id_plano]);
	pet.valor = plano.valor;
	pet = await util.formatDatabase(conn, "hbrd_app_pet", pet);
	await util.dbInsert(conn, 'hbrd_app_pet', pet);
	await util.dbInsert(conn, 'hbrd_app_proposta_hist', { 'id_proposta': body.id_proposta, 'atividade': `Adicionou o Pet '${pet.nome}' Na Proposta `, 'id_pessoa': criador.id, 'nome': criador.nome });
	res.status(200).send({ Pet: pet });
}
async function detalheVistoria(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa WHERE id = ?`, [token.id_pessoa]);
	// ver se solicitante tem acesso ao params.ambiente e o lead é dele
	let vistoria = await util.dbFindOne(conn, `SELECT A.id, A.status, A.observacao, B.descricao, A.id_pet FROM hbrd_app_pet_vistoria A INNER JOIN hbrd_app_vistoria_modelo B ON B.id = A.id_modelo WHERE A.id = ?`, [params.id_vistoria])
	let pet = await util.dbFindOne(conn, `SELECT A.id, A.nome, A.peso, A.cor, A.porte, A.sexo, B.titulo raca, C.titulo especie, A.id_plano FROM hbrd_app_pet A INNER JOIN hbrd_app_pet_raca B ON B.id = A.id_raca INNER JOIN hbrd_app_pet_especie C ON C.id = A.id_especie WHERE A.id = ?`, [vistoria.id_pet])
	let plano = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_planos A WHERE A.id = ?`, [pet.id_plano])
	let items = await util.dbFindList(conn, `SELECT A.id, A.imagem, A.aprovado, A.motivo_recusa, B.descricao, B.imagem_exemplo, B.lib_access, B.required FROM hbrd_app_pet_vistoria_item A INNER JOIN hbrd_app_vistoria_modelo_item B ON B.id = A.id_modelo_item WHERE A.id_vistoria = ? ORDER BY B.ordem`, [params.id_vistoria]);
	let anexos = await util.dbFindList(conn, `SELECT * FROM hbrd_app_pet_vistoria_arquivo WHERE id_vistoria = ? ORDER BY id`, [params.id_vistoria]);
	res.status(200).send({ "vistoria": vistoria, "items": items, "pet": pet, "plano": plano, "anexos": anexos });
}
async function getPlanos(conn, req, res, body, params) {
	let result = await util.dbFindList(conn, 'SELECT A.*, (SELECT GROUP_CONCAT(id_beneficio) FROM hbrd_app_plano_use_beneficio WHERE id_plano = A.id) as beneficios FROM hbrd_app_planos A WHERE A.delete_at IS NULL AND A.stats = 1 ORDER BY valor');
	res.status(200).send(result);
}
async function itemVistoria(conn, req, res, body, params) {
	let file = req.file;
	if (!file) return res.status(400).send('arquivo não encontrado');
	let item = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pet_vistoria_item where id = ?`, [body.id]);
	if (!item) util.BadRequest(res, "Vistoria não encontrada");
	let end = await getEndereco(body.lat, body.lng);
	let key = await util.sendFileAws2(file);
	let dtnow = moment().format('YYYY-MM-DD HH:mm:ss');
	let obj = { 'upload_at': dtnow, 'imagem': key, 'aprovado': null, 'lat': body.lat, 'lng': body.lng, 'fotografado_em': body.photograp_at, 'localizacao': end, 'motivo_recusa': null };
	await util.dbUpdate(conn, 'hbrd_app_pet_vistoria_item', ` where id = ?`, obj, [body.id]);
	await util.dbUpdate(conn, `hbrd_app_pet_vistoria`, ` WHERE id='${item.id_vistoria}'`, { 'ultimo_item_enviado': dtnow });
	res.status(200).send({ 'url': key });
}
function getEndereco(lat, lng) {
	return new Promise(resolve => {
		let url = `https://us1.locationiq.com/v1/reverse.php?key=pk.fec9b236b9a3f14bfd088346e46a9521&lat=${lat}&lon=${lng}&format=json&accept-language=pt-br`;
		request(url, function (error, response, body) {
			try {
				if (error) throw error;
				else {
					body = JSON.parse(body);
					let end = `${body.address.road}, ${body.address.suburb} - ${body.address.postcode} ${body.address.city} ${body.address.state} ${body.address.country}.`;
					resolve(end);
				}
			} catch (e) {
				resolve('');
			}
		});
	});
}
async function observacaoVistoria(conn, req, res, body, params) {
	await util.dbUpdate(conn, `hbrd_app_pet_vistoria`, `WHERE id = ?`, { 'observacao': body.observacao }, [body.id_vistoria]);
	res.status(200).send();
}
async function vistoriaAnexo(conn, req, res, body, params) {
	let file = req.file;
	if (!file) return res.status(400).send('arquivo não encontrado');
	let key = await util.sendFileAws2(file);
	await util.dbInsert(conn, 'hbrd_app_pet_vistoria_arquivo', { 'id_vistoria': body.id_vistoria, 'descricao': body.descricao, 'arquivo': key });
	res.status(200).send();
}
async function contratoLead(conn, req, res, body, params) {
	let pet = await util.dbFindOne(conn, `SELECT A.id, A.hash, A.id_plano, B.* FROM hbrd_app_pet A LEFT JOIN hbrd_app_pet_termo B ON B.id_pet = A.id WHERE A.id = ?`, [params.id_pet]);
	let contratos = await util.dbFindList(conn, `SELECT A.id, A.titulo FROM hbrd_app_termo A INNER JOIN hbrd_app_plano_has_termo B ON B.id_termo = A.id WHERE B.id_plano = ? AND A.delete_at IS NULL`, [pet.id_plano]);
	res.status(200).send({ indicacao: pet, contratos: contratos });
}
async function settipocontrato(conn, req, res, body, params) {
	// let token = await util.verifyToken(req.headers['access_token'], res);
	// let consultant = await util.dbFindOne(conn, `SELECT * FROM hbrd_adm_consultant where id = ${token.id_usuario}`);
	// let acao = `Selecionou tipo de contrato ${body.contrato_tipo.toUpperCase()}`;
	// await util.dbInsert(conn, 'hbrd_adm_indication_history', { 'id_indicacao': params.id_indicacao, 'acao': acao, 'usuario': consultant.nome });
	if (body.contrato_tipo == 'Manuscrito') await util.dbInsertDuplicateKeyUpdate(conn, 'hbrd_app_pet_termo', { 'contrato_tipo': body.contrato_tipo, 'id_pet': params.id_pet, 'assinatura': null, 'selfie': null, 'frente_doc': null, 'atras_doc': null, 'lat': null, 'lng': null, 'id_contrato': null, 'perguntas_contrato': null, 'status': null, 'ip': null, 'dt_envio': null, 'doc_recusados': null, 'feito_em': null, 'tipo_doc': null });
	else await util.dbInsertDuplicateKeyUpdate(conn, 'hbrd_app_pet_termo', { 'contrato_tipo': body.contrato_tipo, 'id_pet': params.id_pet });
	res.status(200).send();
}
async function setcontrato(conn, req, res, body, params) {
	let doc_var = await util.dbFindOne(conn, `SELECT COUNT(*) existe FROM hbrd_app_termo_variables WHERE id_termo = ?`, [body.id_contrato]);
	await util.dbInsertDuplicateKeyUpdate(conn, 'hbrd_app_pet_termo', { 'id_contrato': body.id_contrato, 'id_pet': params.id_pet });
	if (!doc_var.existe) await util.dbUpdate(conn, 'hbrd_app_pet_termo', `where id_pet = ?`, { 'perguntas_contrato': '[]' }, [params.id_pet]);
	res.status(200).send();
}
async function planVariables(conn, req, res, body, params) {
	let perguntas = await util.dbFindList(conn, `SELECT B.descricao, B.variavel FROM hbrd_app_pet A LEFT JOIN hbrd_app_pet_termo C ON C.id_pet = A.id INNER JOIN hbrd_app_termo_variables B ON B.id_termo = C.id_contrato WHERE A.id = ? order by B.ordem`, [params.id_pet]);
	let respostas = (await util.dbFindOne(conn, `SELECT B.perguntas_contrato FROM hbrd_app_pet A LEFT JOIN hbrd_app_pet_termo B ON B.id_pet = A.id WHERE A.id = ?`, [params.id_pet]))?.perguntas_contrato;
	if (respostas && respostas.length) res.status(200).send(JSON.parse(respostas));
	else res.status(200).send(perguntas);
}
async function setVariables(conn, req, res, body, params) {
	await util.dbUpdate(conn, 'hbrd_app_pet_termo', `where id_pet = ?`, { perguntas_contrato: JSON.stringify(Object.values(body)) }, [params.id_pet]);
	res.status(200).send();
}
async function setassinatura(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa WHERE id = ?`, [token.id_pessoa]);
	// ver se solicitante tem acesso ao params.ambiente e o lead é dele
	if (req.headers['access_token'] == 'consultor') {
		// let consultor = await util.dbFindOne(conn, `SELECT * FROM hbrd_adm_consultant where id = ${token.id_usuario}`);
		// let history = { 'id_indicacao': params.id_indicacao, 'acao': 'Enviou assinatura do termo de filiação pelo aplicativo', 'usuario': consultant.nome };
		// await util.dbInsert(conn, 'hbrd_adm_indication_history', history);
	}
	let file = req.file;
	let jimp = await Jimp.read(file.buffer);
	jimp.rotate(90);
	file = await jimp.getBufferAsync(file.mimetype);
	let key = await util.sendFileAws3(file);
	await util.dbInsertDuplicateKeyUpdate(conn, 'hbrd_app_pet_termo', { 'id_pet': params.id_pet, 'assinatura': key, 'status': 'pendente', 'doc_recusados': null, 'feito_em': 'app', 'dt_envio': moment().format('YYYY-MM-DD HH:mm:ss') });
	res.status(200).send();
	await util.queryExe(conn, 'COMMIT');
	// criar arquivo estático para contrato no blob
	// if (process.env.NODE_ENV == 'production')
	// 	request({ method: 'GET', url: `https://${req['nova_client']}.ileva.com.br/indicacao/proposta/${key}` }, (error, response, body) => { });
}
async function dadosassociado(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa WHERE id = ?`, [token.id_pessoa]);
	// ver se solicitante tem acesso ao params.ambiente e o lead é dele
	let pessoa = await util.dbFindOne(conn, `SELECT A.*, B.id id_proposta FROM hbrd_app_pessoa A INNER JOIN hbrd_app_proposta B ON B.id_pessoa = A.id WHERE B.id = ?`, [params.id_proposta]);
	res.status(200).send({ pessoa: pessoa });
}
async function verificaExisteAssociado(conn, req, res, body, params) {
	let token = await util.verifyToken(req.headers['access_token'], res);
	let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa where id = ?`, [token.id_pessoa]);

	let pessoa = await util.formatDatabase(conn, "hbrd_app_pessoa", params);
	let id_pessoa = await util.dbFindOne(conn,'SELECT id, email, nome FROM hbrd_app_pessoa WHERE email like ?',[pessoa.email]);

	if(id_pessoa) res.status(200).send({ associado: id_pessoa });
	else res.status(200).send();

}
