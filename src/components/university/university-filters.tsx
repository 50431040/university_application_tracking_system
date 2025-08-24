import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter } from 'lucide-react'

interface UniversityFiltersProps {
  onFiltersChange: (filters: any) => void
  isOpen: boolean
}

export function UniversityFilters({ onFiltersChange, isOpen }: UniversityFiltersProps) {
  if (!isOpen) return null

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Geographic Location */}
          <div className="space-y-2">
            <Label>Location</Label>
            <Select onValueChange={(value) => onFiltersChange({ state: value === 'clear' ? undefined : value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clear">Clear selection</SelectItem>
                <SelectItem value="California">California</SelectItem>
                <SelectItem value="New York">New York</SelectItem>
                <SelectItem value="Texas">Texas</SelectItem>
                <SelectItem value="Massachusetts">Massachusetts</SelectItem>
                <SelectItem value="Illinois">Illinois</SelectItem>
                <SelectItem value="Pennsylvania">Pennsylvania</SelectItem>
                <SelectItem value="North Carolina">North Carolina</SelectItem>
                <SelectItem value="Florida">Florida</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Virginia">Virginia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ranking Range */}
          <div className="space-y-2">
            <Label>Ranking Range</Label>
            <div className="flex gap-2">
              <Input 
                type="number" 
                placeholder="Min" 
                className="w-full"
                onChange={(e) => onFiltersChange({ minRanking: parseInt(e.target.value) || undefined })}
              />
              <Input 
                type="number" 
                placeholder="Max" 
                className="w-full"
                onChange={(e) => onFiltersChange({ maxRanking: parseInt(e.target.value) || undefined })}
              />
            </div>
          </div>

          {/* Acceptance Rate */}
          <div className="space-y-2">
            <Label>Acceptance Rate</Label>
            <Select onValueChange={(value) => {
              if (value === 'clear') {
                onFiltersChange({ minAcceptanceRate: undefined, maxAcceptanceRate: undefined })
                return
              }
              const ranges = {
                'under-10': { maxAcceptanceRate: 10 },
                '10-30': { minAcceptanceRate: 10, maxAcceptanceRate: 30 },
                '30-50': { minAcceptanceRate: 30, maxAcceptanceRate: 50 },
                'over-50': { minAcceptanceRate: 50 }
              }
              onFiltersChange(ranges[value as keyof typeof ranges] || {})
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clear">Clear selection</SelectItem>
                <SelectItem value="under-10">Under 10%</SelectItem>
                <SelectItem value="10-30">10% - 30%</SelectItem>
                <SelectItem value="30-50">30% - 50%</SelectItem>
                <SelectItem value="over-50">Over 50%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Application System */}
          <div className="space-y-2">
            <Label>Application System</Label>
            <Select onValueChange={(value) => onFiltersChange({ applicationSystem: value === 'clear' ? undefined : value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select system" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clear">Clear selection</SelectItem>
                <SelectItem value="Common App">Common App</SelectItem>
                <SelectItem value="Coalition">Coalition</SelectItem>
                <SelectItem value="Direct">Direct Application</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tuition Range */}
          <div className="space-y-2">
            <Label>Max Tuition</Label>
            <Input 
              type="number" 
              placeholder="$70,000" 
              onChange={(e) => onFiltersChange({ maxTuition: parseInt(e.target.value) || undefined })}
            />
          </div>
        </div>

        {/* Reset Filters */}
        <div className="mt-4 pt-4 border-t">
          <Button 
            variant="outline"
            onClick={() => onFiltersChange({})}
          >
            Reset All Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}