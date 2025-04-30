import React from 'react';

export default function Login() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Connecte-toi</h1>
        <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
          Se connecter avec Google
        </button>
      </div>
    </div>
  );
}

