import GridScan from './GridScan';

function App() {
  return (
    <div className="app-shell">
      <h1>Background Page with GridScan</h1>
      <div className="background-frame">
        <GridScan
          sensitivity={0.55}
          lineThickness={1}
          linesColor="#2F293A"
          gridScale={0.05}
          scanColor="#ffffff"
          scanOpacity={0.4}
          enablePost
          bloomIntensity={0.6}
          chromaticAberration={0.002}
          noiseIntensity={0.01}
          lineJitter={0}
          scanGlow={0.7}
          scanSoftness={3.1}
          style={{ width: '100%', height: '100%', position: 'relative' }}
        />
      </div>
    </div>
  );
}

export default App;
