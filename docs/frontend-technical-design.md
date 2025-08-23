# 前端技术设计文档 (Frontend Technical Design)

## 技术架构概览

### 核心技术栈
- **Framework**: Next.js 15 (App Router) + TypeScript
- **UI Library**: shadcn/ui + Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Server Components + Client state hooks
- **Form Handling**: React Hook Form + Zod validation
- **Data Fetching**: Server Components + fetch API
- **Icons**: Lucide React

### 设计系统架构

#### 色彩系统
```typescript
// tailwind.config.js 配置
const colors = {
  // 主色调 - 专业可信赖的蓝色
  primary: {
    50: '#eff6ff',
    500: '#3b82f6', 
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a'
  },
  // 功能色彩
  success: '#10b981',    // 绿色 - 成功状态
  warning: '#f59e0b',    // 橙色 - 提醒
  destructive: '#ef4444', // 红色 - 警告/错误
  // 中性色
  muted: '#64748b',
  border: '#e2e8f0'
}
```

#### 字体系统
```css
font-family: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'Consolas', 'monospace']
}
```

#### 间距系统 (4px基础单位)
`spacing: { 1: '4px', 2: '8px', 3: '12px', 4: '16px', 6: '24px', 8: '32px', 12: '48px' }`

### 响应式设计策略

#### 断点配置
```typescript
const breakpoints = {
  sm: '640px',   // 移动端
  md: '768px',   // 平板端  
  lg: '1024px',  // 桌面端
  xl: '1280px'   // 大桌面端
}
```

#### 布局适配策略
- **移动端 (< 768px)**: 单列布局，底部标签导航，堆叠卡片
- **平板端 (768px-1024px)**: 双列布局，侧边导航，网格卡片
- **桌面端 (> 1024px)**: 多列布局，顶部导航，表格视图

### 组件架构设计

#### 组件层次结构
```
src/components/
├── ui/                 # shadcn/ui 基础组件
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── form.tsx
│   └── ...
├── layout/             # 布局组件
│   ├── header.tsx
│   ├── sidebar.tsx
│   ├── mobile-nav.tsx
│   └── footer.tsx
├── dashboard/          # 仪表板组件
│   ├── stats-cards.tsx
│   ├── progress-chart.tsx
│   └── deadline-calendar.tsx
├── application/        # 申请管理组件
│   ├── application-card.tsx
│   ├── application-form.tsx
│   ├── requirement-list.tsx
│   └── status-badge.tsx
├── university/         # 大学相关组件
│   ├── university-card.tsx
│   ├── university-filters.tsx
│   ├── search-bar.tsx
│   └── comparison-table.tsx
├── shared/             # 通用组件
│   ├── loading-spinner.tsx
│   ├── error-boundary.tsx
│   ├── confirmation-dialog.tsx
│   └── date-picker.tsx
└── forms/              # 表单组件
    ├── student-profile-form.tsx
    ├── application-form.tsx
    └── form-field-components.tsx
```

#### 组件设计原则
1. **单一职责**: 每个组件只负责一个明确的功能
2. **可复用性**: 通过props配置实现不同场景复用
3. **类型安全**: 完整的TypeScript接口定义
4. **可访问性**: 内置ARIA标签和键盘导航支持

### 页面路由架构

#### App Router 结构
```
src/app/
├── (auth)/
│   ├── login/
│   └── register/
├── (student)/
│   ├── dashboard/
│   ├── applications/
│   │   ├── page.tsx
│   │   ├── new/
│   │   └── [id]/
│   ├── universities/
│   │   ├── page.tsx
│   │   └── compare/
│   └── profile/
├── (parent)/
│   ├── dashboard/
│   └── applications/
└── api/               # API Routes (已存在)
```

#### 路由守卫策略
```typescript
// middleware.ts 实现
export async function middleware(request: NextRequest) {
  // JWT验证
  // 角色权限检查
  // 重定向逻辑
}
```

### 状态管理架构

#### 服务器状态 vs 客户端状态
- **服务器状态**: 数据库数据通过Server Components获取
- **客户端状态**: UI交互状态使用React hooks
- **表单状态**: React Hook Form统一管理

#### 数据流模式
```
Database → Server Component → Client Component → User Interaction
    ↑                                               ↓
API Routes ← Form Submission ← Client State Updates
```

### 用户体验设计

#### 设计原则
- **简洁直观**: 界面简洁，操作直观，减少学习成本
- **信息层次**: 重要信息突出显示，次要信息适当弱化
- **一致性**: 保持设计语言和交互模式的一致性
- **响应式**: 适配各种设备和屏幕尺寸

### 性能优化策略

#### 代码分割
- 路由级代码分割（Next.js自动实现）
- 组件懒加载（React.lazy + Suspense）
- 动态导入大型依赖库

#### 图片优化
```typescript
// Next.js Image组件优化
<Image
  src="/university-logo.jpg"
  alt="Stanford University Logo"
  width={120}
  height={80}
  priority={false}
  placeholder="blur"
/>
```

### 错误处理架构

#### 错误边界策略
```typescript
// components/shared/error-boundary.tsx
interface ErrorBoundaryProps {
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}
```

#### 加载状态模式
```typescript
// 统一加载状态接口
interface LoadingState {
  isLoading: boolean
  error: string | null
  data: T | null
}
```

### 测试策略

#### 测试类型
1. **组件测试**: React Testing Library
2. **集成测试**: API路由 + 组件交互
3. **E2E测试**: 关键用户流程（可选，未来实现）

#### 测试覆盖率目标
- 组件覆盖率: > 80%
- 关键业务流程: 100%
- API端点: > 90%

## 实施优先级

### Phase 1: 基础架构 (当前阶段)
- [ ] shadcn/ui 组件库设置
- [ ] 设计系统配置
- [ ] 基础布局组件
- [ ] 路由结构

### Phase 2: 核心功能组件
- [ ] 认证组件
- [ ] 仪表板组件
- [ ] 申请管理组件

### Phase 3: 高级功能
- [ ] 大学搜索和比较
- [ ] 家长端功能
- [ ] 通知系统

## 代码约定

### 命名规范
- **组件**: PascalCase (ApplicationCard.tsx)
- **文件**: kebab-case (application-card.tsx)
- **函数**: camelCase (handleSubmit)
- **常量**: UPPER_SNAKE_CASE (APPLICATION_STATUS)

### 文件组织
```typescript
// 组件文件结构
export interface ComponentProps {
  // TypeScript接口定义
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // 组件实现
}

export default Component
```

### TypeScript 配置
- 严格模式启用
- 路径别名: `@/*` 映射到 `src/*`
- 类型定义集中在 `src/types/`

这个技术设计文档为前端开发提供了全面的架构指导，确保代码质量、用户体验和可维护性。