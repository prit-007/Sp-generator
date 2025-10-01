import { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const useClipboardAndDownload = (activeTable) => {
  const [showCopiedMessage, setShowCopiedMessage] = useState(null);

  const copyToClipboard = (code, section) => {
    navigator.clipboard.writeText(code);
    setShowCopiedMessage(section);
    setTimeout(() => setShowCopiedMessage(null), 2000);
  };

  const downloadAsFile = (code, fileName, mimeType = 'text/plain') => {
    const blob = new Blob([code], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    // If fileName is not provided, generate it based on activeTable and fileType
    if (!fileName) {
      let fileType = mimeType;
      switch (fileType) {
        case 'model': fileName = `${activeTable}.cs`; break;
        case 'controller': fileName = `${activeTable}Controller.cs`; break;
        case 'view': fileName = `Index.cshtml`; break;
        case 'form': fileName = `Edit.cshtml`; break;
        default: fileName = `${activeTable}.txt`;
      }
    }

    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Function to download multiple files as a ZIP archive
  // Accepts either an array of file objects or an object with filename:content pairs
  const downloadAsZip = async (files, zipName = 'download.zip') => {
    try {
      const zip = new JSZip();
      
      if (Array.isArray(files)) {
        // Handle array of file objects format
        files.forEach(file => {
          const { content, filename, folder } = file;
          if (folder) {
            zip.folder(folder).file(filename, content);
          } else {
            zip.file(filename, content);
          }
        });
      } else if (typeof files === 'object') {
        // Handle object format where keys are filenames and values are content
        Object.entries(files).forEach(([filename, content]) => {
          zip.file(filename, content);
        });
      } else {
        throw new Error('Invalid files format. Must be array or object.');
      }
      
      // Generate the zip file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      
      // Save the zip file using FileSaver
      saveAs(zipBlob, zipName);
      
      return true;
    } catch (error) {
      console.error("Error creating ZIP file:", error);
      return false;
    }
  };

  return {
    showCopiedMessage,
    copyToClipboard,
    downloadAsFile,
    downloadAsZip
  };
};

export default useClipboardAndDownload;