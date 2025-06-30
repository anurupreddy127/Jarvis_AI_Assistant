import React, { useEffect, useState } from 'react';
import '../css/subscribe.css';

export default function SubscribePage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/offerings")
      .then(res => res.json())
      .then(data => {
        setPackages(data.packages || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading packages:", err);
        setLoading(false);
      });
  }, []);

  return (
    <section className="subscribe-section">
      <h1>Choose Your Plan</h1>
      <p className="subtitle">Get the best deal for our subscriptions</p>

      {loading ? (
        <p>Loading packages...</p>
      ) : packages.length > 0 ? (
        <div className="package-grid">
          {packages.map(pkg => (
            <div key={pkg.id} className="package-card">
              <h2>{pkg.display_name}</h2>
              <p className="lookup">Lookup Key: {pkg.lookup_key}</p>
              <p className="price">$3.99 <span>/ month</span></p>
              <button onClick={() => window.location.href = "https://pay.rev.cat/iuszxgkdyyxezjbw/"}>
                Subscribe
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No packages available.</p>
      )}
    </section>
  );
}
