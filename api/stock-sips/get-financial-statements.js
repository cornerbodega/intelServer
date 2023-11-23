import axios from "axios";

const alphaVantageApiKey = "XLYPC3HUFEZ8EM9U";
const financialModelingPrepApiKey = "POdsmigbsGN6QQM56ab45lXVcido7Fpr";

async function getFinancialStatements(companyTicker) {
  let balanceSheetLatest = null;
  let incomeStatementLatest = null;
  let cashFlowLatest = null;
  try {
    // Fetch balance sheet data from Alpha Vantage
    const balanceSheetResponse = await axios.get(
      `https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol=${companyTicker}&apikey=${alphaVantageApiKey}`
    );
    // console.log("balanceSheetResponse");
    // console.log(balanceSheetResponse);
    try {
      balanceSheetLatest = balanceSheetResponse.data["annualReports"][0];
    } catch (error) {
      console.error("Error fetching balance sheet data:", error);
      return null;
    }
    // Fetch income statement data from Alpha Vantage
    const incomeStatementResponse = await axios.get(
      `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${companyTicker}&apikey=${alphaVantageApiKey}`
    );
    // console.log("incomeStatementResponse");
    // console.log(incomeStatementResponse);
    try {
      incomeStatementLatest = incomeStatementResponse.data["annualReports"][0];
    } catch (error) {
      console.error("Error fetching income statement data:", error);
      return null;
    }

    // Fetch cash flow data from Alpha Vantage
    const cashFlowResponse = await axios.get(
      `https://www.alphavantage.co/query?function=CASH_FLOW&symbol=${companyTicker}&apikey=${alphaVantageApiKey}`
    );
    // console.log("cashFlowResponse");
    // console.log(cashFlowResponse);
    try {
      cashFlowLatest = cashFlowResponse.data["annualReports"][0];
    } catch (error) {
      console.error("Error fetching cash flow data:", error);
      return null;
    }
    // console.log("cashFlowLatest");
    // console.log(cashFlowLatest);
    // console.log("operatingCashFlow");
    // console.log(operatingCashFlow);

    // Fetch company overview from Financial Modeling Prep
    const profileResponse = await axios.get(
      `https://financialmodelingprep.com/api/v3/profile/${companyTicker}?apikey=${financialModelingPrepApiKey}`
    );
    const profile = profileResponse.data[0];

    // Populate the externalInputs object
    const financialStatements = {
      balanceSheet: balanceSheetLatest,
      incomeStatement: incomeStatementLatest,
      cashFlow: cashFlowLatest,
      profile: profile,
    };
    // const externalInputs = {
    //   totalLiabilities: balanceSheetLatest.totalLiabilities,
    //   totalShareholdersEquity: balanceSheetLatest.totalShareholderEquity,
    //   currentAssets: balanceSheetLatest.totalCurrentAssets,
    //   currentLiabilities: balanceSheetLatest.totalCurrentLiabilities,
    //   ebit: incomeStatementLatest.ebit,
    //   interestExpense: incomeStatementLatest.interestExpense,
    //   netIncome: incomeStatementLatest.netIncome,
    //   operatingCashFlow: cashFlowLatest.operatingCashFlow,
    //   historicalRevenueData: incomeStatementLatest.totalRevenue,
    //   totalRevenue: incomeStatementLatest.totalRevenue,
    //   stockPrice: profile.price,
    //   earningsPerShare: profile.eps,
    //   bookValuePerShare: profile.bookValue,
    //   annualDividend: profile.lastDiv,
    // };

    return financialStatements;
  } catch (error) {
    console.error("Error fetching financial data:", error);
    return null;
  }
}

export default async function getFinancialStatementsHandler(req, res) {
  console.log("GET FINANCIAL STATEMENTS FOR SECURITY ANALYSIS ENDPOINT");
  const { companyTicker } = req.body;
  const financialStatements = await getFinancialStatements(companyTicker);
  // console.log(financialStatements);
  return { financialStatements };
}
