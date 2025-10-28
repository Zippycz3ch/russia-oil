export interface Hit {
    id: number;
    facilityId: number;
    date: string; // ISO date string
    videoLink?: string;
    expectedRepairTime?: number; // in days
    notes?: string;
}

export interface Facility {
    id: number;
    name: string;
    location: {
        latitude: number;
        longitude: number;
    };
    capacity: number; // in barrels per day
    type: string; // e.g., refinery, storage, etc.
    hit: boolean; // whether the facility has been hit
    hits?: Hit[]; // array of hit records
}

export interface FacilityRequest {
    name: string;
    location: {
        latitude: number;
        longitude: number;
    };
    capacity: number; // in barrels per day
    type: string; // e.g., refinery, storage, etc.
}