export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', background: '#f9f9f9' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', color: '#222' }}>Welcome to Next.js</h1>
      <p style={{ fontSize: '1.25rem', color: '#555', maxWidth: 480, textAlign: 'center' }}>
        This is a minimal, clean Next.js 15 app. Start building your client-side features here!
      </p>
    </main>
  );
}
