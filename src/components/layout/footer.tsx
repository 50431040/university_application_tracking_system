import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="font-semibold">大学申请追踪系统</h3>
            <p className="text-sm text-muted-foreground">
              帮助学生和家长高效管理大学申请流程的综合平台
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">产品功能</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/features" className="hover:text-foreground">申请管理</Link></li>
              <li><Link href="/features" className="hover:text-foreground">进度追踪</Link></li>
              <li><Link href="/features" className="hover:text-foreground">截止日期提醒</Link></li>
              <li><Link href="/features" className="hover:text-foreground">大学比较</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">支持</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/help" className="hover:text-foreground">帮助中心</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">联系我们</Link></li>
              <li><Link href="/faq" className="hover:text-foreground">常见问题</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">法律信息</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground">隐私政策</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">使用条款</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2024 大学申请追踪系统. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  )
}