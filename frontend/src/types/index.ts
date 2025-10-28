export interface Hit {
    id: number;
    facilityId: number;
    date: string;
    videoLink?: string;
    expectedRepairTime?: number;
    notes?: string;
}

export interface Facility {
    id: number;
    name: string;
    location: {
        latitude: number;
        longitude: number;
    };
    capacity: number;
    type: string;
    hit: boolean;
    hits?: Hit[];
}

export interface FacilityResponse {
    facilities: Facility[];
    total: number;
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