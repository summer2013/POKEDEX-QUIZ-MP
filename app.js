/**
 * Hilton Pokédex - Application Entry
 * 企业级微信小程序架构
 */

// ==================== IoC Container ====================
class Container {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
  }

  static getInstance() {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  registerSingleton(name, factory) {
    this.services.set(name, { type: 'singleton', factory });
    return this;
  }

  resolve(name) {
    if (this.singletons.has(name)) {
      return this.singletons.get(name);
    }

    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service '${name}' not found`);
    }

    if (service.type === 'singleton') {
      const instance = service.factory(this);
      this.singletons.set(name, instance);
      return instance;
    }

    return service.factory(this);
  }
}

// ==================== Application ====================
App({
  container: null,

  globalData: {
    isFirstLaunch: true,
    searchCache: {},
  },

  onLaunch() {
    console.log('🚀 Hilton Pokédex Launched');
    this.initContainer();
    this.checkFirstLaunch();
  },

  initContainer() {
    this.container = Container.getInstance();
    console.log('📦 IoC Container initialized');
  },

  checkFirstLaunch() {
    try {
      const launched = wx.getStorageSync('hasLaunched');
      this.globalData.isFirstLaunch = !launched;
      if (!launched) {
        wx.setStorageSync('hasLaunched', true);
      }
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  getService(name) {
    return this.container.resolve(name);
  },
});
