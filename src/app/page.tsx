'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import styles from './page.module.css';
import { DmcColor } from '../utils/DmcPalette';
import { quantizeImage, QuantizedResult } from '../utils/colorQuantizer';
import DiamondCanvas from '../components/DiamondCanvas';
import ColorLegend from '../components/ColorLegend';

// Helper to generate stunning preset images on the fly via HTML5 Canvas
const generatePreset = (type: 'sunset' | 'wave' | 'mandala'): string => {
  if (typeof window === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  if (type === 'sunset') {
    // Beautiful sunset radial gradient
    const grad = ctx.createRadialGradient(200, 300, 20, 200, 200, 300);
    grad.addColorStop(0, '#f97316'); // Vibrant Orange
    grad.addColorStop(0.3, '#ec4899'); // Pink
    grad.addColorStop(0.7, '#8b5cf6'); // Purple
    grad.addColorStop(1.0, '#1e1b4b'); // Deep Dark Indigo
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 400);

    // Subtle sun circle
    ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
    ctx.beginPath();
    ctx.arc(200, 220, 60, 0, 2 * Math.PI);
    ctx.fill();
  } else if (type === 'wave') {
    // Dynamic ocean waves linear gradient
    const grad = ctx.createLinearGradient(0, 0, 400, 400);
    grad.addColorStop(0, '#06b6d4'); // Cyan
    grad.addColorStop(0.5, '#3b82f6'); // Blue
    grad.addColorStop(1.0, '#1d4ed8'); // Royal Blue
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 400);

    // Decorative wave strokes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 12;
    for (let i = 0; i < 400; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.bezierCurveTo(100, i - 30, 300, i + 50, 400, i);
      ctx.stroke();
    }
  } else if (type === 'mandala') {
    // Neon purple/cyan mandala geometry
    ctx.fillStyle = '#0b0a12';
    ctx.fillRect(0, 0, 400, 400);

    // Concentric glowing shapes
    ctx.lineWidth = 2.5;
    const colors = ['#06b6d4', '#d946ef', '#a855f7', '#3b82f6'];
    for (let r = 20; r < 200; r += 20) {
      ctx.strokeStyle = colors[(r / 20) % colors.length];
      ctx.beginPath();
      ctx.arc(200, 200, r, 0, 2 * Math.PI);
      ctx.stroke();

      // Petals
      const petals = 8 + (r / 20) * 2;
      for (let theta = 0; theta < 2 * Math.PI; theta += (2 * Math.PI) / petals) {
        ctx.save();
        ctx.translate(200, 200);
        ctx.rotate(theta);
        ctx.beginPath();
        ctx.ellipse(r, 0, 10, 5, 0, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  return canvas.toDataURL();
};

export default function App() {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);

  // Customized Titles
  const [artworkName, setArtworkName] = useState<string>('Cosmic Sunset');
  const [companyName, setCompanyName] = useState<string>('Diamond Art Studio');

  // Conversion Inputs
  const [unit, setUnit] = useState<'inch' | 'cm'>('cm');
  const [widthInput, setWidthInput] = useState<string>('30');
  const [heightInput, setHeightInput] = useState<string>('40');
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  
  // Quantization Parameters
  const [kColors, setKColors] = useState<number>(20);
  const [drillShape, setDrillShape] = useState<'round' | 'square'>('round');
  const [symbolStyle, setSymbolStyle] = useState<'alphabet' | 'number' | 'mixed'>('alphabet');

  // Viewer Controls
  const [viewMode, setViewMode] = useState<'color' | 'symbols-only' | 'high-contrast'>('color');
  const [showGridLines, setShowGridLines] = useState<boolean>(true);
  const [highlightedColorCode, setHighlightedColorCode] = useState<string | null>(null);

  // Hovered Canvas Cell details
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number; dmc: DmcColor; symbol: string } | null>(null);

  // Processing indicators
  const [isPending, startTransition] = useTransition();
  const [processedResult, setProcessedResult] = useState<QuantizedResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Computed drill dimensions based on selected unit and standards:
  // CM: 4 drills per cm | INCH: 10 drills per inch
  const gridWidth = Math.max(8, Math.round(parseFloat(widthInput || '10') * (unit === 'inch' ? 10 : 4)));
  const gridHeight = Math.max(8, Math.round(parseFloat(heightInput || '10') * (unit === 'inch' ? 10 : 4)));

  // Load default preset on startup
  useEffect(() => {
    const dataUrl = generatePreset('sunset');
    setImageSrc(dataUrl);
    setOriginalWidth(400);
    setOriginalHeight(400);
  }, []);

  // Update image and process colors whenever core sizing or palette configuration changes
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      // Create off-screen canvas resizer
      const canvas = document.createElement('canvas');
      canvas.width = gridWidth;
      canvas.height = gridHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw rescaled pixelated image
      ctx.drawImage(img, 0, 0, gridWidth, gridHeight);
      const imgData = ctx.getImageData(0, 0, gridWidth, gridHeight);

      // Perform heavy K-Means mapping in React Transition to avoid frame drops
      startTransition(() => {
        const result = quantizeImage(imgData.data, gridWidth, gridHeight, kColors, symbolStyle);
        setProcessedResult(result);
      });
    };
  }, [imageSrc, gridWidth, gridHeight, kColors, symbolStyle]);

  // Adjust aspect ratio locks on dimensions input changes
  const handleWidthChange = (val: string) => {
    setWidthInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && lockAspectRatio && originalWidth && originalHeight) {
      const ratio = originalHeight / originalWidth;
      setHeightInput((num * ratio).toFixed(1));
    }
  };

  const handleHeightChange = (val: string) => {
    setHeightInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && lockAspectRatio && originalWidth && originalHeight) {
      const ratio = originalWidth / originalHeight;
      setWidthInput((num * ratio).toFixed(1));
    }
  };

  const handleUnitToggle = (newUnit: 'inch' | 'cm') => {
    setUnit(newUnit);
    // Convert numerical inputs representation
    const widthVal = parseFloat(widthInput);
    const heightVal = parseFloat(heightInput);
    if (!isNaN(widthVal) && !isNaN(heightVal)) {
      if (newUnit === 'inch') {
        // cm -> inch
        setWidthInput((widthVal / 2.54).toFixed(1));
        setHeightInput((heightVal / 2.54).toFixed(1));
      } else {
        // inch -> cm
        setWidthInput((widthVal * 2.54).toFixed(1));
        setHeightInput((heightVal * 2.54).toFixed(1));
      }
    }
  };

  // Drag & drop handlers
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleImageFile = (file: File) => {
    // Set default artwork name from file name (no extension)
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    setArtworkName(nameWithoutExt);

    // Revoke previous blob URL to prevent memory leaks
    if (imageSrc && imageSrc.startsWith('blob:')) {
      URL.revokeObjectURL(imageSrc);
    }

    // Create a local blob Object URL (extremely fast and bypasses CSP rules under proxies)
    const blobUrl = URL.createObjectURL(file);
    
    const img = new Image();
    img.src = blobUrl;
    img.onload = () => {
      setOriginalWidth(img.width);
      setOriginalHeight(img.height);
      setImageSrc(blobUrl);

      // Force calculate initial height based on width 30
      const ratio = img.height / img.width;
      const startWidth = unit === 'inch' ? 12 : 30;
      setWidthInput(startWidth.toString());
      setHeightInput((startWidth * ratio).toFixed(1));
    };

    img.onerror = (err) => {
      console.error("Failed to load image blob URL", err);
    };
  };

  // Printable SVG construction at exact physical scale (2.5mm per drill cell)
  const renderPrintSvg = () => {
    if (!processedResult) return null;
    
    const cellSize = 10; // SVG grid coordinates units per cell
    const svgW = gridWidth * cellSize;
    const svgH = gridHeight * cellSize;

    // Physical sizes in millimeters (2.5mm per drill)
    const physWidthMm = gridWidth * 2.5;
    const physHeightMm = gridHeight * 2.5;
    
    // Build lookup map for color values
    const paletteMap: Record<string, typeof processedResult.palette[0]> = {};
    for (const item of processedResult.palette) {
      paletteMap[item.dmc.code] = item;
    }

    return (
      <svg
        className={styles.printGridSvg}
        viewBox={`0 0 ${svgW} ${svgH}`}
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background sheet */}
        <rect x="0" y="0" width={svgW} height={svgH} fill="#ffffff" />

        {/* Draw the grids and symbols */}
        {Array.from({ length: gridHeight }).map((_, row) => {
          return Array.from({ length: gridWidth }).map((_, col) => {
            const idx = row * gridWidth + col;
            const dmc = processedResult.pixels[idx];
            if (!dmc) return null;
            const pInfo = paletteMap[dmc.code];
            const sym = pInfo?.symbol || '';

            // Map fills and colors directly from active screen canvas viewMode settings
            let fill = dmc.hex;
            let fillOpacity = 1.0;
            let textColor = '#000000';

            if (viewMode === 'symbols-only') {
              fill = '#ffffff';
              textColor = '#000000';
            } else if (viewMode === 'high-contrast') {
              fill = dmc.hex;
              fillOpacity = 0.25; // Faded pale background
              textColor = '#000000';
            } else {
              // Color Mode: dynamic text contrast
              fill = dmc.hex;
              const luminance = dmc.r * 0.2126 + dmc.g * 0.7152 + dmc.b * 0.0722;
              textColor = luminance > 120 ? '#000000' : '#ffffff';
            }

            // Sync grid lines border settings
            let strokeColor = 'none';
            if (showGridLines) {
              strokeColor = '#475569';
            } else if (drillShape === 'round' && (viewMode === 'symbols-only' || viewMode === 'high-contrast')) {
              strokeColor = '#cbd5e1'; // pale border to keep round drill outlines visible
            }

            const x = col * cellSize;
            const y = row * cellSize;

            return (
              <g key={idx}>
                {drillShape === 'round' ? (
                  <circle
                    cx={x + cellSize / 2}
                    cy={y + cellSize / 2}
                    r={cellSize / 2 - 0.5}
                    fill={fill}
                    fillOpacity={fillOpacity}
                    stroke={strokeColor}
                    strokeWidth="0.3"
                  />
                ) : (
                  <rect
                    x={x + 0.5}
                    y={y + 0.5}
                    width={cellSize - 1}
                    height={cellSize - 1}
                    fill={fill}
                    fillOpacity={fillOpacity}
                    stroke={strokeColor}
                    strokeWidth="0.3"
                  />
                )}
                <text
                  x={x + cellSize / 2}
                  y={y + cellSize / 2}
                  fill={textColor}
                  fontSize={cellSize * 0.65}
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  alignmentBaseline="middle"
                >
                  {sym}
                </text>
              </g>
            );
          });
        })}
      </svg>
    );
  };

  return (
    <div className={styles.container} id="generator-main">
      {/* Loading Overlay */}
      {isPending && (
        <div className={styles.loaderOverlay}>
          <div className={styles.spinner} />
          <p style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Recalculating diamond matrix...</p>
        </div>
      )}

      {/* Main Header */}
      <header className={styles.header}>
        <div className={styles.logoArea}>
          <span className={styles.logoIcon}>💎</span>
          <div>
            <h1 className={styles.titleText}>Diamond Painting Generator</h1>
            <p className={styles.subtitle}>Premium Craft Studio</p>
          </div>
        </div>
        <div className={styles.actions}>
          <button className={styles.printBtn} onClick={() => window.print()} title="Print canvas map booklet">
            🖨️ Print PDF Pattern
          </button>
        </div>
      </header>

      {/* App Workspace */}
      <main className={styles.workspace}>
        {/* Settings Sidebar */}
        <section className={styles.configSidebar} aria-label="Generator Settings">
          
          {/* Section: Image Import */}
          <div>
            <div className={styles.sectionTitle}>1. Upload Artwork</div>
            
            {imageSrc ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className={styles.imagePreviewWrapper}>
                  <img src={imageSrc} alt="Preview" className={styles.previewImage} />
                  <div className={styles.changeImageOverlay} onClick={() => fileInputRef.current?.click()}>
                    Replace Image
                  </div>
                </div>
                <div className={styles.controlGroup} style={{ marginTop: '4px' }}>
                  <label className={styles.presetLabel}>Artwork Painting Name</label>
                  <input
                    type="text"
                    className={styles.textInput}
                    value={artworkName}
                    onChange={(e) => setArtworkName(e.target.value)}
                    placeholder="Enter artwork name"
                  />
                </div>
                <div className={styles.controlGroup} style={{ marginTop: '2px' }}>
                  <label className={styles.presetLabel}>Company / Studio Name</label>
                  <input
                    type="text"
                    className={styles.textInput}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter studio name"
                  />
                </div>
                <div className={styles.presetLabel} style={{ marginTop: '6px' }}>Or try another preset:</div>
                <div className={styles.presetContainer}>
                  <button className={styles.presetBtn} onClick={() => { setImageSrc(generatePreset('sunset')); setOriginalWidth(400); setOriginalHeight(400); setArtworkName('Cosmic Sunset'); }}>🌅 Sunset</button>
                  <button className={styles.presetBtn} onClick={() => { setImageSrc(generatePreset('wave')); setOriginalWidth(400); setOriginalHeight(400); setArtworkName('Ocean Wave'); }}>🌊 Wave</button>
                  <button className={styles.presetBtn} onClick={() => { setImageSrc(generatePreset('mandala')); setOriginalWidth(400); setOriginalHeight(400); setArtworkName('Neon Mandala'); }}>🌀 Mandala</button>
                </div>
              </div>
            ) : (
              <div
                className={styles.uploadZone}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={styles.uploadIcon}>🖼️</div>
                <p className={styles.uploadText}>Drag & drop an image</p>
                <p className={styles.uploadSubtext}>Supports JPEG, PNG, WebP</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className={styles.fileInput}
              accept="image/*"
              onChange={handleFileSelect}
            />
          </div>

          {/* Section: Physical Sizing */}
          <div className={styles.controlGroup}>
            <div className={styles.sectionTitle}>2. Sizing Details</div>
            
            <div className={styles.controlGroup} style={{ marginBottom: '8px' }}>
              <label className={styles.presetLabel}>Measurement Unit</label>
              <div className={styles.toggleGroup}>
                <button
                  className={`${styles.toggleBtn} ${unit === 'cm' ? styles.toggleBtnActive : ''}`}
                  onClick={() => handleUnitToggle('cm')}
                >
                  Metric (cm)
                </button>
                <button
                  className={`${styles.toggleBtn} ${unit === 'inch' ? styles.toggleBtnActive : ''}`}
                  onClick={() => handleUnitToggle('inch')}
                >
                  Imperial (inch)
                </button>
              </div>
            </div>

            <div className={styles.dimensionRow}>
              <div className={styles.controlGroup}>
                <label className={styles.presetLabel}>Width</label>
                <input
                  type="number"
                  min="5"
                  max="200"
                  step="0.5"
                  className={styles.textInput}
                  value={widthInput}
                  onChange={(e) => handleWidthChange(e.target.value)}
                />
              </div>
              <div className={styles.controlGroup}>
                <label className={styles.presetLabel}>Height</label>
                <input
                  type="number"
                  min="5"
                  max="200"
                  step="0.5"
                  className={styles.textInput}
                  value={heightInput}
                  onChange={(e) => handleHeightChange(e.target.value)}
                />
              </div>
              <button
                className={`${styles.lockBtn} ${lockAspectRatio ? styles.lockBtnActive : ''}`}
                onClick={() => setLockAspectRatio(!lockAspectRatio)}
                title="Lock aspect ratio"
              >
                {lockAspectRatio ? '🔗' : '🔓'}
              </button>
            </div>
            
            <div className={styles.inputSubtext} style={{ marginTop: '4px' }}>
              Calculated Canvas: <strong>{gridWidth} × {gridHeight}</strong> drills ({ (gridWidth * gridHeight).toLocaleString() } total stones).
            </div>
          </div>

          {/* Section: Parameters */}
          <div className={styles.controlGroup}>
            <div className={styles.sectionTitle}>3. Stone Parameters</div>
            
            <div className={styles.controlGroup}>
              <div className={styles.labelRow}>
                <span>Max Colors</span>
                <span style={{ color: 'var(--accent-purple)', fontWeight: 'bold' }}>{kColors}</span>
              </div>
              <input
                type="range"
                min="8"
                max="40"
                className={styles.rangeSlider}
                value={kColors}
                onChange={(e) => setKColors(parseInt(e.target.value))}
              />
            </div>

            <div className={styles.controlGroup}>
              <label className={styles.presetLabel}>Drill Style (Stones)</label>
              <div className={styles.toggleGroup}>
                <button
                  className={`${styles.toggleBtn} ${drillShape === 'round' ? styles.toggleBtnActive : ''}`}
                  onClick={() => setDrillShape('round')}
                >
                  🔴 Round Drills
                </button>
                <button
                  className={`${styles.toggleBtn} ${drillShape === 'square' ? styles.toggleBtnActive : ''}`}
                  onClick={() => setDrillShape('square')}
                >
                  🟩 Square Drills
                </button>
              </div>
            </div>

            <div className={styles.controlGroup}>
              <label className={styles.presetLabel}>Legend Symbols Style</label>
              <select
                className={styles.selectInput}
                value={symbolStyle}
                onChange={(e) => setSymbolStyle(e.target.value as any)}
              >
                <option value="alphabet">Alphabet only (A-Z)</option>
                <option value="number">Numbers only (0-9)</option>
                <option value="mixed">Mixed Alphanumeric & Symbols</option>
              </select>
            </div>


          </div>

        </section>

        {/* Center: Canvas Workspace */}
        <section className={styles.canvasArea} aria-label="Interactive Canvas">
          <div className={styles.canvasHeader}>
            <div className={styles.canvasTitleRow}>
              <h2 className={styles.canvasTitle}>Pattern Chart Canvas</h2>
              <span className={styles.canvasSubtitle}>
                {drillShape === 'round' ? 'Round Drills Grid' : 'Square Drills Grid'}
              </span>
            </div>
            
            {/* Display Mode Toggles */}
            <div className={styles.canvasControls}>
              <div className={styles.toggleGroup} style={{ marginRight: '10px' }}>
                <button
                  className={`${styles.toggleBtn} ${viewMode === 'color' ? styles.toggleBtnActive : ''}`}
                  onClick={() => setViewMode('color')}
                  title="Show color diamond canvas"
                >
                  Color Canvas
                </button>
                <button
                  className={`${styles.toggleBtn} ${viewMode === 'high-contrast' ? styles.toggleBtnActive : ''}`}
                  onClick={() => setViewMode('high-contrast')}
                  title="Faded backgrounds for symbol clarity"
                >
                  Contrast
                </button>
                <button
                  className={`${styles.toggleBtn} ${viewMode === 'symbols-only' ? styles.toggleBtnActive : ''}`}
                  onClick={() => setViewMode('symbols-only')}
                  title="B&W Printable symbol grids"
                >
                  Symbols Only
                </button>
              </div>

              <button
                className={styles.presetBtn}
                onClick={() => setShowGridLines(!showGridLines)}
                style={{
                  backgroundColor: showGridLines ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  borderColor: showGridLines ? 'var(--accent-cyan)' : 'var(--border-color)',
                  color: showGridLines ? 'var(--accent-cyan)' : 'var(--text-secondary)'
                }}
              >
                Grid: {showGridLines ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Interactive Zoomable Viewport */}
          <div className={styles.viewportWrapper}>
            {/* Floating details HUD tooltip */}
            {hoveredCell && (
              <div className={styles.hudTooltip}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    className={styles.hudSwatch}
                    style={{ backgroundColor: hoveredCell.dmc.hex, borderRadius: drillShape === 'round' ? '50%' : '2px' }}
                  />
                  <strong>DMC {hoveredCell.dmc.code}</strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'capitalize' }}>
                    ({hoveredCell.dmc.name})
                  </span>
                </div>
                <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.1)', height: '14px' }} />
                <div>
                  Key: <strong style={{ color: 'var(--accent-purple)' }}>{hoveredCell.symbol}</strong>
                </div>
                <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.1)', height: '14px' }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                  R{hoveredCell.row + 1}, C{hoveredCell.col + 1}
                </div>
              </div>
            )}

            {processedResult ? (
              <DiamondCanvas
                pixels={processedResult.pixels}
                gridWidth={gridWidth}
                gridHeight={gridHeight}
                palette={processedResult.palette}
                drillShape={drillShape}
                viewMode={viewMode}
                showGridLines={showGridLines}
                highlightedColorCode={highlightedColorCode}
                onHoverCell={setHoveredCell}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#0c0c12',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-secondary)'
                }}
              >
                Please upload an image to start converting.
              </div>
            )}
          </div>
        </section>

        {/* Right Sidebar: Colors Legend */}
        {processedResult && (
          <aside className={styles.legendSidebar} aria-label="Color Palette Legend">
            <ColorLegend
              palette={processedResult.palette}
              drillShape={drillShape}
              highlightedColorCode={highlightedColorCode}
              onHighlightColor={setHighlightedColorCode}
            />
          </aside>
        )}
      </main>

      {/* ---------------------------------------------------- */}
      {/* Hidden layout specifically for print formatting (@media print) */}
      {processedResult && (
        <div className={`${styles.printOnlyLayout} print-only-layout-unified`} id="print-layout">
          <div className="print-canvas-side">
            <h2 style={{ fontSize: '12pt', marginBottom: '4mm', textAlign: 'center', color: '#000', fontWeight: 'bold' }}>
              {artworkName || 'Diamond Painting'}
            </h2>
            <div className="print-canvas-container">
              {renderPrintSvg()}
            </div>
          </div>
          
          <div className="print-legend-side">
            <div className="print-brand-header">
              <h1 className="print-company-name">{companyName || 'Diamond Art Studio'}</h1>
              <div className="print-title-legend">Color Legend Key</div>
              <div className="print-meta-grid">
                <div>Size: <strong>{widthInput}x{heightInput} {unit}</strong></div>
                <div>Stones: <strong>{drillShape === 'square' ? 'Square 2.5mm' : 'Round 2.8mm'}</strong></div>
                <div>Grid: <strong>{gridWidth}x{gridHeight}</strong></div>
                <div>Colors: <strong>{processedResult.palette.length}</strong></div>
              </div>
            </div>
            
            <div className="print-legend-table-wrapper">
              <table className="print-legend-table">
                <thead>
                  <tr>
                    <th style={{ width: '15%', textAlign: 'center' }}>Sym</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Color</th>
                    <th style={{ width: '20%' }}>DMC</th>
                    <th style={{ width: '45%' }}>Color Name</th>
                  </tr>
                </thead>
                <tbody>
                  {processedResult.palette.map((color) => (
                    <tr key={color.dmc.code}>
                      <td style={{ textAlign: 'center', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '11pt' }}>
                        {color.symbol}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div 
                          className="print-color-box-legend" 
                          style={{ backgroundColor: color.dmc.hex }}
                        />
                      </td>
                      <td><strong>{color.dmc.code}</strong></td>
                      <td>{color.dmc.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
