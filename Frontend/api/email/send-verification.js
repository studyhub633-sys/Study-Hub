import { verifyAuth } from '../_utils/auth.js';
import crypto from "crypto";
import { applyCors, setNoStore } from "../_utils/http.js";

export default async function handler(req, res) {
  setNoStore(res);
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await verifyAuth(req);
    const { sessionId, sessionTitle, scheduledTime, meetingUrl } = req.body;

    if (!sessionId || !sessionTitle || !scheduledTime || !meetingUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173'}/verify-session?token=${verificationToken}&sessionId=${sessionId}`;

    // In a real implementation, you would:
    // 1. Store the verification token in the database
    // 2. Send email using a service like Resend, SendGrid, or Supabase's email service
    // 3. Include the verification link in the email

    // For now, we'll just return success (email sending would be implemented with actual email service)
    // Example email content:
    const emailContent = {
      to: user.email,
      subject: `Verify Your Virtual Session: ${sessionTitle}`,
      html: `
        <h2>Verify Your Virtual Session</h2>
        <p>You've created a virtual group revision session:</p>
        <ul>
          <li><strong>Title:</strong> ${sessionTitle}</li>
          <li><strong>Scheduled Time:</strong> ${new Date(scheduledTime).toLocaleString()}</li>
          <li><strong>Meeting URL:</strong> <a href="${meetingUrl}">${meetingUrl}</a></li>
        </ul>
        <p>Please verify your session by clicking the link below:</p>
        <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">
          Verify Session
        </a>
        <p>Or copy this link: ${verificationUrl}</p>
      `
    };

    // TODO: Integrate with actual email service (Resend, SendGrid, etc.)
    if (process.env.NODE_ENV !== "production") {
      console.log("Email would be sent:", emailContent);
    }

    return res.status(200).json({
      success: true,
      message: "Verification email sent",
      ...(process.env.NODE_ENV !== "production" ? { verificationToken } : {}),
    });

  } catch (error) {
    console.error("Error sending verification email:", error);
    return res.status(500).json({
      error:
        process.env.NODE_ENV !== "production"
          ? (error.message || "Internal server error")
          : "Internal server error",
    });
  }
}

