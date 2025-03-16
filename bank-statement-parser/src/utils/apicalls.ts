
const API_KEY = process.env.REACT_APP_API_KEY!;

interface PresignedUrlResponse {
    error: boolean;
    message: string;
    presignedUrl: string;
    url: string;
}

interface ConvertPdfToJsonResponse {
    error: boolean;
    message: string;
    url: string
}

export function getPresignedUrl(localFile: File): Promise<[string, string]> {
    return new Promise((resolve, reject) => {
      if (!localFile || !(localFile instanceof File)) {
        reject("Invalid file");
        return;
      }
  
      //Prepare request to `Get Presigned URL` API endpoint
      const queryPath = `https://api.pdf.co/v1/file/upload/get-presigned-url?contenttype=application/octet-stream&name=${encodeURI(localFile.name)}`;
  
      const reqOptions: RequestInit = {
        method: 'GET',
        headers: {
          "x-api-key": API_KEY,
        },
      };
  
      //Send request
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

export function uploadFile(localFile: File, uploadUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {

      const reader = new FileReader();
      
      reader.onload = () => {
        const fileData = reader.result as ArrayBuffer;
        
        fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/octet-stream",
            "x-api-key": API_KEY,
          },
          body: fileData,
        })
          .then((response) => {
            console.log(response)
            if (response.ok) {
              console.log("File successfully uploaded")
              resolve();
            } else {
              reject(`Upload failed: ${response.statusText}`);
            }
          })
          .catch((error) => {
            reject(`Upload failed: ${error.message}`);
          });
      };
  
      reader.onerror = (error) => {
        reject(`File read error: ${error}`);
      };
  
      reader.readAsArrayBuffer(localFile);
    });
}


export async function convertPdfToJson(uploadedFileUrl: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const queryPath = "/v1/pdf/convert/to/json2";
  
    const jsonPayload = JSON.stringify({
      name: "destinationFile",
      password: "",
      pages: "",
      url: uploadedFileUrl,
    });

    console.log(API_KEY)
  
    const requestOptions: RequestInit = {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
        "Content-Length": new TextEncoder().encode(jsonPayload).length.toString(),
      },
      body: jsonPayload,
    };
  
    try {
      //Make the API request
      const response = await fetch(`https://api.pdf.co${queryPath}`, requestOptions);
      const data: ConvertPdfToJsonResponse = await response.json();
      const jsonUrl = data.url;
      const jsonData = await fetchJsonFromUrl(jsonUrl)
      resolve(jsonData)
  
    } catch (error) {
      reject(error)
    }
    })
  }

export async function fetchJsonFromUrl(url: string): Promise<any> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch JSON file: ${response.statusText}`);
      }
      const json = await response.json();
      return json
    } catch (error) {
      console.error(`fetchJsonFromUrl(): ${error}`);
      throw error;
    }
  };
