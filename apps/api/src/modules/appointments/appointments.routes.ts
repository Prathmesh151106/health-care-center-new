import { Router } from 'express';
import { AppointmentsController } from './appointments.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { CreateAppointmentSchema } from '@health-care-center/shared';

export const appointmentsRoutes = Router();

appointmentsRoutes.use(requireAuth);

appointmentsRoutes.get('/', AppointmentsController.getAppointments);
appointmentsRoutes.post('/', validateBody(CreateAppointmentSchema), AppointmentsController.createAppointment);
appointmentsRoutes.delete('/:id', AppointmentsController.deleteAppointment);
