const API_BASE_URL = process.env.REACT_APP_API_BASE_URL + '/user';

class UserService {
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

  async getAll() {
    return this.makeRequest('/');
  }

  async getById(id) {
    return this.makeRequest(`/${id}`);
  }

  async create(userData) {
    return this.makeRequest('/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async delete(id) {
    return this.makeRequest(`/${id}`, {
      method: 'DELETE',
    });
  }

  async deposit(id, amount) {
    return this.makeRequest(`/${id}/deposit`, {
      method: 'POST',
      body: JSON.stringify({'ammount': amount}),
    });
  }

  async getBalance(id) {
    return this.makeRequest(`/${id}/balance`);
  }

  async getHoldings(id) {
    return this.makeRequest(`/${id}/holdings`);
  }

  async getAssetAllocation(id) {
    return this.makeRequest(`/${id}/allocation`);
  }

  async getHoldingsPrices(id) {
    return this.makeRequest(`/${id}/holdings/prices`);
  }

  async getTransactions(id) {
    return this.makeRequest(`/${id}/transactions`);
  }

  async getUnrealizedGains(id) {
    return this.makeRequest(`/${id}/unrealizedGains`);
  }

  async getRealizedGains(id) {
    return this.makeRequest(`/${id}/realizedGains`);
  }

}

const userService = new UserService();
export default userService;

export { UserService };
