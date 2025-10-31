import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase';

interface Hit {
    id: number;
    facilityId: number;
    date: string;
    severity?: 'damaged' | 'destroyed';
    mediaLinks?: string[];
    videoLink?: string;
    expectedRepairTime?: number;
    notes?: string;
}

interface Facility {
    id: number;
    name: string;
    type: string;
}

const HitEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [hit, setHit] = useState<Hit>({
        id: 0,
        facilityId: 0,
        date: new Date().toISOString().split('T')[0],
        severity: 'damaged',
        mediaLinks: [''],
        expectedRepairTime: 0,
        notes: ''
    });

    useEffect(() => {
        fetchFacilities();
        if (id && id !== 'new') {
            fetchHit(parseInt(id));
        }
    }, [id]);

    const fetchFacilities = async () => {
        try {
            if (!db) throw new Error('Firebase not initialized');
            const querySnapshot = await getDocs(collection(db, COLLECTIONS.FACILITIES));
            const facilitiesData = querySnapshot.docs.map(doc => ({
                id: parseInt(doc.id),
                name: doc.data().name,
                type: doc.data().type
            }));
            setFacilities(facilitiesData);
        } catch (error) {
            console.error('Error fetching facilities:', error);
            alert('Failed to load facilities');
        }
    };

    const fetchHit = async (hitId: number) => {
        setLoading(true);
        try {
            if (!db) throw new Error('Firebase not initialized');
            const docRef = doc(db, COLLECTIONS.HITS, hitId.toString());
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                setHit({
                    id: hitId,
                    facilityId: data.facilityId,
                    date: data.date,
                    severity: data.severity || 'damaged',
                    mediaLinks: data.mediaLinks || (data.videoLink ? [data.videoLink] : ['']),
                    expectedRepairTime: data.expectedRepairTime,
                    notes: data.notes
                });
            } else {
                alert('Hit record not found');
                navigate('/admin');
            }
        } catch (error) {
            console.error('Error fetching hit:', error);
            alert('Failed to load hit record');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!hit.facilityId) {
            alert('Please select a facility');
            return;
        }

        if (!hit.date) {
            alert('Please enter a date');
            return;
        }

        setLoading(true);
        try {
            if (!db) throw new Error('Firebase not initialized');

            const hitData = {
                facilityId: hit.facilityId,
                date: hit.date,
                severity: hit.severity,
                mediaLinks: hit.mediaLinks?.filter(link => link.trim() !== ''),
                expectedRepairTime: hit.expectedRepairTime,
                notes: hit.notes
            };

            if (id === 'new') {
                // Get the next available hit ID
                const hitsSnapshot = await getDocs(collection(db, COLLECTIONS.HITS));
                const maxId = hitsSnapshot.docs.reduce((max, doc) => {
                    const id = parseInt(doc.id);
                    return id > max ? id : max;
                }, 0);
                const newHitId = maxId + 1;

                await setDoc(doc(db, COLLECTIONS.HITS, newHitId.toString()), {
                    ...hitData,
                    id: newHitId
                });

                // Mark facility as hit
                const facilityRef = doc(db, COLLECTIONS.FACILITIES, hit.facilityId.toString());
                await updateDoc(facilityRef, { hit: true });

                alert('Hit record created successfully!');
            } else {
                const docRef = doc(db, COLLECTIONS.HITS, id!);
                await updateDoc(docRef, hitData);
                alert('Hit record updated successfully!');
            }

            navigate('/admin');
        } catch (error) {
            console.error('Error saving hit:', error);
            alert('Failed to save hit record');
        } finally {
            setLoading(false);
        }
    };

    const addMediaLink = () => {
        setHit({
            ...hit,
            mediaLinks: [...(hit.mediaLinks || []), '']
        });
    };

    const removeMediaLink = (index: number) => {
        setHit({
            ...hit,
            mediaLinks: hit.mediaLinks?.filter((_, i) => i !== index)
        });
    };

    const updateMediaLink = (index: number, value: string) => {
        const updated = [...(hit.mediaLinks || [])];
        updated[index] = value;
        setHit({ ...hit, mediaLinks: updated });
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#0a0a0a',
            color: '#fff',
            padding: '20px'
        }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px'
                }}>
                    <div>
                        <h1 style={{ margin: 0, marginBottom: '5px' }}>
                            {id === 'new' ? '💥 Add New Hit Record' : '✏️ Edit Hit Record'}
                        </h1>
                        <p style={{ margin: 0, color: '#999' }}>
                            {id === 'new' ? 'Record a new strike on a facility' : `Editing Hit #${id}`}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/admin')}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#333',
                            color: '#fff',
                            border: '1px solid #555',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        ← Back to Admin
                    </button>
                </div>

                {loading && (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: '#999'
                    }}>
                        Loading...
                    </div>
                )}

                {!loading && (
                    <div style={{
                        backgroundColor: '#1a1a1a',
                        padding: '30px',
                        borderRadius: '8px',
                        border: '1px solid #333'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '20px'
                        }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#999',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>
                                    Facility *
                                </label>
                                <select
                                    value={hit.facilityId}
                                    onChange={(e) => setHit({ ...hit, facilityId: parseInt(e.target.value) })}
                                    disabled={id !== 'new'}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: id !== 'new' ? '#0a0a0a' : '#0a0a0a',
                                        border: '1px solid #333',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        fontSize: '14px',
                                        cursor: id !== 'new' ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    <option value={0}>-- Select a facility --</option>
                                    {facilities.map(f => (
                                        <option key={f.id} value={f.id}>
                                            {f.name} ({f.type})
                                        </option>
                                    ))}
                                </select>
                                {id !== 'new' && (
                                    <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '12px' }}>
                                        Facility cannot be changed after creation
                                    </p>
                                )}
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#999',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    value={hit.date}
                                    onChange={(e) => setHit({ ...hit, date: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: '#0a0a0a',
                                        border: '1px solid #333',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#999',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>
                                    Severity *
                                </label>
                                <select
                                    value={hit.severity}
                                    onChange={(e) => setHit({ ...hit, severity: e.target.value as 'damaged' | 'destroyed' })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: '#0a0a0a',
                                        border: '1px solid #333',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="damaged">Damaged</option>
                                    <option value="destroyed">Destroyed</option>
                                </select>
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#999',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>
                                    Expected Repair Time (days)
                                </label>
                                <input
                                    type="number"
                                    value={hit.expectedRepairTime || ''}
                                    onChange={(e) => setHit({ ...hit, expectedRepairTime: e.target.value ? Number(e.target.value) : undefined })}
                                    placeholder="e.g., 30"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: '#0a0a0a',
                                        border: '1px solid #333',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#999',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>
                                    Media Links (Videos/Photos)
                                </label>
                                {hit.mediaLinks?.map((link, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        gap: '10px',
                                        marginBottom: '10px'
                                    }}>
                                        <input
                                            type="url"
                                            value={link}
                                            onChange={(e) => updateMediaLink(index, e.target.value)}
                                            placeholder="https://..."
                                            style={{
                                                flex: 1,
                                                padding: '12px',
                                                backgroundColor: '#0a0a0a',
                                                border: '1px solid #333',
                                                borderRadius: '4px',
                                                color: '#fff',
                                                fontSize: '14px'
                                            }}
                                        />
                                        {index > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => removeMediaLink(index)}
                                                style={{
                                                    padding: '12px 20px',
                                                    backgroundColor: '#666',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addMediaLink}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#333',
                                        color: '#fff',
                                        border: '1px solid #555',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    + Add Another Link
                                </button>
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#999',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>
                                    Notes
                                </label>
                                <textarea
                                    value={hit.notes}
                                    onChange={(e) => setHit({ ...hit, notes: e.target.value })}
                                    rows={5}
                                    placeholder="Describe the damage, impact, and any other relevant details..."
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: '#0a0a0a',
                                        border: '1px solid #333',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        fontSize: '14px',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{
                            marginTop: '30px',
                            paddingTop: '20px',
                            borderTop: '1px solid #333',
                            display: 'flex',
                            gap: '15px',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                onClick={() => navigate('/admin')}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#333',
                                    color: '#fff',
                                    border: '1px solid #555',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: loading ? '#666' : '#dc2626',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}
                            >
                                {loading ? 'Saving...' : (id === 'new' ? '💥 Create Hit Record' : '✓ Save Changes')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HitEditor;
