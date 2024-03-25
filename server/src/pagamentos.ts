import * as express from 'express';
import * as util from './util';
import * as fileType from 'file-type';
import * as moment from 'moment';
import * as mercadopago from 'mercadopago';
import axios from 'axios';
import { resolve } from 'url';
import { requestHandler } from '@sentry/node/dist/handlers';

export function routesPagamentos() {
    const route = express.Router();

    route.post('/criarPagamento', util.requestHandler(createPayment));
    route.put('/atualizarPagamento', util.requestHandler(updatePayment));
    route.post('/criarPagamentoViaPix', util.requestHandler(createPaymentByPix));
    route.post('/criarPagamentoViaBoleto', util.requestHandler(createPaymentByBol));

    route.post('/criarAssinatura', util.requestHandler(createSignature));
    route.put('/atualizaCartaoAssinatura', util.requestHandler(updateSignature));
    route.put('/atualizarValorAssinatura', util.requestHandler(updateSignatureValue));
    route.get('/listaAssinaturaPagamentos/:external_reference',util.requestHandler(listSignaturePayments));


    route.put('/cancelarAssinatura', util.requestHandler(cancelSignature));
    route.put('/reativarAssinatura', util.requestHandler(reactiveSignature));

    route.get('/buscarPagamentosAssinatura/:id', util.requestHandler(findSignaturePayments));

    route.post('/notificacoes', util.requestHandler(paymentNotification));

    return route;
}

//Metodos de Pagamentos

async function createPayment(conn, req, res, body) {
    let token = await util.verifyToken(req.headers['access_token'], res);
    let access_token = await util.dbFindOne(conn, 'SELECT access_token FROM hbrd_adm_integration');
    let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa A LEFT JOIN hbrd_main_util_city B ON A.id_cidade = B.id LEFT JOIN hbrd_main_util_state C ON A.id_estado = C.id  where A.id = ?`, [token.id_pessoa]);

    await mercadopago.configurations.setAccessToken(access_token.access_token);

    let payment_data = {
        notification_url: "https://api.aupetheinsten.com.br/pagamentos/notificacoes", 
        transaction_amount: Number(body.transactionAmount),
        token: body.token,
        description: body.description,
        installments: Number(body.installments),
        payment_method_id: body.payment_method_id,
        issuer_id: body.issuer_id,
        payer: {
            email: body.email,
            identification: {
                type: body.docType,
                number: body?.docNumber?.replace(/[^0-9]/g,"")
            },
            address: {
                zip_code: solicitante?.cep?.replace('-', ''),
                street_name: solicitante.rua,
                street_number: solicitante.numero,
                neighborhood: solicitante.bairro,
                city: solicitante.cidade,
                federal_unit: solicitante.uf
            }
        },
    };

    await mercadopago.payment.save(payment_data, { headers: { 'X-meli-session-id': body.deviceId } })
        .then(async (payment) => {
            let table;
            if (body.id_ong) table = 'hbrd_app_doacoes'
            let data;
            if (body.id_ong) {
                data = {
                    'id_pessoa': token.id_pessoa,
                    'id_ong': body.id_ong,
                    'valor': body.transactionAmount,
                    'id_pagamento': payment.response.id,
                    'status_pagamento': payment.response.status,
                    'tipo': 'cartao',
                    'nome_doador': body.nome,
                    'cpf_doador': body.cpf,
                    'email_doador': body.email,
                    'telefone_doador': body.telefone,
                    'id_campanha': body.id_campanha ? body.id_campanha : null,
                }
            }
            let trans_id = await util.dbInsert(conn, table, data);
            return res.status(201).send({ payment_id: payment.response.id, message: getMessageStatus(payment.response), status: payment.response.status, trans_id: trans_id });
        })
        .catch((payment) => {
            return res.status(200).send({ message: getMessageStatus(payment.response) });
        });
}

async function updatePayment(conn, req, res, body) {
    let token = await util.verifyToken(req.headers['access_token'], res);
    let access_token = await util.dbFindOne(conn, 'SELECT access_token FROM hbrd_adm_integration');

    mercadopago.configurations.setAccessToken(access_token.access_token);

    await mercadopago.payment.findById(body.paymentId)
        .then(async (payment) => {
            await mercadopago.payment.update({ id: payment.body.id, status: body.status })
                .then((payment) => {
                    return res.status(200).send({ response: payment.response, message: getMessageStatus(payment.response) });
                })
                .catch((payment) => {
                    return res.status(400).send({ message: getMessageStatus(payment.response) });
                });
        })
        .catch((payment) => {
            return res.status(404).send({ message: 'Pagamento não encontrado' });
        });

}

async function createPaymentByPix(conn, req, res, body) {
    let token = await util.verifyToken(req.headers['access_token'], res);
    let access_token = await util.dbFindOne(conn, 'SELECT access_token FROM hbrd_adm_integration');

    let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa A LEFT JOIN hbrd_main_util_city B ON A.id_cidade = B.id LEFT JOIN hbrd_main_util_state C ON A.id_estado = C.id  where A.id = ?`, [token.id_pessoa]);

    mercadopago.configurations.setAccessToken(access_token.access_token);

    let payment_data = {
        transaction_amount: Number(body.transactionAmount),
        description: body.description,
        installments: 1,
        payment_method_id: 'pix',
        payer: {
            email: body.email,
            first_name: body.name,
            last_name: body.last_name,
            identification: {
                type: body.docType,
                number: body.docNumber
            },
            address: {
                zip_code: solicitante.cep.replace('-', ''),
                street_name: solicitante.rua,
                street_number: solicitante.numero,
                neighborhood: solicitante.bairro,
                city: solicitante.cidade,
                federal_unit: solicitante.uf
            }
        }
    };

    await mercadopago.payment.create(payment_data)
        .then(async (payment) => {
            let table;
            if (body.id_ong) table = 'hbrd_app_doacoes'
            else if (body.id_plano) table = 'hbrd_app_pagamentos';
            let data;
            if (body.id_ong) {
                data = {
                    'id_pessoa': token.id_pessoa,
                    'id_ong': body.id_ong,
                    'valor': body.transactionAmount,
                    'id_pagamento': payment.response.id,
                    'status_pagamento': payment.response.status,
                    'tipo': 'cartao',
                    'nome_doador': body.nome,
                    'cpf_doador': body.cpf,
                    'email_doador': body.email,
                    'telefone_doador': body.telefone,
                    'id_campanha': body.id_campanha ? body.id_campanha : null,

                }
            } else {
                data = {
                    'id_pessoa': token.id_pessoa,
                    'id_plano': body.id_plano,
                    'valor': body.transactionAmount,
                    'id_pagamento': payment.response.id,
                    'status_pagamento': payment.response.status,
                    'tipo': 'pix'
                }
            }
            let trans_id = await util.dbInsert(conn, table, data);
            return res.status(200).send({ id_pagamento: payment.response.id, qr_code: payment.response.point_of_interaction.transaction_data.qr_code_base64, message: getMessageStatus(payment.response), status: payment.response.status, trans_id: trans_id });
        })
        .catch((payment) => {
            return res.status(400).send({ message: getMessageStatus(payment.response) });
        });
}

async function createPaymentByBol(conn, req, res, body) {
    let token = await util.verifyToken(req.headers['access_token'], res);
    let access_token = await util.dbFindOne(conn, 'SELECT access_token FROM hbrd_adm_integration');

    let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa A LEFT JOIN hbrd_main_util_city B ON A.id_cidade = B.id LEFT JOIN hbrd_main_util_state C ON A.id_estado = C.id  where A.id = ?`, [token.id_pessoa]);

    await mercadopago.configurations.setAccessToken(access_token.access_token);

    let payment_data = {
        transaction_amount: Number(body.transactionAmount),
        description: body.description,
        payment_method_id: 'bolbradesco',
        installments: 1,
        payer: {
            email: body.email,
            first_name: body.first_name,
            last_name: body.last_name,
            identification: {
                type: body.docType,
                number: body.docNumber
            },
            address: {
                zip_code: solicitante.cep.replace('-', ''),
                street_name: solicitante.rua,
                street_number: solicitante.numero,
                neighborhood: solicitante.bairro,
                city: solicitante.cidade,
                federal_unit: solicitante.uf
            }
        }
    };

    await mercadopago.payment.create(payment_data)
        .then(async (payment) => {
            let table;
            if (body.id_ong) table = 'hbrd_app_doacoes'
            else if (body.id_plano) table = 'hbrd_app_pagamentos';
            let data;
            if (body.id_ong) {
                data = {
                    'id_pessoa': token.id_pessoa,
                    'id_ong': body.id_ong,
                    'valor': body.transactionAmount,
                    'id_pagamento': payment.response.id,
                    'status_pagamento': payment.response.status,
                    'tipo': 'boleto',
                    'nome_doador': body.nome,
                    'cpf_doador': body.cpf,
                    'email_doador': body.email,
                    'telefone_doador': body.telefone,
                    'id_campanha': body.id_campanha ? body.id_campanha : null,
                }
            } else {
                data = {
                    'id_pessoa': token.id_pessoa,
                    'id_plano': body.id_plano,
                    'valor': body.transactionAmount,
                    'id_pagamento': payment.response.id,
                    'status_pagamento': payment.response.status,
                    'tipo': 'boleto'
                }
            }
            let trans_id = await util.dbInsert(conn, table, data);
            return res.status(201).send({ id_pagamento: payment.response.id, boleto_pdf: payment.response.transaction_details.external_resource_url, message: getMessageStatus(payment.response), status: payment.response.status, trans_id: trans_id, codigobarra: payment.response.barcode.content, dataVencimento: payment.response.date_of_expiration });
        })
        .catch((payment) => {
            return res.status(400).send({ message: 'Erro ao processar sua solicitação! Por favor tente novamente.' });
        });
}

//METODOS DE USUÁRIOS

async function saveUser(access_token,user, solicitante) {
    var user_id;

    await mercadopago.configurations.setAccessToken('TEST-1919538428879594-101311-3791bb3f1b395642a19e3e941817b5fe-840352771');

    try {
        var dataUser = { "email": solicitante.email };

        await mercadopago.customers.create(dataUser)
            .then(async (customer) => {
                user_id = customer.response.id;
            }).catch(async (error) => {
                user_id = undefined;
                throw error;
            });

        return user_id;

    } catch (e) {
        return e;
    }
}

async function getUser(conn,req,res,body) {
    await mercadopago.configurations.setAccessToken('TEST-1919538428879594-101311-3791bb3f1b395642a19e3e941817b5fe-840352771');

    await mercadopago.customers.get(body.id)
        .then((users) => {
            return res.status(200).send({ response: users.response });
        })
        .catch((users) => {
            return res.status(404).send({ response: users, message: 'Não foi possível encontrar um usuário! Por favor, tente novamente.' });
        });
    
}

async function findUser(conn, req, res, body) {
    //  let token = await util.verifyToken(req.headers['access_token'], res);
    let access_token = await util.dbFindOne(conn, 'SELECT access_token FROM hbrd_adm_integration');

    mercadopago.configurations.setAccessToken(access_token.access_token);

    await mercadopago.customers.search({ qs: { email: body.email, first_name: body.first_name } })
        .then((users) => {
            return res.status(200).send({ response: users.response });
        })
        .catch((users) => {
            return res.status(404).send({ response: users, message: 'Não foi possível encontrar um usuário! Por favor, tente novamente.' });
        });
}

//METODOS DE CARTÕES

async function saveUserCard(conn, req, res, body) {
    let token = await util.verifyToken(req.headers['access_token'], res);
    let access_token = await util.dbFindOne(conn, 'SELECT access_token FROM hbrd_adm_integration');

    mercadopago.configurations.setAccessToken(access_token.access_token);

    let card_data = {
        "token": body.token,
        "customer_id": body.user_id
    }

    await mercadopago.card.create(card_data)
        .then((cards) => {
            return res.status(201).send({ response: cards.response });
        })
        .catch((cards) => {
            return res.status(400).send({ message: 'Erro ao cadastrar cartão de usuário! Por favor tente novamente.' });
        });
}

//METODOS DE ASSINATURA

async function createSignature(conn, req, res, body) {
    let token = await util.verifyToken(req.headers['access_token'], res);
    let access_token = await util.dbFindOne(conn, 'SELECT access_token FROM hbrd_adm_integration');
    let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa A LEFT JOIN hbrd_main_util_city B ON A.id_cidade = B.id LEFT JOIN hbrd_main_util_state C ON A.id_estado = C.id  where A.id = ?`, [token.id_pessoa]);

    let lastSignatura = await util.dbFindOne(conn,`SELECT id FROM hbrd_app_assinatura ORDER BY id desc`);

    let external_reference = lastSignatura.id.toString() + body.id_associado.toString();

    try {
        await mercadopago.configurations.setAccessToken(access_token.access_token);

        const data = { // configura os dados da assinatura
            "auto_recurring": {
                "currency_id": "BRL",
                "transaction_amount": body.valor,
                "frequency": 1,
                "frequency_type": process.env.PLAN_PERIOD,
                "billing_day": 10,
                "billing_day_proportional": true
            },
            "back_url": "https://app.aupetheinsten.com.br/#/associado",
            "collector_id": await getCollectorId(),
            "external_reference": external_reference,
            "reason": body.descricao,
            "card_token_id": body.token,
            "payer_email": body.email,
            "status": "authorized",
            "payer": {
                "first_name": body.nome,
                "description": body.nome,
                "email": body.email,
                "identification": {
                    "type": "CPF",
                    "number": body.cpf.replace(/[^0-9a-zA-Z]+/g,'')
                },
                "default_address": "Home",
                "address": {
                    "zip_code": solicitante.cep.replace('-', ''),
                    "street_name": solicitante.rua,
                    "street_number": solicitante.numero,
                    "neighborhood": solicitante.bairro,
                    "city": solicitante.cidade,
                    "federal_unit": solicitante.uf
                },
                "phone": {
                    "area_code": body.telefone.split(' ')[0].replace(/[^0-9a-zA-Z]+/g,''),
                    "number": body.telefone.split(' ')[1].replace(/[^0-9a-zA-Z]+/g,'')
                },
            }
        };

        return;

        // metodo que cria a assinatura
        await mercadopago.preapproval.create(data, { headers: { 'X-meli-session-id': body.deviceId } })
            .then(async (signature) => {
                let plano = await util.dbFindOne(conn,`SELECT * FROM hbrd_app_planos WHERE id = ${body.id_plano}`);

                await util.dbUpdate(conn,'hbrd_app_pet',`WHERE id = ${body.id_pet}`,{ id_plano: body.id_plano, valor:  plano.valor, classificacao: 'ativada' });

                let data = {
                    id_associado: body.id_associado,
                    id_pet: body.id_pet,
                    assinatura: signature.body.id,
                    payment_method_id: body.payment_method_id,
                    application_id: signature.body.application_id,
                    external_reference: external_reference,
                    status: "authorized",
                    valor: signature.body.auto_recurring.transaction_amount,
                    descricao: body.descricao
                }                

                let id = await util.dbInsert(conn, 'hbrd_app_assinatura', data);
                let template = await util.dbFindOne(conn,'SELECT A.* FROM hbrd_app_notificacao A WHERE A.id = 15');

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
                            to: (process.env.NODE_ENV == 'production') ? solicitante.email : 'suporte@ileva.com.br',
                            subject: replaceTemplateEmailAssunto(template,solicitante,plano,pet),
                            text: '',
                            html: email
                        };

                        await util.emailHandler(smtp, mailOptions);
                    }

                }

                return res.status(201).send({ id_assinatura: id, message: 'Assinatura criada com sucesso!' });
            })
            .catch((error) => {
                let message = getMessageStatus(error);
                // return res.status(200).send({ error: error.message , message:  message});
                throw message;
            });
    } catch (e) {
        return res.status(200).send({ error: e, message: 'Ocorreu um erro inesperado! Por favor tente novamente mais tarde.' });
    }
}

async function updateSignatureValue(conn, req, res, body){
    let token = await util.verifyToken(req.headers['access_token'], res);
    let access_token = await util.dbFindOne(conn, 'SELECT access_token FROM hbrd_adm_integration');
    let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa A LEFT JOIN hbrd_main_util_city B ON A.id_cidade = B.id LEFT JOIN hbrd_main_util_state C ON A.id_estado = C.id  where A.id = ?`, [token.id_pessoa]);
    
    await mercadopago.configurations.setAccessToken(access_token.access_token);

    try {
        await mercadopago.preapproval.findById(body.assinatura)
            .then(async (signature) => {
                let plano = await util.dbFindOne(conn,`SELECT * FROM hbrd_app_planos WHERE id = ${body.id_plano}`);

                const data = {
                    reason: body.descricao,
                    auto_recurring: {
                        transaction_amount: plano.valor
                    },
                    application_id: signature.body.application_id,
                    card_token_id: body.token
                } 

                await mercadopago.put(`/preapproval/${body.assinatura}`,data)
                    .then(async (signature) => {
                        let data = {
                            valor: signature.body.auto_recurring.transaction_amount,
                            descricao: body.descricao
                        }

                        await util.dbUpdate(conn,'hbrd_app_assinatura',`WHERE id = ${body.id_assinatura}`,data);
                        await util.dbUpdate(conn,'hbrd_app_pet',`WHERE id = ${body.id_pet}`,{ id_plano: body.id_plano });

                        let template = await util.dbFindOne(conn,'SELECT A.* FROM hbrd_app_notificacao A WHERE A.id = 16');

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

                        return res.status(200).send({ id_assinatura: body.id_assinatura, message: 'Assinatura alterada com sucesso!' });
                    })
                    .catch((error) => {
                        return res.status(400).send({ message: 'Erro ao atualizar dados da assinatura! Por favor tente novamente.' });
                    });
            })
            .catch(async(error) => {
                let message = getMessageStatus(error);
                // return res.status(200).send({ error: error.message , message:  message});
                throw error.message;
            });
    } catch (error) {
        let message = getMessageStatus(error);
        // return res.status(200).send({ error: error.message , message:  message});
        throw error.message;
    }
}

async function updateSignature(conn, req, res, body) {
    let token = await util.verifyToken(req.headers['access_token'], res);
    let access_token = await util.dbFindOne(conn, 'SELECT access_token FROM hbrd_adm_integration');

    mercadopago.configurations.setAccessToken(access_token.access_token);
    await mercadopago.preapproval.findById(body.assinatura)
        .then(async (signature) => {
            let data = {
                "application_id": body.application_id,
                "card_token_id": body.token
            };
            await mercadopago.put(`/preapproval/${body.assinatura}`, data, { headers: { 'X-meli-session-id': body.deviceId } })
                .then(async (signature) => {
                    let assinatura = {
                        application_id: signature.body.application_id,
                        card: body.cardNumber,
                        status: signature.body.status,
                        payment_method_id: body.payment_method_id,
                        card_mes: body.cardExpirationMonth,
                        card_ano: body.cardExpirationYear,
                    }
                    await util.dbUpdate(conn, 'hbrd_app_assinatura', `WHERE id = ${body.id_assinatura} `, assinatura);
                    return res.status(200).send({ assinatura: signature, message: 'Assinatura atulizada com sucesso!', status: 1 });
                })
                .catch((error) => {
                    let message = getMessageStatus(error);
                    return res.status(200).send({ error: message, message: message });
                });

        })
        .catch((error) => {
            let message = getMessageStatus(error);
            return res.status(200).send({ error: message, message: message });
        });
}

async function cancelSignature(conn, req, res, body) {
    let token = await util.verifyToken(req.headers['access_token'], res);
    let access_token = await util.dbFindOne(conn, 'SELECT access_token FROM hbrd_adm_integration');
    let solicitante = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_pessoa A LEFT JOIN hbrd_main_util_city B ON A.id_cidade = B.id LEFT JOIN hbrd_main_util_state C ON A.id_estado = C.id  where A.id = ?`, [token.id_pessoa]);

    mercadopago.configurations.setAccessToken(access_token.access_token);

    await mercadopago.preapproval.findById(body.assinatura)
        .then(async (signature) => {
            await mercadopago.preapproval.cancel(body.assinatura)
                .then(async (signature) => {
                    let data = {
                        status: "cancelled", 
                        deleted_at: body.delete_at,
                        cancelado_em: body.cancelado_em,
                        id_arquivamento: body.id_arquivamento
                    }

                    let pet = await util.dbFindOne(conn,` SELECT A.*, B.titulo especie, C.titulo raca FROM hbrd_app_pet A INNER JOIN hbrd_app_pet_especie B ON B.id = A.id_especie INNER JOIN hbrd_app_pet_raca C ON C.id = A.id_raca WHERE A.id = ${body.id_pet}`);
                    let plano = await util.dbFindOne(conn,` SELECT C.*, (SELECT GROUP_CONCAT(A.nome) FROM hbrd_app_plano_beneficio A LEFT JOIN hbrd_app_plano_use_beneficio B ON A.id = B.id_beneficio WHERE B.id_plano = C.id) beneficios_virgula FROM hbrd_app_planos C WHERE C.id = ${pet.id_plano} `);

                    await util.dbUpdate(conn,'hbrd_app_assinatura',`WHERE id = ${body.id_assinatura}`,data);
                    await util.dbUpdate(conn,'hbrd_app_pet',`WHERE id = ${body.id_pet}`,{ id_plano: null, classificacao: 'pendente', valor: '0.00' });

                    let template = await util.dbFindOne(conn,'SELECT A.* FROM hbrd_app_notificacao A WHERE A.id = 17');

                    if(template.desativado == '0'){
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
                    return res.status(400).send({ error : signature.error , messsage: 'Erro ao cancelar assinatura! Por favor tente novamente' });
                });
        })
        .catch((signature) => {
            return res.status(404).send({ error: signature.error , message: 'Assinatura não encontrada! Por favor tente novamente.' });
        });
}

async function reactiveSignature(conn, req, res, body) {
    let token = await util.verifyToken(req.headers['access_token'], res);
    let access_token = await util.dbFindOne(conn, 'SELECT access_token FROM hbrd_adm_integration');

    mercadopago.configurations.setAccessToken(access_token.access_token);

    let data = {
        "status": req.params.status,
        "payer_email": req.params.payer_email
    };

    await mercadopago.preapproval.findById(body.id_signature)
        .then(async (signature) => {
            let data = {
                "application_id": signature.body.application_id,
                "status": "authorized"
            };

            await mercadopago.put(`/preapproval/${signature.body.id}`, data)
                .then((signature) => {
                    return res.status(200).send({ response: signature, message: 'Assinatura reativada com sucesso!' });
                })
                .catch((signature) => {
                    return res.status(400).send({ message: 'Erro ao atualizar dados da assinatura! Por favor tente novamente.' });
                });
        })
        .catch((signature) => {
            return res.status(404).send({ message: 'Assinatura não encontrada! Por favor tente novamente.' });
        });
}

async function findSignaturePayments(conn, req, res, body, params) {
    // let token = await util.verifyToken(req.headers['access_token'], res);
    let access_token = await util.dbFindOne(conn, 'SELECT access_token FROM hbrd_adm_integration');

    mercadopago.configurations.setAccessToken(access_token.access_token);

    await mercadopago.get(`/preapproval/search?id=${params.id}`)
        .then(async (signature) => {
            let ultimo_pagamento = signature.response.results[0].summarized.last_charged_date;
            return res.status(200).send({
                response: signature.response.results[0].summarized,
                next_payment_value: signature.response.results[0].auto_recurring.transaction_amount,
                titulo: signature.response.results[0].reason,
                proxima_fatura: (signature.response.results[0].next_payment_date) ? new Date(signature.response.results[0].next_payment_date).toLocaleDateString("pt-BR") : 'Próxima fatura ainda não foi gerada!',
                payment_status: (ultimo_pagamento != undefined) ? validarPagamento(new Date(ultimo_pagamento)) : null,
                status_assinatura: (ultimo_pagamento != undefined) ? (!validarPagamento(new Date(ultimo_pagamento)) ? "Pagamento Atrasado ou ainda não creditado!" : "Pagamento em dia!") : 'Primeira mensalidade não criada ainda! Tente novamente mais tarde.'
            });
        })
        .catch((signature) => {
            return res.status(200).send({ message: 'Assinatura não encontrada! Por favor tente novamente.' });
        });
}

async function listSignaturePayments(conn, req, res, body, params) {
    let access_token = await util.dbFindOne(conn, 'SELECT access_token FROM hbrd_adm_integration');
    await mercadopago.configurations.setAccessToken(access_token.access_token);

    await mercadopago.payment.search({ qs: { sort: "date_created", criteria: "desc", external_reference: params.external_reference }})
        .then(result => {
            return res.status(200).send(result?.body?.results);
        })
        .catch( error => {
            return res.status(400).send(error);
        })
}


//METODOS DE NOTIFICAÇÃO
async function paymentNotification(conn, req, res, body) {
    let access_token = await util.dbFindOne(conn, 'SELECT access_token FROM hbrd_adm_integration');
    mercadopago.configurations.setAccessToken(access_token.access_token);
    let notification;
    //WEBHOOKS
    if (body.type) {
        switch (body.type) {
            case 'payment':
                let { data } = await axios.get(`https://api.mercadopago.com/v1/payments/${body.data.id}`, { headers: { "Authorization": `Bearer ${access_token.access_token}` } });
                if ((data.status == 'refunded') && (moment.duration(moment().diff(moment(data.refunds[0].date_created))).asDays() < 1)) { //salvar estornos
                    return res.status(200).send();
                }
                else if (data?.description.includes('Plano') && data?.operation_type == 'recurring_payment' && data?.status == 'approved') {
                    // salvar mensalidades pagas na tabela
                    let mensalidade = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_mensalidades WHERE id_mensalidade = ${data.id}`)
                    if (!mensalidade) {
                        await util.dbInsert(conn, 'hbrd_app_mensalidades', {
                            "id_associado": data.external_reference,
                            "id_mensalidade": data.id,
                            "valor": data.transaction_details.total_paid_amount,
                            "data_fatura": data.date_approved,
                            "status": (data.status == 'approved') ? 'recebida' : 'aberta'
                        });
                    }
                } else if (data?.description.includes('Plano') && data?.operation_type == 'recurring_payment' && data?.status == 'rejected') {
                    // salvar mensalidades pagas na tabela
                    let pessoa = await util.dbFindOne(conn, `SELECT B.id, B.nome FROM hbrd_app_associado A INNER JOIN hbrd_app_pessoa B ON A.id_pessoa = B.id INNER JOIN hbrd_app_assinatura C ON C.id_associado = A.id WHERE C.external_reference = ${data.external_reference}`)
                    await util.enviarNotificacao(
                        conn,
                        pessoa.id,
                        `Olá ${pessoa.nome}! Infelizmente o seu cartão recusou a cobrança da sua mensalidade. Pedimos que entre em contato com seu banco e/ou altere o cartão informado`
                    );
                }
                break;
            case 'plan':
                let plan = await mercadopago.get(`/v1/plans/${body.id}`);
                break;
            case 'subscription':
                let subscription = await mercadopago.get(`/v1/subscriptions/${body.id}`);
                break;
            case 'invoice':
                let invoice = await mercadopago.get(`/v1/invoices/${body.id}`);
                break
            default:
                break;
        }
    }
    //IPN
    else if (body.topic) {
        switch (body.topic) {
            case 'payment':
                let { data } = await axios.get(body.resource, { headers: { "Authorization": `Bearer ${access_token.access_token}` } });
                if ((data.collection.status == 'refunded') && (moment.duration(moment().diff(moment(data.collection.refunds[0].date_created))).asDays() < 1)) { //salvar estornos
                    return res.status(200).send();
                }
                else if (data?.collection.reason.includes('Plano') && data?.collection.operation_type == 'recurring_payment' && data?.collection.status == 'approved') {
                    // salvar mensalidades pagas na tabela
                    let mensalidade = await util.dbFindOne(conn, `SELECT * FROM hbrd_app_mensalidades WHERE id_mensalidade = ${data.collection.id}`)
                    if (!mensalidade) {
                        await util.dbInsert(conn, 'hbrd_app_mensalidades', {
                            "id_associado": data.collection.external_reference,
                            "id_mensalidade": data.collection.id,
                            "valor": data.collection.total_paid_amount,
                            "data_fatura": data.collection.date_approved,
                            "status": (data.collection.status == 'approved') ? 'recebida' : 'aberta'
                        });
                    }
                }
                else if (data?.description.includes('Plano') && data?.operation_type == 'recurring_payment' && data?.status == 'rejected') {
                    // salvar mensalidades pagas na tabela
                    let pessoa = await util.dbFindOne(conn, `SELECT B.id, B.nome FROM hbrd_app_associado A INNER JOIN hbrd_app_pessoa B ON A.id_pessoa = B.id INNER JOIN hbrd_app_assinatura C ON C.id_associado = A.id WHERE C.external_reference = ${data.id}`)
                    await util.enviarNotificacao(
                        conn,
                        pessoa.id,
                        `Olá ${pessoa.nome}! Infelizmente o seu cartão recusou a cobrança da sua mensalidade. Pedimos que entre em contato com seu banco e/ou altere o cartão informado`
                    );
                }
                break;
            case 'chargebacks':
                // let chargeback = await mercadopago.get(`/v1/chargebacks/${body.id}`);
                notification = await axios.get(body.resource, { headers: { "Authorization": `Bearer ${access_token.access_token}` } });
                break;
            case 'merchant_orders':
                // let merchant_order = await mercadopago.get(`/merchant_orders/${body.id}`);
                notification = await axios.get(body.resource, { headers: { "Authorization": `Bearer ${access_token.access_token}` } });
                break;
            default:
                break;
        }
    }
    return res.status(200).send();
}

//Metodo para verificar de pagamentos de plano estão em dia

function validarPagamento(dt_pagamento) {
    let last_payment = moment(dt_pagamento);
    let data_atual = moment();

    let duration = moment.duration(data_atual.diff(last_payment))

    return (duration.asDays() > 35) ? false : true;

}

//Metodo para pegar o collector_id do vendedor

async function getCollectorId() {
    let collector_id = await mercadopago.get('/users/me');
    return collector_id.response.id.toString();
}

// Metodos de retorno de mensagem de status de pagamento

function getMessageStatus(payment) {

    // Mensagem de status do pagamento
    const status = new Array();
    status['accredited'] = 'Pronto, seu pagamento foi aprovado! Você verá o nome ' + payment.statement_descriptor + ' na sua fatura de cartão de crédito. Entraremos em contato com você!';
    status['pending_waiting_payment'] = 'Foi processado e ficará com status pendente até que você realize o pagamento!';
    status['pending_contingency'] = 'Estamos processando o pagamento. Em até 2 dias úteis informaremos por e-mail o resultado.';
    status['pending_review_manual'] = 'Estamos processando o pagamento. Em até 2 dias úteis informaremos por e-mail se foi aprovado ou se precisamos de mais informações.';
    status['pending_waiting_transfer'] = 'Estamos processando o pagamento. Em até 24 horas informaremos por e-mail se foi aprovado ou se precisamos de mais informações.';
    status['cc_rejected_bad_filled_card_number'] = 'Confira o número do cartão.';
    status['cc_rejected_bad_filled_date'] = 'Confira a data de validade.';
    status['cc_rejected_bad_filled_other'] = 'Confira os dados.';
    status['cc_rejected_bad_filled_security_code'] = 'Confira o código de segurança.';
    status['cc_rejected_blacklist'] = 'Não conseguimos processar seu pagamento.';
    status['cc_rejected_call_for_authorize'] = 'Você deve autorizar o pagamento do valor ao Mercado Pago.';
    status['cc_rejected_card_error'] = 'Não conseguimos processar seu pagamento.';
    status['cc_rejected_duplicated_payment'] = 'Você já efetuou um pagamento com esse valor. Caso precise pagar novamente, utilize outro cartão ou outra forma de pagamento.';
    status['cc_rejected_high_risk'] = 'Seu pagamento foi recusado. Escolha outra forma de pagamento. Recomendamos meios de pagamento em dinheiro.';
    status['cc_rejected_insufficient_amount'] = 'O cartão possui saldo insuficiente.';
    status['cc_rejected_invalid_installments'] = 'O cartão não processa pagamentos parcelados.';
    status['cc_rejected_max_attempts'] = 'Você atingiu o limite de tentativas permitido. Escolha outro cartão ou outra forma de pagamento.';
    status['cc_rejected_other_reason'] = 'O cartão não processou seu pagamento';

    // Mensagem de erro do pagamento
    const erros = new Array();
    erros['205'] = 'Digite o número do seu cartão.';
    erros['208'] = 'Escolha um mês.';
    erros['209'] = 'Escolha um ano.';
    erros['212'] = 'Informe o tipo da sua identificação.';
    erros['213'] = 'Informe seu documento.';
    erros['214'] = 'Informe o numero da sua identificação.';
    erros['220'] = 'Informe seu banco emissor.';
    erros['221'] = 'Informe seu sobrenome.';
    erros['224'] = 'Digite o código de segurança.';
    erros['E301'] = 'Há algo de errado com esse número de cartão. Digite novamente.';
    erros['E302'] = 'Confira o código de segurança.';
    erros['316'] = 'Por favor, digite um nome válido.';
    erros['322'] = 'Tipo de documento inválido.';
    erros['323'] = 'Tipo de documento do titular inválido.';
    erros['324'] = 'Confira o número da sua documentação.';
    erros['325'] = 'Confira o mês de validade do seu cartão.';
    erros['326'] = 'Confira o ano de validade do seu cartão.';

    const especialErrors = new Array();
    especialErrors['Both payer and collector must be real or test users'] = 'Tanto o pagador quanto o cobrador devem ser usuários reais ou de teste';
    especialErrors['Too many request  message: user has sent too many requests; error code: Too Many Requests; status: 429 '] = 'O usuário enviou muitas requisições num dado tempo! Tente novamente mais tarde.';
    especialErrors['Both payer and collector must be real or test users'] = 'Ambos comprador e vendedor devem ser reais ou usuários de teste.';
    especialErrors['CC_VAL_433 Credit card validation has failed'] = 'Erro na verificação do cartão! Por favor, tente novamente.';
    especialErrors['User bad request'] = 'Erro ao realizar requição de assinatura. Tente novamente';

    if (payment.status_detail != undefined) {
        if (status[payment.status_detail] != undefined) return status[payment.status_detail];
    }
    else if (payment.error !== undefined) {
        if (erros[payment.error.causes[0].code] !== undefined) return erros[payment.error.causes[0].code];
    }
    else if (payment.message !== undefined) {
        if (especialErrors[payment.message] !== undefined) return especialErrors[payment.message];
    }

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