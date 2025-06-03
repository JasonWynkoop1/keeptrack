import { useState } from 'react';
import { useZxing } from 'react-zxing';

const BarcodeScanner = ({ onBarcodeDetected }) => {
  const [error, setError] = useState('');

  const { ref } = useZxing({
    onDecodeResult(result) {
      const barcode = result.getText();
      onBarcodeDetected(barcode);
    },
    onError(error) {
      setError(`Scanning error: ${error.message}`);
    },
  });

  return (
    <div className="barcode-scanner">
      <h2>Scan Barcode</h2>
      <div className="scanner-container">
        <video ref={ref} />
      </div>
      {error && <p className="error">{error}</p>}
      <p className="instructions">Position the barcode within the scanner view</p>
    </div>
  );
};

export default BarcodeScanner;
