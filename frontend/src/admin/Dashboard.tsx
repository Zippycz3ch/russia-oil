import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, addDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth, COLLECTIONS } from '../config/firebase';

interface Hit {
    id: number;
    facilityId: number;
    date: string;
    videoLink?: string;
    expectedRepairTime?: number;
    notes?: string;
}

interface Facility {
    id: number;
    name: string;
    type: string;
    capacity: number;
    latitude: number;
    longitude: number;
    status: string;
    hit: boolean;
    hits?: Hit[];
}

const Dashboard: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<'facilities' | 'hits'>('facilities');
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Facility>>({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [showAddHitForm, setShowAddHitForm] = useState<number | null>(null);
    const [editingHitId, setEditingHitId] = useState<number | null>(null);
    const [newHit, setNewHit] = useState<Partial<Hit>>({
        date: new Date().toISOString().split('T')[0],
        videoLink: '',
        expectedRepairTime: 0,
        notes: ''
    });
    const [newFacility, setNewFacility] = useState<Partial<Facility>>({
        name: '',
        type: 'Refinery',
        capacity: 0,
        latitude: 0,
        longitude: 0,
        status: 'OPERATIONAL',
        hit: false
    });
    const navigate = useNavigate();

    // Check authentication state on mount
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsLoggedIn(true);
                setAuthError(null);
            } else {
                setIsLoggedIn(false);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            fetchFacilities();
        }
    }, [isLoggedIn]);

    const fetchFacilities = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!db) {
                throw new Error('Firebase not initialized');
            }
            const querySnapshot = await getDocs(collection(db, COLLECTIONS.FACILITIES));
            const facilitiesData = await Promise.all(
                querySnapshot.docs.map(async (facilityDoc) => {
                    // Fetch hits for each facility
                    const hitsQuery = query(
                        collection(db, COLLECTIONS.HITS),
                        where('facilityId', '==', parseInt(facilityDoc.id))
                    );
                    const hitsSnapshot = await getDocs(hitsQuery);
                    const hits = hitsSnapshot.docs.map(hitDoc => ({
                        id: parseInt(hitDoc.id),
                        ...hitDoc.data()
                    } as Hit));
                    
                    const data = facilityDoc.data();
                    
                    // Handle both old format (location object) and new format (flat lat/lon)
                    const latitude = data.location?.latitude ?? data.latitude;
                    const longitude = data.location?.longitude ?? data.longitude;
                    
                    return {
                        id: parseInt(facilityDoc.id),
                        name: data.name,
                        type: data.type,
                        capacity: data.capacity,
                        latitude,
                        longitude,
                        status: data.status,
                        hit: data.hit,
                        hits
                    } as Facility;
                })
            );
            setFacilities(facilitiesData);
        } catch (error) {
            console.error('Error fetching facilities:', error);
            setError('Failed to load facilities from Firebase.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError(null);
        setLoading(true);
        
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // onAuthStateChanged will handle setting isLoggedIn
        } catch (error: any) {
            console.error('Login error:', error);
            if (error.code === 'auth/invalid-credential') {
                setAuthError('Invalid email or password');
            } else if (error.code === 'auth/user-not-found') {
                setAuthError('No account found with this email');
            } else if (error.code === 'auth/wrong-password') {
                setAuthError('Incorrect password');
            } else {
                setAuthError('Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this facility?')) return;
        
        try {
            if (!db) throw new Error('Firebase not initialized');
            
            // Delete all hits for this facility first
            const hitsQuery = query(
                collection(db, COLLECTIONS.HITS),
                where('facilityId', '==', id)
            );
            const hitsSnapshot = await getDocs(hitsQuery);
            for (const hitDoc of hitsSnapshot.docs) {
                await deleteDoc(hitDoc.ref);
            }
            
            // Then delete the facility
            await deleteDoc(doc(db, COLLECTIONS.FACILITIES, id.toString()));
            fetchFacilities();
        } catch (error) {
            console.error('Error deleting facility:', error);
            alert('Failed to delete facility');
        }
    };

    const handleToggleHit = async (id: number) => {
        try {
            if (!db) throw new Error('Firebase not initialized');
            
            const docRef = doc(db, COLLECTIONS.FACILITIES, id.toString());
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const facility = docSnap.data() as Facility;
                await updateDoc(docRef, {
                    hit: !facility.hit
                });
                fetchFacilities();
            }
        } catch (error) {
            console.error('Error toggling hit status:', error);
            alert('Failed to toggle hit status');
        }
    };

    const handleEdit = (facility: Facility) => {
        setEditingId(facility.id);
        setEditForm(facility);
    };

    const handleUpdate = async () => {
        if (!editingId) return;

        try {
            if (!db) throw new Error('Firebase not initialized');
            
            // Transform the data to match Firebase structure
            const updateData: any = {
                name: editForm.name,
                type: editForm.type,
                capacity: editForm.capacity,
                status: editForm.status,
                hit: editForm.hit
            };
            
            // Add location object if lat/lon are provided
            if (editForm.latitude !== undefined && editForm.longitude !== undefined) {
                updateData.location = {
                    latitude: editForm.latitude,
                    longitude: editForm.longitude
                };
            }
            
            const docRef = doc(db, COLLECTIONS.FACILITIES, editingId.toString());
            await updateDoc(docRef, updateData);
            
            setEditingId(null);
            setEditForm({});
            fetchFacilities();
        } catch (error) {
            console.error('Error updating facility:', error);
            alert('Failed to update facility');
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            if (!db) throw new Error('Firebase not initialized');
            
            // Get the next available ID
            const querySnapshot = await getDocs(collection(db, COLLECTIONS.FACILITIES));
            const maxId = querySnapshot.docs.reduce((max, doc) => {
                const id = parseInt(doc.id);
                return id > max ? id : max;
            }, 0);
            const newId = maxId + 1;
            
            const facilityData = {
                id: newId,
                name: newFacility.name,
                type: newFacility.type,
                capacity: newFacility.capacity,
                location: {
                    latitude: newFacility.latitude,
                    longitude: newFacility.longitude
                },
                status: newFacility.status,
                hit: false,
                hits: []
            };
            
            await setDoc(doc(db, COLLECTIONS.FACILITIES, newId.toString()), facilityData);
            
            setShowAddForm(false);
            setNewFacility({
                name: '',
                type: 'Refinery',
                capacity: 0,
                latitude: 0,
                longitude: 0,
                status: 'OPERATIONAL',
                hit: false
            });
            fetchFacilities();
        } catch (error) {
            console.error('Error adding facility:', error);
            alert('Failed to add facility');
        }
    };

    const handleAddHit = async (facilityId: number, e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            if (!db) throw new Error('Firebase not initialized');
            
            // Get the next available hit ID
            const hitsSnapshot = await getDocs(collection(db, COLLECTIONS.HITS));
            const maxId = hitsSnapshot.docs.reduce((max, doc) => {
                const id = parseInt(doc.id);
                return id > max ? id : max;
            }, 0);
            const newHitId = maxId + 1;
            
            const hitData = {
                ...newHit,
                id: newHitId,
                facilityId: facilityId
            };
            
            await setDoc(doc(db, COLLECTIONS.HITS, newHitId.toString()), hitData);
            
            // Mark facility as hit
            const facilityRef = doc(db, COLLECTIONS.FACILITIES, facilityId.toString());
            await updateDoc(facilityRef, { hit: true });
            
            setShowAddHitForm(null);
            setNewHit({
                date: new Date().toISOString().split('T')[0],
                videoLink: '',
                expectedRepairTime: 0,
                notes: ''
            });
            fetchFacilities();
        } catch (error) {
            console.error('Error adding hit:', error);
            alert('Failed to add hit record');
        }
    };

    const handleDeleteHit = async (facilityId: number, hitId: number) => {
        if (!confirm('Are you sure you want to delete this hit record?')) return;
        
        try {
            if (!db) throw new Error('Firebase not initialized');
            
            // Delete the hit
            await deleteDoc(doc(db, COLLECTIONS.HITS, hitId.toString()));
            
            // Check if there are any remaining hits for this facility
            const hitsQuery = query(
                collection(db, COLLECTIONS.HITS),
                where('facilityId', '==', facilityId)
            );
            const hitsSnapshot = await getDocs(hitsQuery);
            
            // If no more hits, unmark the facility
            if (hitsSnapshot.empty) {
                const facilityRef = doc(db, COLLECTIONS.FACILITIES, facilityId.toString());
                await updateDoc(facilityRef, { hit: false });
            }
            
            fetchFacilities();
        } catch (error) {
            console.error('Error deleting hit:', error);
            alert('Failed to delete hit record');
        }
    };

    if (!isLoggedIn) {
        return (
            <div style={{
                minHeight: '100vh',
                backgroundColor: '#0a0a0a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    backgroundColor: '#1a1a1a',
                    padding: '40px',
                    borderRadius: '8px',
                    width: '400px',
                    border: '1px solid #333'
                }}>
                    <h1 style={{ color: '#fff', marginBottom: '30px', textAlign: 'center' }}>Admin Login</h1>
                    {authError && (
                        <div style={{
                            backgroundColor: '#dc2626',
                            color: '#fff',
                            padding: '12px',
                            borderRadius: '4px',
                            marginBottom: '20px',
                            textAlign: 'center'
                        }}>
                            {authError}
                        </div>
                    )}
                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ color: '#999', display: 'block', marginBottom: '8px' }}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#0a0a0a',
                                    border: '1px solid #333',
                                    borderRadius: '4px',
                                    color: '#fff'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ color: '#999', display: 'block', marginBottom: '8px' }}>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#0a0a0a',
                                    border: '1px solid #333',
                                    borderRadius: '4px',
                                    color: '#fff'
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#4CAF50',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            Login
                        </button>
                        <p style={{ color: '#666', marginTop: '20px', textAlign: 'center', fontSize: '12px' }}>
                            Contact admin to create an account
                        </p>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            backgroundColor: '#0a0a0a',
            color: '#fff',
            overflow: 'hidden'
        }}>
            {/* Left Sidebar Menu */}
            <div style={{
                width: '250px',
                backgroundColor: '#1a1a1a',
                borderRight: '1px solid #333',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                overflowY: 'auto'
            }}>
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #333'
                }}>
                    <h2 style={{ margin: 0, fontSize: '20px' }}>Admin Panel</h2>
                    <p style={{ color: '#666', fontSize: '12px', marginTop: '5px' }}>Russian Oil Tracker</p>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            marginTop: '15px',
                            padding: '8px 12px',
                            backgroundColor: '#dc2626',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px'
                        }}
                    >
                        Logout
                    </button>
                </div>
                
                <nav style={{ flex: 1, padding: '20px 0' }}>
                    <button
                        onClick={() => setActiveView('facilities')}
                        style={{
                            width: '100%',
                            padding: '15px 20px',
                            backgroundColor: activeView === 'facilities' ? '#2196F3' : 'transparent',
                            color: '#fff',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <span style={{ fontSize: '20px' }}>🏭</span>
                        <span>Facilities</span>
                    </button>
                    
                    <button
                        onClick={() => setActiveView('hits')}
                        style={{
                            width: '100%',
                            padding: '15px 20px',
                            backgroundColor: activeView === 'hits' ? '#2196F3' : 'transparent',
                            color: '#fff',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <span style={{ fontSize: '20px' }}>💥</span>
                        <span>Hit Records</span>
                    </button>
                </nav>

                <div style={{
                    padding: '20px',
                    borderTop: '1px solid #333'
                }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: '#333',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        🗺️ View Map
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{
                flex: 1,
                padding: '20px',
                overflowY: 'auto'
            }}>
                {activeView === 'facilities' && (
                    <>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '30px'
                        }}>
                            <div>
                                <h1 style={{ marginBottom: '5px' }}>Facilities Management</h1>
                                <p style={{ color: '#999' }}>Total: {facilities.length} facilities</p>
                            </div>
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#4CAF50',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                {showAddForm ? 'Cancel' : '+ Add Facility'}
                            </button>
                        </div>

            {showAddForm && (
                <div style={{
                    backgroundColor: '#1a1a1a',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #333'
                }}>
                    <h2 style={{ marginBottom: '20px' }}>Add New Facility</h2>
                    <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ color: '#999', display: 'block', marginBottom: '5px' }}>Name</label>
                            <input
                                type="text"
                                required
                                value={newFacility.name}
                                onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    backgroundColor: '#0a0a0a',
                                    border: '1px solid #333',
                                    borderRadius: '4px',
                                    color: '#fff'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ color: '#999', display: 'block', marginBottom: '5px' }}>Type</label>
                            <select
                                value={newFacility.type}
                                onChange={(e) => setNewFacility({ ...newFacility, type: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    backgroundColor: '#0a0a0a',
                                    border: '1px solid #333',
                                    borderRadius: '4px',
                                    color: '#fff'
                                }}
                            >
                                <option value="Refinery">Refinery</option>
                                <option value="Extraction">Extraction</option>
                                <option value="Storage">Storage</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ color: '#999', display: 'block', marginBottom: '5px' }}>Capacity (barrels/day)</label>
                            <input
                                type="number"
                                required
                                value={newFacility.capacity}
                                onChange={(e) => setNewFacility({ ...newFacility, capacity: Number(e.target.value) })}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    backgroundColor: '#0a0a0a',
                                    border: '1px solid #333',
                                    borderRadius: '4px',
                                    color: '#fff'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ color: '#999', display: 'block', marginBottom: '5px' }}>Status</label>
                            <select
                                value={newFacility.status}
                                onChange={(e) => setNewFacility({ ...newFacility, status: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    backgroundColor: '#0a0a0a',
                                    border: '1px solid #333',
                                    borderRadius: '4px',
                                    color: '#fff'
                                }}
                            >
                                <option value="OPERATIONAL">OPERATIONAL</option>
                                <option value="HIT">HIT</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ color: '#999', display: 'block', marginBottom: '5px' }}>Latitude</label>
                            <input
                                type="number"
                                step="any"
                                required
                                value={newFacility.latitude}
                                onChange={(e) => setNewFacility({ ...newFacility, latitude: Number(e.target.value) })}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    backgroundColor: '#0a0a0a',
                                    border: '1px solid #333',
                                    borderRadius: '4px',
                                    color: '#fff'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ color: '#999', display: 'block', marginBottom: '5px' }}>Longitude</label>
                            <input
                                type="number"
                                step="any"
                                required
                                value={newFacility.longitude}
                                onChange={(e) => setNewFacility({ ...newFacility, longitude: Number(e.target.value) })}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    backgroundColor: '#0a0a0a',
                                    border: '1px solid #333',
                                    borderRadius: '4px',
                                    color: '#fff'
                                }}
                            />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <button
                                type="submit"
                                style={{
                                    padding: '10px 30px',
                                    backgroundColor: '#4CAF50',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Create Facility
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    Loading facilities...
                </div>
            )}

            {error && (
                <div style={{
                    backgroundColor: '#f44336',
                    color: '#fff',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    {error}
                </div>
            )}

            {!loading && !error && (
                <div style={{
                    backgroundColor: '#1a1a1a',
                    borderRadius: '8px',
                    overflow: 'auto',
                    border: '1px solid #333',
                    maxHeight: 'calc(100vh - 250px)'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#0a0a0a' }}>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333' }}>ID</th>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333' }}>Name</th>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333' }}>Type</th>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333' }}>Capacity</th>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333' }}>Location</th>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333' }}>Status</th>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {facilities.map((facility) => (
                            <React.Fragment key={facility.id}>
                            <tr style={{ borderBottom: '1px solid #333' }}>
                                {editingId === facility.id ? (
                                    <>
                                        <td style={{ padding: '15px' }}>{facility.id}</td>
                                        <td style={{ padding: '15px' }}>
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '5px',
                                                    backgroundColor: '#0a0a0a',
                                                    border: '1px solid #333',
                                                    borderRadius: '4px',
                                                    color: '#fff'
                                                }}
                                            />
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <select
                                                value={editForm.type}
                                                onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '5px',
                                                    backgroundColor: '#0a0a0a',
                                                    border: '1px solid #333',
                                                    borderRadius: '4px',
                                                    color: '#fff'
                                                }}
                                            >
                                                <option value="Refinery">Refinery</option>
                                                <option value="Extraction">Extraction</option>
                                                <option value="Storage">Storage</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <input
                                                type="number"
                                                value={editForm.capacity}
                                                onChange={(e) => setEditForm({ ...editForm, capacity: Number(e.target.value) })}
                                                style={{
                                                    width: '100%',
                                                    padding: '5px',
                                                    backgroundColor: '#0a0a0a',
                                                    border: '1px solid #333',
                                                    borderRadius: '4px',
                                                    color: '#fff'
                                                }}
                                            />
                                        </td>
                                        <td style={{ padding: '15px', fontSize: '12px', color: '#999' }}>
                                            {facility.latitude != null && facility.longitude != null 
                                                ? `${facility.latitude.toFixed(4)}, ${facility.longitude.toFixed(4)}`
                                                : 'N/A'}
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <select
                                                value={editForm.status}
                                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '5px',
                                                    backgroundColor: '#0a0a0a',
                                                    border: '1px solid #333',
                                                    borderRadius: '4px',
                                                    color: '#fff'
                                                }}
                                            >
                                                <option value="OPERATIONAL">OPERATIONAL</option>
                                                <option value="HIT">HIT</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <button
                                                onClick={handleUpdate}
                                                style={{
                                                    padding: '5px 15px',
                                                    backgroundColor: '#4CAF50',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    marginRight: '5px'
                                                }}
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                style={{
                                                    padding: '5px 15px',
                                                    backgroundColor: '#666',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td style={{ padding: '15px' }}>{facility.id}</td>
                                        <td style={{ padding: '15px' }}>{facility.name}</td>
                                        <td style={{ padding: '15px' }}>{facility.type}</td>
                                        <td style={{ padding: '15px' }}>{facility.capacity?.toLocaleString() || 0}</td>
                                        <td style={{ padding: '15px', fontSize: '12px', color: '#999' }}>
                                            {facility.latitude != null && facility.longitude != null 
                                                ? `${facility.latitude.toFixed(4)}, ${facility.longitude.toFixed(4)}`
                                                : 'N/A'}
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                backgroundColor: facility.hit ? '#f44336' : '#4CAF50',
                                                color: '#fff'
                                            }}>
                                                {facility.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <button
                                                onClick={() => handleEdit(facility)}
                                                style={{
                                                    padding: '5px 10px',
                                                    backgroundColor: '#2196F3',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    marginRight: '5px',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleToggleHit(facility.id)}
                                                style={{
                                                    padding: '5px 10px',
                                                    backgroundColor: facility.hit ? '#4CAF50' : '#FF9800',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    marginRight: '5px',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                {facility.hit ? 'Restore' : 'Mark Hit'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(facility.id)}
                                                style={{
                                                    padding: '5px 10px',
                                                    backgroundColor: '#f44336',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
                {facilities.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        No facilities found. Add your first facility above.
                    </div>
                )}
                </div>
            )}
                    </>
                )}

                {activeView === 'hits' && (
                    <>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '30px'
                        }}>
                            <div>
                                <h1 style={{ marginBottom: '5px' }}>Hit Records Management</h1>
                                <p style={{ color: '#999' }}>View and manage all hits across facilities</p>
                            </div>
                            <button
                                onClick={() => setShowAddHitForm(showAddHitForm === -1 ? null : -1)}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#dc2626',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}
                            >
                                {showAddHitForm === -1 ? 'Cancel' : '+ Add New Hit'}
                            </button>
                        </div>

                        {showAddHitForm === -1 && (
                            <div style={{
                                backgroundColor: '#1a1a1a',
                                padding: '20px',
                                borderRadius: '8px',
                                marginBottom: '30px',
                                border: '1px solid #333'
                            }}>
                                <h3 style={{ marginTop: 0, color: '#dc2626' }}>Add New Hit Record</h3>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const facilityId = parseInt((e.target as any).facilityId.value);
                                    handleAddHit(facilityId, e);
                                }} style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '15px'
                                }}>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ color: '#999', display: 'block', marginBottom: '5px' }}>Select Facility *</label>
                                        <select
                                            name="facilityId"
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                backgroundColor: '#0a0a0a',
                                                border: '1px solid #333',
                                                borderRadius: '4px',
                                                color: '#fff',
                                                fontSize: '14px'
                                            }}
                                        >
                                            <option value="">-- Choose a facility --</option>
                                            {facilities.map(f => (
                                                <option key={f.id} value={f.id}>
                                                    {f.name} ({f.type}) {f.hits && f.hits.length > 0 ? `- ${f.hits.length} existing hit${f.hits.length > 1 ? 's' : ''}` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ color: '#999', display: 'block', marginBottom: '5px' }}>Date *</label>
                                        <input
                                            type="date"
                                            required
                                            value={newHit.date}
                                            onChange={(e) => setNewHit({ ...newHit, date: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                backgroundColor: '#0a0a0a',
                                                border: '1px solid #333',
                                                borderRadius: '4px',
                                                color: '#fff'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ color: '#999', display: 'block', marginBottom: '5px' }}>Repair Time (days)</label>
                                        <input
                                            type="number"
                                            value={newHit.expectedRepairTime}
                                            onChange={(e) => setNewHit({ ...newHit, expectedRepairTime: Number(e.target.value) })}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                backgroundColor: '#0a0a0a',
                                                border: '1px solid #333',
                                                borderRadius: '4px',
                                                color: '#fff'
                                            }}
                                        />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ color: '#999', display: 'block', marginBottom: '5px' }}>Video Link</label>
                                        <input
                                            type="url"
                                            value={newHit.videoLink}
                                            onChange={(e) => setNewHit({ ...newHit, videoLink: e.target.value })}
                                            placeholder="https://..."
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                backgroundColor: '#0a0a0a',
                                                border: '1px solid #333',
                                                borderRadius: '4px',
                                                color: '#fff'
                                            }}
                                        />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ color: '#999', display: 'block', marginBottom: '5px' }}>Notes</label>
                                        <textarea
                                            value={newHit.notes}
                                            onChange={(e) => setNewHit({ ...newHit, notes: e.target.value })}
                                            rows={3}
                                            placeholder="Describe the damage..."
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                backgroundColor: '#0a0a0a',
                                                border: '1px solid #333',
                                                borderRadius: '4px',
                                                color: '#fff',
                                                resize: 'vertical',
                                                fontFamily: 'inherit'
                                            }}
                                        />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <button
                                            type="submit"
                                            style={{
                                                padding: '12px 24px',
                                                backgroundColor: '#dc2626',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: '600'
                                            }}
                                        >
                                            💥 Add Hit Record
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {loading && (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                Loading hit records...
                            </div>
                        )}

                        {error && (
                            <div style={{
                                backgroundColor: '#f44336',
                                color: '#fff',
                                padding: '15px',
                                borderRadius: '8px',
                                marginBottom: '20px'
                            }}>
                                {error}
                            </div>
                        )}

                        {!loading && !error && (
                            <>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                {facilities.filter(f => f.hits && f.hits.length > 0).map(facility => (
                                    <div key={facility.id} style={{
                                        backgroundColor: '#1a1a1a',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        border: '1px solid #333'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '15px',
                                            paddingBottom: '15px',
                                            borderBottom: '1px solid #333'
                                        }}>
                                            <div>
                                                <h2 style={{ margin: 0, color: '#dc2626' }}>{facility.name}</h2>
                                                <p style={{ margin: '5px 0 0 0', color: '#999', fontSize: '14px' }}>
                                                    {facility.type} • {facility.hits!.length} hit record{facility.hits!.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setShowAddHitForm(showAddHitForm === facility.id ? null : facility.id)}
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#dc2626',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                {showAddHitForm === facility.id ? 'Cancel' : '+ Add Hit'}
                                            </button>
                                        </div>

                                        {showAddHitForm === facility.id && (
                                            <form onSubmit={(e) => handleAddHit(facility.id, e)} style={{
                                                backgroundColor: '#0a0a0a',
                                                padding: '15px',
                                                borderRadius: '4px',
                                                marginBottom: '15px',
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr',
                                                gap: '10px',
                                                border: '1px solid #dc2626'
                                            }}>
                                                <div>
                                                    <label style={{ color: '#999', display: 'block', marginBottom: '5px' }}>Date *</label>
                                                    <input
                                                        type="date"
                                                        required
                                                        value={newHit.date}
                                                        onChange={(e) => setNewHit({ ...newHit, date: e.target.value })}
                                                        style={{
                                                            width: '100%',
                                                            padding: '8px',
                                                            backgroundColor: '#1a1a1a',
                                                            border: '1px solid #333',
                                                            borderRadius: '4px',
                                                            color: '#fff'
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ color: '#999', display: 'block', marginBottom: '5px' }}>Repair Time (days)</label>
                                                    <input
                                                        type="number"
                                                        value={newHit.expectedRepairTime}
                                                        onChange={(e) => setNewHit({ ...newHit, expectedRepairTime: Number(e.target.value) })}
                                                        style={{
                                                            width: '100%',
                                                            padding: '8px',
                                                            backgroundColor: '#1a1a1a',
                                                            border: '1px solid #333',
                                                            borderRadius: '4px',
                                                            color: '#fff'
                                                        }}
                                                    />
                                                </div>
                                                <div style={{ gridColumn: '1 / -1' }}>
                                                    <label style={{ color: '#999', display: 'block', marginBottom: '5px' }}>Video Link</label>
                                                    <input
                                                        type="url"
                                                        value={newHit.videoLink}
                                                        onChange={(e) => setNewHit({ ...newHit, videoLink: e.target.value })}
                                                        placeholder="https://..."
                                                        style={{
                                                            width: '100%',
                                                            padding: '8px',
                                                            backgroundColor: '#1a1a1a',
                                                            border: '1px solid #333',
                                                            borderRadius: '4px',
                                                            color: '#fff'
                                                        }}
                                                    />
                                                </div>
                                                <div style={{ gridColumn: '1 / -1' }}>
                                                    <label style={{ color: '#999', display: 'block', marginBottom: '5px' }}>Notes</label>
                                                    <textarea
                                                        value={newHit.notes}
                                                        onChange={(e) => setNewHit({ ...newHit, notes: e.target.value })}
                                                        rows={3}
                                                        placeholder="Describe the damage..."
                                                        style={{
                                                            width: '100%',
                                                            padding: '8px',
                                                            backgroundColor: '#1a1a1a',
                                                            border: '1px solid #333',
                                                            borderRadius: '4px',
                                                            color: '#fff',
                                                            resize: 'vertical',
                                                            fontFamily: 'inherit'
                                                        }}
                                                    />
                                                </div>
                                                <div style={{ gridColumn: '1 / -1' }}>
                                                    <button
                                                        type="submit"
                                                        style={{
                                                            padding: '10px 20px',
                                                            backgroundColor: '#dc2626',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        💥 Save Hit Record
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                            {facility.hits && facility.hits.length > 0 && (
                                                <div style={{ display: 'grid', gap: '10px' }}>
                                                    {facility.hits.map(hit => (
                                                    <div key={hit.id} style={{
                                                        backgroundColor: '#0a0a0a',
                                                        padding: '15px',
                                                        borderRadius: '4px',
                                                        border: '1px solid #333'
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                                                                    <div>
                                                                        <div style={{ color: '#666', fontSize: '12px' }}>Hit ID</div>
                                                                        <div style={{ color: '#4CAF50', fontWeight: 'bold' }}>#{hit.id}</div>
                                                                    </div>
                                                                    <div>
                                                                        <div style={{ color: '#666', fontSize: '12px' }}>Date</div>
                                                                        <div style={{ color: '#fff' }}>{new Date(hit.date).toLocaleDateString()}</div>
                                                                    </div>
                                                                    {hit.expectedRepairTime && (
                                                                        <div>
                                                                            <div style={{ color: '#666', fontSize: '12px' }}>Repair Time</div>
                                                                            <div style={{ color: '#FF9800' }}>{hit.expectedRepairTime} days</div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {hit.videoLink && (
                                                                    <div style={{ marginTop: '10px' }}>
                                                                        <a
                                                                            href={hit.videoLink}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            style={{
                                                                                color: '#2196F3',
                                                                                textDecoration: 'none',
                                                                                fontSize: '14px'
                                                                            }}
                                                                        >
                                                                            🎥 View Video
                                                                        </a>
                                                                    </div>
                                                                )}
                                                                {hit.notes && (
                                                                    <div style={{ marginTop: '10px', color: '#ccc', fontSize: '14px' }}>
                                                                        <strong>Notes:</strong> {hit.notes}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteHit(facility.id, hit.id)}
                                                                style={{
                                                                    padding: '5px 10px',
                                                                    backgroundColor: '#f44336',
                                                                    color: '#fff',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '12px'
                                                                }}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                ))}
                            </div>
                                {facilities.filter(f => f.hits && f.hits.length > 0).length === 0 && (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '60px 20px',
                                        color: '#666'
                                    }}>
                                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>💥</div>
                                        <h3 style={{ margin: '0 0 10px 0', color: '#999' }}>No Hit Records Yet</h3>
                                        <p>Click the "+ Add New Hit" button above to record a strike.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;