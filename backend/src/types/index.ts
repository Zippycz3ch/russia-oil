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