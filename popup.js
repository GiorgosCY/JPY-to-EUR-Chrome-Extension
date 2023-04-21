document.addEventListener("DOMContentLoaded", async () => {
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

function showLoadingIndicator() {
  document.querySelector(".loading").style.display = "block";
  document.getElementById("result").style.display = "none";
}

function hideLoadingIndicator() {
  document.querySelector(".loading").style.display = "none";
  document.getElementById("result").style.display = "block";
}

async function convertCurrency(amount) {
  const fromCurrency = "JPY";
  const fromCurrencyFlag = "<img src='japan_flag.png.svg' class='flag'>"; // Add the flag image
  const toCurrency = "EUR";
  const toCurrencyFlag = "<img src='eu_flag.png.svg' class='flag'>"; // Add the flag image
  const apiKey = "dc4f2471671a5ce68d466c28";
  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${fromCurrency}/${toCurrency}`;
  const corsProxyUrl = "https://thingproxy.freeboard.io/fetch/";

  try {
    let rate = await getExchangeRate(fromCurrency, toCurrency, corsProxyUrl + url);
    const convertedAmount = (amount * rate).toFixed(2);
    const reverseRate = 1 / rate;
    document.getElementById("result").innerHTML = `<strong>${amount.toLocaleString()}</strong> ${fromCurrencyFlag} ${fromCurrency} ≈ <strong>${convertedAmount.toLocaleString()}</strong> ${toCurrencyFlag} ${toCurrency} \n\nExchange Rates:\n1 ${fromCurrency}  = ${rate.toFixed(5)} ${toCurrency} \n1 ${toCurrency}  = ${reverseRate.toFixed(5)} ${fromCurrency} `;
  } catch (error) {
    console.error(error);
    document.getElementById("result").innerText =
      "An error occurred while fetching exchange rates. Please try again later.";
  } finally {
    hideLoadingIndicator();
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
