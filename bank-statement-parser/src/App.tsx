import React, {useState} from 'react';
import './App.css';
import {getPresignedUrl, uploadFile, convertPdfToJson} from './utils/apicalls'
import {cleanJSONData, extractAllMetrics, bankStatementInfo} from './utils/extraction'
import ClipLoader from "react-spinners/ClipLoader";

function App() {
  const [file, setFile] = useState<File | null>(null);

  const [metrics, setMetrics] = useState<bankStatementInfo>({"Name": null,
                                                 "Address": null,
                                                 "Total Deposits": null,
                                                 "Total ATM Withdrawals": null,
                                                 "Total Walmart Purchases": null})
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
      <div>Upload the bank statement as a PDF, then click "Parse Bank Statement" to read the different fields. Note that it takes around 20 seconds for processing.</div>

      <div className = "buttonsWrapper">
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        {isParsing ? 
        <div className="parseStatement">
            <span>Parsing your bank statement...</span>
            <ClipLoader
              color={"white"}
              loading={true}
              size={30}
              aria-label="Loading Spinner"
              data-testid="loader"
              className="clipLoader"
            /> 
        </div>
     : 
          <button onClick={handleFileUpload} disabled={file === null}>Parse Bank Statement</button>
        }
      </div>

      <table align="left">
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
