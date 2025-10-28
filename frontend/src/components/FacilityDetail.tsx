import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase';

interface Facility {
    id: number;
    name: string;
    location: {
        latitude: number;
        longitude: number;
    };
    capacity: number;
    type: string;
    hit: boolean;
}

const FacilityDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [facility, setFacility] = useState<Facility | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchFacility = async () => {
            if (id) {
                try {
                    if (!db) {
                        console.error('Firebase not initialized');
                        setLoading(false);
                        return;
                    }
                    const docRef = doc(db, COLLECTIONS.FACILITIES, id);
                    const docSnap = await getDoc(docRef);
                    
                    if (docSnap.exists()) {
                        setFacility({
                            id: parseInt(docSnap.id),
                            ...docSnap.data()
                        } as Facility);
                    } else {
                        console.error('Facility not found');
                    }
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching facility:', error);
                    setLoading(false);
                }
            }
        };
        
        fetchFacility();
    }, [id]);

    if (loading) {
        return (
            <div style={{ 
                width: '100%', 
                height: '100vh', 
                backgroundColor: '#0a0a0a', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px'
            }}>
                Loading...
            </div>
        );
    }

    if (!facility) {
        return (
            <div style={{ 
                width: '100%', 
                height: '100vh', 
                backgroundColor: '#0a0a0a', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                color: 'white',
                gap: '20px'
            }}>
                <div style={{ fontSize: '18px' }}>Facility not found</div>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    Back to Map
                </button>
            </div>
        );
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'refinery': return '#FF5733';
            case 'extraction': return '#33FF57';
            case 'storage': return '#3357FF';
            default: return '#FFC300';
        }
    };

    return (
        <div style={{ 
            width: '100%', 
            minHeight: '100vh', 
            backgroundColor: '#0a0a0a',
            color: 'white'
        }}>
            {/* Header */}
            <div style={{
                backgroundColor: '#1a1a1a',
                borderBottom: '2px solid #333',
                padding: '20px 40px'
            }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#333',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        marginBottom: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    ← Back to Map
                </button>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', fontWeight: '600' }}>
                    {facility.name}
                </h1>
                <div style={{ 
                    display: 'inline-block',
                    padding: '6px 16px',
                    backgroundColor: facility.hit ? '#dc2626' : '#10b981',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    {facility.hit ? 'HIT' : 'OPERATIONAL'}
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '40px', maxWidth: '1200px' }}>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                    gap: '30px',
                    marginBottom: '40px'
                }}>
                    {/* Facility Type Card */}
                    <div style={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        padding: '24px'
                    }}>
                        <div style={{
                            fontSize: '11px',
                            color: '#888',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '12px',
                            fontWeight: '500'
                        }}>
                            Facility Type
                        </div>
                        <div style={{
                            fontSize: '24px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <span style={{ 
                                color: getTypeColor(facility.type),
                                fontSize: '28px'
                            }}>●</span>
                            <span style={{ textTransform: 'capitalize' }}>{facility.type}</span>
                        </div>
                    </div>

                    {/* Capacity Card */}
                    <div style={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        padding: '24px'
                    }}>
                        <div style={{
                            fontSize: '11px',
                            color: '#888',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '12px',
                            fontWeight: '500'
                        }}>
                            Production Capacity
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: '600', color: 'white' }}>
                            {facility.capacity.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '14px', color: '#888', marginTop: '4px' }}>
                            barrels per day
                        </div>
                    </div>

                    {/* ID Card */}
                    <div style={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        padding: '24px'
                    }}>
                        <div style={{
                            fontSize: '11px',
                            color: '#888',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '12px',
                            fontWeight: '500'
                        }}>
                            Facility ID
                        </div>
                        <div style={{ 
                            fontSize: '32px', 
                            fontWeight: '600',
                            color: '#666',
                            fontFamily: 'monospace'
                        }}>
                            #{facility.id}
                        </div>
                    </div>
                </div>

                {/* Location Section */}
                <div style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    padding: '30px'
                }}>
                    <h2 style={{ 
                        margin: '0 0 20px 0', 
                        fontSize: '20px', 
                        fontWeight: '600' 
                    }}>
                        Location
                    </h2>
                    <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '20px'
                    }}>
                        <div>
                            <div style={{
                                fontSize: '11px',
                                color: '#888',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: '8px',
                                fontWeight: '500'
                            }}>
                                Latitude
                            </div>
                            <div style={{ 
                                fontSize: '18px', 
                                fontFamily: 'monospace',
                                backgroundColor: '#0a0a0a',
                                padding: '12px',
                                borderRadius: '4px',
                                border: '1px solid #333'
                            }}>
                                {facility.location.latitude.toFixed(6)}°
                            </div>
                        </div>
                        <div>
                            <div style={{
                                fontSize: '11px',
                                color: '#888',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: '8px',
                                fontWeight: '500'
                            }}>
                                Longitude
                            </div>
                            <div style={{ 
                                fontSize: '18px', 
                                fontFamily: 'monospace',
                                backgroundColor: '#0a0a0a',
                                padding: '12px',
                                borderRadius: '4px',
                                border: '1px solid #333'
                            }}>
                                {facility.location.longitude.toFixed(6)}°
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: '20px' }}>
                        <a
                            href={`https://www.google.com/maps?q=${facility.location.latitude},${facility.location.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-block',
                                padding: '10px 20px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            View on Google Maps →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacilityDetail;
