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
    <section className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-start px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
      <p className="mb-6 text-gray-400">Get the best deal for our subscriptions</p>

      {loading ? (
        <p>Loading packages...</p>
      ) : packages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map(pkg => (
            <div key={pkg.id} className="bg-gray-800 rounded-xl p-6 shadow-lg w-full max-w-sm">
              <h2 className="text-xl font-semibold">{pkg.display_name}</h2>
              <p className="text-gray-400 text-sm mt-1">Lookup Key: {pkg.lookup_key}</p>
              <p className="mt-3 text-lg">$3.99 / month</p>
              <button
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded"
                onClick={() => window.location.href = "https://pay.rev.cat/iuszxgkdyyxezjbw/"} // Replace with your custom logic later
              >
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
