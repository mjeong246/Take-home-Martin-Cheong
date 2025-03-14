import React, { useEffect, useState} from 'react';
import logo from './logo.svg';
import './App.css';
import {getPresignedUrl, uploadFile, convertPdfToJson} from './utils/apicalls'
import {cleanJSONData, extractAllMetrics} from './utils/extraction'


// Example React component for using the function
function App() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    setFile(selectedFile);
  };

  async function handleFileUpload() {
  
    if (file) {
      //Use API to convert PDF -> JSON
      const [presignedUrl, url] = await getPresignedUrl(file)
      await uploadFile(file, presignedUrl)
      const rawJSONdata = await convertPdfToJson(url)
      const cleanedJSONdata = cleanJSONData(rawJSONdata)

      //Extract relevant information
      const {name, address, totalDeposits, totalATMWithdrawals, totalWalmartPurchases} = extractAllMetrics(cleanedJSONdata)

      console.log(`Name: ${name}`)
      console.log(`Address: ${address}`)
      console.log(`Total Deposits: ${totalDeposits}`)
      console.log(`Total ATM Withdrawals: ${totalATMWithdrawals}`)
      console.log(`Total Walmart Purchases: ${totalWalmartPurchases}`)
    }
  }

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload</button>
    </div>
  );
};


export default App;
