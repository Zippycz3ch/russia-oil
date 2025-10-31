import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase';

interface Facility {
    id: number;
    name: string;
    type: string;
    capacity: number;
    gasCapacity?: number;
    latitude: number;
    longitude: number;
    status: string;
    hit: boolean;
    description?: string;
    draft: boolean;
}

const FacilityEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [facility, setFacility] = useState<Partial<Facility>>({
        name: '',
        type: 'refinery',
        capacity: 0,
        gasCapacity: undefined,
        latitude: 0,
        longitude: 0,
        status: 'operational',
        hit: false,
        description: '',
        draft: true
    });

    useEffect(() => {
        if (id && id !== 'new') {
            fetchFacility();
        }
    }, [id]);

    const fetchFacility = async () => {
        setLoading(true);
        try {
            if (!db) throw new Error('Firebase not initialized');
            
            const docRef = doc(db, COLLECTIONS.FACILITIES, id!);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                const latitude = data.location?.latitude ?? data.latitude;
                const longitude = data.location?.longitude ?? data.longitude;
                
                setFacility({
                    id: parseInt(docSnap.id),
                    name: data.name,
                    type: data.type,
                    capacity: data.capacity,
                    gasCapacity: data.gasCapacity,
                    latitude,
                    longitude,
                    status: data.status,
                    hit: data.hit,
                    description: data.description || '',
                    draft: data.draft ?? false
                });
            } else {
                setError('Facility not found');
            }
        } catch (error) {
            console.error('Error fetching facility:', error);
            setError('Failed to load facility');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (publishNow: boolean = false) => {
        setLoading(true);
        setError(null);
        
        try {
            if (!db) throw new Error('Firebase not initialized');
            
            if (!facility.name || !facility.type || facility.capacity === undefined) {
                setError('Please fill in all required fields');
                setLoading(false);
                return;
            }
            
            let facilityId = id;
            
            // If new facility, get next ID
            if (!id || id === 'new') {
                const querySnapshot = await getDocs(collection(db, COLLECTIONS.FACILITIES));
                const maxId = querySnapshot.docs.reduce((max, doc) => {
                    const docId = parseInt(doc.id);
                    return docId > max ? docId : max;
                }, 0);
                facilityId = (maxId + 1).toString();
            }
            
            const facilityData: any = {
                id: parseInt(facilityId!),
                name: facility.name,
                type: facility.type,
                capacity: facility.capacity,
                location: {
                    latitude: facility.latitude,
                    longitude: facility.longitude
                },
                hit: facility.hit ?? false,
                draft: publishNow ? false : (facility.draft ?? true)
            };
            
            if (facility.status) {
                facilityData.status = facility.status;
            }
            
            if (facility.gasCapacity !== undefined && facility.gasCapacity !== null) {
                facilityData.gasCapacity = facility.gasCapacity;
            }
            
            if (facility.description) {
                facilityData.description = facility.description;
            }
            
            const docRef = doc(db, COLLECTIONS.FACILITIES, facilityId!);
            
            if (id && id !== 'new') {
                await updateDoc(docRef, facilityData);
            } else {
                await setDoc(docRef, facilityData);
            }
            
            alert(publishNow ? 'Facility published successfully!' : 'Facility saved as draft!');
            navigate('/admin');
        } catch (error) {
            console.error('Error saving facility:', error);
            setError('Failed to save facility');
        } finally {
            setLoading(false);
        }
    };

    if (loading && id && id !== 'new') {
        return (
            <div style={{
                minHeight: '100vh',
                backgroundColor: '#0a0a0a',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                Loading...
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#0a0a0a',
            color: 'white',
            padding: '20px'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ margin: 0 }}>
                        {id && id !== 'new' ? 'Edit Facility' : 'Add New Facility'}
                    </h1>
                    <button
                        onClick={() => navigate('/admin')}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#666',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Back to Dashboard
                    </button>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#f44336',
                        color: 'white',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}>
                        {error}
                    </div>
                )}

                {facility.draft && (
                    <div style={{
                        backgroundColor: '#FF9800',
                        color: 'white',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '14px'
                    }}>
                        ⚠️ This facility is in DRAFT mode and is not visible on the public map
                    </div>
                )}

                <div style={{
                    backgroundColor: '#1a1a1a',
                    padding: '30px',
                    borderRadius: '8px',
                    border: '1px solid #333'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#999' }}>
                                Facility Name *
                            </label>
                            <input
                                type="text"
                                value={facility.name}
                                onChange={(e) => setFacility({ ...facility, name: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#0a0a0a',
                                    border: '1px solid #333',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    fontSize: '16px'
                                }}
                                placeholder="Enter facility name"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#999' }}>
                                Type *
                            </label>
                            <select
                                value={facility.type}
                                onChange={(e) => setFacility({ ...facility, type: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#0a0a0a',
                                    border: '1px solid #333',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    fontSize: '16px'
                                }}
                            >
                                <option value="refinery">Refinery</option>
                                <option value="extraction">Extraction</option>
                                <option value="storage">Storage</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#999' }}>
                                Status *
                            </label>
                            <select
                                value={facility.status}
                                onChange={(e) => setFacility({ ...facility, status: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#0a0a0a',
                                    border: '1px solid #333',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    fontSize: '16px'
                                }}
                            >
                                <option value="operational">Operational</option>
                                <option value="damaged">Damaged</option>
                                <option value="offline">Offline</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#999' }}>
                                Oil Capacity (barrels/day) *
                            </label>
                            <input
                                type="number"
                                value={facility.capacity}
                                onChange={(e) => setFacility({ ...facility, capacity: Number(e.target.value) })}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#0a0a0a',
                                    border: '1px solid #333',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    fontSize: '16px'
                                }}
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#999' }}>
                                Gas Capacity (million m³/year)
                            </label>
                            <input
                                type="number"
                                value={facility.gasCapacity || ''}
                                onChange={(e) => setFacility({ ...facility, gasCapacity: e.target.value ? Number(e.target.value) : undefined })}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#0a0a0a',
                                    border: '1px solid #333',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    fontSize: '16px'
                                }}
                                placeholder="Optional"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#999' }}>
                                Latitude *
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                value={facility.latitude}
                                onChange={(e) => setFacility({ ...facility, latitude: Number(e.target.value) })}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#0a0a0a',
                                    border: '1px solid #333',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    fontSize: '16px'
                                }}
                                placeholder="0.0000"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#999' }}>
                                Longitude *
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                value={facility.longitude}
                                onChange={(e) => setFacility({ ...facility, longitude: Number(e.target.value) })}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#0a0a0a',
                                    border: '1px solid #333',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    fontSize: '16px'
                                }}
                                placeholder="0.0000"
                            />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#999' }}>
                                Description
                            </label>
                            <textarea
                                value={facility.description}
                                onChange={(e) => setFacility({ ...facility, description: e.target.value })}
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#0a0a0a',
                                    border: '1px solid #333',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    fontSize: '16px',
                                    resize: 'vertical'
                                }}
                                placeholder="Enter facility description (optional)"
                            />
                        </div>
                    </div>

                    <div style={{
                        marginTop: '30px',
                        paddingTop: '20px',
                        borderTop: '1px solid #333',
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'flex-end'
                    }}>
                        <button
                            onClick={() => handleSave(false)}
                            disabled={loading}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#666',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '16px',
                                opacity: loading ? 0.6 : 1
                            }}
                        >
                            {loading ? 'Saving...' : 'Save as Draft'}
                        </button>
                        <button
                            onClick={() => handleSave(true)}
                            disabled={loading}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#4CAF50',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '16px',
                                opacity: loading ? 0.6 : 1
                            }}
                        >
                            {loading ? 'Publishing...' : 'Publish'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacilityEditor;
