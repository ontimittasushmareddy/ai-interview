/**
 * Media Stream utilities for PrepAI
 * Handles physical device acquisition with audio+video fallback,
 * and generates high-fidelity simulated 30fps canvas video streams
 * if the browser blocks cross-origin iframe media access.
 */

export async function getPhysicalMediaStream(preferAudio = true): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('MediaDevices API not supported');
  }

  if (preferAudio) {
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });
    } catch (err) {
      console.warn('Physical audio+video failed, falling back to video-only:', err);
    }
  }

  return await navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 640 }, height: { ideal: 480 } },
    audio: false,
  });
}

export function createSimulatedCameraStream(candidateName: string): {
  stream: MediaStream;
  stop: () => void;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');

  let animationId: number;
  let frame = 0;
  let running = true;

  const render = () => {
    if (!running || !ctx) return;
    frame++;

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, 640, 480);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 480);

    // Subtle technical grid
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 640; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 480);
      ctx.stroke();
    }
    for (let y = 0; y < 480; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(640, y);
      ctx.stroke();
    }

    // Motion calculations (breathing + gaze)
    const breathing = Math.sin(frame * 0.04) * 3.5;
    const gazeOffsetX = Math.sin(frame * 0.015) * 6;
    const isBlinking = frame % 130 < 5;

    // Silhouette Torso
    ctx.fillStyle = '#312e81';
    ctx.beginPath();
    ctx.ellipse(320, 450 + breathing, 145, 95, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neck
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(305, 300 + breathing, 30, 40);

    // Head
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(320, 235 + breathing, 72, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(320, 220 + breathing, 74, Math.PI, Math.PI * 2);
    ctx.fill();

    // Face detection box overlay
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
    ctx.lineWidth = 2;
    ctx.strokeRect(235, 145 + breathing, 170, 175);

    // Corner brackets on face box
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(230, 160 + breathing);
    ctx.lineTo(230, 140 + breathing);
    ctx.lineTo(250, 140 + breathing);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(385, 140 + breathing);
    ctx.lineTo(410, 140 + breathing);
    ctx.lineTo(410, 160 + breathing);
    ctx.stroke();

    // Eyes
    if (isBlinking) {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(292 + gazeOffsetX, 228 + breathing);
      ctx.lineTo(308 + gazeOffsetX, 228 + breathing);
      ctx.moveTo(332 + gazeOffsetX, 228 + breathing);
      ctx.lineTo(348 + gazeOffsetX, 228 + breathing);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(300 + gazeOffsetX, 228 + breathing, 5.5, 0, Math.PI * 2);
      ctx.arc(340 + gazeOffsetX, 228 + breathing, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Eye highlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(298 + gazeOffsetX, 226 + breathing, 1.8, 0, Math.PI * 2);
      ctx.arc(338 + gazeOffsetX, 226 + breathing, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Natural smile
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(320 + gazeOffsetX * 0.5, 258 + breathing, 18, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // HUD Status Overlays
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(30, 30, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('CAMERA: LIVE SIMULATOR (30 FPS)', 45, 34);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Candidate: ${candidateName}`, 25, 455);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText(`Gaze Tracking: Optimal (88%) • Posture: Centered`, 350, 455);

    animationId = requestAnimationFrame(render);
  };

  render();

  const stream = canvas.captureStream(30);

  return {
    stream,
    stop: () => {
      running = false;
      cancelAnimationFrame(animationId);
      stream.getTracks().forEach((t) => t.stop());
    },
  };
}
