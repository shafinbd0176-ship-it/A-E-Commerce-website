import { Router } from 'express';
import { AddressController } from './addressController.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', AddressController.getMyAddresses);
router.post('/', AddressController.create);
router.delete('/:id', AddressController.delete);

export default router;
