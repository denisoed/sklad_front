const useImage = () => {
  function formatBase64ToFile(dataurl, filename) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
        
    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  }

  function formatFileToBase64(file) {
    if (!file) return null
    const fileName = new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        resolve(reader.result)
      }
      reader.onerror = error => {
        reject(error)
      }
    })
    return fileName
  }

  function filterImgBySize(images, maxSize) {
    try {
      return [...images].filter(img => {
        const imgSize = (img.size / 1024);
        return imgSize <= maxSize;
      });
    } catch (err) {
      if (err) throw err;
    }
  }


  return {
    formatBase64ToFile,
    formatFileToBase64,
    filterImgBySize,
  }
}

export default useImage
