document.getElementById("scrapeBtn").addEventListener("click", () => {

  // Get the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const activeTab = tabs[0];
      const tabId = activeTab.id;

      // Capture and serialize the HTML content and embedded images
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          function: () => {
            // Code to retrieve HTML content and embedded image sources
            htmlContent = document.documentElement.outerHTML;
            const imageSources = Array.from(document.images).map((img) => img.src);
            const styles = Array.from(document.styleSheets).map((styleSheet) => {
              try {
                if (styleSheet.cssRules) {
                  return Array.from(styleSheet.cssRules)
                    .map((rule) => rule.cssText)
                    .join('\n');
                }
              } catch (e) {
                console.error('Error capturing CSS:', e);
              }
              return '';
            });
            cssContent = styles.join('\n');
            htmlContent = htmlContent.replace('</head>', `<style>${cssContent}</style></head>`);

            // Create an HTML file with embedded images
            const htmlWithImages = htmlContent.replace(/src="([^"]+)"/g, (match, src) => {
              const dataURL = `data:image/png;base64,...`; // You need to convert the image to a data URL
              return `src="${dataURL}"`;
            });
        
            // Create a Blob with the entire HTML
            const htmlBlob = new Blob([htmlWithImages], { type: 'text/html' });
            
            // Create a Blob URL for the HTML file
            const htmlUrl = URL.createObjectURL(htmlBlob);
            
            // Create a download link
            const a = document.createElement('a');
            a.href = htmlUrl;
            const timestamp = new Date().getTime(); // Get the current timestamp
            a.download = `${timestamp}.html`;
            a.style.display = 'none';
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            return { htmlContent, imageSources };
          },
        },
        (result) => {  

        }
      );
    } else {
      console.error("No active tab found.");
    }
  });
});
