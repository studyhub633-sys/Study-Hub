import { supabase, verifyAuth } from "../_utils/auth.js";
import { applyCors, setNoStore } from "../_utils/http.js";

export default async function handler(req, res) {
    setNoStore(res);
    if (applyCors(req, res)) return;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // 1. Verify caller is admin
        const user = await verifyAuth(req);
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile || !profile.is_admin) {
            return res.status(403).json({ error: "Admin access required." });
        }

        // 2. Extract email and link
        const { email, inviteLink } = req.body;
        if (!email || !inviteLink) {
            return res.status(400).json({ error: "Email and invite link are required." });
        }

        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            return res.status(500).json({ 
                error: "Email service not configured. Please add RESEND_API_KEY to environment variables." 
            });
        }

        // 3. Send email via Resend API
        const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
                from: 'Revisely <no-reply@revisely.ai>',
                to: [email],
                subject: "You're invited to join Revisely as an official Creator! 🚀",
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <h1 style="color: #0ea5e9; font-size: 24px;">Welcome to Revisely!</h1>
                        <p>Hello,</p>
                        <p>You've been personally invited to join Revisely as a Creator. This gives you a unique referral code to share with your audience and earn commission on every premium signup.</p>
                        <div style="margin: 30px 0; text-align: center;">
                            <a href="${inviteLink}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                                Complete your Creator Setup
                            </a>
                        </div>
                        <p style="font-size: 14px; color: #64748b;">If the button above doesn't work, copy and paste this link into your browser:</p>
                        <p style="font-size: 12px; color: #94a3b8; word-break: break-all;">${inviteLink}</p>
                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                        <p style="font-size: 14px; color: #64748b;">Best,<br>The Revisely Team</p>
                    </div>
                `
            })
        });

        const result = await emailResponse.json();
        
        if (!emailResponse.ok) {
            console.error("Resend Error:", result);
            return res.status(500).json({ error: result.message || "Failed to send email" });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Email sent successfully via Resend" 
        });

    } catch (error) {
        console.error("Invite Email Error:", error);
        return res.status(500).json({ error: error.message || "An error occurred while sending the email" });
    }
}
