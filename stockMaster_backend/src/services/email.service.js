// src/services/email.service.js
import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  ADMIN_EMAIL
} = process.env;

/**
 * Returns a configured nodemailer transporter or null if not configured.
 */
const getTransporter = () => {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("SMTP not configured — email will be skipped.");
    return null;
  }

  // SMTP_PORT may be string -> convert to number
  const port = SMTP_PORT ? Number(SMTP_PORT) : 587;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
};

/**
 * Generic send email helper.
 * Returns the result from transporter.sendMail or throws.
 */
export const sendEmail = async ({ to, subject, html, text = "" }) => {
  const transporter = getTransporter();
  if (!transporter) {
    // SMTP not configured — fallback to console log so app doesn't crash
    console.log("EMAIL SKIPPED (no SMTP). to:", to, "subject:", subject);
    console.log("text:", text);
    console.log("html:", html);
    return null;
  }

  const mailOptions = {
    from: SMTP_USER,
    to,
    subject,
    text,
    html
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

/**
 * Send low-stock alert email.
 * Accepts an object:
 * { productId, sku, name, current, reorderLevel, warehouseId, extraText }
 */
export const sendLowStockAlert = async ({
  productId,
  sku,
  name,
  current,
  reorderLevel,
  warehouseId,
  extraText = ""
}) => {
  try {
    const to = ADMIN_EMAIL || SMTP_USER;
    if (!to) {
      console.warn("No ADMIN_EMAIL or SMTP_USER set — cannot send low stock alert.");
      return null;
    }

    const subject = `Low stock alert: ${name || sku} (${sku || productId})`;
    const html = `
      <p>Low stock alert for product <strong>${name || sku}</strong> (${sku || productId}).</p>
      <ul>
        <li>Product ID: ${productId}</li>
        <li>SKU: ${sku || "-"}</li>
        <li>Current stock: <strong>${current}</strong></li>
        <li>Reorder level: <strong>${reorderLevel}</strong></li>
        <li>Warehouse ID: ${warehouseId}</li>
      </ul>
      ${extraText ? `<p>${extraText}</p>` : ""}
      <p>This is an automated notification from StockMaster.</p>
    `;
    const text = `Low stock for ${name || sku} (current: ${current}, reorder: ${reorderLevel})`;

    const info = await sendEmail({ to, subject, html, text });
    console.log("Low stock email sent:", info?.messageId || info);
    return info;
  } catch (err) {
    console.error("Failed to send low stock email:", err);
    // swallow error to avoid breaking stock flows
    return null;
  }
};

export default {
  sendEmail,
  sendLowStockAlert
};
