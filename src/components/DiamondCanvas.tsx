'use client';

import React, { useRef, useEffect, useState, MouseEvent, WheelEvent } from 'react';
import { DmcColor } from '../utils/DmcPalette';
import { QuantizedColor } from '../utils/colorQuantizer';

interface DiamondCanvasProps {
  pixels: DmcColor[];
  gridWidth: number;
  gridHeight: number;
  palette: QuantizedColor[];
  drillShape: 'round' | 'square';
  viewMode: 'color' | 'symbols-only' | 'high-contrast';
  showGridLines: boolean;
  highlightedColorCode: string | null;
  onHoverCell: (cell: { row: number; col: number; dmc: DmcColor; symbol: string } | null) => void;
}

export default function DiamondCanvas({
  pixels,
  gridWidth,
  gridHeight,
  palette,
  drillShape,
  viewMode,
  showGridLines,
  highlightedColorCode,
  onHoverCell
}: DiamondCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan and Zoom States
  const [scale, setScale] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Map color code to its palette symbol configuration for fast lookup
  const colorMap = React.useMemo(() => {
    const map: Record<string, QuantizedColor> = {};
    for (const item of palette) {
      map[item.dmc.code] = item;
    }
    return map;
  }, [palette]);

  // Base cell size when scale is 1
  const baseCellSize = 20;

  // Initialize view: center the canvas grid inside the viewport container
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const container = containerRef.current;
    
    const viewWidth = container.clientWidth;
    const viewHeight = container.clientHeight;
    
    const gridPixelWidth = gridWidth * baseCellSize;
    const gridPixelHeight = gridHeight * baseCellSize;
    
    // Choose scale to fit grid
    const scaleX = (viewWidth - 40) / gridPixelWidth;
    const scaleY = (viewHeight - 40) / gridPixelHeight;
    const initialScale = Math.max(0.1, Math.min(1.5, Math.min(scaleX, scaleY)));
    
    setScale(initialScale);
    setOffset({
      x: (viewWidth - gridPixelWidth * initialScale) / 2,
      y: (viewHeight - gridPixelHeight * initialScale) / 2
    });
  }, [gridWidth, gridHeight]);

  // Redraw Canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle High-DPI screens (Retina)
    const devicePixelRatio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // Clear background
    ctx.fillStyle = '#0f0f15';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw the grid elements
    ctx.save();
    // Apply pan & zoom translations
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    const cellSize = baseCellSize;

    // Render cells
    for (let row = 0; row < gridHeight; row++) {
      for (let col = 0; col < gridWidth; col++) {
        const idx = row * gridWidth + col;
        if (idx >= pixels.length) continue;
        
        const dmc = pixels[idx];
        const paletteInfo = colorMap[dmc.code];
        const symbol = paletteInfo?.symbol || '?';
        
        const x = col * cellSize;
        const y = row * cellSize;

        // Determine if this cell is highlighted or dimmed
        let opacity = 1.0;
        let isHighlighted = false;
        
        if (highlightedColorCode !== null) {
          if (dmc.code === highlightedColorCode) {
            opacity = 1.0;
            isHighlighted = true;
          } else {
            opacity = 0.12; // Dim others
          }
        }

        // Draw Cell Background / Drill shape
        ctx.save();
        ctx.globalAlpha = opacity;

        // Pick color based on viewMode
        let cellColor = dmc.hex;
        if (viewMode === 'symbols-only') {
          cellColor = '#ffffff';
        } else if (viewMode === 'high-contrast') {
          // Keep background very faint so symbols are highly visible
          cellColor = getLuminance(dmc.r, dmc.g, dmc.b) > 0.5 ? '#f3f4f6' : '#e5e7eb';
        }

        ctx.fillStyle = cellColor;

        if (drillShape === 'round') {
          // Draw round drill
          ctx.beginPath();
          const r = cellSize / 2 - 0.75;
          ctx.arc(x + cellSize / 2, y + cellSize / 2, r, 0, 2 * Math.PI);
          ctx.fill();

          if (isHighlighted) {
            ctx.strokeStyle = '#00f6ff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          } else if (viewMode === 'symbols-only' || showGridLines) {
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        } else {
          // Draw square drill
          ctx.fillRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);
          
          if (isHighlighted) {
            ctx.strokeStyle = '#00f6ff';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);
          } else if (viewMode === 'symbols-only' || showGridLines) {
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);
          }
        }

        // Draw Symbol text inside drill (only if scale is large enough to see it)
        const minScaleForText = 0.45; // allows reading symbols at mid-zoom
        if (scale >= minScaleForText) {
          // Determine text color for readability contrast
          let textColor = '#000000';
          if (viewMode === 'color') {
            const luminance = getLuminance(dmc.r, dmc.g, dmc.b);
            textColor = luminance > 0.45 ? '#000000' : '#ffffff';
          }

          ctx.fillStyle = textColor;
          ctx.font = `bold ${cellSize * 0.55}px var(--font-mono)`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(symbol, x + cellSize / 2, y + cellSize / 2);
        }

        ctx.restore();
      }
    }

    // Outer grid boundary
    if (showGridLines) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, gridWidth * cellSize, gridHeight * cellSize);
    }

    ctx.restore();
  }, [pixels, gridWidth, gridHeight, scale, offset, drillShape, viewMode, showGridLines, highlightedColorCode, colorMap]);

  // Get luminance helper for text contrast
  function getLuminance(r: number, g: number, b: number): number {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  // Handle Dragging / Panning
  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) { // Left click drags
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }

    // Hover detection
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert screen coordinates to zoomed canvas coordinates
    const gridX = (mouseX - offset.x) / scale;
    const gridY = (mouseY - offset.y) / scale;

    const cellSize = baseCellSize;
    const col = Math.floor(gridX / cellSize);
    const row = Math.floor(gridY / cellSize);

    if (col >= 0 && col < gridWidth && row >= 0 && row < gridHeight) {
      const idx = row * gridWidth + col;
      const dmc = pixels[idx];
      if (dmc) {
        const symbol = colorMap[dmc.code]?.symbol || '?';
        onHoverCell({ row, col, dmc, symbol });
        return;
      }
    }
    onHoverCell(null);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom centered on the cursor position
  const handleWheel = (e: WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Current mouse pos in canvas space
    const canvasX = (mouseX - offset.x) / scale;
    const canvasY = (mouseY - offset.y) / scale;

    const zoomIntensity = 0.12;
    const delta = -e.deltaY;
    let newScale = scale + (delta > 0 ? zoomIntensity : -zoomIntensity) * scale;
    
    // Constraints
    newScale = Math.max(0.08, Math.min(30, newScale));

    // Calculate new offsets to keep cursor stationary
    const newOffsetX = mouseX - canvasX * newScale;
    const newOffsetY = mouseY - canvasY * newScale;

    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  // Zoom controls UI
  const zoomIn = () => {
    if (!canvasRef.current) return;
    const w = canvasRef.current.clientWidth / 2;
    const h = canvasRef.current.clientHeight / 2;
    const canvasX = (w - offset.x) / scale;
    const canvasY = (h - offset.y) / scale;
    const newScale = Math.min(30, scale * 1.3);
    setScale(newScale);
    setOffset({ x: w - canvasX * newScale, y: h - canvasY * newScale });
  };

  const zoomOut = () => {
    if (!canvasRef.current) return;
    const w = canvasRef.current.clientWidth / 2;
    const h = canvasRef.current.clientHeight / 2;
    const canvasX = (w - offset.x) / scale;
    const canvasY = (h - offset.y) / scale;
    const newScale = Math.max(0.08, scale / 1.3);
    setScale(newScale);
    setOffset({ x: w - canvasX * newScale, y: h - canvasY * newScale });
  };

  const resetView = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const viewWidth = container.clientWidth;
    const viewHeight = container.clientHeight;
    
    const gridPixelWidth = gridWidth * baseCellSize;
    const gridPixelHeight = gridHeight * baseCellSize;
    
    const scaleX = (viewWidth - 40) / gridPixelWidth;
    const scaleY = (viewHeight - 40) / gridPixelHeight;
    const initialScale = Math.max(0.1, Math.min(1.5, Math.min(scaleX, scaleY)));
    
    setScale(initialScale);
    setOffset({
      x: (viewWidth - gridPixelWidth * initialScale) / 2,
      y: (viewHeight - gridPixelHeight * initialScale) / 2
    });
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        backgroundColor: '#0c0c12',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      />

      {/* Floating Canvas Controls */}
      <div
        className="no-print"
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          display: 'flex',
          gap: '8px',
          backgroundColor: 'rgba(18, 18, 28, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '6px',
          borderRadius: 'var(--radius-sm)',
          zIndex: 10,
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <button
          onClick={zoomIn}
          title="Zoom In"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '18px',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background var(--transition-fast)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          ➕
        </button>
        <button
          onClick={zoomOut}
          title="Zoom Out"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '18px',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background var(--transition-fast)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          ➖
        </button>
        <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />
        <button
          onClick={resetView}
          title="Reset View"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: '600',
            padding: '0 8px',
            height: '32px',
            cursor: 'pointer',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background var(--transition-fast)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          RESET
        </button>
      </div>

      {/* Helper zoom indicator overlay */}
      <div
        className="no-print"
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          color: 'var(--text-secondary)',
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          backgroundColor: 'rgba(18, 18, 28, 0.65)',
          padding: '4px 8px',
          borderRadius: '4px',
          pointerEvents: 'none',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        Zoom: {Math.round(scale * 100)}%
      </div>
    </div>
  );
}
