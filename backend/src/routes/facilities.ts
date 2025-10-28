import { Router } from 'express';
import facilitiesController from '../controllers/facilitiesController';

const router = Router();

// Route to get all facilities
router.get('/', facilitiesController.getAllFacilities);

// Route to get a facility by ID
router.get('/:id', facilitiesController.getFacilityById);

// Route to create a new facility
router.post('/', facilitiesController.createFacility);

// Route to update a facility by ID
router.put('/:id', facilitiesController.updateFacility);

// Route to delete a facility by ID
router.delete('/:id', facilitiesController.deleteFacility);

// Route to toggle hit status of a facility
router.patch('/:id/hit', facilitiesController.toggleHitStatus);

export default router;