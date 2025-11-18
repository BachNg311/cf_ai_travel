import { Router } from 'express';
import { z } from 'zod';
import { getProfile } from '../services/memoryStore.js';
import { upsertUserProfile } from '../services/workflowService.js';

const router = Router();

const profileSchema = z.object({
  userId: z.string().min(1),
  profile: z.object({
    homeAirport: z.string().optional(),
    interests: z.array(z.string()).optional(),
    budget: z.string().optional(),
    travelStyle: z.string().optional(),
    travelers: z.string().optional()
  })
});

router.get('/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const profile = await getProfile(userId);
    res.json(profile || {});
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = profileSchema.parse(req.body);
    const profile = await upsertUserProfile(payload.userId, payload.profile);
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

export default router;

