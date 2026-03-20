/**
 * 微信小程序网络请求封装：超时、请求/响应拦截器
 */

class Request {
  constructor(config = {}) {
    this.baseURL = config.baseURL || '';
    this.timeout = config.timeout || 10000;
    this.header = config.header || {};
    
    this.interceptors = {
      request: [],
      response: [],
    };
  }

  // 添加请求拦截器
  use(type, fn) {
    this.interceptors[type].push(fn);
  }

  // 执行拦截器
  async runInterceptors(type, data) {
    for (const fn of this.interceptors[type]) {
      data = await fn(data);
    }
    return data;
  }

  // 核心请求方法
  async request(options) {
    // 1. 应用请求拦截器
    options = await this.runInterceptors('request', {
      url: this.baseURL + options.url,
      method: options.method || 'GET',
      header: { ...this.header, ...options.header },
      data: options.data,
      timeout: options.timeout || this.timeout,
    });

    // 2. 发起请求
    return new Promise((resolve, reject) => {
      let timer = null;
      let requestTask = null;

      // 设置超时
      if (options.timeout) {
        timer = setTimeout(() => {
          requestTask && requestTask.abort();
          reject(new Error('Request timeout'));
        }, options.timeout);
      }

      // 发起请求
      requestTask = wx.request({
        ...options,
        success: async (res) => {
          clearTimeout(timer);
          
          // 3. 应用响应拦截器
          try {
            const result = await this.runInterceptors('response', {
              data: res.data,
              statusCode: res.statusCode,
              header: res.header,
            });
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        fail: (err) => {
          clearTimeout(timer);
          reject(new Error(err.errMsg || 'Network error'));
        },
      });
    });
  }

  // GET 请求
  get(url, params, config = {}) {
    return this.request({
      url,
      method: 'GET',
      data: params,
      ...config,
    });
  }

  // POST 请求
  post(url, data, config = {}) {
    return this.request({
      url,
      method: 'POST',
      data,
      ...config,
    });
  }
}

// 创建实例
const request = new Request({
  timeout: 10000,
  header: {
    'Content-Type': 'application/json',
  },
});

// 添加响应拦截器
request.use('response', (response) => {
  if (response.statusCode !== 200) {
    throw new Error(`HTTP ${response.statusCode}`);
  }
  return response.data;
});

module.exports = request;