import express from 'express'
import refreshAToken from '../controllers/tokenController';

const router = express.Router();

// Refresh a token
router.get('/', refreshAToken)



export default router