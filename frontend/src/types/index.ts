export interface Hit {
    id: number;
    facilityId: number;
    date: string;
    severity?: 'damaged' | 'destroyed';
    mediaLinks?: string[];
    videoLink?: string; // kept for backward compatibility
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
    gasCapacity?: number;
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