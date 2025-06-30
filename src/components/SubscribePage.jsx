import React, { useEffect, useState } from 'react';

export default function SubscribePage() {
  const [offering, setOffering] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/offerings")
      .then(res => res.json())
      .then(data => {
        console.log("Received offering:", data);
        setOffering(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading offerings:", err);
        setLoading(false);
      });
  }, []);

  return (
    <section style={{ minHeight: '100vh', background: '#111', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      <h2>Available Plans</h2>
      {loading ? (
        <p>Loading...</p>
      ) : offering && offering.display_name ? (
        <p>{offering.display_name}</p> // or render real package info here
      ) : (
        <p>No offerings available</p>
      )}
    </section>
  );
}
