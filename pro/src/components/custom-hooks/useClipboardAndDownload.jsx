import { useState } from 'react';

const useClipboardAndDownload = (activeTable) => {
  const [showCopiedMessage, setShowCopiedMessage] = useState(null);

  const copyToClipboard = (code, section) => {
    navigator.clipboard.writeText(code);
    setShowCopiedMessage(section);
    setTimeout(() => setShowCopiedMessage(null), 2000);
  };

  const downloadCode = (code, fileType) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    let fileName = '';

    switch (fileType) {
      case 'model': fileName = `${activeTable}.cs`; break;
      case 'controller': fileName = `${activeTable}Controller.cs`; break;
      case 'view': fileName = `Index.cshtml`; break;
      case 'form': fileName = `Edit.cshtml`; break;
      default: fileName = `${activeTable}.txt`;
    }

    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    showCopiedMessage,
    copyToClipboard,
    downloadCode,
  };
};

export default useClipboardAndDownload;