
"use client";
import { Stage, Layer, Rect } from "react-konva";

export default function Home() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <Stage width={240} height={120} style={{ background: "white", borderRadius: 8 }}>
        <Layer>
          <Rect x={20} y={20} width={200} height={80} fill="#29b6f6" cornerRadius={12} shadowBlur={8} />
        </Layer>
      </Stage>
    </div>
  );
}
