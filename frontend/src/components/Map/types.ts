export interface Facility {
    id: number;
    name: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    latitude?: number;
    longitude?: number;
    capacity: number;
    gasCapacity?: number;
    type: string;
    hit: boolean;
    draft?: boolean;
    damagePercentage?: number;
}

export interface Capital {
    name: string;
    lat: number;
    lon: number;
    color?: string;
    colors?: {
        top: string;
        bottom: string;
    };
}

export interface MissileType {
    name: string;
    range: number;
    color: string;
}
