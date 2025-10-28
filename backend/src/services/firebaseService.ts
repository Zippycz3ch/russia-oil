import { db, COLLECTIONS } from '../config/firebase';
import { Facility, Hit } from '../types';

class FirebaseService {
    // Facilities
    async getAllFacilities(): Promise<Facility[]> {
        if (!db) {
            console.warn('Firebase not initialized, returning empty array');
            return [];
        }

        const snapshot = await db.collection(COLLECTIONS.FACILITIES).get();
        return snapshot.docs.map(doc => ({
            id: parseInt(doc.id),
            ...doc.data()
        } as Facility));
    }

    async getFacilityById(id: number): Promise<Facility | null> {
        if (!db) return null;

        const doc = await db.collection(COLLECTIONS.FACILITIES).doc(id.toString()).get();
        if (!doc.exists) return null;

        return {
            id: parseInt(doc.id),
            ...doc.data()
        } as Facility;
    }

    async createFacility(facility: Omit<Facility, 'id'>): Promise<Facility> {
        if (!db) throw new Error('Firebase not initialized');

        // Get next ID
        const snapshot = await db.collection(COLLECTIONS.FACILITIES).get();
        const maxId = snapshot.docs.reduce((max, doc) => {
            const id = parseInt(doc.id);
            return id > max ? id : max;
        }, 0);
        const newId = maxId + 1;

        const newFacility: Facility = {
            id: newId,
            ...facility,
            hits: []
        };

        await db.collection(COLLECTIONS.FACILITIES).doc(newId.toString()).set(newFacility);
        return newFacility;
    }

    async updateFacility(id: number, facility: Partial<Facility>): Promise<Facility | null> {
        if (!db) throw new Error('Firebase not initialized');

        const docRef = db.collection(COLLECTIONS.FACILITIES).doc(id.toString());
        const doc = await docRef.get();

        if (!doc.exists) return null;

        const updated = {
            ...doc.data(),
            ...facility,
            id // Ensure ID doesn't change
        };

        await docRef.set(updated);
        return updated as Facility;
    }

    async deleteFacility(id: number): Promise<boolean> {
        if (!db) throw new Error('Firebase not initialized');

        await db.collection(COLLECTIONS.FACILITIES).doc(id.toString()).delete();

        // Also delete associated hits
        const hitsSnapshot = await db.collection(COLLECTIONS.HITS)
            .where('facilityId', '==', id)
            .get();

        const batch = db.batch();
        hitsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        return true;
    }

    async toggleHitStatus(id: number): Promise<Facility | null> {
        if (!db) throw new Error('Firebase not initialized');

        const docRef = db.collection(COLLECTIONS.FACILITIES).doc(id.toString());
        const doc = await docRef.get();

        if (!doc.exists) return null;

        const facility = doc.data() as Facility;
        const updated = {
            ...facility,
            hit: !facility.hit
        };

        await docRef.set(updated);
        return updated;
    }

    // Hits
    async getHitsByFacility(facilityId: number): Promise<Hit[]> {
        if (!db) return [];

        const snapshot = await db.collection(COLLECTIONS.HITS)
            .where('facilityId', '==', facilityId)
            .orderBy('date', 'desc')
            .get();

        return snapshot.docs.map(doc => ({
            id: parseInt(doc.id),
            ...doc.data()
        } as Hit));
    }

    async getAllHits(): Promise<Hit[]> {
        if (!db) return [];

        const snapshot = await db.collection(COLLECTIONS.HITS)
            .orderBy('date', 'desc')
            .get();

        return snapshot.docs.map(doc => ({
            id: parseInt(doc.id),
            ...doc.data()
        } as Hit));
    }

    async addHit(facilityId: number, hit: Omit<Hit, 'id' | 'facilityId'>): Promise<Hit> {
        if (!db) throw new Error('Firebase not initialized');

        // Get next ID
        const snapshot = await db.collection(COLLECTIONS.HITS).get();
        const maxId = snapshot.docs.reduce((max, doc) => {
            const id = parseInt(doc.id);
            return id > max ? id : max;
        }, 0);
        const newId = maxId + 1;

        const newHit: Hit = {
            id: newId,
            facilityId,
            ...hit
        };

        await db.collection(COLLECTIONS.HITS).doc(newId.toString()).set(newHit);

        // Update facility hit status
        const facilityRef = db.collection(COLLECTIONS.FACILITIES).doc(facilityId.toString());
        await facilityRef.update({ hit: true });

        return newHit;
    }

    async updateHit(id: number, hit: Partial<Hit>): Promise<Hit | null> {
        if (!db) throw new Error('Firebase not initialized');

        const docRef = db.collection(COLLECTIONS.HITS).doc(id.toString());
        const doc = await docRef.get();

        if (!doc.exists) return null;

        const updated = {
            ...doc.data(),
            ...hit,
            id // Ensure ID doesn't change
        };

        await docRef.set(updated);
        return updated as Hit;
    }

    async deleteHit(facilityId: number, hitId: number): Promise<boolean> {
        if (!db) throw new Error('Firebase not initialized');

        await db.collection(COLLECTIONS.HITS).doc(hitId.toString()).delete();

        // Check if facility has any remaining hits
        const remainingHits = await this.getHitsByFacility(facilityId);
        if (remainingHits.length === 0) {
            const facilityRef = db.collection(COLLECTIONS.FACILITIES).doc(facilityId.toString());
            await facilityRef.update({ hit: false });
        }

        return true;
    }

    // Migration helper - import initial data
    async importFacilities(facilities: Facility[]): Promise<void> {
        if (!db) throw new Error('Firebase not initialized');

        const batch = db.batch();
        facilities.forEach(facility => {
            const docRef = db!.collection(COLLECTIONS.FACILITIES).doc(facility.id.toString());
            batch.set(docRef, facility);
        });

        await batch.commit();
        console.log(`Imported ${facilities.length} facilities to Firebase`);
    }
}

export default new FirebaseService();
