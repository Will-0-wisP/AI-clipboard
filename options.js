document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(["userPrompt"], (data) => {
      document.getElementById("userPrompt").value = data.userPrompt || "";
    });
  
    document.getElementById("saveSettings").addEventListener("click", () => {
      const userPrompt = document.getElementById("userPrompt").value;
      chrome.storage.local.set({ userPrompt }, () => {
        alert("Settings saved successfully.");
      });
    });
  });