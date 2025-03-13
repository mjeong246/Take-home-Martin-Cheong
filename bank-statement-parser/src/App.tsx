import React, { useEffect, useState} from 'react';
import logo from './logo.svg';
import './App.css';

// Define types for the function's response
interface PresignedUrlResponse {
  error: boolean;
  message: string;
  presignedUrl: string;
  url: string;
}

function getPresignedUrl(apiKey: string, localFile: File): Promise<[string, string]> {
  return new Promise((resolve, reject) => {
    if (!localFile || !(localFile instanceof File)) {
      reject("Invalid file");
      return;
    }

    // Prepare request to `Get Presigned URL` API endpoint
    const queryPath = `https://api.pdf.co/v1/file/upload/get-presigned-url?contenttype=application/octet-stream&name=${encodeURI(localFile.name)}`;

    // API request options
    const reqOptions: RequestInit = {
      method: 'GET',
      headers: {
        "x-api-key": apiKey,
      },
    };

    // Send request using fetch
    fetch(queryPath, reqOptions)
      .then((response) => response.json())
      .then((data: PresignedUrlResponse) => {
        if (!data.error) {
          console.log(`PresignedUrl:${data.presignedUrl}`)
          console.log(`Url:${data.url}`)
          resolve([data.presignedUrl, data.url]);
        } else {
          reject(`Error: ${data.message}`);
        }
      })
      .catch((error) => {
        reject(`Request failed: ${error}`);
      });
  });
}

// Define the function to upload a file
function uploadFile(apiKey: string, localFile: File, uploadUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Use FileReader to read the file in the browser
    const reader = new FileReader();
    
    // When the file is read successfully
    reader.onload = () => {
      const fileData = reader.result as ArrayBuffer;
      
      // Create a PUT request using fetch
      fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/octet-stream",
          "x-api-key": apiKey, // If needed, you can include the API key in the headers
        },
        body: fileData, // Use the file data read by the FileReader
      })
        .then((response) => {
          console.log(response)
          if (response.ok) {
            console.log("File successfully uploaded")
            resolve(); // Successfully uploaded
          } else {
            reject(`Upload failed: ${response.statusText}`); // Handle response error
          }
        })
        .catch((error) => {
          reject(`Upload failed: ${error.message}`); // Handle network or other errors
        });
    };

    // If an error occurs while reading the file
    reader.onerror = (error) => {
      reject(`File read error: ${error}`);
    };

    // Read the file as an ArrayBuffer
    reader.readAsArrayBuffer(localFile);
  });
}

interface ConvertPdfToJsonProps {
  apiKey: string;
  uploadedFileUrl: string;
  password: string;
  pages: string;
  destinationFile: string;
}


interface ConvertPdfToJsonResponse {
  error: boolean;
  message: string;
  url: string;
}
async function convertPdfToJson(
  apiKey: string,
  uploadedFileUrl: string,
  password: string,
  pages: string, // Can be a range or "all"
  destinationFile: string
): Promise<void> {
  const queryPath = "/v1/pdf/convert/to/json";

  const jsonPayload = JSON.stringify({
    name: destinationFile,
    password: password,
    pages: pages,
    url: uploadedFileUrl,
  });

  const requestOptions: RequestInit = {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
      "Content-Length": new TextEncoder().encode(jsonPayload).length.toString(),
    },
    body: jsonPayload,
  };

  try {
    // Make the API request
    const response = await fetch(`https://api.pdf.co${queryPath}`, requestOptions);
    const data: ConvertPdfToJsonResponse = await response.json();
    const jsonUrl = data.url;
    const jsonData = await fetchJsonFromUrl(jsonUrl)
    console.log(jsonData)

    if (data.error === false) {
      // Log the JSON response
      console.log("PDF to JSON conversion successful:", data);
    } else {
      console.error("convertPdfToJson(): " + data.message);
    }
  } catch (error) {
    console.error("convertPdfToJson(): Error occurred", error);
  }
}

const fetchJsonFromUrl = async (url: string): Promise<any> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch JSON file: ${response.statusText}`);
    }
    const json = await response.json();
    return json;
  } catch (error) {
    console.error(`fetchJsonFromUrl(): ${error}`);
    throw error;
  }
};

const password : string = "";

// Example React component for using the function
function App() {
  const [file, setFile] = useState<File | null>(null);
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    setFile(selectedFile);
  };

  const handleFileUpload = () => {
    const apiKey = "mcheong246@gmail.com_bn1J0dUpYIhmSp21USBVZnQeaHBkjmvu55bAPrXBp9PsM55KuZlp0Td4OVzCLAop"; // Replace with your actual API key

    if (file) {
      getPresignedUrl(apiKey, file)
        .then(([presignedUrl, url]) => {
          setPresignedUrl(presignedUrl); // Store the presigned URL
          uploadFile(apiKey, file, presignedUrl).then(() => {
            //not sure if needs to be presigned or just regular url
            convertPdfToJson(apiKey, url, password, "all", "destinationFile")
          })
        })
        .catch((err) => {
          setError(err); // Handle error
        });
    } else {
      setError("No file selected.");
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload</button>

      {presignedUrl && <p>Presigned URL: {presignedUrl}</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
};


export default App;
