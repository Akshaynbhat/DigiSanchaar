
'use server';

/**
 * @fileOverview This flow orchestrates the entire SOS protocol.
 * It logs the incident, gets user data, sends alerts, and automatically files an e-FIR.
 *
 * - initiateSosProtocol - The main function to trigger the SOS process.
 * - InitiateSosProtocolInput - The input type for the function.
 * - InitiateSosProtocolOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getUserAndContacts, logIncidentToDatabase } from '@/lib/database';
import { sendResendEmail, sendTwilioVoiceCall } from '@/lib/notifications';
import { autoFileEFir } from './auto-file-efir';


// Define input and output schemas with Zod
const InitiateSosProtocolInputSchema = z.object({
  userId: z.string().describe('The unique ID of the user triggering the SOS.'),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).describe('The geographical coordinates where the SOS was triggered.'),
  audioAnalysis: z.object({
    isDistress: z.boolean(),
    summary: z.string(),
    keywords: z.array(z.string()),
  }).nullable().describe('The AI analysis of the recorded audio, if available.'),
});

const InitiateSosProtocolOutputSchema = z.object({
  success: z.boolean().describe('Whether the SOS protocol was initiated successfully.'),
  message: z.string().describe('A summary message of the actions taken.'),
  incidentId: z.string().nullable().describe('The ID of the logged incident document.'),
});

export type InitiateSosProtocolInput = z.infer<typeof InitiateSosProtocolInputSchema>;
export type InitiateSosProtocolOutput = z.infer<typeof InitiateSosProtocolOutputSchema>;


export const initiateSosProtocol = ai.defineFlow(
    {
        name: 'initiateSosProtocol',
        inputSchema: InitiateSosProtocolInputSchema,
        outputSchema: InitiateSosProtocolOutputSchema,
    },
    async (input) => {
        const { userId, location, audioAnalysis } = input;
        
        console.log(`[SOS Flow] Initiated for user: ${userId}`);

        let incidentId: string | null = null;
        try {
            // Step 1: Log the incident to the database. This is the most critical step.
            incidentId = await logIncidentToDatabase(userId, location, audioAnalysis);
            console.log(`[SOS Flow] Successfully logged incident to database. Incident ID: ${incidentId}`);

            // Step 2: Fetch user data to get emergency contacts.
            const { userData, emergencyContacts } = await getUserAndContacts(userId);
            const userName = userData.name || 'A DigiSanchaar user';
            
            let alertMessage = "Incident logged successfully.";
            
            if (emergencyContacts.length === 0) {
                 alertMessage = "Incident logged, but no emergency contacts were found to alert.";
            } else {
                 // Step 3: Send alerts to all contacts.
                const alertPromises = emergencyContacts.flatMap((contact: any) => [
                    sendTwilioVoiceCall(contact, userName, location),
                    sendResendEmail(contact, userName, location)
                ]);

                const results = await Promise.all(alertPromises);
                alertMessage = results.join(' ');
                console.log(`[SOS Flow] Alert results: ${alertMessage}`);
            }
            
            // Step 4: Automatically file the e-FIR.
            console.log(`[SOS Flow] Triggering auto e-FIR filing for incident: ${incidentId}`);
            const eFirResult = await autoFileEFir({ incidentId });
            console.log(`[SOS Flow] Auto e-FIR result: ${eFirResult.message}`);


            return {
                success: true,
                incidentId,
                message: `${alertMessage} ${eFirResult.message}`,
            };

        } catch (error: any) {
            console.error("Critical failure in SOS protocol:", error);
            // Even if subsequent steps fail, we try to return what we can.
            // The most critical failure is if logging itself fails.
            return {
                success: false,
                incidentId: incidentId, // Return ID even if subsequent steps fail
                message: `Critical failure: ${error.message}`,
            };
        }
    }
);
