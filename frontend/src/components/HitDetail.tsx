import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase';

interface Hit {
    id: number;
    facilityId: number;
    date: string;
    severity?: 'damaged' | 'destroyed';
    damagePercentage?: number;
    mediaLinks?: string[];
    videoLink?: string;
    expectedRepairTime?: number;
    notes?: string;
    draft?: boolean;
}

interface Facility {
    id: number;
    name: string;
    type: string;
    capacity: number;
    gasCapacity?: number;
}

const HitDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [hit, setHit] = useState<Hit | null>(null);
    const [facility, setFacility] = useState<Facility | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchHitAndFacility = async () => {
            if (id) {
                try {
                    if (!db) {
                        console.error('Firebase not initialized');
                        setLoading(false);
                        return;
                    }
                    
                    // Fetch all hits to find the one with matching id
                    const hitsRef = collection(db, COLLECTIONS.HITS);
                    const hitsSnap = await getDocs(hitsRef);
                    const hitDoc = hitsSnap.docs.find(doc => doc.data().id === parseInt(id));
                    
                    if (hitDoc) {
                        const hitData = {
                            id: hitDoc.data().id,
                            ...hitDoc.data()
                        } as Hit;
                        
                        setHit(hitData);

                        // Fetch the associated facility
                        const facilitiesRef = collection(db, COLLECTIONS.FACILITIES);
                        const facilitiesSnap = await getDocs(facilitiesRef);
                        const facilityDoc = facilitiesSnap.docs.find(doc => 
                            parseInt(doc.id) === hitData.facilityId
                        );
                        
                        if (facilityDoc) {
                            setFacility({
                                id: parseInt(facilityDoc.id),
                                ...facilityDoc.data()
                            } as Facility);
                        }
                    } else {
                        console.error('Hit not found');
                    }
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching hit:', error);
                    setLoading(false);
                }
            }
        };
        
        fetchHitAndFacility();
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

    if (!hit) {
        return (
            <div style={{ 
                width: '100%', 
                height: '100vh', 
                backgroundColor: '#0a0a0a', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <div style={{ color: 'white', fontSize: '18px' }}>Hit not found</div>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
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

    const hitDate = new Date(hit.date);

    return (
        <div style={{ 
            width: '100%', 
            minHeight: '100vh', 
            backgroundColor: '#0a0a0a',
            color: 'white',
            padding: '0'
        }}>
            {/* Header with back button */}
            <div style={{
                backgroundColor: '#1a1a1a',
                borderBottom: '1px solid #333',
                padding: '20px 40px',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'transparent',
                            color: '#888',
                            border: '1px solid #333',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#333';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#888';
                        }}
                    >
                        <span>←</span>
                        <span>Back</span>
                    </button>
                </div>
            </div>

            <div style={{ 
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '40px'
            }}>
                {/* Title Section */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '16px'
                    }}>
                        <div style={{
                            backgroundColor: '#dc2626',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            ⚠ Strike Record
                        </div>
                        <div style={{
                            color: '#666',
                            fontSize: '14px',
                            fontFamily: 'monospace'
                        }}>
                            ID #{hit.id}
                        </div>
                    </div>
                    <h1 style={{ 
                        margin: '0 0 12px 0', 
                        fontSize: '36px', 
                        fontWeight: '700'
                    }}>
                        Strike on {hitDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </h1>
                    {facility && (
                        <div style={{ 
                            fontSize: '16px', 
                            color: '#888',
                            marginBottom: '8px'
                        }}>
                            Target: <button
                                onClick={() => navigate(`/facility/${facility.id}`)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#3b82f6',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    textDecoration: 'underline',
                                    padding: 0
                                }}
                            >
                                {facility.name}
                            </button>
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                }}>
                    {/* Date Card */}
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
                            📅 Strike Date
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: '600', color: 'white' }}>
                            {hitDate.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                            {hitDate.toLocaleDateString('en-US', { weekday: 'long' })}
                        </div>
                    </div>

                    {/* Severity Card */}
                    {hit.severity && (
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
                                ⚡ Severity
                            </div>
                            <div style={{ 
                                fontSize: '24px', 
                                fontWeight: '700',
                                color: hit.severity === 'destroyed' ? '#f44336' : '#FF9800',
                                textTransform: 'uppercase'
                            }}>
                                {hit.severity}
                            </div>
                        </div>
                    )}

                    {/* Damage Percentage Card */}
                    {hit.damagePercentage != null && (
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
                                📉 Impact on Production
                            </div>
                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#dc2626' }}>
                                -{hit.damagePercentage}%
                            </div>
                        </div>
                    )}

                    {/* Repair Time Card */}
                    {hit.expectedRepairTime && (
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
                                🔧 Expected Repair Time
                            </div>
                            <div style={{ fontSize: '32px', fontWeight: '600', color: '#f59e0b' }}>
                                {hit.expectedRepairTime}
                            </div>
                            <div style={{ fontSize: '14px', color: '#888', marginTop: '4px' }}>
                                days
                            </div>
                        </div>
                    )}
                </div>

                {/* Production Impact Section */}
                {facility && hit.damagePercentage != null && hit.damagePercentage > 0 && (
                    <div style={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        padding: '30px',
                        marginBottom: '30px'
                    }}>
                        <h2 style={{ 
                            margin: '0 0 20px 0', 
                            fontSize: '20px', 
                            fontWeight: '600'
                        }}>
                            📊 Production Impact
                        </h2>
                        <div style={{
                            display: 'grid',
                            gap: '20px'
                        }}>
                            {/* Oil Production Impact */}
                            <div style={{
                                padding: '20px',
                                backgroundColor: '#0a0a0a',
                                borderRadius: '6px',
                                border: '1px solid #333'
                            }}>
                                <div style={{ 
                                    fontSize: '14px', 
                                    color: '#888',
                                    marginBottom: '8px',
                                    fontWeight: '500'
                                }}>
                                    🛢️ Oil Production
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    flexWrap: 'wrap'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                                            Before Strike
                                        </div>
                                        <div style={{ fontSize: '24px', fontWeight: '600', color: 'white' }}>
                                            {facility.capacity.toLocaleString()} <span style={{ fontSize: '14px', color: '#888' }}>bbl/day</span>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '24px', color: '#666' }}>→</div>
                                    <div>
                                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                                            After Strike
                                        </div>
                                        <div style={{ fontSize: '24px', fontWeight: '600', color: '#dc2626' }}>
                                            {Math.round(facility.capacity * (1 - hit.damagePercentage / 100)).toLocaleString()} <span style={{ fontSize: '14px', color: '#888' }}>bbl/day</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    marginTop: '12px',
                                    padding: '12px',
                                    backgroundColor: '#1a1a1a',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    color: '#dc2626',
                                    fontWeight: '600'
                                }}>
                                    Loss: {Math.round(facility.capacity * (hit.damagePercentage / 100)).toLocaleString()} bbl/day
                                </div>
                            </div>

                            {/* Gas Production Impact */}
                            {facility.gasCapacity && (
                                <div style={{
                                    padding: '20px',
                                    backgroundColor: '#0a0a0a',
                                    borderRadius: '6px',
                                    border: '1px solid #333'
                                }}>
                                    <div style={{ 
                                        fontSize: '14px', 
                                        color: '#888',
                                        marginBottom: '8px',
                                        fontWeight: '500'
                                    }}>
                                        🔥 Gas Production
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        flexWrap: 'wrap'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                                                Before Strike
                                            </div>
                                            <div style={{ fontSize: '24px', fontWeight: '600', color: 'white' }}>
                                                {facility.gasCapacity.toLocaleString()} <span style={{ fontSize: '14px', color: '#888' }}>m³/year</span>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '24px', color: '#666' }}>→</div>
                                        <div>
                                            <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                                                After Strike
                                            </div>
                                            <div style={{ fontSize: '24px', fontWeight: '600', color: '#dc2626' }}>
                                                {Math.round(facility.gasCapacity * (1 - hit.damagePercentage / 100)).toLocaleString()} <span style={{ fontSize: '14px', color: '#888' }}>m³/year</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        marginTop: '12px',
                                        padding: '12px',
                                        backgroundColor: '#1a1a1a',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        color: '#dc2626',
                                        fontWeight: '600'
                                    }}>
                                        Loss: {Math.round(facility.gasCapacity * (hit.damagePercentage / 100)).toLocaleString()} m³/year
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Notes Section */}
                {hit.notes && (
                    <div style={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        padding: '30px',
                        marginBottom: '30px'
                    }}>
                        <h2 style={{ 
                            margin: '0 0 16px 0', 
                            fontSize: '20px', 
                            fontWeight: '600' 
                        }}>
                            📝 Notes
                        </h2>
                        <p style={{ 
                            margin: 0,
                            fontSize: '15px',
                            lineHeight: '1.7',
                            color: '#ccc',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {hit.notes}
                        </p>
                    </div>
                )}

                {/* Media Section */}
                {((hit.mediaLinks && hit.mediaLinks.length > 0) || hit.videoLink) && (
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
                            📹 Media & Evidence
                        </h2>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            {hit.mediaLinks && hit.mediaLinks.length > 0 ? (
                                hit.mediaLinks.map((link, idx) => (
                                    <a
                                        key={idx}
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '16px 20px',
                                            backgroundColor: '#0a0a0a',
                                            color: 'white',
                                            textDecoration: 'none',
                                            borderRadius: '6px',
                                            border: '1px solid #333',
                                            fontSize: '15px',
                                            fontWeight: '500',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#dc2626';
                                            e.currentTarget.style.borderColor = '#dc2626';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#0a0a0a';
                                            e.currentTarget.style.borderColor = '#333';
                                        }}
                                    >
                                        <span style={{ fontSize: '24px' }}>
                                            {link.includes('youtube') || link.includes('youtu.be') || link.includes('video') ? '📹' : '📷'}
                                        </span>
                                        <div style={{ flex: 1 }}>
                                            <div>Media Source {idx + 1}</div>
                                            <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                                                {new URL(link).hostname}
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '20px' }}>→</span>
                                    </a>
                                ))
                            ) : hit.videoLink && (
                                <a
                                    href={hit.videoLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '16px 20px',
                                        backgroundColor: '#0a0a0a',
                                        color: 'white',
                                        textDecoration: 'none',
                                        borderRadius: '6px',
                                        border: '1px solid #333',
                                        fontSize: '15px',
                                        fontWeight: '500',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#dc2626';
                                        e.currentTarget.style.borderColor = '#dc2626';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#0a0a0a';
                                        e.currentTarget.style.borderColor = '#333';
                                    }}
                                >
                                    <span style={{ fontSize: '24px' }}>📹</span>
                                    <div style={{ flex: 1 }}>
                                        <div>Video Evidence</div>
                                        <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                                            {new URL(hit.videoLink).hostname}
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '20px' }}>→</span>
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HitDetail;
