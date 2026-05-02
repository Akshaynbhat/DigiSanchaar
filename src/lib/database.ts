import { getFirebaseAdmin } from './firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Logs a new SOS incident to the Firestore database.
 * @param userId - The ID of the user triggering the SOS.
 * @param location - The user's location.
 * @param audioAnalysis - The analysis of the background audio.
 * @returns The ID of the newly created incident document.
 */
export async function logIncidentToDatabase(userId: string, location: any, audioAnalysis: any) {
    const { db } = getFirebaseAdmin();
    const incidentRef = db.collection('sos_incidents').doc();
    
    const incidentData = {
        userId,
        createdAt: Timestamp.now(),
        location,
        audioAnalysis,
        status: 'Pending Action', // Initial status
        eFirFiled: false,
    };
    
    await incidentRef.set(incidentData);
    return incidentRef.id;
}


/**
 * Fetches the user's data and their list of emergency contacts.
 * @param userId - The ID of the user.
 * @returns An object containing the user's data and their emergency contacts.
 * @throws Will throw an error if the user is not found.
 */
export async function getUserAndContacts(userId: string) {
    const { db } = getFirebaseAdmin();
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
        throw new Error("User data not found in database.");
    }
    
    const userData = userDoc.data()!;
    const emergencyContacts = userData.emergencyContacts || [];
    
    return { userData, emergencyContacts };
}
