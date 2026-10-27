import { Router } from 'express';
import { MedicinesController } from './medicines.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { CreateMedicineSchema, RecordMedicineEventSchema } from '@health-care-center/shared';

export const medicinesRoutes = Router();

medicinesRoutes.use(requireAuth);

medicinesRoutes.get('/', MedicinesController.getMedicines);
medicinesRoutes.post('/', validateBody(CreateMedicineSchema), MedicinesController.createMedicine);
medicinesRoutes.get('/adherence', MedicinesController.getAdherence);
medicinesRoutes.post('/:id/events', validateBody(RecordMedicineEventSchema), MedicinesController.recordEvent);
medicinesRoutes.delete('/:id', MedicinesController.deleteMedicine);
