import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaTable, FaDownload, FaExpand, FaCompress } from 'react-icons/fa';
import { BsDiagram3Fill } from 'react-icons/bs';

const DiagramPage = ({ metadata }) => {
  const canvasRef = useRef(null);
  const miniMapRef = useRef(null);
  const containerRef = useRef(null);
  const offsetRef = React.useRef({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [scale, setScale] = React.useState(1);
  // Pan state for dragging
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = React.useState(false);
  const panLastRef = React.useRef({ x: 0, y: 0 });
  const panTimeRef = React.useRef(0);
  const panVelocityRef = React.useRef({ x: 0, y: 0 });
  const inertiaRafRef = React.useRef(null);

  useEffect(() => {
    // keep ref in sync with state for callbacks/animations
    offsetRef.current = offset;
  }, [offset]);

  
  useEffect(() => {
    if (!canvasRef.current || Object.keys(metadata).length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Compute layout-driven canvas size to avoid cropping when diagram is large
    const computeAndDraw = () => {
      if (!canvasRef.current) return;
      const parentWidth = canvas.parentElement.clientWidth || 800;

      // Layout constants (mirror the ones in drawERDiagram)
      const tableWidth = 220;
      const tableHeight = 45;
      const tableSpacing = 280;
      const columnHeight = 28;

      // Determine positions to compute required width/height
      const tables = Object.keys(metadata);
      const maxTablesPerRow = Math.max(1, Math.floor(parentWidth / tableSpacing));

      let maxX = 0;
      let maxY = 0;

      tables.forEach((tableName, index) => {
        const row = Math.floor(index / maxTablesPerRow);
        const col = index % maxTablesPerRow;
        const x = 50 + col * tableSpacing;
        const y = 50 + row * 300;

        const cols = metadata[tableName].Columns ? metadata[tableName].Columns.length : 0;
        const bodyHeight = columnHeight * cols;

        maxX = Math.max(maxX, x + tableWidth);
        maxY = Math.max(maxY, y + tableHeight + bodyHeight);
      });

      // Add padding
      const padding = 80;
      const cssWidth = Math.max(parentWidth, Math.ceil(maxX + padding));
      const minHeight = isFullscreen ? 800 : 600;
      const cssHeight = Math.max(minHeight, Math.ceil(maxY + padding));

      // Account for device pixel ratio for crisp canvas on HiDPI screens
      const dpr = window.devicePixelRatio || 1;

      // Set canvas drawing buffer size and CSS size
      canvas.width = Math.floor(cssWidth * dpr);
      canvas.height = Math.floor(cssHeight * dpr);
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;

      // Scale drawing context to DPR so drawing coordinates are in CSS pixels
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Clear canvas (use CSS dimensions for clearRect since ctx is scaled)
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      // When fullscreen, compute a fit-to-viewport scale so diagram fits without scroll
      if (isFullscreen) {
        const viewportW = window.innerWidth - 40; // small margin
        const viewportH = window.innerHeight - 160; // allow header/toolbars space
        const fitScaleW = viewportW / cssWidth;
        const fitScaleH = viewportH / cssHeight;
        const fitScale = Math.max(0.2, Math.min(2.5, Math.min(fitScaleW, fitScaleH)));
        // update scale state only if it differs noticeably to avoid loops
        if (Math.abs(scale - fitScale) > 0.01) {
          setScale(fitScale);
        }
      }

      // Draw tables using CSS width/height
      drawERDiagram(ctx, metadata, cssWidth, cssHeight);
    };

    // Initial draw
    computeAndDraw();

    // Handle window resize
    const handleResize = () => {
      computeAndDraw();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [metadata, scale, isFullscreen]);

  // Mini-map rendering and interaction
  useEffect(() => {
    const mini = miniMapRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!mini || !canvas || !container) return;

    const ctx = mini.getContext('2d');
    const cssWidth = canvas.clientWidth || parseFloat(canvas.style.width) || 800;
    const cssHeight = canvas.clientHeight || parseFloat(canvas.style.height) || 600;

    const miniWidth = 220; // px
    const miniScale = miniWidth / cssWidth;
    const miniHeight = Math.max(120, Math.ceil(cssHeight * miniScale));

    const dpr = window.devicePixelRatio || 1;
    mini.width = Math.floor(miniWidth * dpr);
    mini.height = Math.floor(miniHeight * dpr);
    mini.style.width = `${miniWidth}px`;
    mini.style.height = `${miniHeight}px`;

    // Scale context for DPR and miniScale so we can draw using diagram (CSS) coords
    ctx.setTransform(dpr * miniScale, 0, 0, dpr * miniScale, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    // Draw diagram into mini-map (scaled by transform)
    drawERDiagram(ctx, metadata, cssWidth, cssHeight);

    // Draw viewport rectangle
    const viewportW = container.clientWidth || window.innerWidth;
    const viewportH = container.clientHeight || window.innerHeight;
    const viewX = -offset.x; // diagram coord
    const viewY = -offset.y;
    const viewW = viewportW / scale;
    const viewH = viewportH / scale;

    // Draw rectangle overlay (in diagram coords, transform will scale it)
    ctx.setTransform(dpr * miniScale, 0, 0, dpr * miniScale, 0, 0);
    ctx.lineWidth = 2 / miniScale; // scale back to make consistent thickness
    ctx.strokeStyle = 'rgba(255, 87, 34, 0.9)'; // orange
    ctx.beginPath();
    ctx.rect(viewX, viewY, viewW, viewH);
    ctx.stroke();
  }, [metadata, offset, scale, isFullscreen]);

  // Handle click on mini-map to center viewport
  const onMiniMapClick = (e) => {
    const mini = miniMapRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!mini || !canvas || !container) return;

    const rect = mini.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const cssWidth = canvas.clientWidth || parseFloat(canvas.style.width) || 800;
    const cssHeight = canvas.clientHeight || parseFloat(canvas.style.height) || 600;
    const miniWidth = parseFloat(rect.width);
    const miniScale = miniWidth / cssWidth;

    // Convert click to diagram coords
    const diagramX = clickX / miniScale;
    const diagramY = clickY / miniScale;

    // Center viewport at diagramX/diagramY
    const viewportW = container.clientWidth || window.innerWidth;
    const viewportH = container.clientHeight || window.innerHeight;

    const newOffsetX = -(diagramX - (viewportW / (2 * scale)));
    const newOffsetY = -(diagramY - (viewportH / (2 * scale)));

    const clamped = clampOffset({ x: newOffsetX, y: newOffsetY });
    // animate to clamped position
    animateToOffset(clamped);
  };

  // Clamp offset so panning doesn't reveal too much empty space
  const clampOffset = (raw) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return raw;

    const cssWidth = canvas.clientWidth || parseFloat(canvas.style.width) || 800;
    const cssHeight = canvas.clientHeight || parseFloat(canvas.style.height) || 600;
    const viewportW = container.clientWidth || window.innerWidth;
    const viewportH = container.clientHeight || window.innerHeight;

    // viewport size in diagram (CSS) coordinates
    const viewW = viewportW / scale;
    const viewH = viewportH / scale;

    let minX, maxX;
    if (cssWidth <= viewW) {
      // center horizontally when diagram is smaller than viewport
      const centerX = (viewW - cssWidth) / 2;
      minX = maxX = centerX;
    } else {
      maxX = 0; // don't allow revealing left empty space
      minX = -(cssWidth - viewW); // don't allow revealing right empty space
    }

    let minY, maxY;
    if (cssHeight <= viewH) {
      const centerY = (viewH - cssHeight) / 2;
      minY = maxY = centerY;
    } else {
      maxY = 0;
      minY = -(cssHeight - viewH);
    }

    // Small padding to avoid snapping directly to edges (in diagram coords)
    const padding = 20 / Math.max(0.0001, scale);
    minX += padding;
    minY += padding;
    maxX -= padding;
    maxY -= padding;

    const x = Math.max(minX, Math.min(maxX, raw.x));
    const y = Math.max(minY, Math.min(maxY, raw.y));
    return { x, y };
  };

  // Smoothly animate the offset from current to target over duration (ms)
  const animateToOffset = (target, duration = 220) => {
    const start = performance.now();
    const initial = { ...offsetRef.current };
    if (inertiaRafRef.current) {
      cancelAnimationFrame(inertiaRafRef.current);
      inertiaRafRef.current = null;
    }

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutQuad
      const eased = 1 - (1 - t) * (1 - t);
      const x = initial.x + (target.x - initial.x) * eased;
      const y = initial.y + (target.y - initial.y) * eased;
      setOffset({ x, y });
      if (t < 1) {
        inertiaRafRef.current = requestAnimationFrame(tick);
      } else {
        inertiaRafRef.current = null;
      }
    };

    inertiaRafRef.current = requestAnimationFrame(tick);
  };

  const drawERDiagram = (ctx, metadata, width, height) => {
    const tables = Object.keys(metadata);
    const tableWidth = 220; // Wider tables for better readability
    const tableHeight = 45; // Slightly taller header
    const tableSpacing = 280; // More spacing between tables
    const columnHeight = 28; // Slightly taller column rows

    // Track all foreign key columns for visualization
    const tableForeignKeys = {};
    Object.keys(metadata).forEach(tableName => {
      const table = metadata[tableName];
      if (table.ForeignKeys) {
        tableForeignKeys[tableName] = table.ForeignKeys.map(fk => fk.ColumnName);
      } else {
        tableForeignKeys[tableName] = [];
      }
    });

    // Track all foreign key columns for visualization
    const foreignKeys = {};
    Object.keys(metadata).forEach(tableName => {
      const table = metadata[tableName];
      if (table.ForeignKeys) {
        foreignKeys[tableName] = table.ForeignKeys.map(fk => fk.Column);
      }
    });

    // Calculate layout
    const tablePositions = {};
    const maxTablesPerRow = Math.floor(width / tableSpacing);

    tables.forEach((tableName, index) => {
      const row = Math.floor(index / maxTablesPerRow);
      const col = index % maxTablesPerRow;

      tablePositions[tableName] = {
        x: 50 + col * tableSpacing,
        y: 50 + row * 300
      };
    });

    // Draw tables
    tables.forEach(tableName => {
      const table = metadata[tableName];
      const position = tablePositions[tableName];
      const columnCount = table.Columns.length;

      // Table header
      ctx.fillStyle = '#0d9488'; // teal-600
      ctx.fillRect(position.x, position.y, tableWidth, tableHeight);

      // Table name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Show table name with column count
      const displayText = `${tableName} (${table.Columns.length})`;
      ctx.fillText(displayText, position.x + tableWidth / 2, position.y + tableHeight / 2);

      // Table body
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(position.x, position.y + tableHeight, tableWidth, columnHeight * columnCount);

      // Table columns
      table.Columns.forEach((column, index) => {
        const isPrimaryKey = table.PrimaryKeys.includes(column.Name);
        const isForeignKey = tableForeignKeys[tableName] && tableForeignKeys[tableName].includes(column.Name);

        // Column background
        if (isPrimaryKey) {
          ctx.fillStyle = '#e6f7f5'; // light teal
        } else if (isForeignKey) {
          ctx.fillStyle = '#f0e7f7'; // light purple
        } else {
          ctx.fillStyle = '#ffffff';
        }

        ctx.fillRect(position.x, position.y + tableHeight + (index * columnHeight), tableWidth, columnHeight);

        // Column name
        ctx.fillStyle = '#374151'; // gray-700
        ctx.font = `${isPrimaryKey ? 'bold' : 'normal'} 12px Arial`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        // Add a key icon for primary keys
        if (isPrimaryKey) {
          ctx.fillText('🔑 ' + column.Name, position.x + 10, position.y + tableHeight + (index * columnHeight) + columnHeight / 2);
        } else if (isForeignKey) {
          ctx.fillText('🔗 ' + column.Name, position.x + 10, position.y + tableHeight + (index * columnHeight) + columnHeight / 2);
        } else {
          ctx.fillText(column.Name, position.x + 10, position.y + tableHeight + (index * columnHeight) + columnHeight / 2);
        }

        // Column type
        ctx.fillStyle = '#6b7280'; // gray-500
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(column.Type, position.x + tableWidth - 10, position.y + tableHeight + (index * columnHeight) + columnHeight / 2);
      });

      // Table border
      ctx.strokeStyle = '#d1d5db'; // gray-300
      ctx.lineWidth = 1;
      ctx.strokeRect(position.x, position.y, tableWidth, tableHeight + columnHeight * columnCount);

      // Separator line between header and body
      ctx.beginPath();
      ctx.moveTo(position.x, position.y + tableHeight);
      ctx.lineTo(position.x + tableWidth, position.y + tableHeight);
      ctx.stroke();
    });

    // Draw relationships
    tables.forEach(tableName => {
      const table = metadata[tableName];
      if (!table.ForeignKeys || table.ForeignKeys.length === 0) return;

      table.ForeignKeys.forEach(fk => {
        const sourcePosition = tablePositions[tableName];
        const targetPosition = tablePositions[fk.ReferencedTable];

        if (!sourcePosition || !targetPosition) return;

        // Find the source column position
        const sourceColumnIndex = table.Columns.findIndex(col => col.Name === fk.ColumnName);
        const sourceY = sourcePosition.y + tableHeight + (sourceColumnIndex * columnHeight) + columnHeight / 2;

        // Find the target column position (primary key)
        const targetColumnIndex = metadata[fk.ReferencedTable].Columns.findIndex(col => col.Name === fk.ReferencedColumn);
        const targetY = targetPosition.y + tableHeight + (targetColumnIndex * columnHeight) + columnHeight / 2;

        // Draw relationship line with gradient
        const gradient = ctx.createLinearGradient(
          sourcePosition.x, sourceY,
          targetPosition.x, targetY
        );
        gradient.addColorStop(0, '#8b5cf6'); // purple-500
        gradient.addColorStop(1, '#6d28d9'); // purple-700

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2; // Thicker line for better visibility

        // Add shadow for depth
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        ctx.beginPath();

        // Source side
        ctx.moveTo(sourcePosition.x, sourceY);

        // Control points for curve
        const controlPointX1 = sourcePosition.x - 50;
        const controlPointX2 = targetPosition.x + tableWidth + 50;

        // If source is to the right of target
        if (sourcePosition.x > targetPosition.x) {
          ctx.moveTo(sourcePosition.x, sourceY);
          ctx.lineTo(sourcePosition.x - 10, sourceY);

          // Create curve to target
          ctx.bezierCurveTo(
            sourcePosition.x - 50, sourceY,
            targetPosition.x + tableWidth + 50, targetY,
            targetPosition.x + tableWidth, targetY
          );
        }
        // If source is to the left of target
        else if (sourcePosition.x < targetPosition.x) {
          ctx.moveTo(sourcePosition.x + tableWidth, sourceY);
          ctx.lineTo(sourcePosition.x + tableWidth + 10, sourceY);

          // Create curve to target
          ctx.bezierCurveTo(
            sourcePosition.x + tableWidth + 50, sourceY,
            targetPosition.x - 50, targetY,
            targetPosition.x, targetY
          );
        }
        // If source and target are aligned
        else {
          // If source is above target
          if (sourcePosition.y < targetPosition.y) {
            ctx.moveTo(sourcePosition.x + tableWidth / 2, sourcePosition.y + tableHeight + (table.Columns.length * columnHeight));
            ctx.lineTo(targetPosition.x + tableWidth / 2, targetPosition.y);
          }
          // If source is below target
          else {
            ctx.moveTo(sourcePosition.x + tableWidth / 2, sourcePosition.y);
            ctx.lineTo(targetPosition.x + tableWidth / 2, targetPosition.y + tableHeight + (metadata[fk.ReferencedTable].Columns.length * columnHeight));
          }
        }

        ctx.stroke();

        // Draw arrow at target end
        const arrowSize = 5;
        ctx.fillStyle = '#8b5cf6'; // purple-500

        // Calculate angle of the line at the target end
        let angle;
        if (sourcePosition.x > targetPosition.x) {
          angle = Math.atan2(0, -1); // pointing left
        } else if (sourcePosition.x < targetPosition.x) {
          angle = Math.atan2(0, 1); // pointing right
        } else if (sourcePosition.y < targetPosition.y) {
          angle = Math.atan2(1, 0); // pointing down
        } else {
          angle = Math.atan2(-1, 0); // pointing up
        }

        // Draw arrow
        ctx.beginPath();
        ctx.moveTo(
          sourcePosition.x > targetPosition.x ? targetPosition.x + tableWidth : targetPosition.x,
          targetY
        );
        ctx.lineTo(
          sourcePosition.x > targetPosition.x ? targetPosition.x + tableWidth - arrowSize : targetPosition.x + arrowSize,
          targetY - arrowSize
        );
        ctx.lineTo(
          sourcePosition.x > targetPosition.x ? targetPosition.x + tableWidth - arrowSize : targetPosition.x + arrowSize,
          targetY + arrowSize
        );
        ctx.closePath();
        ctx.fill();
      });
    });
  };

  const handleDownloadDiagram = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'er-diagram.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);

    // Reset pan and optionally adjust zoom when toggling fullscreen
    setOffset({ x: 0, y: 0 });
    if (!isFullscreen) {
      // we'll compute a fit scale in the drawing effect; set a small temporary scale to avoid flashes
      setScale(1.0);
    } else {
      setScale(1.0); // Back to normal when exiting
    }
  };

  const handleZoomIn = () => {
    setScale(Math.min(scale + 0.1, 2.5));
  };

  const handleZoomOut = () => {
    setScale(Math.max(scale - 0.1, 0.4));
  };

  const handleBackFromFullscreen = () => {
    setIsFullscreen(false);
    setScale(1.0); // Reset zoom
  };

  // Pointer-based panning handlers
  const onPointerDown = (e) => {
    // Only left button
    if (e.button !== 0) return;
    // stop any running inertia
    if (inertiaRafRef.current) {
      cancelAnimationFrame(inertiaRafRef.current);
      inertiaRafRef.current = null;
    }
    setIsPanning(true);
    panLastRef.current = { x: e.clientX, y: e.clientY };
    panTimeRef.current = e.timeStamp || Date.now();
    panVelocityRef.current = { x: 0, y: 0 };
    // capture pointer to continue receiving events even outside element
    e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!isPanning) return;
    const last = panLastRef.current;
    const now = e.timeStamp || Date.now();
    const dt = Math.max(1, now - (panTimeRef.current || now));
    const dx = e.clientX - last.x;
    const dy = e.clientY - last.y;

    // Update offset; divide by scale so movement matches visual scale
    setOffset(prev => ({ x: prev.x + dx / scale, y: prev.y + dy / scale }));

    // Compute velocity in CSS pixels per ms
    panVelocityRef.current = { x: (dx / dt), y: (dy / dt) };

    panLastRef.current = { x: e.clientX, y: e.clientY };
    panTimeRef.current = now;
  };

  const onPointerUp = (e) => {
    setIsPanning(false);
    try { e.target.releasePointerCapture && e.target.releasePointerCapture(e.pointerId); } catch (_) {}

    // Start inertia / momentum using the last recorded velocity
    const vx = panVelocityRef.current.x || 0;
    const vy = panVelocityRef.current.y || 0;
    const decay = 0.95; // per frame multiplier
    const minVelocity = 0.001; // px per ms threshold

    let last = performance.now();

    const step = (now) => {
      const dt = now - last;
      last = now;

      // Use the current velocity so decay actually reduces movement over time
      const curVx = panVelocityRef.current.x || 0;
      const curVy = panVelocityRef.current.y || 0;

      // Apply velocity (convert px/ms to px for dt), and account for scale
      const moveX = (curVx * dt) / scale;
      const moveY = (curVy * dt) / scale;

      // Apply movement and clamp to bounds
      setOffset(prev => clampOffset({ x: prev.x + moveX, y: prev.y + moveY }));

      // Decay velocity
      panVelocityRef.current.x *= Math.pow(decay, dt / 16.67);
      panVelocityRef.current.y *= Math.pow(decay, dt / 16.67);

      // Stop when velocities are tiny
      if (Math.abs(panVelocityRef.current.x) < minVelocity && Math.abs(panVelocityRef.current.y) < minVelocity) {
        inertiaRafRef.current = null;
        // snap to clamped position smoothly if needed
        const clamped = clampOffset({ x: (offsetRef.current.x || 0), y: (offsetRef.current.y || 0) });
        if (clamped.x !== (offsetRef.current.x || 0) || clamped.y !== (offsetRef.current.y || 0)) {
          animateToOffset(clamped);
        }
        return;
      }

      inertiaRafRef.current = requestAnimationFrame(step);
    };

    // Start if velocity significant, otherwise clamp the final offset
    if (Math.abs(vx) > minVelocity || Math.abs(vy) > minVelocity) {
      inertiaRafRef.current = requestAnimationFrame(step);
    } else {
      // Ensure we end up inside bounds — animate to it if different
      setTimeout(() => {
        const clamped = clampOffset({ x: (offsetRef.current.x || 0), y: (offsetRef.current.y || 0) });
        if (clamped.x !== (offsetRef.current.x || 0) || clamped.y !== (offsetRef.current.y || 0)) {
          animateToOffset(clamped);
        } else {
          setOffset(clamped);
        }
      }, 0);
    }
  };

  // Add keyboard shortcuts for better UX
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isFullscreen) {
        // ESC key to exit fullscreen
        if (e.key === 'Escape') {
          handleBackFromFullscreen();
        }
        // Plus key for zoom in
        if (e.key === '+' || e.key === '=') {
          handleZoomIn();
        }
        // Minus key for zoom out
        if (e.key === '-' || e.key === '_') {
          handleZoomOut();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, scale]);

  // Keyboard arrow pan handling (always active)
  useEffect(() => {
    const stepBase = 40; // base pixels per key press (CSS pixels)
    const onKey = (e) => {
      const shift = e.shiftKey ? 3 : 1; // faster when shift is held
      let dx = 0, dy = 0;
      if (e.key === 'ArrowLeft') dx = stepBase * -1 * shift;
      if (e.key === 'ArrowRight') dx = stepBase * 1 * shift;
      if (e.key === 'ArrowUp') dy = stepBase * -1 * shift;
      if (e.key === 'ArrowDown') dy = stepBase * 1 * shift;
      if (dx !== 0 || dy !== 0) {
        // Prevent scrolling the page
        e.preventDefault && e.preventDefault();
        setOffset(prev => ({ x: prev.x + dx / scale, y: prev.y + dy / scale }));
      }
    };

    window.addEventListener('keydown', onKey, { passive: false });
    return () => window.removeEventListener('keydown', onKey);
  }, [scale]);

  return (
    <div className="h-full flex flex-col">
      <motion.div
        className="relative bg-gradient-to-br from-blue-600 to-indigo-900 text-white p-6 rounded-b-3xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <motion.div
            className="absolute top-10 right-10 w-40 h-40 bg-blue-400 rounded-full opacity-10"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 10, 0],
              y: [0, -10, 0]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 left-20 w-60 h-60 bg-indigo-500 rounded-full opacity-10"
            animate={{
              scale: [1, 1.1, 1],
              x: [0, -15, 0],
              y: [0, 10, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-900/10 to-transparent"></div>
        </div>

        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center space-x-5">
            {/* Logo */}
            <motion.div
              className="flex items-center justify-center w-14 h-14 bg-indigo-600/50 backdrop-blur-sm rounded-2xl border border-indigo-400/30 shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <BsDiagram3Fill className="text-3xl text-yellow-100" />
                <motion.div
                  className="absolute -right-2 -top-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>

            {/* Title Section */}
            <div>
              <div className="flex items-center mb-1">
                <h3 className="text-3xl font-extrabold tracking-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-200">
                    Entity Relationship Diagram
                  </span>
                </h3>
                <div className="relative ml-3">
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-md blur-sm"></span>
                  <span className="relative px-2.5 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-md border border-white/30">v2.0</span>
                </div>
              </div>
              <p className="text-blue-100 font-light">
                Visual representation of database tables and their relationships
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <motion.button
              onClick={handleZoomIn}
              className="flex items-center justify-center w-9 h-9 bg-indigo-600/40 backdrop-blur-sm rounded-xl border border-indigo-400/30 text-white hover:bg-indigo-500/50 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Zoom in"
            >
              <span className="text-xl font-bold text-yellow-100">+</span>
            </motion.button>

            <motion.button
              onClick={handleZoomOut}
              className="flex items-center justify-center w-9 h-9 bg-indigo-600/40 backdrop-blur-sm rounded-xl border border-indigo-400/30 text-white hover:bg-indigo-500/50 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Zoom out"
            >
              <span className="text-xl font-bold text-yellow-100">-</span>
            </motion.button>

            <motion.button
              onClick={toggleFullscreen}
              className="flex items-center justify-center w-9 h-9 bg-indigo-600/40 backdrop-blur-sm rounded-xl border border-indigo-400/30 text-white hover:bg-indigo-500/50 transition-all duration-200"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <FaCompress className="text-yellow-100" /> : <FaExpand className="text-yellow-100" />}
            </motion.button>

            <motion.button
              onClick={handleDownloadDiagram}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl border border-blue-400/30 text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              title="Download diagram"
            >
              <FaDownload className="text-blue-200" />
              <span className="font-medium">Download</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className={`flex-1 overflow-auto bg-gray-50 p-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-100 pt-16' : ''}`}>
        {isFullscreen && (
          <>
            <div className="fixed top-4 left-4 z-50">
              <button
                onClick={handleBackFromFullscreen}
                className="flex items-center p-2 rounded-md bg-teal-100 text-teal-700 hover:bg-teal-200 shadow-md transition-all"
                title="Exit fullscreen (ESC)"
              >
                <FaCompress className="mr-1" /> Exit Fullscreen
              </button>
            </div>
            <div className="fixed top-4 right-4 z-50 flex space-x-3">
              <button
                onClick={handleZoomIn}
                className="p-2 rounded-md bg-white text-teal-700 hover:bg-teal-50 shadow-md transition-all"
                title="Zoom in (+)"
              >
                <span className="text-xl font-bold">+</span>
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2 rounded-md bg-white text-teal-700 hover:bg-teal-50 shadow-md transition-all"
                title="Zoom out (-)"
              >
                <span className="text-xl font-bold">-</span>
              </button>
              <button
                onClick={handleDownloadDiagram}
                className="p-2 rounded-md bg-white text-teal-700 hover:bg-teal-50 shadow-md transition-all"
                title="Download diagram"
              >
                <FaDownload />
              </button>
            </div>
          </>
        )}
  <div ref={containerRef} className={`bg-white rounded-xl shadow-sm p-4 h-full ${isFullscreen ? 'min-h-screen' : ''}`}>
          {Object.keys(metadata).length > 0 ? (
            <>
              {/* wrapper supports pan + zoom. When fullscreen we compute a fit-to-screen scale (see effect) */}
              <div
                className={`overflow-auto ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                style={{
                  // translate by offset (in CSS pixels) and then scale
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                  transformOrigin: 'top left',
                  transition: isPanning ? 'none' : 'transform 0.12s'
                }}
              >
                <canvas
                  ref={canvasRef}
                  className="bg-white"
                />
              </div>

              {/* Mini-map overlay */}
              <div className="absolute bottom-4 right-4 z-50">
                <div className="bg-white/90 rounded-md p-1 shadow-lg border border-gray-200">
                  <canvas
                    ref={miniMapRef}
                    onClick={onMiniMapClick}
                    className="block"
                    style={{ cursor: 'pointer', display: 'block' }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <FaTable className="mx-auto text-5xl text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 mb-2">No Tables Found</h2>
                <p className="text-gray-500">
                  Connect to a database with tables to generate an ER diagram
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagramPage;
