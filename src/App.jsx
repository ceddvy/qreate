import { useEffect, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import './App.css';
import CustomInput from './components/shared/CustomInput.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
  const [showIntro, setShowIntro] = useState(true);
const [isDarkMode, setIsDarkMode] = useState(false);

  const [name, setName] = useState('');
  const [theme, setTheme] = useState('system');
  const [qrColor, setQrColor] = useState('#000000');
  const [logo, setLogo] = useState(null);
  const qrRef = useRef(null);
  const logoInputRef = useRef(null); // 👈 File input ref

  const applyTheme = (mode) => {
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-bs-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-bs-theme', mode);
    }
  };

  useEffect(() => {
  const savedTheme = localStorage.getItem('theme') || 'system';
  setTheme(savedTheme);
  applyTheme(savedTheme);

  const updateDarkMode = () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(savedTheme === 'dark' || (savedTheme === 'system' && prefersDark));
  };



  updateDarkMode();

  const listener = () => {
    if (savedTheme === 'system') {
      applyTheme('system');
      updateDarkMode();
    }
  };

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);
  return () =>
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener);
}, []);


  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const handleSaveImage = () => {
    const size = 200;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const qrCanvas = qrRef.current.querySelector('canvas');
    ctx.drawImage(qrCanvas, 0, 0, size, size);

    if (logo) {
      const logoImg = new Image();
      logoImg.src = logo;
      logoImg.onload = () => {
        const logoSize = 50;
        const x = (size - logoSize) / 2;
        const y = (size - logoSize) / 2;
        ctx.drawImage(logoImg, x, y, logoSize, logoSize);

        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name}_qr.png`;
        a.click();
      };
    } else {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}_qr.png`;
      a.click();
    }
  };

  const handleClear = () => {
    setName('');
    setLogo(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogo(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className="theme-toggle-wrapper position-fixed top-0 end-0 z-3 p-3">

      <button
        className="btn btn-outline-secondary dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}
      </button>
      <ul className="dropdown-menu dropdown-menu-end">
        <li>
          <button className="dropdown-item" onClick={() => handleThemeChange('light')}>
            Light
          </button>
        </li>
        <li>
          <button className="dropdown-item" onClick={() => handleThemeChange('dark')}>
            Dark
          </button>
        </li>
        <li>
          <button className="dropdown-item" onClick={() => handleThemeChange('system')}>
            System
          </button>
        </li>
      </ul>

    </div>
    <div className="app-wrapper d-flex justify-content-center align-items-center p-3">
    <div className={`flip-card ${showIntro ? '' : 'flipped'}`}>
      <div className="flip-card-inner card shadow-lg rounded-4 w-100 custom-card">
     
        {/* FRONT: Welcome Screen */}
        <div className="flip-card-front d-flex flex-column justify-content-center align-items-center text-center">
          {/* <img src="/logo.png" alt="Logo" style={{ width: '80px', height: '80px' }} className="mb-4" /> */}
          <h2>Welcome to <span className="text-primary">QReate</span></h2>
          <p className="text-muted">Effortless QR code generation made simple.</p>
          <button className="btn btn-primary mt-4" onClick={() => setShowIntro(false)}>
            Let’s QReate →
          </button>
        </div>

        {/* BACK: QR Code Generator */}
        <div className="flip-card-back w-100 h-auto position-relative">

          {/* Your entire QR generator form content here */}
          {/* Keep everything you already have for input, color, logo upload, preview, buttons... */}
          {/* BEGIN Main Generator */}
          <div className="d-flex flex-column h-100 justify-content-start p-5">
            <h2 className="mb-4 text-center">QReate Code Generator</h2>

            <div className="mb-3">
              <CustomInput
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Input text here..."
              />
            </div>

            <div className="d-flex gap-3 flex-column flex-md-row mb-4">
              <div className="flex-fill">
                <label className="fw-semibold d-block mb-2">QR Color:</label>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="color"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    className="form-control form-control-color"
                  />
                  <input
                      type="text"
                      value={qrColor}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^#([0-9A-Fa-f]{0,6})$/.test(val)) {
                          setQrColor(val);
                        }
                      }}
                      className="form-control"
                      maxLength={7}
                      placeholder="#000000"
                    />

                </div>
              </div>

              <div className="flex-fill">
                <label className="fw-semibold d-block mb-2">Upload Logo:</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  ref={logoInputRef}
                />
              </div>
            </div>

            <div
                className="mt-2 p-4 border border-secondary rounded bg-light-subtle text-center d-flex justify-content-center align-items-center"
                style={{ minHeight: '500px' }}
                ref={qrRef}
              >

              {name ? (
                <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                  <QRCodeCanvas
                    value={name}
                    size={200}
                    bgColor={isDarkMode ? "#212529" : "#ffffff"} // dark bg
                    fgColor={qrColor || (isDarkMode ? "#ffffff" : "#000000")} // contrast text
                    includeMargin={false}
                    level="H"
                  />

                  
                  {logo && (
                    <img
                      src={logo}
                      alt="QR Logo"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '50px',
                        height: '50px',
                        borderRadius: '8px',
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className="d-flex flex-column align-items-center">
                  <i className="bi bi-qr-code fs-1 text-secondary mb-2"></i>
                  <span className="text-muted text-center">Your generated QR code will appear here.</span>
                </div>

              )}
            </div>

            {name && (
              <div className="d-flex flex-column flex-md-row gap-2 mt-4">
                <button className="btn btn-success w-100" onClick={handleSaveImage}>
                  💾 Save Image
                </button>
                <button className="btn btn-danger w-100" onClick={handleClear}>
                  <i className="bi bi-eraser-fill me-2"></i>Clear
                </button>
              </div>
            )}
          </div>
          {/* END Main Generator */}
        </div>
      </div>
    </div>
  </div>
    </>
    
  
);

}

export default App;
