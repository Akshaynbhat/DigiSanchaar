import Twilio from 'twilio';
import { Resend } from 'resend';

/**
 * Sends an emergency voice call using Twilio.
 * @param contact - The contact object with `phone` and `name`.
 * @param userName - The name of the user in distress.
 * @param location - The location object with `lat` and `lng`.
 * @returns A status message string.
 */
export async function sendTwilioVoiceCall(contact: { phone: string, name: string }, userName: string, location: any) {
    const {
        TWILIO_ACCOUNT_SID,
        TWILIO_AUTH_TOKEN,
        TWILIO_PHONE_NUMBER
    } = process.env;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
        throw new Error("Twilio environment variables are not configured.");
    }
    
    const client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    const message = `This is an automated emergency alert from DigiSanchaar. ${userName} has triggered an SOS. Their last known location is near latitude ${location.lat}, longitude ${location.lng}. Please check on them immediately. Repeating: ${userName} has triggered an SOS.`;

    try {
        await client.calls.create({
            twiml: `<Response><Say>${message}</Say></Response>`,
            to: `+91${contact.phone}`, // Assuming Indian phone numbers
            from: TWILIO_PHONE_NUMBER,
        });
        return `Successfully placed a call to ${contact.name}.`;
    } catch (error: any) {
        console.error(`Twilio call to ${contact.phone} failed:`, error);
        return `Failed to place a call to ${contact.name}: ${error.message}`;
    }
}

/**
 * Sends an emergency email using Resend.
 * @param contact - The contact object with `email` and `name`.
 * @param userName - The name of the user in distress.
 * @param location - The location object with `lat` and `lng`.
 * @returns A status message string.
 */
export async function sendResendEmail(contact: { email: string, name: string }, userName: string, location: any) {
    const { RESEND_API_KEY, RESEND_FROM_EMAIL } = process.env;

    if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
        throw new Error("Resend environment variables are not configured.");
    }

    const resend = new Resend(RESEND_API_KEY);
    
    const mapsLink = `https://www.google.com/maps?q=${location.lat},${location.lng}`;

    try {
        await resend.emails.send({
            from: RESEND_FROM_EMAIL,
            to: contact.email,
            subject: `URGENT: SOS Alert from ${userName} via DigiSanchaar`,
            html: `
                <h1>SOS Alert for ${userName}</h1>
                <p>This is an automated emergency alert from the DigiSanchaar application.</p>
                <p><strong>${userName} has triggered an SOS and may require immediate assistance.</strong></p>
                <p>Their last known location was:</p>
                <p><strong>Latitude:</strong> ${location.lat}</p>
                <p><strong>Longitude:</strong> ${location.lng}</p>
                <p><a href="${mapsLink}">Click here to view the location on Google Maps.</a></p>
                <p>Please attempt to contact them or relevant authorities immediately.</p>
            `,
        });
        return `Successfully sent an email to ${contact.name}.`;
    } catch (error: any) {
        console.error(`Resend email to ${contact.email} failed:`, error);
        return `Failed to send an email to ${contact.name}: ${error.message}`;
    }
}
