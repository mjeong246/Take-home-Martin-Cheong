import {flatten} from 'flat'

const PARSE_FAIL_MSG = "UNABLE TO PARSE"

export interface bankStatementInfo {
  Name: string | null;
  Address: string | null;
  "Total Deposits": string | null;
  "Total ATM Withdrawals": string | null;
  "Total Walmart Purchases": string | null;
}

export function cleanJSONData(jsonData : Record<any, String>) : Array<string> {
    try {
      const flattenedJson : Record<string, any> = flatten(jsonData)
    
      const regex = /\.text$/;
      const filteredData = filterObjectByRegex(flattenedJson, regex);
    
      const dataArray = Object.values(filteredData)
    
      return dataArray

    } catch (e) {
      console.log(`Clean JSON Failed: ${e}`)
      return []
    }
}

function filterObjectByRegex<T extends Record<string, any>>(obj: T, regex: RegExp): Partial<T> {
    const result: Partial<T> = {};
    for (const key in obj) {
      if (regex.test(key) && obj[key] != "") {
        result[key] = obj[key];
      }
    }
    return result;
  }

//Extract Name
function extractName(data : Array<string>) : string {
    try {
      return data[3]
    } catch (e) {
      console.log(`Could not parse name: ${e}`)
      return PARSE_FAIL_MSG
    }
  }
  
//Extract Address
function extractAddress(data : Array<string>) : string {
    try {
      return `${data[4]}, ${data[5]}`
    } catch (e) {
      console.log(`Could not parse address: ${e}`)
      return PARSE_FAIL_MSG
    }
  }
  
//Helper function for converting $1,293 => 1293
function convertCurrencyStringToNumber(currencyString: String): number {
    // Remove the dollar sign and commas
    const cleanedString = currencyString.replace(/[$,]/g, '');
    // Convert the cleaned string to a number
    const numberValue = parseFloat(cleanedString);
    return numberValue;
  }
  
//Extract Total Deposits
function extractTotalDeposits(data : Array<String>) {
    try {
      const i = data.findIndex((v) => v === "+ Deposits and other credits") + 1
      const j = data.findIndex((v) => v === "+ Interest paid") + 1
    
      const totalDeposits = convertCurrencyStringToNumber(data[i]) + convertCurrencyStringToNumber(data[j])
    
      return String(totalDeposits)
    } catch (e) {
      console.log(`Could not parse total deposits: ${e}`)
      return PARSE_FAIL_MSG
    }
  }
  
  
//Extract Total Deposits
function extractTotalATMWithdrawals(data : Array<String>) : string {
    try {
      const start = data.findIndex((v) => v === "Withdrawals and Other Debits") + 4
      const end = data.findIndex((v) => v === "Account Service Charges and Fees") + 1
  
      var totalATMWithdrawals = 0
  
      for (let i = start; i < end-4; i += 4) {
        let description = data[i+1]
        let amount = convertCurrencyStringToNumber(data[i+3])
        if (description === "ATM WITHDRAWAL") {
          totalATMWithdrawals += amount
        }
      }
  
      return String(totalATMWithdrawals)
  
    } catch (e) {
      console.log(`Could not parse total ATM withdrawals: ${e}`)
      return PARSE_FAIL_MSG
    }
  }
  
  //Extract Total Walmart Purchases
function extractTotalWalmartPurchases(data : Array<String>) : string {
    try {
      const start = data.findIndex((v) => v === "Withdrawals and Other Debits") + 4
      const end = data.findIndex((v) => v === "Account Service Charges and Fees") + 1
  
      var totalWalmartPurchases = 0
  
      for (let i = start; i < end-4; i += 4) {
        let description = data[i+1]
        let location = data[i+2]
        let amount = convertCurrencyStringToNumber(data[i+3])
        if (description === "POS PURCHASE" && location.includes("WAL-MART")) {
          totalWalmartPurchases += amount
        }
      }
  
      return String(totalWalmartPurchases)
  
    } catch (e) {
      console.log(`Could not parse total walmart purchases: ${e}`)
      return PARSE_FAIL_MSG
    }
  }
  
  export function extractAllMetrics(data : Array<string>) : bankStatementInfo{

    const name = extractName(data)
    const address = extractAddress(data)
    const totalDeposits = extractTotalDeposits(data)
    const totalATMWithdrawals = extractTotalATMWithdrawals(data)
    const totalWalmartPurchases = extractTotalWalmartPurchases(data)
    
    return {
      Name: name,
      Address: address,
      "Total Deposits": totalDeposits,
      "Total ATM Withdrawals": totalATMWithdrawals,
      "Total Walmart Purchases": totalWalmartPurchases
    };
  }