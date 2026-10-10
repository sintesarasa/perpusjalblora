import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'PERPUSJAL — Perpustakaan Jalanan Blora | Membaca dan Berbahagia';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#FAF8F5',
          color: '#111111',
          padding: '60px 70px',
          fontFamily: 'serif',
          border: '16px solid #111111',
        }}
      >
        {/* Top Header Ledger */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '3px solid #111111',
            paddingBottom: '24px',
            fontFamily: 'monospace',
            fontSize: '18px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '14px', height: '14px', backgroundColor: '#111111' }} />
            <span>KRONIK UTAMA // RUANG BACA RAKYAT</span>
          </div>
          <div>BLORA, JAWA TENGAH &bull; 2026</div>
        </div>

        {/* Central Masthead & Manifesto */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: 'auto', marginBottom: 'auto' }}>
          <div
            style={{
              fontSize: '84px',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              textTransform: 'uppercase',
            }}
          >
            PERPUSJAL BLORA
          </div>
          <div
            style={{
              fontSize: '32px',
              fontStyle: 'italic',
              color: '#333333',
              lineHeight: 1.3,
              maxWidth: '960px',
            }}
          >
            &ldquo;Buku tidak diciptakan untuk membusuk di lemari kaca. Kami membawanya ke trotoar Alun-Alun Blora agar siapa pun bisa membaca dan berbahagia.&rdquo;
          </div>
        </div>

        {/* Bottom Verification Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '3px solid #111111',
            paddingTop: '24px',
            fontFamily: 'monospace',
            fontSize: '18px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          <div style={{ display: 'flex', gap: '24px' }}>
            <span>&bull; PINJAM BUKU GRATIS</span>
            <span>&bull; 100% TANPA DENDA</span>
            <span>&bull; RUANG TULIS WARGA</span>
          </div>
          <div style={{ fontWeight: 800 }}>PERPUSJALBLORA.ORG</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
