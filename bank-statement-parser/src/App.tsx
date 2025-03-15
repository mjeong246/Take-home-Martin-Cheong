import React, {useState} from 'react';
import './App.css';
import {getPresignedUrl, uploadFile, convertPdfToJson} from './utils/apicalls'
import {cleanJSONData, extractAllMetrics, bankStatementInfo} from './utils/extraction'
import ClipLoader from "react-spinners/ClipLoader";

function App() {
  const [file, setFile] = useState<File | null>(null);

  const [metrics, setMetrics] = useState<bankStatementInfo>({"Name": "MADING DONG",
                                                 "Address": "YA MOM",
                                                 "Total Deposits": "23443",
                                                 "Total ATM Withdrawals": "243422",
                                                 "Total Walmart Purchases": "2322424"})
  const [isParsing, setIsParsing] = useState<Boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    setFile(selectedFile);
  };

  async function handleFileUpload() {
    if (file) {
      setIsParsing(true)
      //Call API to convert uploaded PDF -> JSON
      const [presignedUrl, url] = await getPresignedUrl(file)
      await uploadFile(file, presignedUrl)
      const rawJSONdata = await convertPdfToJson(url)
      const cleanedJSONdata = cleanJSONData(rawJSONdata)

      //Extract relevant information
      const extractedMetrics : bankStatementInfo = extractAllMetrics(cleanedJSONdata)
      setMetrics(extractedMetrics)
      setIsParsing(false)
    }
  }

  return (
    <div className = "wrapper">

  
      <div className="title">Bank Statement Parser</div>

      <div className = "buttonsWrapper">
        <input type="file" onChange={handleFileChange} />
        {isParsing ? 
            <ClipLoader
              color={"white"}
              loading={true}
              size={20}
              aria-label="Loading Spinner"
              data-testid="loader"
            /> : 
          <button onClick={handleFileUpload} disabled={file === null}>Parse Bank Statement</button>
        }
      </div>

      <table>
        {Object.keys(metrics).map((k) => (
        <tr key={k}>
          <td className="metricField">{k}</td>
          <td className="metricValue">{metrics[k as keyof bankStatementInfo]}</td>
        </tr>
        ))}
      </table>
    </div>
  );
};


export default App;
