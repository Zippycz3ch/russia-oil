export interface Hit {
    id: number;
    facilityId: number;
    date: string;
    severity?: 'damaged' | 'destroyed';
    damagePercentage?: number; // % of production capacity lost (0-100)
    mediaLinks?: string[];
    videoLink?: string; // kept for backward compatibility
    expectedRepairTime?: number;
    notes?: string;
    draft?: boolean;
}

export interface Facility {
    id: number;
    name: string;
    location: {
        latitude: number;
        longitude: number;
    };
    capacity: number; // normal production capacity
    gasCapacity?: number;
    currentProduction?: number; // calculated based on hits
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