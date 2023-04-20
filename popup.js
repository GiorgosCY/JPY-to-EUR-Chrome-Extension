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
    convertCurrency(amount);
  });
});

function getSelectionText() {
  return window.getSelection().toString();
}

async function convertCurrency(amount) {
  const fromCurrency = "JPY";
  const toCurrency = "EUR";
  const apiKey = "dc4f2471671a5ce68d466c28";
  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${fromCurrency}/${toCurrency}`;
  const corsProxyUrl = "https://thingproxy.freeboard.io/fetch/";

  try {
    const response = await fetch(corsProxyUrl + url);
    const data = await response.json();

    if (data.result !== 'success') {
      throw new Error('Error fetching exchange rates');
    }

    const rate = data.conversion_rate;
    const convertedAmount = (amount * rate).toFixed(2);
    document.getElementById("result").innerText = `${amount.toLocaleString()} ${fromCurrency} is approximately ${convertedAmount.toLocaleString()} ${toCurrency}.`;
  } catch (error) {
    console.error(error);
    document.getElementById("result").innerText =
      "An error occurred while fetching exchange rates. Please try again later.";
  }
}



  
  
  
  
  