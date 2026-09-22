# 无障碍出行协助平台

面向视障、轮椅和行动不便人群的室内外无障碍路线协助系统，聚合站点、设施、路线、志愿协助与障碍上报流程。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20101>

后端健康检查：<http://localhost:21101/health>


## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`（Vite 开发服务器将 `/api` 代理到 `http://localhost:3000`，可用 `VITE_API_TARGET` 覆盖）
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。

## 停用影响评估（设施停用联动）

巡检员在「设施巡检」页对设施发起停用时，系统先执行影响评估，再决定是否落库：

1. **扫描**（`GET /api/accessible-facility/:id/deactivation-impact`）：扫描引用该设施的**进行中路线**（`IN_PROGRESS`）与**未完成协助请求**（`REQUESTED/ACCEPTED/ARRIVED`）。
2. **拒绝规则**：存在高风险路线或已接单（`ACCEPTED/ARRIVED` 且有 `helper_id`）请求时，缺少影响说明则整次拒绝（HTTP 409 `IMPACT_NOTE_REQUIRED`），设施状态、路线风险与阻塞说明均不变。
3. **确认联动**（`PATCH /api/accessible-facility/:id/deactivate`）：设施标为 `DISABLED`；相关进行中路线风险统一升为 `HIGH` 并写入阻塞说明；未完成协助请求写入阻塞原因，**接单关系（`helper_id`、状态）保留**；已完成/已取消路线与终态请求不处理。
4. **幂等**：重复提交返回 `already_processed: true`，不重复处理，阻塞说明保持首次结果。
5. **一致性**：设施页列出受影响路线与被阻塞请求；路线页、协助页、总览页显示新状态与阻塞原因；所有数据来自后端重读，刷新后一致。

接口默认角色为 `admin`，可通过 `x-role` 请求头模拟；停用接口仅 `FACILITY_INSPECTOR / FACILITY_ADMIN` 可用（见 `rbacMiddleware`）。

## 枚举/常量出现位置清单

- MobilityType:
  - 后端：`backend/src/constants/MobilityType.ts`
  - 前端：`frontend/src/constants/MobilityType.ts`、`frontend/src/types/MobilityType.ts`、`frontend/src/constants/statusText.ts`
  - 引用面：constructors、logTemplates、errorMessages、筛选器、展示组件。
- FacilityStatus（含新增 `DISABLED`）:
  - 后端：`constants/FacilityStatus.ts`、`models/AccessibleFacility.ts`、`constructors/AccessibleFacilityDtoFactory.ts`、`services/AccessibleFacilityService.ts`、`repositories/AccessibleFacilityRepository.ts`、`seed.ts`、`database/init.sql`
  - 前端：`constants/FacilityStatus.ts`、`types/FacilityStatus.ts`、`types/AccessibleFacility.ts`、`constants/statusText.ts`、`utils/formatters.ts`（`formatFacilityStatus`）、`constructors/AccessibleFacilityConstructor.ts`、设施页状态筛选器、`StatusBadge` 展示、`mocks/seedData.ts`
- AssistanceStatus:
  - 后端：`constants/AssistanceStatus.ts`、`constants/AssistanceFlow.ts`（未完成/已接单分组）、`models/AssistanceRequest.ts`、`constructors/AssistanceRequestDtoFactory.ts`、`repositories/AssistanceRequestRepository.ts`、`seed.ts`
  - 前端：`constants/AssistanceStatus.ts`、`types/AssistanceStatus.ts`、`constants/statusText.ts`、`utils/formatters.ts`（`formatAssistanceStatus`）、协助页状态筛选器、`StatusBadge/TimelineList` 展示。
- RoutePlanStatus（`IN_PROGRESS/COMPLETED/CANCELLED`，停用评估新增）:
  - 后端：`constants/RoutePlanStatus.ts`、`models/RoutePlan.ts`、`constructors/RoutePlanDtoFactory.ts`、`repositories/RoutePlanRepository.ts`、`seed.ts`、`database/init.sql`
  - 前端：`constants/RoutePlanStatus.ts`、`types/RoutePlan.ts`、`constants/statusText.ts`、`utils/formatters.ts`（`formatRouteStatus`）、路线页筛选器。
- RouteRiskLevel（`LOW/MEDIUM/HIGH`，停用确认后统一升 `HIGH`）:
  - 后端：`constants/RouteRiskLevel.ts`；前端：`constants/RouteRiskLevel.ts`、`utils/formatters.ts`（`formatRisk`）、`RouteRiskPanel`。
- 阻塞原因模板：后端 `constants/blockReasons.ts`（`buildFacilityBlockReason`），落库到 `route_plan.block_reason` 与 `assistance_request.block_reason`。
- 停用评估错误码：前后端 `constants/errorCodes.ts` 同步新增 `FACILITY_NOT_FOUND / FACILITY_ALREADY_DISABLED / IMPACT_NOTE_REQUIRED`，文案见 `constants/errorMessages.ts`。
- 停用评估日志模板：前后端 `constants/logTemplates.ts` 中 `AccessibleFacility[4..7]`（扫描/拒绝/确认/幂等跳过）、`RoutePlan[4]`（风险升级）、`AssistanceRequest[4]`（请求阻塞）。


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

完整清单见上方「停用影响评估」一节之后的分组说明（前后端 constants / types / constructors / repositories / seed / init.sql / formatters / 筛选器 / 展示组件均逐一列出）。核心枚举为：

- MobilityType: `BLIND / LOW_VISION / WHEELCHAIR / ELDERLY / TEMPORARY_INJURY`
- FacilityStatus: `AVAILABLE / BLOCKED / MAINTENANCE / DISABLED / UNKNOWN`
- AssistanceStatus: `REQUESTED / ACCEPTED / ARRIVED / COMPLETED / CANCELLED`
- RoutePlanStatus: `IN_PROGRESS / COMPLETED / CANCELLED`
- RouteRiskLevel: `LOW / MEDIUM / HIGH`

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。以「设施停用影响评估」为例，一次确认停用会跨 `AccessibleFacility → RoutePlan → AssistanceRequest` 三条实体链路：状态枚举（`DISABLED`）、风险常量（`HIGH`）、阻塞原因模板、错误码（`IMPACT_NOTE_REQUIRED`）、日志模板（扫描/拒绝/确认/幂等）、RBAC、DTO 工厂、前端 hook/弹窗/三个页面与 `init.sql` 必须同时变更。

## License

MIT
