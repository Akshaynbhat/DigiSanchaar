
'use server';

/**
 * @fileOverview This flow automatically files an electronic First Information Report (e-FIR)
 * after an SOS incident has been logged. It fetches incident and user data,
 * generates a report narrative using AI, and updates the incident in the database.
 */

import { ai } from '@/ai/genkit';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { z } from 'zod';

const AutoFileEFirInputSchema = z.object({
  incidentId: z.string().describe('The unique ID of the SOS incident to file an e-FIR for.'),
});

const AutoFileEFirOutputSchema = z.object({
  success: z.boolean().describe('Whether the e-FIR was filed successfully.'),
  firNumber: z.string().nullable().describe('The generated FIR number.'),
  message: z.string().describe('A summary of the result.'),
});

export type AutoFileEFirInput = z.infer<typeof AutoFileEFirInputSchema>;
export type AutoFileEFirOutput = z.infer<typeof AutoFileEFirOutputSchema>;


// Prompt to generate a concise incident narrative for the e-FIR
const narrativePrompt = ai.definePrompt({
    name: 'generateEFirNarrative',
    input: { schema: z.object({
        userName: z.string(),
        incidentTime: z.string(),
        location: z.object({ lat: z.number(), lng: z.number() }),
        audioSummary: z.string().optional(),
    })},
    output: { schema: z.object({ narrative: z.string().describe('A one-paragraph incident summary for a police report.') }) },
    prompt: `Generate a concise, one-paragraph incident narrative for an electronic First Information Report (e-FIR).
    
    Incident Details:
    - Person's Name: {{{userName}}}
    - Incident Time: {{{incidentTime}}}
    - Location: Latitude {{{location.lat}}}, Longitude {{{location.lng}}}
    - AI Audio Summary: {{{audioSummary}}}
    
    The narrative should be formal and state that the user triggered an SOS alert via the DigiSanchaar app at the given time and location. Mention the audio summary if available.
    Example: "This report is filed automatically based on an SOS alert triggered by {{{userName}}} via the DigiSanchaar application on {{{incidentTime}}}. The last known location was at coordinates ({{{location.lat}}}, {{{location.lng}}}). The system's AI audio analysis summarized the background audio as: '{{{audioSummary}}}'."
    `
});


export const autoFileEFir = ai.defineFlow(
  {
    name: 'autoFileEFir',
    inputSchema: AutoFileEFirInputSchema,
    outputSchema: AutoFileEFirOutputSchema,
  },
  async ({ incidentId }) => {
    console.log(`[e-FIR Flow] Starting auto-filing for incident: ${incidentId}`);
    const { db } = getFirebaseAdmin();
    const incidentRef = db.collection('sos_incidents').doc(incidentId);

    try {
      const incidentDoc = await incidentRef.get();
      if (!incidentDoc.exists) {
        throw new Error('Incident not found in the database.');
      }
      const incidentData = incidentDoc.data()!;

      const userDoc = await db.collection('users').doc(incidentData.userId).get();
      if (!userDoc.exists) {
        throw new Error('User associated with the incident not found.');
      }
      const userData = userDoc.data()!;

      // Generate the narrative using the AI prompt
      const { output } = await narrativePrompt({
          userName: userData.name || 'Unknown User',
          incidentTime: incidentData.createdAt.toDate().toLocaleString(),
          location: incidentData.location,
          audioSummary: incidentData.audioAnalysis?.summary || 'Not available',
      });
      
      if (!output?.narrative) {
          throw new Error('Failed to generate incident narrative.');
      }

      const firNumber = `AUTOFIR-${Date.now()}`;
      
      // Update the incident document with the e-FIR details
      await incidentRef.update({
        eFirFiled: true,
        eFirDetails: {
          filedAt: new Date(),
          firNumber: firNumber,
          narrative: output.narrative,
          reporterName: userData.name || 'Automated System',
          reporterPhone: userData.phone || userData.phoneNumber || 'N/A',
        },
        status: 'Filed',
      });

      console.log(`[e-FIR Flow] Successfully filed e-FIR ${firNumber} for incident ${incidentId}`);

      return {
        success: true,
        firNumber: firNumber,
        message: `e-FIR ${firNumber} filed successfully.`,
      };

    } catch (error: any) {
      console.error(`[e-FIR Flow] Critical failure for incident ${incidentId}:`, error);
      // If filing fails, we should update the status to reflect that
      await incidentRef.update({ status: 'Filing Failed' }).catch(() => {});
      return {
        success: false,
        firNumber: null,
        message: `Failed to auto-file e-FIR: ${error.message}`,
      };
    }
  }
);
