import { Request, Response } from 'express';
import { Facility, FacilityRequest, Hit } from '../types';
import { facilities as initialFacilities } from '../data/facilities';

class FacilitiesController {
    private facilities: Facility[] = [...initialFacilities];
    private hitIdCounter: number = 1;

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

        // Initialize hits array for all facilities
        this.facilities.forEach(facility => {
            if (!facility.hits) {
                facility.hits = [];
            }
        });
    }

    public createFacility(req: Request, res: Response): void {
        const facility: FacilityRequest = req.body;
        const newFacility: Facility = { id: this.facilities.length + 1, ...facility, hit: false };
        this.facilities.push(newFacility);
        res.status(201).json(newFacility);
    }

    public getAllFacilities(req: Request, res: Response): void {
        res.status(200).json(this.facilities);
    }

    public getFacilityById(req: Request, res: Response): void {
        const facilityId = parseInt(req.params.id);
        const facility = this.facilities.find(f => f.id === facilityId);
        if (facility) {
            res.status(200).json(facility);
        } else {
            res.status(404).json({ message: 'Facility not found' });
        }
    }

    public updateFacility(req: Request, res: Response): void {
        const facilityId = parseInt(req.params.id);
        const index = this.facilities.findIndex(f => f.id === facilityId);
        if (index !== -1) {
            const updatedFacility: Facility = { id: facilityId, ...req.body };
            this.facilities[index] = updatedFacility;
            res.status(200).json(updatedFacility);
        } else {
            res.status(404).json({ message: 'Facility not found' });
        }
    }

    public deleteFacility(req: Request, res: Response): void {
        const facilityId = parseInt(req.params.id);
        const index = this.facilities.findIndex(f => f.id === facilityId);
        if (index !== -1) {
            this.facilities.splice(index, 1);
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Facility not found' });
        }
    }

    public toggleHitStatus(req: Request, res: Response): void {
        const facilityId = parseInt(req.params.id);
        const facility = this.facilities.find(f => f.id === facilityId);
        if (facility) {
            facility.hit = !facility.hit;
            res.status(200).json(facility);
        } else {
            res.status(404).json({ message: 'Facility not found' });
        }
    }

    public addHit(req: Request, res: Response): void {
        const facilityId = parseInt(req.params.id);
        const facility = this.facilities.find(f => f.id === facilityId);

        if (!facility) {
            res.status(404).json({ message: 'Facility not found' });
            return;
        }

        const newHit: Hit = {
            id: this.hitIdCounter++,
            facilityId: facilityId,
            date: req.body.date || new Date().toISOString(),
            videoLink: req.body.videoLink,
            expectedRepairTime: req.body.expectedRepairTime,
            notes: req.body.notes
        };

        if (!facility.hits) {
            facility.hits = [];
        }
        facility.hits.push(newHit);
        facility.hit = true; // Mark facility as hit

        res.status(201).json(newHit);
    }

    public getHits(req: Request, res: Response): void {
        const facilityId = parseInt(req.params.id);
        const facility = this.facilities.find(f => f.id === facilityId);

        if (!facility) {
            res.status(404).json({ message: 'Facility not found' });
            return;
        }

        res.status(200).json(facility.hits || []);
    }

    public updateHit(req: Request, res: Response): void {
        const facilityId = parseInt(req.params.id);
        const hitId = parseInt(req.params.hitId);
        const facility = this.facilities.find(f => f.id === facilityId);

        if (!facility) {
            res.status(404).json({ message: 'Facility not found' });
            return;
        }

        if (!facility.hits) {
            res.status(404).json({ message: 'Hit not found' });
            return;
        }

        const hitIndex = facility.hits.findIndex(h => h.id === hitId);
        if (hitIndex === -1) {
            res.status(404).json({ message: 'Hit not found' });
            return;
        }

        const updatedHit: Hit = {
            ...facility.hits[hitIndex],
            ...req.body,
            id: hitId,
            facilityId: facilityId
        };

        facility.hits[hitIndex] = updatedHit;
        res.status(200).json(updatedHit);
    }

    public deleteHit(req: Request, res: Response): void {
        const facilityId = parseInt(req.params.id);
        const hitId = parseInt(req.params.hitId);
        const facility = this.facilities.find(f => f.id === facilityId);

        if (!facility) {
            res.status(404).json({ message: 'Facility not found' });
            return;
        }

        if (!facility.hits) {
            res.status(404).json({ message: 'Hit not found' });
            return;
        }

        const hitIndex = facility.hits.findIndex(h => h.id === hitId);
        if (hitIndex === -1) {
            res.status(404).json({ message: 'Hit not found' });
            return;
        }

        facility.hits.splice(hitIndex, 1);

        // If no more hits, mark facility as not hit
        if (facility.hits.length === 0) {
            facility.hit = false;
        }

        res.status(204).send();
    }
}

export default new FacilitiesController();
