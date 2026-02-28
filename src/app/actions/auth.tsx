"use server";

import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { sendNotificationEmail } from "./email";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

export async function requestPasswordReset(email: string) {
  try {
    // 1. Check if the user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Security Best Practice: Do not reveal if an email exists in the DB.
      // Always return a generic success message.
      return {
        success: true,
        message: "If an account exists, a reset link was sent.",
      };
    }

    // 2. Generate a secure, random token
    const token = crypto.randomBytes(32).toString("hex");

    // 3. Set expiration time (e.g., 1 hour from now)
    const expires = new Date(new Date().getTime() + 3600 * 1000);

    // 4. Delete any existing reset tokens for this user to prevent clutter
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    // 5. Save the new token to the database
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    // 6. Construct the reset link
    // Make sure NEXT_PUBLIC_APP_URL is in your .env (e.g., http://localhost:3000)
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000/account";
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    // 7. Send the email using your Gmail configuration
    const emailResult = await sendNotificationEmail(
      email,
      "Password Reset Request - Secure Investment Portal",
      `
    <div style="font-family: Arial, sans-serif; color: #000000; max-width: 500px; margin: 40px auto; padding: 40px; border: 1px solid #E5E5E5; background-color: #FFFFFF;">
      <div style="margin-bottom: 40px; text-align: center;">
        <h2 style="font-size: 18px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; margin: 0;">
          Password Reset
        </h2>
      </div>

      <div style="font-size: 11px; line-height: 1.8; letter-spacing: 0.5px; color: #666666;">
        <p style="margin-bottom: 20px; color: #000000; font-weight: bold; text-transform: uppercase;">
          Hello ${user.fullName},
        </p>
        <p style="margin-bottom: 20px;">
          WE RECEIVED A REQUEST TO RESET YOUR PASSWORD. IF YOU DID NOT MAKE THIS REQUEST, PLEASE DISREGARD THIS MESSAGE.
        </p>
        <p style="margin-bottom: 30px;">
          THIS SECURE LINK WILL EXPIRE IN 60 MINUTES.
        </p>
      </div>

      <div style="text-align: center; margin: 40px 0;">
        <a href="${resetLink}" style="display: inline-block; background-color: #000000; color: #FFFFFF; padding: 18px 36px; text-decoration: none; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border: 1px solid #000000;">
          Reset Password
        </a>
      </div>

      <div style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #F0F0F0; text-align: center;">
        <p style="font-size: 9px; color: #999999; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px;">
          If the button above does not work, please use the link below:
        </p>
        <p style="font-size: 9px; color: #000000; word-break: break-all; text-decoration: underline;">
          ${resetLink}
        </p>
      </div>
    </div>
  `,
    );

    if (!emailResult.success) {
      return {
        success: false,
        error: "Failed to send the email. Please try again later.",
      };
    }

    return { success: true, message: "Check your email for a reset link." };
  } catch (error) {
    console.error("Password reset error:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    // 1. Find the token in the database
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return { success: false, error: "Invalid or expired reset link." };
    }

    // 2. Check if the token has expired
    if (new Date() > resetToken.expires) {
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      return {
        success: false,
        error: "Reset link has expired. Please request a new one.",
      };
    }

    // 3. Hash the new password securely
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update the user's password
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    // 5. Delete the token so it cannot be reused
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return { success: true, message: "Password updated successfully." };
  } catch (error) {
    console.error("Failed to reset password:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
