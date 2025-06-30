import React, { useEffect, useState } from 'react';

export default function SubscribePage() {
  const [offering, setOffering] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/offerings")
      .then(res => res.json())
      .then(data => {
        console.log("Received offering with packages:", data);
        setOffering(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading offerings:", err);
        setLoading(false);
      });
  }, []);

  return (
    <section style={{ minHeight: '100vh', background: '#111', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h2>Available Plans</h2>
      {loading ? (
        <p>Loading...</p>
      ) : offering?.packages?.length > 0 ? (
        offering.packages.map((pkg) => (
          <div key={pkg.identifier} style={{ marginTop: '1rem', border: '1px solid #fff', padding: '1rem', width: '300px', textAlign: 'center' }}>
            <p><strong>{pkg.identifier}</strong></p>
            <p>{pkg.product?.name || 'Unnamed Product'}</p>
            <p>{pkg.product?.price_string || 'Price not available'}</p>
            <button style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>Subscribe</button>
          </div>
        ))
      ) : (
        <p>No packages available</p>
      )}
    </section>
  );
}
