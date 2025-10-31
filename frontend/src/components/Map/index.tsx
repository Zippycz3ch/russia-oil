import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { collection, getDocs } from 'firebase/firestore';
import { db, COLLECTIONS } from '../../config/firebase';
import { Facility } from './types';
import { ukraineBorderLine, missileTypes, capitals } from './constants';
import { createOffsetLine } from './utils';
import { createCapitalIcon } from './icons';
import { FacilityMarker } from './FacilityMarker';
import { Sidebar } from './Sidebar';

const Map: React.FC = () => {
    const navigate = useNavigate();
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [filterType, setFilterType] = useState<string>('all');
    const [filterHitStatus, setFilterHitStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [minCapacity, setMinCapacity] = useState<number>(0);
    const [minGasCapacity, setMinGasCapacity] = useState<number>(0);
    
    // Facility type visibility
    const [showRefinery, setShowRefinery] = useState<boolean>(true);
    const [showExtraction, setShowExtraction] = useState<boolean>(true);
    const [showStorage, setShowStorage] = useState<boolean>(true);
    
    // Weapon range visibility
    const [show500km, setShow500km] = useState<boolean>(true);
    const [show1000km, setShow1000km] = useState<boolean>(true);
    const [show1500km, setShow1500km] = useState<boolean>(true);
    const [show2000km, setShow2000km] = useState<boolean>(true);

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
        
        // Gas capacity filter
        if (facility.gasCapacity && facility.gasCapacity < minGasCapacity) return false;
        
        // Search filter
        if (searchTerm && !facility.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        
        return true;
    });

    return (
        <div style={{ display: 'flex', width: '100%', height: '100vh', backgroundColor: '#0a0a0a', overflow: 'hidden' }}>
            {/* Left Sidebar */}
            <Sidebar 
                filteredCount={filteredFacilities.length}
                totalCount={facilities.length}
                facilities={facilities}
                filteredFacilities={filteredFacilities}
                filterState={{
                    searchTerm,
                    setSearchTerm,
                    filterHitStatus,
                    setFilterHitStatus,
                    minCapacity,
                    setMinCapacity,
                    minGasCapacity,
                    setMinGasCapacity,
                    showRefinery,
                    setShowRefinery,
                    showExtraction,
                    setShowExtraction,
                    showStorage,
                    setShowStorage
                }}
            />

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
                        if (missile.range === 2000 && !show2000km) return null;
                        
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
                                    fillOpacity: 0,
                                    dashArray: '10, 15'
                                }}
                            />
                        );
                    })}

                    {/* Capital city markers */}
                    {capitals.map((capital) => {
                        const icon = createCapitalIcon(capital);
                        
                        return (
                            <Marker
                                key={capital.name}
                                position={[capital.lat, capital.lon]}
                                icon={icon}
                            >
                                <Popup>
                                    <div style={{ 
                                        backgroundColor: '#1a1a2e',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        padding: '4px',
                                        borderRadius: '8px'
                                    }}>
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
