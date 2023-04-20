ocument.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, { message: "getSelectedText" }, (response) => {
    const selectedText = response.text;
    const amount = parseFloat(selectedText.replace(/,/g, ""));
    if (isNaN(amount)) {
      document.getElementById("result").innerText =
        "Invalid number selected. Please try again.";
      return;
    }
    showLoadingIndicator();
    convertCurrency(amount);
  });
});

function getSelectionText() {
  return window.getSelection().toString();
}

function showLoadingIndicator() {
  document.getElementById("result").innerText = "Converting...";
}

async function convertCurrency(amount) {
  const fromCurrency = "JPY";
  const toCurrency = "EUR";
  const apiKey = "dc4f2471671a5ce68d466c28";
  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${fromCurrency}/${toCurrency}`;
  const corsProxyUrl = "https://thingproxy.freeboard.io/fetch/";

  try {
    let rate = await getExchangeRate(fromCurrency, toCurrency, corsProxyUrl + url);
    const convertedAmount = (amount * rate).toFixed(2);
    document.getElementById("result").innerText = `${amount.toLocaleString()} ${fromCurrency} is approximately ${convertedAmount.toLocaleString()} ${toCurrency}.`;
  } catch (error) {
    console.error(error);
    document.getElementById("result").innerText =
      "An error occurred while fetching exchange rates. Please try again later.";
  }
}

async function getExchangeRate(fromCurrency, toCurrency, url) {
  const cacheKey = `${fromCurrency}_${toCurrency}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
    const { rate, timestamp } = JSON.parse(cachedData);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    if (now - timestamp < oneHour) {
      return rate;
    }
  }

  const response = await fetch(url);
  const data = await response.json();

  if (data.result !== 'success') {
    throw new Error('Error fetching exchange rates');
  }

  const rate = data.conversion_rate;
  const timestamp = Date.now();
  localStorage.setItem(cacheKey, JSON.stringify({ rate, timestamp }));
  return rate;
}



  
  
  
  
  
