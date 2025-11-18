import { Router } from 'express';
import { z } from 'zod';
import { TripWorkflow } from '../services/workflowService.js';

const router = Router();
const workflow = new TripWorkflow();

const chatSchema = z.object({
  userId: z.string().min(1),
  message: z.string().min(2),
  metadata: z
    .object({
      travelMonth: z.string().optional(),
      departureCity: z.string().optional(),
      durationDays: z.number().int().positive().optional()
    })
    .optional()
});

router.post('/', async (req, res, next) => {
  try {
    const payload = chatSchema.parse(req.body);
    const result = await workflow.run(payload);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;

