import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
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
    type: string;
    hit: boolean;
}

// Ukraine border line (highly detailed border - clockwise from northwest)
const ukraineBorderLine: [number, number][] = [
    // Northwest - Poland/Belarus tripoint
    [52.365, 23.485],
    [52.360, 23.620], [52.355, 23.755], [52.345, 23.890], [52.340, 24.025],
    
    // North - Belarus border (moving east)
    [52.338, 24.160], [52.335, 24.295], [52.340, 24.430], [52.345, 24.565], [52.352, 24.700],
    [52.360, 24.835], [52.370, 24.970], [52.380, 25.105], [52.390, 25.240], [52.398, 25.375],
    [52.405, 25.510], [52.410, 25.645], [52.415, 25.780], [52.420, 25.915], [52.423, 26.050],
    [52.425, 26.185], [52.427, 26.320], [52.428, 26.455], [52.428, 26.590], [52.427, 26.725],
    [52.425, 26.860], [52.422, 26.995], [52.418, 27.130], [52.413, 27.265], [52.407, 27.400],
    [52.400, 27.535], [52.392, 27.670], [52.383, 27.805], [52.373, 27.940], [52.362, 28.075],
    [52.350, 28.210], [52.337, 28.345], [52.323, 28.480], [52.308, 28.615], [52.292, 28.750],
    [52.275, 28.885], [52.257, 29.020], [52.238, 29.155], [52.218, 29.290], [52.197, 29.425],
    [52.175, 29.560], [52.152, 29.695], [52.128, 29.830], [52.103, 29.965], [52.077, 30.100],
    [52.050, 30.235], [52.022, 30.370], [51.993, 30.505], [51.963, 30.640],
    
    // Northeast - Approaching Russia border
    [51.932, 30.775], [51.900, 30.910], [51.867, 31.045], [51.833, 31.180], [51.798, 31.315],
    [51.762, 31.450], [51.725, 31.585], [51.687, 31.720], [51.648, 31.855], [51.608, 31.990],
    [51.567, 32.125], [51.525, 32.260], [51.482, 32.395], [51.438, 32.530], [51.393, 32.665],
    [51.347, 32.800], [51.300, 32.935], [51.252, 33.070], [51.203, 33.205], [51.153, 33.340],
    
    // East - Russia border (north to south)
    [51.102, 33.475], [51.050, 33.610], [50.997, 33.745], [50.943, 33.880], [50.888, 34.015],
    [50.832, 34.150], [50.775, 34.285], [50.717, 34.420], [50.658, 34.555], [50.598, 34.690],
    [50.537, 34.825], [50.475, 34.960], [50.412, 35.095], [50.348, 35.230], [50.283, 35.365],
    [50.217, 35.500], [50.150, 35.635], [50.082, 35.770], [50.013, 35.905], [49.943, 36.040],
    [49.872, 36.175], [49.800, 36.310], [49.727, 36.445], [49.653, 36.580], [49.578, 36.715],
    [49.502, 36.850], [49.425, 36.985], [49.347, 37.120], [49.268, 37.255], [49.188, 37.390],
    [49.107, 37.525], [49.025, 37.660], [48.942, 37.795], [48.858, 37.930], [48.773, 38.065],
    [48.687, 38.200], [48.600, 38.335], [48.512, 38.470], [48.423, 38.605], [48.333, 38.740],
    [48.242, 38.875], [48.150, 39.010], [48.057, 39.145], [47.963, 39.280], [47.868, 39.415],
    
    // Southeast - Azov Sea region
    [47.772, 39.550], [47.675, 39.685], [47.577, 39.820], [47.478, 39.955], [47.378, 40.090],
    [47.277, 39.975], [47.175, 39.860], [47.072, 39.745], [46.968, 39.630], [46.863, 39.515],
    [46.757, 39.400], [46.650, 39.285], [46.542, 39.170], [46.433, 39.055], [46.323, 38.940],
    [46.212, 38.825], [46.100, 38.710], [45.987, 38.595], [45.873, 38.480], [45.758, 38.365],
    [45.642, 38.250], [45.525, 38.135], [45.407, 38.020], [45.288, 37.905],
    
    // South - Azov and Black Sea coast (administrative border, excluding Crimea)
    [45.168, 37.790], [45.047, 37.675], [44.925, 37.560], [44.802, 37.445], [44.678, 37.330],
    [44.553, 37.215], [44.427, 37.100], [44.300, 36.985], [44.172, 36.870], [44.043, 36.755],
    [45.220, 35.180], [45.225, 34.880], [45.228, 34.580], [45.228, 34.280], [45.225, 33.980],
    [45.220, 33.680], [45.213, 33.380], [45.203, 33.080], [45.190, 32.780], [45.175, 32.480],
    [45.157, 32.180], [45.165, 31.980], [45.180, 31.780], [45.200, 31.580], [45.225, 31.380],
    [45.255, 31.180], [45.290, 30.980], [45.330, 30.780], [45.375, 30.580], [45.425, 30.380],
    [45.480, 30.180], [45.540, 30.000], [45.605, 29.825], [45.675, 29.655], [45.750, 29.490],
    
    // Southwest - Danube Delta and Romania border
    [45.830, 29.330], [45.915, 29.175], [46.005, 29.025], [46.100, 28.880], [46.200, 28.740],
    [46.305, 28.605], [46.415, 28.475], [46.530, 28.350], [46.650, 28.230], [46.775, 28.115],
    [46.905, 28.005], [47.040, 27.900], [47.180, 27.800], [47.240, 27.660], [47.295, 27.520],
    [47.345, 27.380], [47.390, 27.240], [47.430, 27.100], [47.465, 26.960], [47.495, 26.820],
    [47.520, 26.680], [47.540, 26.540], [47.555, 26.400], [47.565, 26.260], [47.570, 26.120],
    [47.572, 25.980], [47.573, 25.840], [47.573, 25.700], [47.572, 25.560], [47.570, 25.420],
    [47.567, 25.280], [47.563, 25.140], [47.558, 25.000], [47.565, 24.860], [47.580, 24.720],
    [47.600, 24.580], [47.625, 24.440], [47.655, 24.300], [47.690, 24.160], [47.730, 24.020],
    [47.775, 23.880], [47.825, 23.740], [47.880, 23.600], [47.940, 23.465], [48.005, 23.335],
    
    // West - Romania/Hungary border region
    [48.075, 23.210], [48.150, 23.090], [48.230, 22.975], [48.315, 22.865], [48.405, 22.760],
    [48.500, 22.660], [48.600, 22.565], [48.705, 22.475], [48.815, 22.390], [48.930, 22.310],
    [49.050, 22.235], [49.175, 22.165], [49.305, 22.100], [49.440, 22.040], [49.580, 21.985],
    [49.665, 21.905], [49.745, 21.820], [49.820, 21.730], [49.890, 21.635], [49.955, 21.535],
    [50.015, 21.430], [50.070, 21.320], [50.120, 21.205], [50.165, 21.085], [50.205, 20.960],
    
    // Northwest - Poland border (heading north)
    [50.240, 20.900], [50.285, 20.845], [50.335, 20.795], [50.390, 20.750], [50.450, 20.710],
    [50.515, 20.675], [50.585, 20.645], [50.660, 20.620], [50.740, 20.600], [50.825, 20.585],
    [50.915, 20.640], [51.010, 20.720], [51.110, 20.820], [51.215, 20.935], [51.325, 21.065],
    [51.440, 21.205], [51.560, 21.355], [51.685, 21.515], [51.815, 21.680], [51.950, 21.855],
    [52.090, 22.035], [52.175, 22.185], [52.255, 22.340], [52.330, 22.500], [52.400, 22.665],
    [52.465, 22.835], [52.525, 23.010], [52.495, 23.150], [52.460, 23.285], [52.420, 23.385],
    [52.365, 23.485]  // Close the loop
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
        
        offsetPoints.push([
            point[0] + dirLat * distanceKm * latPerKm,
            point[1] + dirLon * distanceKm * lonPerKm
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

// Custom marker icons
const createCustomIcon = (color: string, isHit: boolean) => {
    const borderColor = isHit ? 'red' : 'white';
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid ${borderColor};"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });
};

// Custom Marker Component that updates icon on hit status change
const FacilityMarker: React.FC<{
    facility: Facility;
    onViewDetails: (id: number) => void;
}> = ({ facility, onViewDetails }) => {
    const markerRef = useRef<L.Marker>(null);
    
    useEffect(() => {
        // Update marker icon when hit status changes
        if (markerRef.current) {
            const color = facility.type === 'refinery' ? '#FF5733' : 
                         facility.type === 'extraction' ? '#33FF57' : 
                         facility.type === 'storage' ? '#3357FF' : '#FFC300';
            markerRef.current.setIcon(createCustomIcon(color, facility.hit));
        }
    }, [facility.hit, facility.type]);
    
    const getMarkerColor = (type: string) => {
        switch (type) {
            case 'refinery': return '#FF5733';
            case 'extraction': return '#33FF57';
            case 'storage': return '#3357FF';
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
            icon={createCustomIcon(getMarkerColor(facility.type), facility.hit)}
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
                const facilitiesData = querySnapshot.docs.map(doc => ({
                    id: parseInt(doc.id),
                    ...doc.data()
                } as Facility));
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
            case 'refinery': return '#FF5733';
            case 'extraction': return '#33FF57';
            case 'storage': return '#3357FF';
            default: return '#FFC300';
        }
    };

    return (
        <div style={{ display: 'flex', width: '100%', height: '100vh', backgroundColor: '#0a0a0a', overflow: 'hidden' }}>
            {/* Left Sidebar */}
            <div style={{ 
                width: '320px', 
                backgroundColor: '#1a1a1a', 
                borderRight: '2px solid #333',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* Sidebar Header */}
                <div style={{ 
                    padding: '20px', 
                    borderBottom: '1px solid #333',
                    backgroundColor: '#222'
                }}>
                    <h2 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: '600', color: 'white' }}>
                        Russian Oil Facilities
                    </h2>
                    <p style={{ margin: 0, color: '#888', fontSize: '13px' }}>
                        {filteredFacilities.length} of {facilities.length} facilities
                    </p>
                </div>

                {/* Filters */}
                <div style={{ 
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px'
                }}>
                    {/* Search */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontSize: '13px', 
                            color: '#aaa', 
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
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
                                backgroundColor: '#0a0a0a',
                                border: '1px solid #444',
                                borderRadius: '4px',
                                color: 'white',
                                fontSize: '14px',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Facility Type */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontSize: '13px', 
                            color: '#aaa', 
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Facility Type
                        </label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                backgroundColor: '#0a0a0a',
                                border: '1px solid #444',
                                borderRadius: '4px',
                                color: 'white',
                                fontSize: '14px',
                                cursor: 'pointer',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        >
                            <option value="all">All Types</option>
                            <option value="refinery">Refinery</option>
                            <option value="extraction">Extraction</option>
                            <option value="storage">Storage</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontSize: '13px', 
                            color: '#aaa', 
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Status
                        </label>
                        <select
                            value={filterHitStatus}
                            onChange={(e) => setFilterHitStatus(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                backgroundColor: '#0a0a0a',
                                border: '1px solid #444',
                                borderRadius: '4px',
                                color: 'white',
                                fontSize: '14px',
                                cursor: 'pointer',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        >
                            <option value="all">All Status</option>
                            <option value="hit">Hit</option>
                            <option value="operational">Operational</option>
                        </select>
                    </div>

                    {/* Minimum Capacity */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontSize: '13px', 
                            color: '#aaa', 
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Min. Capacity
                        </label>
                        <div style={{ color: '#666', fontSize: '12px', marginBottom: '8px' }}>
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
                                accentColor: '#3b82f6'
                            }}
                        />
                    </div>

                    {/* Clear Filters */}
                    {(filterType !== 'all' || filterHitStatus !== 'all' || searchTerm !== '' || minCapacity > 0) && (
                        <button
                            onClick={() => {
                                setFilterType('all');
                                setFilterHitStatus('all');
                                setSearchTerm('');
                                setMinCapacity(0);
                            }}
                            style={{
                                width: '100%',
                                padding: '10px',
                                backgroundColor: '#333',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500',
                                marginBottom: '20px'
                            }}
                        >
                            Clear All Filters
                        </button>
                    )}

                    {/* Legend */}
                    <div style={{ 
                        borderTop: '1px solid #333',
                        paddingTop: '20px',
                        marginTop: '20px'
                    }}>
                        <div style={{ 
                            fontSize: '13px', 
                            color: '#aaa', 
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '12px'
                        }}>
                            Facility Types
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    checked={showRefinery} 
                                    onChange={(e) => setShowRefinery(e.target.checked)}
                                    style={{ 
                                        cursor: 'pointer',
                                        width: '16px',
                                        height: '16px',
                                        accentColor: '#FF5733'
                                    }}
                                />
                                <span style={{ color: '#FF5733', fontSize: '16px' }}>●</span>
                                <span style={{ fontSize: '14px', color: '#ccc' }}>Refinery</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    checked={showExtraction} 
                                    onChange={(e) => setShowExtraction(e.target.checked)}
                                    style={{ 
                                        cursor: 'pointer',
                                        width: '16px',
                                        height: '16px',
                                        accentColor: '#33FF57'
                                    }}
                                />
                                <span style={{ color: '#33FF57', fontSize: '16px' }}>●</span>
                                <span style={{ fontSize: '14px', color: '#ccc' }}>Extraction</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    checked={showStorage} 
                                    onChange={(e) => setShowStorage(e.target.checked)}
                                    style={{ 
                                        cursor: 'pointer',
                                        width: '16px',
                                        height: '16px',
                                        accentColor: '#3357FF'
                                    }}
                                />
                                <span style={{ color: '#3357FF', fontSize: '16px' }}>●</span>
                                <span style={{ fontSize: '14px', color: '#ccc' }}>Storage</span>
                            </label>
                        </div>
                    </div>

                    {/* Weapon Range Toggle */}
                    <div style={{ 
                        borderTop: '1px solid #333',
                        paddingTop: '20px',
                        marginTop: '20px'
                    }}>
                        <div style={{ 
                            fontSize: '13px', 
                            color: '#aaa', 
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '12px'
                        }}>
                            Weapon Ranges
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    checked={show500km} 
                                    onChange={(e) => setShow500km(e.target.checked)}
                                    style={{ 
                                        cursor: 'pointer',
                                        width: '16px',
                                        height: '16px',
                                        accentColor: '#10B981'
                                    }}
                                />
                                <span style={{ color: '#10B981', fontSize: '16px' }}>■</span>
                                <span style={{ fontSize: '14px', color: '#ccc' }}>500km Range</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    checked={show1000km} 
                                    onChange={(e) => setShow1000km(e.target.checked)}
                                    style={{ 
                                        cursor: 'pointer',
                                        width: '16px',
                                        height: '16px',
                                        accentColor: '#F97316'
                                    }}
                                />
                                <span style={{ color: '#F97316', fontSize: '16px' }}>■</span>
                                <span style={{ fontSize: '14px', color: '#ccc' }}>1000km Range</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    checked={show1500km} 
                                    onChange={(e) => setShow1500km(e.target.checked)}
                                    style={{ 
                                        cursor: 'pointer',
                                        width: '16px',
                                        height: '16px',
                                        accentColor: '#EF4444'
                                    }}
                                />
                                <span style={{ color: '#EF4444', fontSize: '16px' }}>■</span>
                                <span style={{ fontSize: '14px', color: '#ccc' }}>1500km Range</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div style={{ flex: 1, position: 'relative' }}>
                <MapContainer
                    center={[55, 50]}
                    zoom={4}
                    style={{ width: '100%', height: '100%', backgroundColor: '#0a0a0a' }}
                    zoomControl={true}
                >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                {/* Ukraine territory - filled */}
                <Polygon
                    positions={ukraineBorderLine}
                    pathOptions={{
                        color: '#0057B7',  // Ukrainian blue border
                        fillColor: '#0057B7',  // Ukrainian blue fill
                        weight: 2,
                        opacity: 0.8,
                        fillOpacity: 0.25  // Semi-transparent fill to see through
                    }}
                />

                {/* Range boundary from Ukraine border */}
                {missileTypes.map((missile) => {
                    // Check if this range should be shown
                    if (missile.range === 500 && !show500km) return null;
                    if (missile.range === 1000 && !show1000km) return null;
                    if (missile.range === 1500 && !show1500km) return null;
                    
                    const rangeLine = createOffsetLine(ukraineBorderLine, missile.range);
                    return (
                        <React.Fragment key={missile.name}>
                            {/* Range boundary as line only */}
                            <Polygon
                                positions={rangeLine}
                                pathOptions={{
                                    color: missile.color,
                                    fillColor: 'transparent',
                                    weight: 2,
                                    opacity: 0.9,
                                    fillOpacity: 0
                                }}
                            />
                        </React.Fragment>
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