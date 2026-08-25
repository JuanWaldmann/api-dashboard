import './loadenv.ts'
import express, {type Express, type Request, type Response, type NextFunction} from 'express';
import { getRepo } from './services/github.ts';



const app: Express = express();
const port = 3000;
const router = express.Router();


router.get('/repos/:user/:repo', async (req: Request, res: Response) =>{
    const user = req.params.user
    const repo = req.params.repo

    const result = await getRepo(user, repo);

    res.send(result)
})

app.use('/api/github', router);

app.listen (port, ()=> {
    console.log(`App listening on port ${port}`)
})
