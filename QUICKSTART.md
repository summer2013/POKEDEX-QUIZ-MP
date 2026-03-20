# Quickstart

## 前置条件

- 微信开发者工具（稳定版）
- 可访问 `https://beta.pokeapi.co/graphql/v1beta`

## 运行

1. 导入仓库根目录（含 `project.config.json`）。
2. AppID 使用正式号或测试号。
3. 编译运行；若请求失败，在开发者工具本地设置中勾选域名校验相关开关（仅开发环境）。

## 冒烟测试

| 操作 | 预期 |
|------|------|
| 首次进入搜索页 | 若本地无 `hasLaunched`，出现欢迎层 |
| 搜索 `pikachu` | 返回结果列表，可点击 variety 进入详情 |
| 搜索无匹配词 | 显示 `h-empty` |
| 翻到末页 | `hasMore` 为 `false`，下一页按钮禁用 |
| 详情页异常 | 显示 `h-empty`，可返回搜索页 |

## 常用调参

| 需求 | 位置 |
|------|------|
| 每页条数 | `pages/search/index.js`：`initPagination(8)` |
| 输入防抖 | `pages/search/index.js`：`debounce(..., 600)` |
| GraphQL URL | `data/pokemon.service.js`：`GraphQLClient.endpoint` |
| 缓存上限 | `data/pokemon.service.js`：`MAX_CACHE_SIZE` |
| 请求超时 | `utils/request.js`：`new Request({ timeout })` |

## 排错

| 现象 | 处理 |
|------|------|
| `request:fail` / 无法连接 | 检查网络、域名校验、代理设置 |
| 服务未注册报错 | 确认 `app.js` 在 `initContainer()` 注册了 `pokemonService` |
| 欢迎层不再出现 | 清除小程序缓存；逻辑依赖 `wx.getStorageSync('hasLaunched')` |

## 评审入口

1. `data/pokemon.service.js` — 查询、缓存、分页判定。
2. `app.js` — IoC 注册与服务解析。
3. `pages/search/index.js` / `pages/detail/index.js` — 页面编排与错误处理。
4. `utils/request.js` / `utils/error-handler.js` — 网络与日志。

完整说明见 `README.md`。
