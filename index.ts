import './loadenv.ts'
import express, {type Express} from 'express';
import combinedRouter from './routes/routes.ts';


const app: Express = express();
const port = 3000;

app.use('/api', combinedRouter);

app.listen (port, ()=> {
    console.log(`App listening on port ${port}`)
})
