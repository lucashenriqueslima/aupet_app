import * as cron from 'node-cron';
import { resolve } from 'url';
import * as util from './util';

export function CronJobs() {
    if (process.env.NODE_ENV != 'production') return;
    // cron.schedule("* * * * *", util.handlerCron(teste)); // At every 1 minute.
    cron.schedule("* 1 * * *", util.handlerCron(outroServico)); // At every 1 minute.
    // cron.schedule("* * * * *", util.handlerCron(outroServico)); // At every 1 minute.
    async function teste(conn) {
        // BUSCAR ALGUMA INFORMAÇÃO E ENVIAR NOTIFICAÇÕES
        // await util.enviarNotificacao(conn, 1, 'Esta é uma notificacao');
        console.log("Cron executado");
    }
    async function outroServico(conn){
        let associados = await util.dbFindList(conn, `SELECT A.id as id_associado, B.id as id_pessoa FROM hbrd_app_associado A INNER JOIN hbrd_app_pessoa B ON A.id_pessoa = B.id WHERE A.stats = 1`);
        let i = 0;
        await new Promise<void>(async (resolve, reject) => {
            try {
                if (associados.length == 0) return resolve();
                let funSync = async () => {
                    const response = await util.dbFindList(conn, `SELECT C.*, E.titulo AS especie, (SELECT titulo FROM hbrd_app_planos WHERE id = C.id_plano) AS plano 
                    FROM hbrd_app_associado AS A 
                    INNER JOIN hbrd_app_pet AS C ON (C.id_associado = A.id) 
                    INNER JOIN hbrd_app_pet_especie AS E ON (C.id_especie = E.id) 
                    WHERE A.id = ${associados[i].id_associado} `);

                    let items = response;
                    
                    let x = 0;
                    await new Promise<void>(async (resolve, reject) => {
                        try {
                            if (items.length == 0) return resolve();
                            let funSync = async () => {
                                let item = items[x];
                                await util.queryExe(conn, "SET lc_time_names = 'pt_BR'");

                                item.exames = await util.dbFindList(conn, `SELECT * , CONCAT(MONTHNAME(data), ' ', YEAR(data)) mes FROM hbrd_app_pet_exames A WHERE A.id_pet =${item.id} `);
                                if(Object.keys(item.exames).length !== 0){ 
                                    item.exames.forEach(async (exame) => {
                                        let agendamento = new Date(exame.data);
                                        let hoje = new Date();
                                        agendamento.toLocaleDateString();
                                        if((exame.status == 'Agendado') && (agendamento.toLocaleDateString() == hoje.toLocaleDateString())) { 
                                            await util.enviarNotificacao(conn, associados[i].id_associado, 'Esta é uma notificacao de agendamento'); 
                                            await util.sendLeadszApp(conn, associados[i].id_pessoa, 'Esta é uma notificacao de agendamento'); 
                                        }
                                    })
                                }
                                    
                                item.medicamentos = await util.dbFindList(conn, `
                                    SELECT A.* , B.tratamento , CONCAT(MONTHNAME(A.dt_inicio), ' ', YEAR(A.dt_inicio)) mes 
                                    FROM hbrd_app_pet_medicamentos A
                                    INNER JOIN  hbrd_app_pet_tipo_tratamento B on (A.id_tipo_tratamento = B.id) 
                                    WHERE A.id_pet =${item.id} `);
                                if(Object.keys(item.medicamentos).length !== 0){ 
                                    item.medicamentos.forEach(async (medicamento) => {
                                        let agendamento = new Date(medicamento.data_agendamento);
                                        let hoje = new Date();
                                        agendamento.toLocaleDateString();
                                        if((medicamento.status == 'Agendado') && (agendamento.toLocaleDateString() == hoje.toLocaleDateString())) { 
                                            await util.enviarNotificacao(conn, associados[i].id_associado, 'Esta é uma notificacao de agendamento'); 
                                            await util.sendLeadszApp(conn, associados[i].id_pessoa, 'Esta é uma notificacao de agendamento'); 
                                        }
                                    })
                                }
                            
                                item.vermifungos = await util.dbFindList(conn, `SELECT *, CONCAT(MONTHNAME(A.data_vermifungo), ' ', YEAR(A.data_vermifungo)) mes FROM hbrd_app_pet_vermifugos A WHERE A.id_pet = ${item.id} ORDER BY A.data_vermifungo`);
                                if(Object.keys(item.vermifungos).length !== 0){
                                    item.vermifungos.forEach(async (vermifungo) => {
                                        let agendamento = new Date(vermifungo.data_vermifungo);
                                        let hoje = new Date();
                                        agendamento.toLocaleDateString();
                                        if((vermifungo.status == 'Agendado') && (agendamento.toLocaleDateString() == hoje.toLocaleDateString())) { 
                                            await util.enviarNotificacao(conn, associados[i].id_associado, 'Esta é uma notificacao de agendamento'); 
                                            await util.sendLeadszApp(conn, associados[i].id_pessoa, 'Esta é uma notificacao de agendamento'); 
                                        }
                                    })
                                }
                             
                                item.banhos = await util.dbFindList(conn, `SELECT *, CONCAT(MONTHNAME(A.data_banho), ' ', YEAR(A.data_banho)) mes FROM hbrd_app_pet_banhos A WHERE A.id_pet = ${item.id} ORDER BY A.data_banho`);
                                if(Object.keys(item.banhos).length !== 0){
                                    item.banhos.forEach(async (banho) => {
                                        let agendamento = new Date(banho.data_banho);
                                        let hoje = new Date();
                                        agendamento.toLocaleDateString();
                                        if((banho.status == 'Agendado') && (agendamento.toLocaleDateString() == hoje.toLocaleDateString())) { 
                                            await util.enviarNotificacao(conn, associados[i].id_associado, 'Esta é uma notificacao de agendamento'); 
                                            await util.sendLeadszApp(conn, associados[i].id_pessoa, 'Esta é uma notificacao de agendamento'); 
                                        }
                                    })
                                }
                                
                                item.vacinas = await util.dbFindList(conn, `SELECT *, CONCAT(MONTHNAME(A.data_vacina), ' ', YEAR(A.data_vacina)) mes FROM hbrd_app_pet_vacinas A WHERE A.id_pet = ${item.id} ORDER BY A.data_vacina`);
                                if(Object.keys(item.vacinas).length !== 0){ 
                                    item.vacinas.forEach(async (vacina) => {
                                    let agendamento = new Date(vacina.data_vacina);
                                    let hoje = new Date();
                                    agendamento.toLocaleDateString();
                                    if((vacina.status == 'Agendado') && (agendamento.toLocaleDateString() == hoje.toLocaleDateString())) { 
                                        await util.enviarNotificacao(conn, associados[i].id_associado, 'Esta é uma notificacao de agendamento'); 
                                        await util.sendLeadszApp(conn, associados[i].id_pessoa, 'Esta é uma notificacao de agendamento'); 
                                    }
                                    }) 
                                }
                                
                                item.consultas = await util.dbFindList(conn, `
                                    SELECT A.*, CONCAT(MONTHNAME(A.data_hora), ' ', YEAR(A.data_hora)) mes, B.nome_fantasia clinica, A.descricao 
                                    FROM hbrd_app_pet_agendamento A   
                                    INNER JOIN hbrd_app_clinica B ON A.id_clinica = B.id 
                                    WHERE A.id_pet = ${item.id} ORDER BY A.data_hora`);
                                
                                if(Object.keys(item.consultas).length !== 0){
                                    item.consultas.forEach(async (consulta) => {
                                        let agendamento = new Date(consulta.data_agendamento);
                                        let hoje = new Date();
                                        agendamento.toLocaleDateString();
                                        if((consulta.status == 'Agendado') && (agendamento.toLocaleDateString() == hoje.toLocaleDateString())) { 
                                            await util.enviarNotificacao(conn, associados[i].id_associado, 'Esta é uma notificacao de agendamento'); 
                                            await util.sendLeadszApp(conn, associados[i].id_pessoa, 'Esta é uma notificacao de agendamento'); 
                                        }
                                    })
                                }    
                               
                                item.cirurgias = await util.dbFindList(conn, `
                                    SELECT A.*, CONCAT(MONTHNAME(A.data_hora), ' ', YEAR(A.data_hora)) mes, B.nome_fantasia clinica, A.descricao 
                                    FROM hbrd_app_pet_cirurgias A 
                                    INNER JOIN hbrd_app_clinica B ON A.id_clinica = B.id 
                                    WHERE A.id_pet = ${item.id} ORDER BY A.data_hora`);
                                
                                if(Object.keys(item.cirurgias).length !== 0){
                                    item.cirurgias.forEach(async (cirurgia) => {
                                        let agendamento = new Date(cirurgia.data_agendamento);
                                        let hoje = new Date();
                                        agendamento.toLocaleDateString();
                                        if((cirurgia.status == 'Agendado') && (agendamento.toLocaleDateString() == hoje.toLocaleDateString())) { 
                                            await util.enviarNotificacao(conn, associados[i].id_associado, 'Esta é uma notificacao de agendamento'); 
                                            await util.sendLeadszApp(conn, associados[i].id_pessoa, 'Esta é uma notificacao de agendamento'); 
                                        }
                                    })
                                }    
                               
                                item.internacoes = await util.dbFindList(conn, `
                                    SELECT A.*, CONCAT(MONTHNAME(A.data_hora), ' ', YEAR(A.data_hora)) mes, B.nome_fantasia clinica, A.descricao 
                                    FROM hbrd_app_pet_internacoes A 
                                    INNER JOIN hbrd_app_clinica B ON A.id_clinica = B.id 
                                    WHERE A.id_pet = ${item.id} ORDER BY A.data_hora`);
                                
                                if(Object.keys(item.internacoes).length !== 0){
                                    item.internacoes.forEach(async (internacao) => {
                                        let agendamento = new Date(internacao.data_agendamento);
                                        let hoje = new Date();
                                        agendamento.toLocaleDateString();
                                        if((internacao.status == 'Agendado') && (agendamento.toLocaleDateString() == hoje.toLocaleDateString())) { 
                                            await util.enviarNotificacao(conn, associados[i].id_associado, 'Esta é uma notificacao de agendamento'); 
                                            await util.sendLeadszApp(conn, associados[i].id_pessoa, 'Esta é uma notificacao de agendamento'); 
                                        }
                                    })
                                }    
                                
                                // await util.enviarNotificacao(conn, item.id_pesssoa, 'Esta é uma notificacao de agendamento');
                                x++;
                                if (x == items.length) resolve();
                                else funSync();
                            }
                            funSync();
                        } catch (e) { reject(e); }
                    });

                    i++;
                    if (i == associados.length) resolve();
                    else funSync();
                }
                funSync();
            } catch (e) { reject(e); }
        });
        
        
    }
}