import { Request, Response } from 'express';
import firebaseService from '../services/firebaseService';
import { facilities as initialFacilities } from '../data/facilities';

class FacilitiesController {
    private isInitialized = false;

    constructor() {
        this.createFacility = this.createFacility.bind(this);
        this.getAllFacilities = this.getAllFacilities.bind(this);
        this.getFacilityById = this.getFacilityById.bind(this);
        this.updateFacility = this.updateFacility.bind(this);
        this.deleteFacility = this.deleteFacility.bind(this);
        this.toggleHitStatus = this.toggleHitStatus.bind(this);
        this.addHit = this.addHit.bind(this);
        this.getHits = this.getHits.bind(this);
        this.updateHit = this.updateHit.bind(this);
        this.deleteHit = this.deleteHit.bind(this);
        this.initializeData = this.initializeData.bind(this);
    }

    // Initialize Firebase with initial data if empty
    public async initializeData(req: Request, res: Response): Promise<void> {
        try {
            const facilities = await firebaseService.getAllFacilities();

            if (facilities.length === 0 && !this.isInitialized) {
                await firebaseService.importFacilities(initialFacilities);
                this.isInitialized = true;
                res.status(200).json({
                    message: 'Data initialized successfully',
                    count: initialFacilities.length
                });
            } else {
                res.status(200).json({
                    message: 'Data already initialized',
                    count: facilities.length
                });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error initializing data', error });
        }
    }

    public async createFacility(req: Request, res: Response): Promise<void> {
        try {
            const newFacility = await firebaseService.createFacility({
                ...req.body,
                hit: false,
                hits: []
            });
            res.status(201).json(newFacility);
        } catch (error) {
            res.status(500).json({ message: 'Error creating facility', error });
        }
    }

    public async getAllFacilities(req: Request, res: Response): Promise<void> {
        try {
            const facilities = await firebaseService.getAllFacilities();

            // Fetch hits for each facility
            const facilitiesWithHits = await Promise.all(
                facilities.map(async (facility) => {
                    const hits = await firebaseService.getHitsByFacility(facility.id);
                    return { ...facility, hits };
                })
            );

            res.status(200).json(facilitiesWithHits);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching facilities', error });
        }
    }

    public async getFacilityById(req: Request, res: Response): Promise<void> {
        try {
            const facilityId = parseInt(req.params.id);
            const facility = await firebaseService.getFacilityById(facilityId);

            if (facility) {
                const hits = await firebaseService.getHitsByFacility(facilityId);
                res.status(200).json({ ...facility, hits });
            } else {
                res.status(404).json({ message: 'Facility not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error fetching facility', error });
        }
    }

    public async updateFacility(req: Request, res: Response): Promise<void> {
        try {
            const facilityId = parseInt(req.params.id);
            const updatedFacility = await firebaseService.updateFacility(facilityId, req.body);

            if (updatedFacility) {
                res.status(200).json(updatedFacility);
            } else {
                res.status(404).json({ message: 'Facility not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error updating facility', error });
        }
    }

    public async deleteFacility(req: Request, res: Response): Promise<void> {
        try {
            const facilityId = parseInt(req.params.id);
            await firebaseService.deleteFacility(facilityId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Error deleting facility', error });
        }
    }

    public async toggleHitStatus(req: Request, res: Response): Promise<void> {
        try {
            const facilityId = parseInt(req.params.id);
            const facility = await firebaseService.toggleHitStatus(facilityId);

            if (facility) {
                res.status(200).json(facility);
            } else {
                res.status(404).json({ message: 'Facility not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error toggling hit status', error });
        }
    }

    public async addHit(req: Request, res: Response): Promise<void> {
        try {
            const facilityId = parseInt(req.params.id);
            const newHit = await firebaseService.addHit(facilityId, {
                date: req.body.date || new Date().toISOString(),
                videoLink: req.body.videoLink,
                expectedRepairTime: req.body.expectedRepairTime,
                notes: req.body.notes
            });
            res.status(201).json(newHit);
        } catch (error) {
            res.status(500).json({ message: 'Error adding hit', error });
        }
    }

    public async getHits(req: Request, res: Response): Promise<void> {
        try {
            const facilityId = parseInt(req.params.id);
            const hits = await firebaseService.getHitsByFacility(facilityId);
            res.status(200).json(hits);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching hits', error });
        }
    }

    public async updateHit(req: Request, res: Response): Promise<void> {
        try {
            const hitId = parseInt(req.params.hitId);
            const updatedHit = await firebaseService.updateHit(hitId, req.body);

            if (updatedHit) {
                res.status(200).json(updatedHit);
            } else {
                res.status(404).json({ message: 'Hit not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error updating hit', error });
        }
    }

    public async deleteHit(req: Request, res: Response): Promise<void> {
        try {
            const facilityId = parseInt(req.params.id);
            const hitId = parseInt(req.params.hitId);
            await firebaseService.deleteHit(facilityId, hitId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Error deleting hit', error });
        }
    }
}

export default new FacilitiesController();
