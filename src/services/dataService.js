const API_BASE_URL = process.env.REACT_APP_API_BASE_URL + '/data';

class DataService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${error}`);
    }
    return response.json();
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`API request failed: ${error.message}`);
      throw error;
    }
  }

  async getSymbolData(symbol) {
    return this.makeRequest(`/${symbol}`);
  }

  async getAllData() {
    return this.makeRequest(`/`);
  }
}


const dataService = new DataService();
export default dataService;

export { DataService };
