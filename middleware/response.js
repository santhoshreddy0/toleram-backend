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
  