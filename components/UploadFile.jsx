import React, { useState } from 'react';
import * as XLSX from 'xlsx';

function UploadFile({ onDataLoaded }) {
  const [fileName, setFileName] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      onDataLoaded(jsonData); // on envoie les données au parent
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-4 border rounded shadow-md bg-white">
      <label className="block mb-2 text-lg font-semibold">Upload your contact list (Excel/CSV):</label>
      <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
      {fileName && <p className="mt-2 text-sm text-gray-500">Fichier sélectionné : {fileName}</p>}
    </div>
  );
}

export default UploadFile;
