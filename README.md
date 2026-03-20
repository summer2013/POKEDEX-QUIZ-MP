# Hilton Pokédex

微信小程序：基于 [PokéAPI GraphQL (beta)](https://beta.pokeapi.co/graphql/v1beta) 的物种搜索与宝可梦详情示例。

## 技术栈

| 项 | 说明 |
|----|------|
| 运行时 | 微信小程序基础库 2.x+（`style: v2`，`lazyCodeLoading: requiredComponents`） |
| 语言 | JavaScript（CommonJS） |
| API | GraphQL POST，`utils/request.js` 封装超时与响应拦截 |
| UI | 全局设计变量 `app.wxss`；原子工具类 `styles/utilities.wxss` |

## 架构

```
pages
  → PokemonService (IoC 单例)
    → PokemonRepository (LRU 风格缓存，容量上限 200)
      → GraphQLClient
        → request.post(endpoint)
```

- **Fragment 复用**：查询字符串在 `data/pokemon.service.js` 内集中管理。
- **分页判定**：`aggregate` 提供 `total`，`hasMore = offset + species.length < total`。
- **IoC 接入**：`app.js` 注册 `pokemonService`，页面通过 `app.getService('pokemonService')` 获取。

## 目录结构

```
├── app.js / app.json / app.wxss
├── data/pokemon.service.js
├── utils/
│   ├── request.js
│   ├── error-handler.js
│   ├── performance.js
│   └── formatters.js
├── mixins/
│   ├── pagination.mixin.js
│   └── loading.mixin.js
├── components/
│   ├── h-loading / h-empty / h-pagination / species-card
├── styles/utilities.wxss
└── pages/search | pages/detail
```

## 页面与组件

| 模块 | 职责 |
|------|------|
| `pages/search` | Pagination + Loading mixin；600ms 防抖搜索；`species-card` 列表 + `h-pagination` |
| `pages/detail` | Loading mixin + `h-loading`；无数据/失败时 `h-empty` |
| `species-card` | 物种卡片 + variety 点击事件 `varietytap` |
| `utils/error-handler.js` | `handleError(error, context)`：Toast + realtime log 上报 |

## 配置与扩展

- **分页大小**：`pages/search/index.js` → `initPagination(8)`。
- **防抖时间**：`pages/search/index.js` → `debounce(..., 600)`。
- **GraphQL 端点**：`data/pokemon.service.js` → `GraphQLClient.endpoint`。
- **缓存容量**：`data/pokemon.service.js` → `MAX_CACHE_SIZE`。
- **主题变量**：`app.wxss` 中 `page { --* }`。

## 限制说明

- 缓存为内存级（进程内），冷启动清空。
- `request` 当前无自动重试机制（仅超时中止 + 拦截器）。
- 依赖第三方 GraphQL 可用性与 schema 稳定性。

## 参考

- [微信小程序框架](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [PokéAPI GraphQL](https://pokeapi.co/docs/graphql)

更短的运行与排错步骤见 `QUICKSTART.md`。
