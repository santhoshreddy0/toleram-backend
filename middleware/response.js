function sendResponse({ code, message = "", data = null, error = [] }) {
    const response = {
      status: code,  
      message,
      data,
      error   
    };
  
    this.status(code).json(response);
  }
  
module.exports = sendResponse;
  

export const getImageUrl =(imageKey)=>{
  return `https://toleram.s3.ap-south-1.amazonaws.com/${imageKey}`
}