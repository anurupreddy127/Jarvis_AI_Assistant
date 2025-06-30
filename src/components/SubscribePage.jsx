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
    <section className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-6 py-12">
      <div className="max-w-5xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-gray-400">Get the best deal for our subscriptions</p>
      </div>

      {loading ? (
        <p className="text-center text-gray-300">Loading packages...</p>
      ) : packages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-center items-center max-w-6xl mx-auto">
          {packages.map(pkg => (
            <div key={pkg.id} className="bg-gray-800 rounded-xl p-6 shadow-lg flex flex-col items-center text-center">
              <h2 className="text-xl font-semibold mb-1">{pkg.display_name}</h2>
              <p className="text-gray-400 text-sm mb-2">Lookup Key: <span className="italic">{pkg.lookup_key}</span></p>
              <p className="text-2xl font-bold mb-4">$3.99 <span className="text-sm text-gray-400">/ month</span></p>
              <button
                onClick={() => window.location.href = "https://pay.rev.cat/iuszxgkdyyxezjbw/"}
                className="mt-auto bg-indigo-600 hover:bg-indigo-700 transition-colors px-6 py-2 rounded-full font-medium"
              >
                Subscribe
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-red-400 mt-10">No packages available.</p>
      )}
    </section>
  );
}
