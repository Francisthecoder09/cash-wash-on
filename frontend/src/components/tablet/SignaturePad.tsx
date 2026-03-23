import { Box, Button, Stack } from '@mui/material';
import { PointerEvent, useEffect, useRef } from 'react';

interface SignaturePadProps {
  onChange: (value: string) => void;
}

export function SignaturePad({ onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.lineWidth = 3;
    context.lineCap = 'round';
    context.strokeStyle = '#14b86a';
    context.fillStyle = '#f8fafc';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    drawingRef.current = true;
    context.beginPath();
    context.moveTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
  };

  const draw = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!drawingRef.current || !canvas || !context) return;
    context.lineTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
    context.stroke();
    onChange(canvas.toDataURL('image/png'));
  };

  const stopDrawing = () => {
    drawingRef.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    context.fillStyle = '#f8fafc';
    context.fillRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };

  return (
    <Stack spacing={2}>
      <Box sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(148,163,184,0.25)' }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={280}
          style={{ width: '100%', display: 'block', touchAction: 'none' }}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
        />
      </Box>
      <Button onClick={clear} variant="outlined">Clear Signature</Button>
    </Stack>
  );
}
