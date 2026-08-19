'use client';

import React from 'react';
import { QuantizedColor } from '../utils/colorQuantizer';

interface ColorLegendProps {
  palette: QuantizedColor[];
  drillShape: 'round' | 'square';
  highlightedColorCode: string | null;
  onHighlightColor: (code: string | null) => void;
}

export default function ColorLegend({
  palette,
  drillShape,
  highlightedColorCode,
  onHighlightColor
}: ColorLegendProps) {
  
  // Total raw drills and buffered drills count
  const totals = React.useMemo(() => {
    let raw = 0;
    let buffered = 0;
    for (const item of palette) {
      raw += item.count;
      buffered += Math.ceil(item.count * 1.10); // 10% buffer
    }
    return { raw, buffered };
  }, [palette]);

  // Export palette to CSV file
  const handleExportCSV = () => {
    const headers = ['DMC Code', 'Color Name', 'Hex Value', 'Symbol', 'Raw Pixel Count', 'Drills Needed (+10% Buffer)'];
    const rows = palette.map(item => [
      item.dmc.code,
      item.dmc.name,
      item.dmc.hex,
      item.symbol,
      item.count.toString(),
      Math.ceil(item.count * 1.10).toString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DMC_Color_Legend_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        padding: '20px',
        gap: '16px'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
          Color Legend & Key
        </h3>
        <button
          onClick={handleExportCSV}
          title="Download DMC list for purchasing drills"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.borderColor = 'var(--text-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
        >
          📥 CSV
        </button>
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
        👉 Click on a color row to <strong>highlight</strong> only those drills on the canvas.
      </div>

      {/* Palette list scroll container */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          paddingRight: '4px'
        }}
      >
        {palette.map((item) => {
          const isSelected = highlightedColorCode === item.dmc.code;
          const bufferedCount = Math.ceil(item.count * 1.10);
          
          // Determine contrast color inside swatch
          const r = item.dmc.r;
          const g = item.dmc.g;
          const b = item.dmc.b;
          const u = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
          });
          const luminance = u[0] * 0.2126 + u[1] * 0.7152 + u[2] * 0.0722;
          const contrastColor = luminance > 0.45 ? '#000000' : '#ffffff';

          return (
            <div
              key={item.dmc.code}
              onClick={() => onHighlightColor(isSelected ? null : item.dmc.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid',
                borderColor: isSelected ? 'var(--accent-purple)' : 'transparent',
                backgroundColor: isSelected ? 'rgba(168, 85, 247, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              {/* Color Swatch Badge */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: drillShape === 'round' ? '50%' : '4px',
                  backgroundColor: item.dmc.hex,
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: contrastColor,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginRight: '12px',
                  boxShadow: 'var(--shadow-sm)',
                  flexShrink: 0
                }}
              >
                {item.symbol}
              </div>

              {/* DMC details */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  DMC {item.dmc.code}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                  {item.dmc.name}
                </span>
              </div>

              {/* Quantity Counts */}
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-cyan)' }} title="Required drills including safety margin">
                  {bufferedCount.toLocaleString()}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }} title="Raw canvas coordinates count">
                  ({item.count.toLocaleString()} px)
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer stats summary */}
      <div
        style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '14px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Unique Colors
          </span>
          <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {palette.length}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'right' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Drills (+10%)
          </span>
          <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--accent-purple)' }}>
            {totals.buffered.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
