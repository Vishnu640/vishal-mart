import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const scannerId = 'qr-reader';
    const html5QrCode = new Html5Qrcode(scannerId);
    scannerRef.current = html5QrCode;

    html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        try {
          const data = JSON.parse(decodedText);
          onScan(data);
          html5QrCode.stop().catch(() => {});
        } catch {
          setError('❌ Invalid QR code. Must contain product JSON.');
        }
      },
      () => {}
    ).then(() => setScanning(true))
     .catch(() => setError('❌ Camera not accessible. Allow camera permission.'));

    return () => {
      html5QrCode.stop().catch(() => {});
    };
  }, [onScan]);

  return (
    <div style={styles.overlay}>
      <div style={styles.box}>
        <div style={styles.header}>
          <span style={styles.title}>📷 Scan Product QR Code</span>
          <button onClick={onClose} style={styles.closeBtn}>✖</button>
        </div>
        <p style={styles.hint}>Point camera at a QR code containing product details</p>
        <div id="qr-reader" style={styles.reader} />
        {!scanning && !error && <p style={styles.loading}>Starting camera...</p>}
        {error && <p style={styles.error}>{error}</p>}
        <div style={styles.formatBox}>
          <p style={styles.formatTitle}>QR Code JSON Format:</p>
          <code style={styles.code}>{`{"name":"Product","category":"Grocery","price":99,"stock":50,"description":"desc","image":"url"}`}</code>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  box: { backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '360px', maxWidth: '95vw' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  title: { fontSize: '17px', fontWeight: 'bold', color: '#1a73e8' },
  closeBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#666' },
  hint: { fontSize: '13px', color: '#888', margin: '0 0 12px' },
  reader: { width: '100%', borderRadius: '10px', overflow: 'hidden' },
  loading: { textAlign: 'center', color: '#888', fontSize: '14px', marginTop: '10px' },
  error: { color: '#c62828', backgroundColor: '#fff3f3', padding: '10px', borderRadius: '6px', fontSize: '13px', marginTop: '10px' },
  formatBox: { marginTop: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '12px' },
  formatTitle: { fontSize: '12px', color: '#555', margin: '0 0 6px', fontWeight: 'bold' },
  code: { fontSize: '11px', color: '#333', wordBreak: 'break-all', display: 'block' },
};
