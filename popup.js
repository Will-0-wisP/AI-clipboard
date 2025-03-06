document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(["copiedText", "aiResponse", "userPrompt"], (data) => {
      document.getElementById("copiedText").textContent = data.copiedText || "No copied text yet.";
      document.getElementById("response").textContent = data.aiResponse || "No response yet.";
      document.getElementById("userPrompt").value = data.userPrompt || "";
    });
  
    document.getElementById("savePrompt").addEventListener("click", () => {
      const prompt = document.getElementById("userPrompt").value;
      chrome.storage.local.set({ userPrompt: prompt }, () => {
        alert("Custom prompt saved.");
      });
    });
  
    document.getElementById("copyButton").addEventListener("click", () => {
      chrome.storage.local.get("aiResponse", (data) => {
        if (data.aiResponse) {
          navigator.clipboard.writeText(data.aiResponse).then(() => {
            alert("Copied AI Response to clipboard");
          }).catch(err => {
            console.error("Clipboard write failed:", err);
          });
        }
      });
    });
  });
  