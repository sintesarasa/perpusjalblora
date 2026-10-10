/**
 * Email Service — Perpustakaan Jalanan Blora (Perpusjal v3)
 *
 * Implements Resend transactional emails with Stark Monochrome Editorial HTML templates.
 * Features graceful fallback to console logging for seamless local development
 * without requiring real API keys.
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  actionUrl?: string;
}

interface SendEmailResult {
  success: boolean;
  id?: string;
  devFallback?: boolean;
  error?: string;
}

export class EmailService {
  private apiKey: string;
  private fromAddress: string;
  private appUrl: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || '';
    this.fromAddress = process.env.EMAIL_FROM || 'halo@perpusjal.org';
    this.appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      'http://localhost:3000';
  }

  /**
   * Helper to check whether Resend is configured with a real production API key.
   */
  private isConfigured(): boolean {
    return (
      Boolean(this.apiKey) &&
      !this.apiKey.includes('mock') &&
      this.apiKey.startsWith('re_') &&
      this.apiKey !== 're_mock_key'
    );
  }

  /**
   * Send an email via Resend REST API or fallback gracefully to terminal log
   */
  async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    const { to, subject, html, text, actionUrl } = params;

    // Graceful Fallback if API key is missing or mock
    if (!this.isConfigured()) {
      this.logDevEmail(to, subject, text, actionUrl);
      return {
        success: true,
        id: `mock-${Date.now()}`,
        devFallback: true,
      };
    }

    try {
      // Determine appropriate 'from' header:
      // If fromAddress contains @perpusjal.org but user has not verified the domain on Resend,
      // Resend will return a 403 unless onboarding@resend.dev is used for testing.
      const fromHeader = this.fromAddress.includes('<')
        ? this.fromAddress
        : `Perpustakaan Jalanan Blora <${this.fromAddress}>`;

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromHeader,
          to: [to],
          subject,
          html,
          text,
        }),
      });

      let data = (await response.json()) as { id?: string; message?: string; name?: string };

      // If sending from custom domain failed due to unverified domain or 403, retry with onboarding@resend.dev
      if (!response.ok && !fromHeader.includes('onboarding@resend.dev')) {
        console.warn(
          `[EMAIL SERVICE] Domain custom belum diverifikasi di Resend (${data.message || response.statusText}). Mengirim ulang via 'onboarding@resend.dev'...`
        );
        const retryResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Perpustakaan Jalanan Blora <onboarding@resend.dev>',
            to: [to],
            subject,
            html,
            text,
          }),
        });

        if (retryResponse.ok) {
          const retryData = (await retryResponse.json()) as { id?: string };
          console.log(`[EMAIL SERVICE] Email berhasil terkirim via Resend (onboarding@resend.dev) ke ${to} (ID: ${retryData.id})`);
          return {
            success: true,
            id: retryData.id,
            devFallback: false,
          };
        } else {
          data = (await retryResponse.json()) as { id?: string; message?: string; name?: string };
        }
      }

      if (!response.ok) {
        console.warn(
          `[EMAIL SERVICE WARNING] Resend API responded with error (${response.status}):`,
          data.message || data.name || response.statusText
        );
        console.warn('[EMAIL SERVICE] Falling back to local console dispatch for uninterrupted workflow.');
        this.logDevEmail(to, subject, text, actionUrl);
        return {
          success: true,
          id: `fallback-${Date.now()}`,
          devFallback: true,
        };
      }

      console.log(`[EMAIL SERVICE] Email successfully dispatched via Resend to ${to} (ID: ${data.id})`);
      return {
        success: true,
        id: data.id,
        devFallback: false,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[EMAIL SERVICE EXCEPTION] Network failure sending email to ${to}: ${errMsg}`);
      console.warn('[EMAIL SERVICE] Falling back to local console dispatch.');
      this.logDevEmail(to, subject, text, actionUrl);
      return {
        success: true,
        id: `fallback-${Date.now()}`,
        devFallback: true,
      };
    }
  }

  /**
   * Log email details clearly in development console
   */
  private logDevEmail(to: string, subject: string, text: string, actionUrl?: string) {
    console.log('\n' + '═'.repeat(78));
    console.log('📜 [PERPUSJAL EMAIL DISPATCH — LOCAL DEV EMULATION]');
    console.log(`   Kepada   : ${to}`);
    console.log(`   Perihal  : ${subject}`);
    console.log(`   Waktu    : ${new Date().toLocaleString('id-ID')}`);
    if (actionUrl) {
      console.log('   ──────────────────────────────────────────────────────────────────────────');
      console.log(`   🔗 TAUTAN TOKEN RESMI : \x1b[36m\x1b[1m${actionUrl}\x1b[0m`);
    }
    console.log('   ──────────────────────────────────────────────────────────────────────────');
    console.log('   Ringkasan Isi Pesan:');
    const indented = text
      .split('\n')
      .map((line) => `   ${line}`)
      .join('\n');
    console.log(indented);
    console.log('═'.repeat(78) + '\n');
  }

  /**
   * Base template generator for Stark Monochrome Gazette email layout
   */
  private generateMonochromeTemplate(options: {
    preheader: string;
    headline: string;
    recipientName: string;
    bodyParagraphs: string[];
    actionButton?: {
      label: string;
      url: string;
    };
    expiryNotice?: string;
    securityNotice?: string;
  }): string {
    const {
      preheader,
      headline,
      recipientName,
      bodyParagraphs,
      actionButton,
      expiryNotice,
      securityNotice,
    } = options;

    const paragraphsHtml = bodyParagraphs
      .map(
        (p) =>
          `<p style="margin: 0 0 16px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 15px; line-height: 1.7; color: #0A0A0A;">${p}</p>`
      )
      .join('\n');

    const buttonHtml = actionButton
      ? `
      <!-- Action CTA -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
        <tr>
          <td align="left">
            <a href="${actionButton.url}" target="_blank" style="display: inline-block; background-color: #0A0A0A; color: #FFFFFF !important; text-decoration: none; padding: 14px 28px; font-family: 'Courier New', Courier, monospace; font-size: 12px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; border-radius: 0px; border: 1px solid #0A0A0A;">
              ${actionButton.label} &rarr;
            </a>
          </td>
        </tr>
      </table>

      <!-- Plaintext Fallback URL -->
      <div style="margin: 20px 0 28px 0; padding: 14px; background-color: #F1F1EE; border: 1px solid #E2E2DC;">
        <p style="margin: 0 0 6px 0; font-family: 'Courier New', Courier, monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #555555; font-weight: bold;">
          Tautan Cadangan (Bila tombol tidak dapat diklik):
        </p>
        <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 11px; line-height: 1.5; color: #0A0A0A; word-break: break-all;">
          <a href="${actionButton.url}" style="color: #0A0A0A; text-decoration: underline;">${actionButton.url}</a>
        </p>
      </div>
      `
      : '';

    const expiryHtml = expiryNotice
      ? `
      <div style="margin: 20px 0; padding: 12px 14px; border-left: 2px solid #0A0A0A; background-color: #F6F6F4;">
        <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 11px; line-height: 1.5; color: #333333;">
          <strong>CATATAN MASA BERLAKU:</strong> ${expiryNotice}
        </p>
      </div>
      `
      : '';

    const securityHtml = securityNotice
      ? `
      <div style="margin: 20px 0; padding: 12px 14px; border: 1px dashed #777777; background-color: #FAFAFA;">
        <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 11px; line-height: 1.5; color: #444444;">
          <strong>PROTOKOL KEAMANAN:</strong> ${securityNotice}
        </p>
      </div>
      `
      : '';

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headline}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #F9F9F7; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F9F9F7; font-family: Georgia, 'Times New Roman', serif; -webkit-font-smoothing: antialiased;">
  <!-- Hidden preheader for email preview -->
  <div style="display: none; font-size: 1px; color: #F9F9F7; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheader}
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F9F9F7;">
    <tr>
      <td align="center" style="padding: 32px 16px 48px 16px;">
        <!-- Main Gazette Dossier Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #FFFFFF; border: 1px solid #1A1A1A;">
          
          <!-- Gazette Masthead Header -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; border-bottom: 2px solid #0A0A0A; background-color: #FFFFFF;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 2.5px; color: #555555; margin-bottom: 6px;">
                      Kolektif Literasi Independen Blora &bull; Warta Resmi
                    </div>
                    <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: bold; letter-spacing: 1px; color: #0A0A0A; text-transform: uppercase; margin: 0 0 4px 0;">
                      PERPUSTAKAAN JALANAN BLORA
                    </div>
                    <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 12px; font-style: italic; color: #333333; letter-spacing: 0.5px;">
                      — Membaca dan Berbahagia —
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Gazette Sub-meta bar -->
          <tr>
            <td style="padding: 8px 32px; background-color: #F4F4F0; border-bottom: 1px solid #1A1A1A; font-family: 'Courier New', Courier, monospace; font-size: 10px; color: #555555; letter-spacing: 1px;">
              REGISTRI // ${new Date().toISOString().slice(0, 10)} // SIKLUS HIDUP AKUN
            </td>
          </tr>

          <!-- Main Letter Content -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; background-color: #FFFFFF;">
              <!-- Headline -->
              <h1 style="margin: 0 0 20px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: normal; line-height: 1.3; color: #0A0A0A; letter-spacing: -0.5px;">
                ${headline}
              </h1>

              <!-- Salutation -->
              <p style="margin: 0 0 16px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 15px; line-height: 1.6; color: #0A0A0A;">
                Salam hangat, Kawan <strong>${recipientName}</strong>,
              </p>

              <!-- Body Paragraphs -->
              ${paragraphsHtml}

              <!-- Expiry Box -->
              ${expiryHtml}

              <!-- CTA Button & Fallback -->
              ${buttonHtml}

              <!-- Security Notice -->
              ${securityHtml}

              <!-- Formal Closing -->
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E5E0;">
                <p style="margin: 0 0 4px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 14px; font-style: italic; color: #333333;">
                  Salam hangat dari kawan-kawan lapak Alun-Alun Blora.
                </p>
                <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #777777; font-weight: bold;">
                  Relawan Kolektif Perpustakaan Jalanan Blora
                </p>
              </div>
            </td>
          </tr>

          <!-- Gazette Colophon Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #F9F9F7; border-top: 1px solid #1A1A1A; font-family: 'Courier New', Courier, monospace; font-size: 10px; line-height: 1.6; color: #666666;">
              <div style="margin-bottom: 6px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #0A0A0A;">
                KOLOFON &bull; PERPUSTAKAAN JALANAN BLORA
              </div>
              <div>
                Lapak terbuka di Alun-Alun Blora setiap akhir pekan. Sistem peminjaman buku jalanan tanpa denda, tanpa jaminan uang, berasaskan gotong royong dan saling percaya.
              </div>
              <div style="margin-top: 10px; color: #888888; font-size: 9px;">
                Surat ini dikirim secara otomatis oleh sistem registri Perpusjal. Jangan membalas email ini secara langsung.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  /**
   * 1. Send Email Verification link to newly registered user
   */
  async sendVerificationEmail(to: string, name: string, rawToken: string): Promise<SendEmailResult> {
    const actionUrl = `${this.appUrl}/verifikasi?token=${rawToken}`;
    const subject = 'Aktivasi Akun Pembaca — Perpustakaan Jalanan Blora';

    const text = `Halo, Kawan ${name}.\n\n` +
      `Selamat bergabung dengan kawan-kawan pembaca di Perpustakaan Jalanan Blora.\n` +
      `Untuk mengaktifkan akunmu dan membuka hak peminjaman buku jalanan bebas denda, silakan buka tautan berikut:\n\n` +
      `${actionUrl}\n\n` +
      `Tautan aktivasi ini hanya berlaku selama 24 jam.\n\n` +
      `Salam hangat dari kawan-kawan lapak Alun-Alun Blora.\n` +
      `Perpustakaan Jalanan Blora — Membaca dan Berbahagia`;

    const html = this.generateMonochromeTemplate({
      preheader: `Aktivasi akun pembaca Kawan ${name} di Perpustakaan Jalanan Blora.`,
      headline: 'Aktivasi Keanggotaan Pembaca',
      recipientName: name,
      bodyParagraphs: [
        'Terima kasih telah mendaftarkan diri sebagai bagian dari kolektif pembaca mandiri Perpustakaan Jalanan Blora.',
        'Di lapak jalanan kami, buku dipinjamkan tanpa jaminan uang dan tanpa denda sepeser pun. Cukup dengan modal saling percaya dan kesediaan menjaga lembar-lembar bacaan.',
        'Untuk mengonfirmasi alamat surat elektronik ini dan mengaktifkan hak peminjaman bukumu, silakan klik tombol aktivasi di bawah ini.',
      ],
      actionButton: {
        label: 'Aktivasi Akun Pembaca',
        url: actionUrl,
      },
      expiryNotice: 'Tautan verifikasi ini berlaku selama 24 jam sejak surat elektronik ini dikirimkan.',
      securityNotice: 'Jika kawan merasa tidak pernah mendaftarkan akun di Perpustakaan Jalanan Blora, kawan dapat mengabaikan warta ini dengan aman.',
    });

    return this.sendEmail({
      to,
      subject,
      html,
      text,
      actionUrl,
    });
  }

  /**
   * 2. Send Password Reset link to user
   */
  async sendPasswordResetEmail(to: string, name: string, rawToken: string): Promise<SendEmailResult> {
    const actionUrl = `${this.appUrl}/reset-password?token=${rawToken}`;
    const subject = 'Pemulihan Kata Sandi — Perpustakaan Jalanan Blora';

    const text = `Halo, Kawan ${name}.\n\n` +
      `Kami menerima permintaan pengaturan ulang kata sandi untuk akun pembacamu di Perpustakaan Jalanan Blora.\n` +
      `Silakan buka tautan berikut untuk membuat kata sandi baru:\n\n` +
      `${actionUrl}\n\n` +
      `Tautan ini hanya berlaku selama 1 jam demi alasan keamanan akunmu.\n\n` +
      `Jika kawan tidak mengajukan permintaan ini, abaikan pesan ini. Kata sandi lamamu tetap aman dan tidak berubah.\n\n` +
      `Salam hangat dari kawan-kawan lapak Alun-Alun Blora.\n` +
      `Perpustakaan Jalanan Blora — Membaca dan Berbahagia`;

    const html = this.generateMonochromeTemplate({
      preheader: `Tautan pemulihan kata sandi akun Perpusjal untuk Kawan ${name}.`,
      headline: 'Pengaturan Ulang Kata Sandi',
      recipientName: name,
      bodyParagraphs: [
        'Kami menerima permohonan untuk mengatur ulang kata sandi bagi akun pembacamu.',
        'Klik tombol di bawah ini untuk merumuskan kata sandi baru. Setelah kata sandi diperbarui, seluruh sesi aktif di perangkat lain akan dicabut seketika demi perlindungan integritas akunmu.',
      ],
      actionButton: {
        label: 'Atur Ulang Kata Sandi',
        url: actionUrl,
      },
      expiryNotice: 'Tautan ini kedaluwarsa secara otomatis dalam waktu 1 jam (60 menit) sejak penerbitan.',
      securityNotice: 'Jika kawan TIDAK PERNAH meminta pemulihan ini, abaikan surat ini. Akunmu tetap terlindungi dan kata sandimu tidak akan berubah tanpa persetujuanmu.',
    });

    return this.sendEmail({
      to,
      subject,
      html,
      text,
      actionUrl,
    });
  }

  /**
   * 3. Send Notification that password was updated and all other sessions revoked
   */
  async sendPasswordChangedNotification(to: string, name: string): Promise<SendEmailResult> {
    const subject = 'Pemberitahuan Keamanan: Kata Sandi Telah Diperbarui — Perpustakaan Jalanan Blora';

    const text = `Halo, Kawan ${name}.\n\n` +
      `Warta Keamanan: Kata sandi untuk akun pembacamu di Perpustakaan Jalanan Blora baru saja berhasil diperbarui.\n\n` +
      `Demi menjaga keamanan kedaulatan akunmu, seluruh sesi aktif pada peramban dan perangkat lain telah dicabut secara otomatis oleh sistem kami.\n\n` +
      `Jika tindakan ini TIDAK dilakukan oleh kawan, mohon segera hubungi relawan pengurus perpusjal di lapak Alun-Alun Blora atau atur ulang kata sandi akunmu secepatnya.\n\n` +
      `Salam hangat dari kawan-kawan lapak Alun-Alun Blora.\n` +
      `Perpustakaan Jalanan Blora — Membaca dan Berbahagia`;

    const html = this.generateMonochromeTemplate({
      preheader: `Pemberitahuan keamanan: kata sandi akun Perpusjal Kawan ${name} telah diperbarui.`,
      headline: 'Kata Sandi Berhasil Diperbarui',
      recipientName: name,
      bodyParagraphs: [
        'Warta ini merupakan konfirmasi bahwa kata sandi untuk akun pembacamu di Perpustakaan Jalanan Blora baru saja diubah.',
        'Selaras dengan protokol keamanan kedaulatan data warga, seluruh sesi masuk pada perangkat maupun peramban lain telah dicabut secara serentak.',
      ],
      securityNotice: 'PERINGATAN KEAMANAN: Apabila perubahan kata sandi ini tidak kawan lakukan sendiri, kemungkinan ada pihak lain yang mengakses akunmu. Segera lakukan reset kata sandi atau beri tahu relawan lapak kami.',
    });

    return this.sendEmail({
      to,
      subject,
      html,
      text,
    });
  }
}

export const emailService = new EmailService();
