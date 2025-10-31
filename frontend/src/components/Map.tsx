import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Tooltip } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, getDocs } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase';

interface Facility {
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

// Ukraine border line (detailed complete border - clockwise from northwest)
const ukraineBorderLine: [number, number][] = [
    // Northwest corner - Poland/Belarus border junction
    [52.37, 23.48],
    
    // North - Belarus border (west to east)
    [52.35, 24.00],
    [52.33, 24.50],
    [52.35, 25.00],
    [52.38, 25.50],
    [52.40, 26.00],
    [52.42, 26.50],
    [52.43, 27.00],
    [52.43, 27.50],
    [52.42, 28.00],
    [52.40, 28.50],
    [52.38, 29.00],
    [52.36, 29.50],
    [52.35, 30.00],
    [52.33, 30.50],
    
    // Northeast corner - Belarus/Russia border junction
    [52.25, 31.15],
    [52.18, 31.70],
    [52.10, 32.25],
    [52.00, 32.80],
    [51.88, 33.35],
    
    // East - Russia border (north to south)
    [51.75, 33.90],
    [51.60, 34.45],
    [51.45, 35.00],
    [51.28, 35.55],
    [51.10, 36.10],
    [50.90, 36.65],
    [50.70, 37.20],
    [50.50, 37.75],
    [50.30, 38.30],
    [50.10, 38.70],
    [49.90, 39.00],
    [49.70, 39.25],
    [49.50, 39.40],
    [49.30, 39.50],
    [49.10, 39.55],
    [48.90, 39.52],
    [48.70, 39.45],
    [48.50, 39.35],
    [48.30, 39.20],
    [48.10, 39.00],
    [47.95, 38.75],
    
    // Southeast - approaching Azov Sea
    [47.80, 38.50],
    [47.65, 38.30],
    [47.50, 38.15],
    [47.35, 38.05],
    [47.20, 38.00],
    [47.05, 37.95],
    
    // South - Azov Sea coast and Crimea approach
    [46.90, 37.85],
    [46.75, 37.70],
    [46.60, 37.50],
    [46.45, 37.25],
    [46.30, 37.00],
    [46.15, 36.70],
    [46.00, 36.40],
    [45.85, 36.05],
    [45.70, 35.70],
    [45.55, 35.35],
    [45.40, 35.00],
    [45.30, 34.65],
    
    // Southwest - Black Sea coast (west along coast)
    [45.25, 34.30],
    [45.22, 33.95],
    [45.20, 33.60],
    [45.19, 33.25],
    [45.18, 32.90],
    [45.20, 32.55],
    [45.23, 32.20],
    [45.28, 31.85],
    [45.35, 31.50],
    [45.43, 31.15],
    [45.52, 30.80],
    [45.62, 30.45],
    [45.73, 30.15],
    [45.85, 29.90],
    
    // South - Danube Delta and Romania border
    [45.98, 29.70],
    [46.12, 29.55],
    [46.25, 29.45],
    [46.38, 29.40],
    [46.50, 29.38],
    [46.62, 29.35],
    [46.73, 29.30],
    [46.83, 29.20],
    [46.92, 29.05],
    [47.00, 28.85],
    
    // Southwest - Moldova/Romania border (heading north)
    [47.08, 28.60],
    [47.15, 28.35],
    [47.22, 28.10],
    [47.28, 27.85],
    [47.33, 27.60],
    [47.38, 27.35],
    [47.42, 27.10],
    [47.45, 26.85],
    [47.48, 26.60],
    [47.50, 26.35],
    [47.52, 26.10],
    [47.53, 25.85],
    [47.54, 25.60],
    [47.55, 25.35],
    [47.58, 25.10],
    [47.62, 24.85],
    [47.67, 24.60],
    [47.73, 24.35],
    [47.80, 24.15],
    
    // West - Romania/Hungary border junction
    [47.88, 23.95],
    [47.97, 23.80],
    [48.07, 23.65],
    [48.17, 23.50],
    [48.28, 23.38],
    [48.40, 23.28],
    [48.52, 23.20],
    [48.65, 23.15],
    [48.78, 23.12],
    
    // West - Slovakia/Hungary border
    [48.92, 23.10],
    [49.05, 23.08],
    [49.18, 23.05],
    [49.30, 23.00],
    [49.42, 22.95],
    [49.53, 22.88],
    [49.63, 22.80],
    [49.72, 22.70],
    [49.80, 22.58],
    [49.87, 22.45],
    [49.93, 22.32],
    [49.98, 22.20],
    
    // Northwest - Poland border (heading north)
    [50.03, 22.10],
    [50.10, 22.02],
    [50.18, 21.95],
    [50.27, 21.90],
    [50.37, 21.87],
    [50.48, 21.85],
    [50.60, 21.85],
    [50.72, 21.87],
    [50.85, 21.92],
    [50.98, 22.00],
    [51.12, 22.10],
    [51.25, 22.23],
    [51.38, 22.38],
    [51.50, 22.55],
    [51.62, 22.75],
    [51.73, 22.97],
    [51.85, 23.10],
    [51.97, 23.20],
    [52.10, 23.28],
    [52.23, 23.38],
    [52.37, 23.48],  // Close the loop back to start
];

// Function to interpolate points between border points for smoother curves
const interpolateBorder = (borderLine: [number, number][], pointsPerSegment: number = 3): [number, number][] => {
    const interpolated: [number, number][] = [];
    
    for (let i = 0; i < borderLine.length - 1; i++) {
        const current = borderLine[i];
        const next = borderLine[i + 1];
        
        for (let j = 0; j < pointsPerSegment; j++) {
            const t = j / pointsPerSegment;
            interpolated.push([
                current[0] + (next[0] - current[0]) * t,
                current[1] + (next[1] - current[1]) * t
            ]);
        }
    }
    
    return interpolated;
};

// Function to create rounded offset boundary around all of Ukraine
const createOffsetLine = (borderLine: [number, number][], distanceKm: number): [number, number][] => {
    // First interpolate more points for smoother boundary
    const smoothBorder = interpolateBorder(borderLine, 5);
    
    // Create offset points radially outward from Ukraine's center
    // At this latitude, 1 degree longitude ≈ 70km, 1 degree latitude ≈ 111km
    const latPerKm = 1 / 111;
    const lonPerKm = 1 / 70;
    
    const centerLat = 48.5;  // Approximate center of Ukraine
    const centerLon = 31.5;
    
    const offsetPoints: [number, number][] = [];
    
    for (let i = 0; i < smoothBorder.length; i++) {
        const point = smoothBorder[i];
        
        // Calculate direction from center to this border point (radial outward)
        const toLat = point[0] - centerLat;
        const toLon = point[1] - centerLon;
        const distance = Math.sqrt(toLat * toLat + toLon * toLon);
        
        if (distance === 0) continue;
        
        // Normalize direction and scale by desired distance
        const dirLat = toLat / distance;
        const dirLon = toLon / distance;
        
        // Calculate angle from center (0° = north, 90° = east, 180° = south, 270° = west)
        const angle = Math.atan2(toLon, toLat) * (180 / Math.PI);
        
        // Smooth reduction for east (45° to 135°) and south (135° to 225°)
        let reduction = 0;
        
        // East reduction: gradually from 0 at 45° to max 100km at 90° back to 0 at 135°
        if (angle >= 45 && angle <= 135) {
            const eastFactor = 1 - Math.abs((angle - 90) / 45);
            reduction += 100 * eastFactor;
        }
        
        // South reduction: gradually from 0 at 135° to max 100km at 180° back to 0 at 225°
        if (Math.abs(angle) >= 135) {
            const southAngle = Math.abs(angle);
            const southFactor = 1 - Math.abs((southAngle - 180) / 45);
            reduction += 100 * southFactor;
        }
        
        const adjustedDistance = Math.max(0, distanceKm - reduction);
        
        offsetPoints.push([
            point[0] + dirLat * adjustedDistance * latPerKm,
            point[1] + dirLon * adjustedDistance * lonPerKm
        ]);
    }
    
    return offsetPoints;
};

// Missile types and their ranges (in km)
const missileTypes = [
    { name: "500km Range", range: 500, color: "#10B981" },
    { name: "1000km Range", range: 1000, color: "#F97316" },
    { name: "1500km Range", range: 1500, color: "#EF4444" }
];

// Capital cities
const capitals = [
    { name: "Kyiv", lat: 50.4501, lon: 30.5234, colors: { top: "#0057B7", bottom: "#FFD700" } }, // Ukrainian flag colors
    { name: "Moscow", lat: 55.7558, lon: 37.6173, color: "#DC2626", colors: undefined } // Red
];

// Custom marker icons
const createCustomIcon = (color: string, damagePercentage: number = 0) => {
    let borderColor = 'white';
    let borderWidth = 2;
    
    if (damagePercentage > 0 && damagePercentage < 50) {
        borderColor = '#FF9800'; // Orange
        borderWidth = 3;
    } else if (damagePercentage >= 50) {
        borderColor = '#EF4444'; // Brighter red for visibility
        borderWidth = 3;
    }
    
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: ${borderWidth}px solid ${borderColor};"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });
};

// Custom Marker Component that updates icon on damage status change
const FacilityMarker: React.FC<{
    facility: Facility;
    onViewDetails: (id: number) => void;
}> = ({ facility, onViewDetails }) => {
    const markerRef = useRef<L.Marker>(null);
    
    useEffect(() => {
        // Update marker icon when damage percentage changes
        if (markerRef.current) {
            const color = facility.type === 'refinery' ? '#DC2626' : 
                         facility.type === 'extraction' ? '#16A34A' : 
                         facility.type === 'storage' ? '#2563EB' : '#FFC300';
            markerRef.current.setIcon(createCustomIcon(color, facility.damagePercentage || 0));
        }
    }, [facility.damagePercentage, facility.type]);
    
    const getMarkerColor = (type: string) => {
        switch (type) {
            case 'refinery': return '#DC2626';
            case 'extraction': return '#16A34A';
            case 'storage': return '#2563EB';
            default: return '#FFC300';
        }
    };
    // Get latitude and longitude from either location object or flat properties
    const lat = facility.location?.latitude ?? facility.latitude ?? 0;
    const lon = facility.location?.longitude ?? facility.longitude ?? 0;
    
    return (
        <Marker
            ref={markerRef}
            position={[lat, lon]}
            icon={createCustomIcon(getMarkerColor(facility.type), facility.damagePercentage || 0)}
        >
            <Popup>
                <div style={{ color: '#000', minWidth: '200px' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{facility.name}</h3>
                    <div style={{ marginBottom: '8px' }}>
                        <div style={{ 
                            display: 'inline-block',
                            padding: '3px 8px',
                            backgroundColor: facility.hit ? '#dc2626' : '#10b981',
                            color: 'white',
                            borderRadius: '3px',
                            fontSize: '11px',
                            fontWeight: '600',
                            textTransform: 'uppercase'
                        }}>
                            {facility.hit ? 'HIT' : 'OPERATIONAL'}
                        </div>
                    </div>
                    <p style={{ margin: '5px 0', fontSize: '13px' }}>
                        <strong>Type:</strong> <span style={{ textTransform: 'capitalize' }}>{facility.type}</span>
                    </p>
                    <p style={{ margin: '5px 0', fontSize: '13px' }}>
                        <strong>Capacity:</strong> {facility.capacity.toLocaleString()} bbl/day
                    </p>
                    <p style={{ margin: '5px 0 10px 0', fontSize: '11px', color: '#666' }}>
                        {lat.toFixed(4)}, {lon.toFixed(4)}
                    </p>
                    <button
                        onClick={() => onViewDetails(facility.id)}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                    >
                        View Full Details →
                    </button>
                </div>
            </Popup>
        </Marker>
    );
};

const Map: React.FC = () => {
    const navigate = useNavigate();
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [filterType, setFilterType] = useState<string>('all');
    const [filterHitStatus, setFilterHitStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [minCapacity, setMinCapacity] = useState<number>(0);
    
    // Facility type visibility
    const [showRefinery, setShowRefinery] = useState<boolean>(true);
    const [showExtraction, setShowExtraction] = useState<boolean>(true);
    const [showStorage, setShowStorage] = useState<boolean>(true);
    
    // Weapon range visibility
    const [show500km, setShow500km] = useState<boolean>(true);
    const [show1000km, setShow1000km] = useState<boolean>(true);
    const [show1500km, setShow1500km] = useState<boolean>(true);

    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                if (!db) {
                    console.error('Firebase not initialized');
                    return;
                }
                const querySnapshot = await getDocs(collection(db, COLLECTIONS.FACILITIES));
                const hitsSnapshot = await getDocs(collection(db, COLLECTIONS.HITS));
                
                // Calculate damage per facility
                const facilitiesData = querySnapshot.docs
                    .map(doc => {
                        const facilityData = doc.data();
                        const facilityId = parseInt(doc.id);
                        
                        // Get all published hits for this facility
                        const facilityHits = hitsSnapshot.docs
                            .map(hitDoc => hitDoc.data())
                            .filter(hit => hit.facilityId === facilityId && !hit.draft);
                        
                        // Calculate total damage percentage
                        const totalDamage = facilityHits.reduce((sum, hit) => sum + (hit.damagePercentage || 0), 0);
                        
                        return {
                            id: facilityId,
                            ...facilityData,
                            damagePercentage: totalDamage
                        } as Facility;
                    })
                    .filter(facility => !facility.draft); // Filter out draft facilities
                setFacilities(facilitiesData);
            } catch (error) {
                console.error('Error fetching facilities:', error);
            }
        };
        
        fetchFacilities();
    }, []);
    
    const handleFacilityClick = (facility: Facility) => {
        navigate(`/facility/${facility.id}`);
    };
    
    const handleViewDetails = (id: number) => {
        navigate(`/facility/${id}`);
    };

    // Filter facilities based on all criteria
    const filteredFacilities = facilities.filter(facility => {
        // Type filter
        if (filterType !== 'all' && facility.type !== filterType) return false;
        
        // Visibility filter by type
        if (facility.type === 'refinery' && !showRefinery) return false;
        if (facility.type === 'extraction' && !showExtraction) return false;
        if (facility.type === 'storage' && !showStorage) return false;
        
        // Hit status filter
        if (filterHitStatus === 'hit' && !facility.hit) return false;
        if (filterHitStatus === 'operational' && facility.hit) return false;
        
        // Capacity filter
        if (facility.capacity < minCapacity) return false;
        
        // Search filter
        if (searchTerm && !facility.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        
        return true;
    });

    const getMarkerColor = (type: string) => {
        switch (type) {
            case 'refinery': return '#DC2626';
            case 'extraction': return '#16A34A';
            case 'storage': return '#2563EB';
            default: return '#FFC300';
        }
    };

    return (
        <div style={{ display: 'flex', width: '100%', height: '100vh', backgroundColor: '#0a0a0a', overflow: 'hidden' }}>
            {/* Left Sidebar */}
            <div style={{ 
                width: '320px', 
                background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1e 100%)',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '2px 0 15px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* Sidebar Header */}
                <div style={{ 
                    padding: '18px 20px', 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'linear-gradient(135deg, #2d3561 0%, #1f2749 100%)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}>
                    <h2 style={{ 
                        margin: '0 0 6px 0', 
                        fontSize: '18px', 
                        fontWeight: '700', 
                        color: 'white',
                        letterSpacing: '0.3px'
                    }}>
                        Russian Oil Facilities
                    </h2>
                    <p style={{ 
                        margin: 0, 
                        color: 'rgba(255, 255, 255, 0.7)', 
                        fontSize: '13px',
                        fontWeight: '500'
                    }}>
                        {filteredFacilities.length} of {facilities.length} facilities
                    </p>
                </div>

                {/* Filters */}
                <div style={{ 
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px 20px'
                }}>
                    {/* Search */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontSize: '12px', 
                            color: '#a0aec0', 
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.8px'
                        }}>
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                backgroundColor: 'rgba(10, 10, 10, 0.5)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '6px',
                                color: 'white',
                                fontSize: '14px',
                                outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.2s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'rgba(96, 165, 250, 0.5)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                        />
                    </div>

                    {/* Status Filter */}
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ 
                            fontSize: '12px', 
                            color: '#a0aec0', 
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.8px',
                            marginBottom: '8px'
                        }}>
                            Status
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px', 
                                cursor: 'pointer',
                                padding: '6px',
                                borderRadius: '4px',
                                transition: 'background 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <input 
                                    type="checkbox" 
                                    checked={filterHitStatus === 'all' || filterHitStatus === 'hit'} 
                                    onChange={(e) => {
                                        if (filterHitStatus === 'hit') {
                                            setFilterHitStatus('all');
                                        } else {
                                            setFilterHitStatus('hit');
                                        }
                                    }}
                                    style={{ 
                                        cursor: 'pointer',
                                        width: '16px',
                                        height: '16px',
                                        accentColor: '#6b7280'
                                    }}
                                />
                                <span style={{ fontSize: '13px', color: '#cbd5e0', fontWeight: '500' }}>Hit</span>
                            </label>
                            <label style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px', 
                                cursor: 'pointer',
                                padding: '6px',
                                borderRadius: '4px',
                                transition: 'background 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <input 
                                    type="checkbox" 
                                    checked={filterHitStatus === 'all' || filterHitStatus === 'operational'} 
                                    onChange={(e) => {
                                        if (filterHitStatus === 'operational') {
                                            setFilterHitStatus('all');
                                        } else {
                                            setFilterHitStatus('operational');
                                        }
                                    }}
                                    style={{ 
                                        cursor: 'pointer',
                                        width: '16px',
                                        height: '16px',
                                        accentColor: '#6b7280'
                                    }}
                                />
                                <span style={{ fontSize: '13px', color: '#cbd5e0', fontWeight: '500' }}>Operational</span>
                            </label>
                        </div>
                    </div>

                    {/* Minimum Capacity */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontSize: '12px', 
                            color: '#a0aec0', 
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.8px'
                        }}>
                            Min. Capacity
                        </label>
                        <div style={{ 
                            color: '#9ca3af', 
                            fontSize: '14px', 
                            marginBottom: '8px',
                            fontWeight: '600'
                        }}>
                            {minCapacity.toLocaleString()} barrels/day
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="400000"
                            step="10000"
                            value={minCapacity}
                            onChange={(e) => setMinCapacity(Number(e.target.value))}
                            style={{
                                width: '100%',
                                cursor: 'pointer',
                                accentColor: '#6b7280',
                                height: '5px'
                            }}
                        />
                    </div>

                    {/* Legend */}
                    <div style={{ 
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        paddingTop: '16px',
                        marginTop: '16px'
                    }}>
                        <div style={{ 
                            fontSize: '12px', 
                            color: '#a0aec0', 
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.8px',
                            marginBottom: '8px'
                        }}>
                            Facility Types
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px', 
                                cursor: 'pointer',
                                padding: '6px',
                                borderRadius: '4px',
                                transition: 'background 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <input 
                                    type="checkbox" 
                                    checked={showRefinery} 
                                    onChange={(e) => setShowRefinery(e.target.checked)}
                                    style={{ 
                                        cursor: 'pointer',
                                        width: '16px',
                                        height: '16px',
                                        accentColor: '#6b7280'
                                    }}
                                />
                                <span style={{ color: '#DC2626', fontSize: '16px', lineHeight: '1' }}>●</span>
                                <span style={{ fontSize: '13px', color: '#cbd5e0', fontWeight: '500' }}>Refinery</span>
                            </label>
                            <label style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px', 
                                cursor: 'pointer',
                                padding: '6px',
                                borderRadius: '4px',
                                transition: 'background 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <input 
                                    type="checkbox" 
                                    checked={showExtraction} 
                                    onChange={(e) => setShowExtraction(e.target.checked)}
                                    style={{ 
                                        cursor: 'pointer',
                                        width: '16px',
                                        height: '16px',
                                        accentColor: '#6b7280'
                                    }}
                                />
                                <span style={{ color: '#16A34A', fontSize: '16px', lineHeight: '1' }}>●</span>
                                <span style={{ fontSize: '13px', color: '#cbd5e0', fontWeight: '500' }}>Extraction</span>
                            </label>
                            <label style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px', 
                                cursor: 'pointer',
                                padding: '6px',
                                borderRadius: '4px',
                                transition: 'background 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <input 
                                    type="checkbox" 
                                    checked={showStorage} 
                                    onChange={(e) => setShowStorage(e.target.checked)}
                                    style={{ 
                                        cursor: 'pointer',
                                        width: '16px',
                                        height: '16px',
                                        accentColor: '#6b7280'
                                    }}
                                />
                                <span style={{ color: '#2563EB', fontSize: '16px', lineHeight: '1' }}>●</span>
                                <span style={{ fontSize: '13px', color: '#cbd5e0', fontWeight: '500' }}>Storage</span>
                            </label>
                        </div>
                    </div>

                    {/* Weapon Ranges Legend */}
                    <div style={{ 
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        paddingTop: '16px',
                        marginTop: '16px'
                    }}>
                        <div style={{ 
                            fontSize: '12px', 
                            color: '#a0aec0', 
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.8px',
                            marginBottom: '8px'
                        }}>
                            Weapon Ranges
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px', 
                                padding: '6px'
                            }}>
                                <span style={{ color: '#10B981', fontSize: '16px' }}>■</span>
                                <span style={{ fontSize: '13px', color: '#cbd5e0', fontWeight: '500' }}>500km Range</span>
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px', 
                                padding: '6px'
                            }}>
                                <span style={{ color: '#F97316', fontSize: '16px' }}>■</span>
                                <span style={{ fontSize: '13px', color: '#cbd5e0', fontWeight: '500' }}>1000km Range</span>
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px', 
                                padding: '6px'
                            }}>
                                <span style={{ color: '#EF4444', fontSize: '16px' }}>■</span>
                                <span style={{ fontSize: '13px', color: '#cbd5e0', fontWeight: '500' }}>1500km Range</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div style={{ flex: 1, position: 'relative' }}>
                <MapContainer
                    center={[55, 50]}
                    zoom={4.4}
                    style={{ width: '100%', height: '100%', backgroundColor: '#0a0a0a' }}
                    zoomControl={true}
                >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                {/* Range boundary from Ukraine border */}
                {missileTypes.map((missile) => {
                    // Check if this range should be shown
                    if (missile.range === 500 && !show500km) return null;
                    if (missile.range === 1000 && !show1000km) return null;
                    if (missile.range === 1500 && !show1500km) return null;
                    
                    const rangeLine = createOffsetLine(ukraineBorderLine, missile.range);
                    return (
                        <Polygon
                            key={missile.range}
                            positions={rangeLine}
                            pathOptions={{
                                color: missile.color,
                                fillColor: 'transparent',
                                weight: 2,
                                opacity: 0.9,
                                fillOpacity: 0
                            }}
                        />
                    );
                })}

                {/* Capital city markers */}
                {capitals.map((capital) => {
                    let icon;
                    
                    if (capital.name === "Moscow") {
                        // 5-point star for Moscow
                        icon = L.divIcon({
                            className: 'capital-marker',
                            html: `<div style="
                                width: 24px; 
                                height: 24px; 
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                filter: drop-shadow(0 0 4px rgba(0,0,0,0.7));
                            ">
                                <svg width="24" height="24" viewBox="0 0 24 24" style="display: block;">
                                    <path d="M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 Z" 
                                          fill="${capital.color}" 
                                          stroke="white" 
                                          stroke-width="2"/>
                                </svg>
                            </div>`,
                            iconSize: [24, 24],
                            iconAnchor: [12, 12]
                        });
                    } else if (capital.name === "Kyiv" && capital.colors) {
                        // 5-point star with Ukrainian flag colors (horizontal 70/30 split - blue 70%, yellow 30%)
                        icon = L.divIcon({
                            className: 'capital-marker',
                            html: `<div style="
                                width: 24px; 
                                height: 24px; 
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                filter: drop-shadow(0 0 4px rgba(0,0,0,0.7));
                            ">
                                <svg width="24" height="24" viewBox="0 0 24 24" style="display: block;">
                                    <defs>
                                        <linearGradient id="ukraineFlag" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="70%" style="stop-color:${capital.colors.top};stop-opacity:1" />
                                            <stop offset="70%" style="stop-color:${capital.colors.bottom};stop-opacity:1" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 Z" 
                                          fill="url(#ukraineFlag)"/>
                                </svg>
                            </div>`,
                            iconSize: [24, 24],
                            iconAnchor: [12, 12]
                        });
                    }
                    
                    return (
                        <Marker
                            key={capital.name}
                            position={[capital.lat, capital.lon]}
                            icon={icon}
                        >
                            <Popup>
                                <div style={{ color: '#000', fontWeight: 'bold' }}>
                                    {capital.name}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {/* Facility markers */}
                {filteredFacilities.map((facility) => (
                    <FacilityMarker
                        key={facility.id}
                        facility={facility}
                        onViewDetails={handleViewDetails}
                    />
                ))}
            </MapContainer>
            </div>
        </div>
    );
};

export default Map;