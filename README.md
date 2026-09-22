# 无障碍出行协助平台

面向视障、轮椅和行动不便人群的室内外无障碍路线协助系统，聚合站点、设施、路线、志愿协助与障碍上报流程。

## 设施停用影响评估流程

巡检员在「设施巡检」页对可用设施发起停用，系统执行跨实体影响评估：

1. 扫描所有引用该设施的**进行中路线**（`route_status = ACTIVE`），以及这些路线下状态为待接单 / 已接单 / 已到达的**未完成协助请求**。
2. 若存在高风险路线或已接单（含已到达）请求，**必须填写影响说明**；缺少说明时整次操作返回 `409 IMPACT_NOTE_REQUIRED`，设施状态、路线风险与阻塞说明均不变。
3. 确认后：设施标为 `DISABLED` 并记录影响说明；引用它的进行中路线一律升为 `HIGH` 高风险并写入阻塞说明；未完成请求写入 `blocked_reason`/`blocked_at`，`helper_id` 接单关系与请求状态保留。
4. 已停用设施重复提交只处理一次（返回 `deactivated: false`，不再重复升级或写阻塞）。
5. 设施页列出受影响路线与请求；路线页展示高风险状态与阻塞说明，协助页展示阻塞标记；后端为内存态存储，接口刷新后结果一致，前端在后端不可达时使用本地降级引擎复现同一流程。

接口：`GET /api/accessible-facility/:id/deactivation-impact`（预览）、`POST /api/accessible-facility/:id/deactivate`（确认，body 为 `{"impact_note":"..."}`）。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20101>

后端健康检查：<http://localhost:21101/health>


## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。


## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Ant Design + Zustand |
| 后端 | NestJS + TypeScript + TypeORM |
| 数据库 | PostgreSQL 15 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `accessroute`
- `FRONTEND_PORT`: 前端端口，默认 `20101`
- `BACKEND_PORT`: 后端端口，默认 `21101`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: accessroute`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-accessroute}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- MobilityType: constants/MobilityType、types/MobilityType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- FacilityStatus: AVAILABLE / BLOCKED / MAINTENANCE / UNKNOWN / DISABLED（停用影响评估确认后写入）：constants/FacilityStatus（前后端两份）、types/FacilityStatus、constructors、logTemplates（deactivateScan/deactivate/deactivateRejected）、errorCodes/errorMessages（IMPACT_NOTE_REQUIRED 等）、utils/formatters、筛选器、FacilityTag/StatusBadge 展示组件、DeactivationImpactService、数据库 init.sql 均有引用。
- AssistanceStatus: constants/AssistanceStatus、types/AssistanceStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
