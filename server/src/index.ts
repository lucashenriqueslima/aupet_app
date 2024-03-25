import * as express from 'express';
import * as cors from 'cors';
import * as path from 'path';
import { routesHttp } from './httpApi';
import { routesAupet } from './aupet';
import { routesProposta } from './proposta';
import { routesPet } from './pet';
import { routesConsultor } from './consultor';
import { routesClinica } from './clinica';
import { routesAssociado } from './associado';
import { routesPagamentos } from './pagamentos';
import { CronJobs } from './cronJobs';


import * as compression from 'compression';
export const server_conf = { appVersion: '1.0.0' };
import * as Sentry from '@sentry/node';
import * as dotenv from 'dotenv';

if (process.env.NODE_ENV == 'production')
    Sentry.init({ dsn: 'https://7c6b09f4d7e64d93ab09fd6900c23ddc@o553045.ingest.sentry.io/5679754' });
const app = express();
app.use((req, res, next) => { dotenv.config(); next(); })
dotenv.config();


app.enable('trust proxy');
app.use(compression());
app.use(cors());
// codigo para validar certificado
app.use('/.well-known', express.static(path.join(__dirname, '..','.well-known')));
app.use('/proposta', routesProposta());
app.use('/pet', routesPet());
app.use('/consultor', routesConsultor());
app.use('/clinica', routesClinica());
app.use('/associado', routesAssociado());
app.use('/aupet', routesAupet());
app.use('/pagamentos', routesPagamentos());
app.use('/', routesHttp());

CronJobs();

app.get('/', (req, res) => res.send('API aupet online <b style="color:green">●</b>'));
console.log(`http://localhost:${process.env.PORT}/`);
console.log(process.env.NODE_ENV);
app.listen(process.env.PORT);
console.log('This process is your pid ' + process.pid);