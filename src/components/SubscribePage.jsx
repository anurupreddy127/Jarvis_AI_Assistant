import React, { useEffect, useState } from 'react';

export default function SubscribePage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/offerings")
      .then(res => res.json())
      .then(data => {
        console.log("Received packages:", data);
        setPackages(data.packages || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading packages:", err);
        setLoading(false);
      });
  }, []);

  return (
    <section style={{ minHeight: '100vh', background: '#111', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <h2>Available Plans</h2>
      {loading ? (
        <p>Loading...</p>
      ) : packages.length > 0 ? (
        packages.map((pkg) => (
          <div key={pkg.id} style={{ marginTop: '1rem', border: '1px solid #fff', borderRadius: '8px', padding: '1rem', width: '300px', textAlign: 'center' }}>
            <p><strong>{pkg.display_name}</strong></p>
            <p>Lookup Key: {pkg.lookup_key}</p>
            <button onClick={() => window.location.href = "https://pay.rev.cat/iuszxgkdyyxezjbw/anurupreddy127"} style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
              Subscribe
            </button>
          </div>
        ))
      ) : (
        <p>No packages available</p>
      )}
    </section>
  );
}
