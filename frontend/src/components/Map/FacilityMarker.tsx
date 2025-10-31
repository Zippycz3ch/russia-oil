import React, { useEffect, useRef } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Facility } from './types';
import { createCustomIcon, getMarkerColor } from './icons';

interface FacilityMarkerProps {
    facility: Facility;
    onViewDetails: (id: number) => void;
}

export const FacilityMarker: React.FC<FacilityMarkerProps> = ({ facility, onViewDetails }) => {
    const markerRef = useRef<L.Marker>(null);
    
    useEffect(() => {
        // Update marker icon when damage percentage changes
        if (markerRef.current) {
            const color = getMarkerColor(facility.type);
            markerRef.current.setIcon(createCustomIcon(color, facility.damagePercentage || 0));
        }
    }, [facility.damagePercentage, facility.type]);
    
    // Get latitude and longitude from either location object or flat properties
    const lat = facility.location?.latitude ?? facility.latitude ?? 0;
    const lon = facility.location?.longitude ?? facility.longitude ?? 0;
    
    // Get the marker color
    const markerColor = getMarkerColor(facility.type);
    
    return (
        <Marker
            ref={markerRef}
            position={[lat, lon]}
            icon={createCustomIcon(markerColor, facility.damagePercentage || 0)}
        >
            <Popup>
                <div style={{ color: '#000', minWidth: '200px' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{facility.name}</h3>
                    <div style={{ marginBottom: '8px', display: 'flex', gap: '6px', alignItems: 'center' }}>
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
                        {facility.hit && facility.damagePercentage && facility.damagePercentage > 0 && (
                            <div style={{ 
                                display: 'inline-block',
                                padding: '3px 8px',
                                backgroundColor: '#f59e0b',
                                color: 'white',
                                borderRadius: '3px',
                                fontSize: '11px',
                                fontWeight: '600'
                            }}>
                                -{facility.damagePercentage}%
                            </div>
                        )}
                    </div>
                    <p style={{ margin: '5px 0', fontSize: '13px' }}>
                        <strong>Type:</strong> <span style={{ textTransform: 'capitalize' }}>{facility.type}</span>
                    </p>
                    <div style={{ margin: '10px 0' }}>
                        <p style={{ margin: '0 0 5px 0', fontSize: '13px', fontWeight: 'bold' }}>Production:</p>
                        <p style={{ margin: '2px 0 2px 10px', fontSize: '13px' }}>
                            <strong>Oil:</strong> {facility.capacity.toLocaleString()} bbl/day
                            {facility.hit && facility.damagePercentage && facility.damagePercentage > 0 && (
                                <span style={{ color: '#dc2626', fontWeight: '600', marginLeft: '6px' }}>
                                    → {Math.round(facility.capacity * (1 - facility.damagePercentage / 100)).toLocaleString()} bbl/day
                                </span>
                            )}
                        </p>
                        {facility.gasCapacity && (
                            <p style={{ margin: '2px 0 2px 10px', fontSize: '13px' }}>
                                <strong>Gas:</strong> {facility.gasCapacity.toLocaleString()} m³/year
                                {facility.hit && facility.damagePercentage && facility.damagePercentage > 0 && (
                                    <span style={{ color: '#dc2626', fontWeight: '600', marginLeft: '6px' }}>
                                        → {Math.round(facility.gasCapacity * (1 - facility.damagePercentage / 100)).toLocaleString()} m³/year
                                    </span>
                                )}
                            </p>
                        )}
                    </div>
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
