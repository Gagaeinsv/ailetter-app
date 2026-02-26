import React from "react";

export default function Skeleton() {
  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "sans-serif",
        background: "white"
      }}
    >
      {/* header */}
      <div style={{ marginBottom: "30px" }}>
        <div style={bar(240, 26)} />
        <div style={{ height: 12 }} />
        <div style={bar(160, 12)} />
      </div>

      {/* lines */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={bar("100%", 12)} />
        <div style={bar("95%", 12)} />
        <div style={bar("92%", 12)} />
        <div style={bar("98%", 12)} />
        <div style={bar("85%", 12)} />
        <div style={bar("90%", 12)} />
        <div style={bar("80%", 12)} />
      </div>

      {/* footer */}
      <div style={{ marginTop: "40px" }}>
        <div style={bar(200, 14)} />
      </div>
    </div>
  );
}

function bar(width, height) {
  return {
    width,
    height,
    borderRadius: "6px",
    background:
      "linear-gradient(90deg,#e5e7eb 25%,#f1f5f9 37%,#e5e7eb 63%)",
    backgroundSize: "400% 100%",
    animation: "skeleton 1.4s ease infinite"
  };
}