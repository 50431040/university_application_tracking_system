# 后端技术设计文档

## 1. 技术架构概览

### 1.1 架构选择
- **框架**: Next.js 15 App Router (全栈框架，API Routes + React)
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: NextAuth.js 5.0 (JWT策略)
- **部署**: Vercel + Supabase

### 1.2 架构原则
- **RESTful API设计**: 遵循REST原则，资源导向
- **分层架构**: Controller → Service → Repository → Database
- **职责分离**: 认证、授权、业务逻辑、数据访问分离
- **防御式编程**: 输入验证、错误处理、安全防护

## 2. API设计规范

### 2.1 路由结构
```
/api/
├── auth/              # 认证相关
│   ├── login          # POST 用户登录
│   ├── register       # POST 用户注册
│   └── logout         # POST 用户登出
├── student/           # 学生操作
│   ├── profile        # GET/PUT 学生档案
│   ├── applications   # GET/POST/PUT/DELETE 申请管理
│   └── dashboard      # GET 仪表板数据
├── parent/            # 家长操作
│   ├── students       # GET 关联学生列表
│   ├── notes         # GET/POST/PUT/DELETE 家长笔记
│   └── dashboard      # GET 家长仪表板
├── universities/      # 大学相关
│   ├── search         # GET 大学搜索
│   ├── [id]          # GET 大学详情
│   └── requirements   # GET 大学要求
└── applications/      # 申请详情
    └── [id]/
        └── requirements # GET/PUT 申请要求
```

### 2.2 HTTP方法规范
- **GET**: 查询数据，无副作用
- **POST**: 创建新资源
- **PUT**: 更新整个资源
- **PATCH**: 部分更新资源
- **DELETE**: 删除资源

### 2.3 状态码标准
- **200**: 成功
- **201**: 创建成功
- **400**: 客户端错误
- **401**: 未认证
- **403**: 无权限
- **404**: 资源不存在
- **409**: 资源冲突
- **422**: 参数验证失败
- **500**: 服务器错误

## 3. 数据安全与验证

### 3.1 输入验证策略
- **Zod Schema验证**: 所有API入参使用Zod进行类型和格式验证
- **数据清理**: XSS防护，SQL注入防护
- **业务规则验证**: GPA(0.00-4.00)、SAT(400-1600)、ACT(1-36)

### 3.2 认证授权机制
- **JWT Token**: NextAuth.js生成，包含用户ID和角色
- **会话管理**: 安全的session存储和过期处理
- **权限控制**: 基于角色的访问控制(RBAC)

### 3.3 数据保护
- **密码安全**: bcrypt哈希存储
- **敏感数据**: 环境变量存储配置信息
- **访问控制**: 用户只能访问自己的数据，家长只能访问关联学生数据

## 4. API响应格式

### 4.1 成功响应
```typescript
// 单个资源
{
  "data": { ...resource },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0"
  }
}

// 列表资源
{
  "data": [...resources],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    },
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### 4.2 错误响应
```typescript
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Email is required"
    }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req_123"
  }
}
```

### 4.3 错误代码标准
- `VALIDATION_ERROR`: 输入验证失败
- `AUTHENTICATION_ERROR`: 认证失败
- `AUTHORIZATION_ERROR`: 权限不足
- `RESOURCE_NOT_FOUND`: 资源不存在
- `RESOURCE_CONFLICT`: 资源冲突
- `INTERNAL_ERROR`: 服务器内部错误

## 5. 中间件设计

### 5.1 认证中间件
- 验证JWT token有效性
- 提取用户信息到请求上下文
- 处理token过期和刷新

### 5.2 授权中间件
- 基于角色的权限检查
- 资源所有权验证
- 访问日志记录

### 5.3 验证中间件
- 请求体Zod schema验证
- 查询参数类型转换
- 文件上传大小限制

## 6. 业务逻辑层

### 6.1 Service层职责
- 业务逻辑封装
- 数据转换和计算
- 跨模型操作协调
- 业务规则验证

### 6.2 Repository层职责
- 数据库操作抽象
- Prisma客户端封装
- 查询优化
- 事务管理

## 7. 错误处理策略

### 7.1 异常分类
- **业务异常**: 业务规则违反，返回4xx状态码
- **系统异常**: 技术故障，返回5xx状态码
- **验证异常**: 输入格式错误，返回422状态码

### 7.2 错误处理流程
1. 捕获异常
2. 分类异常类型
3. 记录错误日志
4. 返回标准化错误响应
5. 不暴露敏感系统信息

## 8. 性能优化

### 8.1 数据库优化
- 索引策略: 查询频繁的字段建立索引
- 连接池: Prisma连接池配置
- 查询优化: 避免N+1查询，使用include/select

### 8.2 API优化
- 分页查询: 大数据集分页返回
- 缓存策略: 静态数据缓存
- 压缩响应: gzip压缩

## 9. 监控与日志

### 9.1 日志策略
- 结构化日志记录
- 错误堆栈跟踪
- 性能指标监控
- 敏感信息脱敏

### 9.2 健康检查
- 数据库连接检查
- 服务依赖检查
- 系统资源监控

## 10. 开发规范

### 10.1 代码组织
```
src/app/api/
├── auth/              # 认证模块
├── student/          # 学生模块
├── parent/           # 家长模块
├── universities/     # 大学模块
└── _lib/            # 共享工具
    ├── middleware/   # 中间件
    ├── validators/   # 验证器
    ├── services/     # 业务服务
    ├── repositories/ # 数据访问
    └── utils/       # 工具函数
```

### 10.2 类型定义
- API请求/响应类型
- 业务实体类型
- 错误类型定义
- 中间件类型

### 10.3 测试策略
- 单元测试: 业务逻辑和工具函数
- 集成测试: API端点完整流程
- 数据库测试: 使用测试数据库

## 11. 部署配置

### 11.1 环境变量
```env
# 数据库
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# 认证
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="..."
JWT_SECRET="..."

# 可选: Supabase
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

### 11.2 生产环境优化
- 数据库连接池配置
- 错误监控集成
- 性能监控设置
- 安全头配置