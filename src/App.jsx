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
  const [logoSizePercent, setLogoSizePercent] = useState(25);
  const [qrSize, setQrSize] = useState(250);
  const qrRef = useRef(null);
  const logoInputRef = useRef(null);

  const applyTheme = (mode) => {
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-bs-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-bs-theme', mode);
    }
  };

  const updateDarkMode = (mode = theme) => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(mode === 'dark' || (mode === 'system' && prefersDark));
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);
    updateDarkMode(savedTheme);

    const listener = () => {
      if (savedTheme === 'system') {
        applyTheme('system');
        updateDarkMode('system');
      }
    };

    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkQuery.addEventListener('change', listener);

    return () => darkQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    const container = qrRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect();
      const size = Math.min(width, height);
      setQrSize(Math.floor(size));
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    updateDarkMode(newTheme);
  };

  const handleSaveImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = qrSize;
    canvas.height = qrSize;
    const ctx = canvas.getContext('2d');

    const qrCanvas = qrRef.current.querySelector('canvas');
    ctx.drawImage(qrCanvas, 0, 0, qrSize, qrSize);

    if (logo) {
      const logoImg = new Image();
      logoImg.src = logo;
      logoImg.onload = () => {
        const logoSize = qrSize * (logoSizePercent / 100);
        const x = (qrSize - logoSize) / 2;
        const y = (qrSize - logoSize) / 2;
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
    setLogoSizePercent(25);
    setQrColor('#000000'); // Reset color input too
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
      {/* Top-right for larger screens */}
      <div className="theme-toggle-wrapper position-fixed top-0 end-0 z-3 p-3 d-none d-sm-block">
        <button
          className="btn btn-outline-secondary dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}
        </button>
        <ul className="dropdown-menu dropdown-menu-end">
          <li><button className="dropdown-item" onClick={() => handleThemeChange('light')}>Light</button></li>
          <li><button className="dropdown-item" onClick={() => handleThemeChange('dark')}>Dark</button></li>
          <li><button className="dropdown-item" onClick={() => handleThemeChange('system')}>System</button></li>
        </ul>
      </div>

      {/* Bottom-center for small screens */}
      <div className="theme-toggle-wrapper position-fixed top-0 start-50 translate-middle-x p-3 d-block d-sm-none">
        <button
          className="btn btn-outline-secondary dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}
        </button>
        <ul className="dropdown-menu dropdown-menu-center show-on-hover">
          <li><button className="dropdown-item" onClick={() => handleThemeChange('light')}>Light</button></li>
          <li><button className="dropdown-item" onClick={() => handleThemeChange('dark')}>Dark</button></li>
          <li><button className="dropdown-item" onClick={() => handleThemeChange('system')}>System</button></li>
        </ul>
      </div>


      <div className="app-wrapper d-flex justify-content-center align-items-center p-3">
        <div className={`flip-card ${showIntro ? '' : 'flipped'}`}>
          <div className="flip-card-inner card shadow-lg rounded-4 w-100 custom-card">
            {/* FRONT */}
            <div className="flip-card-front d-flex flex-column justify-content-center align-items-center text-center">
              <h2>Welcome to <span className="text-primary">QReatify</span></h2>
              <p className="text-muted">Effortless QR code generation made simple.</p>
              <button className="btn btn-primary mt-4" onClick={() => setShowIntro(false)}>Let’s QReate →</button>
            </div>

            {/* BACK */}
            <div className="flip-card-back w-100 h-auto position-relative">
              <div className="d-flex flex-column h-100 justify-content-start p-5">
                <h2 className="mb-4 text-center">QReatify Code Generator</h2>

                <div className="mb-3">
                  <CustomInput
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter text, link, or any data for your QR code"
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
                          if (val.startsWith('#') && /^#([0-9A-Fa-f]{0,6})$/.test(val)) {
                            setQrColor(val);
                          }
                        }}
                        className="form-control"
                        maxLength={7}
                        placeholder="#000000"
                      />
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => setQrColor('#000000')}
                        title="Reset to default black"
                      >
                        Reset
                      </button>
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

                    {/* Logo size slider */}
                    {logo && (
                      <div className="mt-3">
                        <label className="fw-semibold d-block mb-1">Logo Size: {logoSizePercent}%</label>
                        <input
                          type="range"
                          min="10"
                          max="30"
                          step="1"
                          value={logoSizePercent}
                          onChange={(e) => setLogoSizePercent(Number(e.target.value))}
                          className="form-range"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="mt-2 p-4 border border-secondary rounded bg-light-subtle text-center d-flex justify-content-center align-items-center qr-container"
                  ref={qrRef}
                >
                  {name ? (
                    <div style={{ position: 'relative', width: qrSize, height: qrSize }}>
                      <QRCodeCanvas
                        value={name}
                        size={qrSize}
                        bgColor="#ffffff"
                        fgColor={qrColor}
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
                            width: `${Math.floor(qrSize * (logoSizePercent / 100))}px`,
                            height: `${Math.floor(qrSize * (logoSizePercent / 100))}px`,
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
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center mt-5 mb-3 text-muted small">
        <div className="container">
          <p>
            Developed by <strong>Ceddy</strong> &middot; 
            <a 
              href="https://github.com/ceddvy/qreate" 
              className="ms-1 text-decoration-none" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </p>
          <p>
            This QR generator is 100% free and runs entirely in your browser. <strong>No data is collected or stored.</strong>
          </p>

          <p className="mt-2">&copy; {new Date().getFullYear()} QReatify. All rights reserved.</p>
        </div>
      </footer>

    </>
  );
}

export default App;
