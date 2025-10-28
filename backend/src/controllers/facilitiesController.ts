import { Request, Response } from 'express';
import { Facility, FacilityRequest } from '../types';
import { facilities as initialFacilities } from '../data/facilities';

class FacilitiesController {
    private facilities: Facility[] = [...initialFacilities];

    constructor() {
        this.createFacility = this.createFacility.bind(this);
        this.getAllFacilities = this.getAllFacilities.bind(this);
        this.getFacilityById = this.getFacilityById.bind(this);
        this.updateFacility = this.updateFacility.bind(this);
        this.deleteFacility = this.deleteFacility.bind(this);
        this.toggleHitStatus = this.toggleHitStatus.bind(this);
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
}

export default new FacilitiesController();
