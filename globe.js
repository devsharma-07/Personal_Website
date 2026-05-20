/**
 * globe.js — Rotating geodesic wireframe sphere
 * Renders a slowly rotating 3D globe using canvas 2D API
 */

(function () {
  const canvas = document.getElementById('globe');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // ── Geometry: icosphere ─────────────────────────────────────
  function createIcosphere(subdivisions) {
    // Base icosahedron vertices
    const t = (1 + Math.sqrt(5)) / 2;
    let verts = [
      [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
      [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
      [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
    ].map(normalize);

    let faces = [
      [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
      [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
      [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
      [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]
    ];

    const midCache = {};
    function getMid(a, b) {
      const key = Math.min(a,b) + '_' + Math.max(a,b);
      if (midCache[key] !== undefined) return midCache[key];
      const mid = normalize([
        (verts[a][0] + verts[b][0]) / 2,
        (verts[a][1] + verts[b][1]) / 2,
        (verts[a][2] + verts[b][2]) / 2
      ]);
      midCache[key] = verts.length;
      verts.push(mid);
      return midCache[key];
    }

    for (let i = 0; i < subdivisions; i++) {
      const newFaces = [];
      for (const [a, b, c] of faces) {
        const ab = getMid(a, b);
        const bc = getMid(b, c);
        const ca = getMid(c, a);
        newFaces.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
      }
      faces = newFaces;
    }

    return { verts, faces };
  }

  function normalize(v) {
    const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    return [v[0]/len, v[1]/len, v[2]/len];
  }

  // ── Build unique edges ──────────────────────────────────────
  const { verts, faces } = createIcosphere(2);
  const edgeSet = new Set();
  const edges = [];
  for (const [a, b, c] of faces) {
    for (const [x, y] of [[a,b],[b,c],[c,a]]) {
      const key = Math.min(x,y) + '_' + Math.max(x,y);
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push([x, y]);
      }
    }
  }

  // Labeled highlight nodes — each dot has a connection label shown on the arc
  const labeledNodes = [
    { idx: 0,  label: "AI"   },
    { idx: 1,  label: "Emotion"   },
    { idx: 3,  label: "Design"    },
    { idx: 5,  label: "Systems"   },
    { idx: 7,  label: "Code"      },
    { idx: 8,  label: "Strategy"  },
    { idx: 10, label: "Research"  },
    { idx: 11, label: "Product"   },
  ];
  const dotIndices = labeledNodes.map(n => n.idx);

  // Pre-build pair → label map  e.g. "0_1" → "Emotion → Finance"
  const pairLabels = {};
  const allPairsStatic = [];
  for (let i = 0; i < labeledNodes.length; i++) {
    for (let j = i + 1; j < labeledNodes.length; j++) {
      const a = labeledNodes[i], b = labeledNodes[j];
      const key = Math.min(a.idx, b.idx) + '_' + Math.max(a.idx, b.idx);
      pairLabels[key] = `${a.label} → ${b.label}`;
      allPairsStatic.push([a.idx, b.idx]);
    }
  }

  // Animation timing for geodesic routes
  let animationTime = 0;
  const drawDuration = 1.0;     // seconds to draw the line
  const holdDuration = 0.5;     // seconds to hold before next
  const cycleDuration = drawDuration + holdDuration;

  // ── Rotation ───────────────────────────────────────────────
  let angleY = 0;
  let angleX = 0.3; // slight tilt

  function rotateY(v, a) {
    const cos = Math.cos(a), sin = Math.sin(a);
    return [v[0]*cos + v[2]*sin, v[1], -v[0]*sin + v[2]*cos];
  }

  function rotateX(v, a) {
    const cos = Math.cos(a), sin = Math.sin(a);
    return [v[0], v[1]*cos - v[2]*sin, v[1]*sin + v[2]*cos];
  }

  // ── Projection ─────────────────────────────────────────────
  function project(v, cx, cy, scale, fov) {
    const z = v[2] + fov;
    const factor = fov / z;
    return [cx + v[0] * scale * factor, cy + v[1] * scale * factor, v[2]];
  }

  // ── Draw ───────────────────────────────────────────────────
  function draw() {
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2;
    const cy = H / 2;
    const scale = W * 0.42;
    const fov = 3.5;

    // Transform vertices
    const transformed = verts.map(v => {
      let r = rotateX(v, angleX);
      r = rotateY(r, angleY);
      return r;
    });

    const projected = transformed.map(v => project(v, cx, cy, scale, fov));

    // Sort edges by average Z for painter's algorithm (back to front)
    const sortedEdges = edges.map(([a, b]) => ({
      a, b,
      z: (transformed[a][2] + transformed[b][2]) / 2
    })).sort((x, y) => x.z - y.z);

    // Draw edges
    for (const { a, b, z } of sortedEdges) {
      const pa = projected[a];
      const pb = projected[b];

      // Depth-based opacity: back edges are lighter
      const depth = (z + 1) / 2; // 0 (back) to 1 (front)
      const alpha = 0.08 + depth * 0.22;

      ctx.beginPath();
      ctx.moveTo(pa[0], pa[1]);
      ctx.lineTo(pb[0], pb[1]);
      ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }

    // Draw geodesic routes connecting dots (animated)
    function cross(a, b) {
      return [
        a[1]*b[2] - a[2]*b[1],
        a[2]*b[0] - a[0]*b[2],
        a[0]*b[1] - a[1]*b[0]
      ];
    }

    function dot(a, b) {
      return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
    }

    // Determine which pair to draw based on animation time
    const cyclePosition = animationTime % cycleDuration;
    const pairIndex = Math.floor(animationTime / cycleDuration) % allPairsStatic.length;
    const [idx1, idx2] = allPairsStatic[pairIndex];
    const v1 = transformed[idx1];
    const v2 = transformed[idx2];

    // Calculate animation progress (0 to 1) for stretching the line
    const drawProgress = Math.min(1, cyclePosition / drawDuration);

    // Skip if both points are behind camera
    if (!(v1[2] < -0.2 && v2[2] < -0.2)) {
      // Calculate great circle path
      const axis = cross(v1, v2);
      const axisLen = Math.sqrt(dot(axis, axis));
      if (axisLen > 0.001) { // points not too close

        const normalAxis = [axis[0]/axisLen, axis[1]/axisLen, axis[2]/axisLen];
        const angle = Math.acos(Math.max(-1, Math.min(1, dot(v1, v2))));

        // Draw geodesic curve with progressive stretching
        const segments = Math.ceil(angle * 20);
        const maxSegment = Math.ceil(segments * drawProgress);
        
        ctx.beginPath();
        let first = true;

        for (let seg = 0; seg <= maxSegment; seg++) {
          const t = seg / segments;
          const currentAngle = angle * t;
          
          // Rodrigues rotation formula
          const cos = Math.cos(currentAngle);
          const sin = Math.sin(currentAngle);
          const oneMinusCos = 1 - cos;
          
          const p = [
            v1[0] * cos + (normalAxis[1]*v1[2] - normalAxis[2]*v1[1]) * sin + normalAxis[0] * dot(normalAxis, v1) * oneMinusCos,
            v1[1] * cos + (normalAxis[2]*v1[0] - normalAxis[0]*v1[2]) * sin + normalAxis[1] * dot(normalAxis, v1) * oneMinusCos,
            v1[2] * cos + (normalAxis[0]*v1[1] - normalAxis[1]*v1[0]) * sin + normalAxis[2] * dot(normalAxis, v1) * oneMinusCos
          ];

          const proj = project(p, cx, cy, scale, fov);

          if (first) {
            ctx.moveTo(proj[0], proj[1]);
            first = false;
          } else {
            ctx.lineTo(proj[0], proj[1]);
          }
        }

        ctx.strokeStyle = `rgba(0, 0, 0, 0.5)`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw connection label at the arc midpoint when fully drawn
        if (drawProgress > 0.5) {
          const labelAlpha = Math.min(1, (drawProgress - 0.5) * 2.5);
          const midT = 0.5;
          const midAngle = angle * midT;
          const cosM = Math.cos(midAngle), sinM = Math.sin(midAngle);
          const omcM = 1 - cosM;
          const mp = [
            v1[0]*cosM + (normalAxis[1]*v1[2] - normalAxis[2]*v1[1])*sinM + normalAxis[0]*dot(normalAxis,v1)*omcM,
            v1[1]*cosM + (normalAxis[2]*v1[0] - normalAxis[0]*v1[2])*sinM + normalAxis[1]*dot(normalAxis,v1)*omcM,
            v1[2]*cosM + (normalAxis[0]*v1[1] - normalAxis[1]*v1[0])*sinM + normalAxis[2]*dot(normalAxis,v1)*omcM,
          ];
          const mProj = project(mp, cx, cy, scale, fov);

          const labelKey = Math.min(idx1,idx2) + '_' + Math.max(idx1,idx2);
          const labelText = pairLabels[labelKey] || '';

          ctx.save();
          ctx.font = '600 11px "DM Sans", sans-serif';
          ctx.letterSpacing = '0.06em';
          const tw = ctx.measureText(labelText).width;

          // Pill background
          const pad = { x: 10, y: 5 };
          const rx = mProj[0] - tw/2 - pad.x;
          const ry = mProj[1] - 8 - pad.y;
          const rw = tw + pad.x*2;
          const rh = 16 + pad.y*2;
          const rr = 20;

          ctx.globalAlpha = labelAlpha * 0.88;
          ctx.fillStyle = '#0d0d0d';
          ctx.beginPath();
          ctx.roundRect(rx, ry, rw, rh, rr);
          ctx.fill();

          // Label text
          ctx.globalAlpha = labelAlpha;
          ctx.fillStyle = '#f0ede8';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(labelText, mProj[0], mProj[1]);
          ctx.restore();
        }
      }
    }

    // Update animation time
    animationTime += 1 / 60; // Assuming ~60fps


    // Draw highlight dots
    for (const idx of dotIndices) {
      const p = projected[idx];
      const t = transformed[idx];
      if (t[2] < -0.2) continue; // hide back dots

      const depth = (t[2] + 1) / 2;
      const alpha = 0.4 + depth * 0.6;
      const radius = 2.5 + depth * 2;

      ctx.beginPath();
      ctx.arc(p[0], p[1], radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.fill();
    }

    angleY += 0.0025; // slow rotation speed
  }

  // ── Resize handling ─────────────────────────────────────────
  function resize() {
    const container = canvas.parentElement;
    const size = Math.min(container.offsetWidth, container.offsetHeight, 720);
    canvas.width = size;
    canvas.height = size;
  }

  window.addEventListener('resize', resize);
  resize();

  // ── Animation loop ──────────────────────────────────────────
  function loop() {
    draw();
    requestAnimationFrame(loop);
  }
  loop();
})();
