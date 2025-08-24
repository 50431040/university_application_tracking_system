'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { UniversityFilters } from '@/components/university/university-filters'
import { UniversityCard } from '@/components/university/university-card'
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'

interface University {
  id: string
  name: string
  country: string
  state: string
  city: string
  usNewsRanking: number
  acceptanceRate: number
  applicationSystem: string
  tuitionInState: number
  tuitionOutState: number
  applicationFee: number
  deadlines: any
  availableMajors: string[]
}

interface SearchResponse {
  data: University[]
  meta: {
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export default function UniversitiesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<any>({})
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })

  // Build search params
  const searchParams = useMemo(() => {
    const params = new URLSearchParams()
    
    if (searchQuery.trim()) {
      params.set('query', searchQuery.trim())
    }
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString())
      }
    })
    
    params.set('page', pagination.page.toString())
    params.set('limit', pagination.limit.toString())
    
    return params
  }, [searchQuery, filters, pagination.page, pagination.limit])

  // Fetch universities
  const fetchUniversities = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/universities/search?${searchParams}`)
      const data: SearchResponse = await response.json()
      
      if (response.ok) {
        setUniversities(data.data)
        setPagination(prev => ({
          ...prev,
          total: data.meta.pagination.total,
          totalPages: data.meta.pagination.totalPages
        }))
      } else {
        console.error('Failed to fetch universities')
      }
    } catch (error) {
      console.error('Error fetching universities:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch on component mount and when search params change
  useEffect(() => {
    fetchUniversities()
  }, [searchParams])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Handle filter changes
  const handleFiltersChange = (newFilters: any) => {
    setFilters((prev: any) => ({ ...prev, ...newFilters }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle add application
  const handleAddApplication = async (universityId: string) => {
    // Navigate to new application page with university pre-selected
    router.push(`/applications/new?universityId=${universityId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            University Search
          </h1>
          <p className="text-gray-600">
            Discover and explore universities for your college applications
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search universities by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={loading}>
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6">
            <UniversityFilters
              onFiltersChange={handleFiltersChange}
              isOpen={showFilters}
            />
          </div>
        )}

        {/* Results */}
        <div className="w-full">
          {/* Results Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600">
              {loading ? (
                'Searching...'
              ) : (
                `Showing ${universities.length} of ${pagination.total} universities`
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner className="mr-2" />
              <span>Loading universities...</span>
            </div>
          )}

          {/* Universities Grid */}
          {!loading && universities.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {universities.map((university) => (
                <UniversityCard
                  key={university.id}
                  university={university}
                  onAddApplication={handleAddApplication}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && universities.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <Search className="mx-auto h-12 w-12 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No universities found</h3>
                  <p>Try adjusting your search criteria or filters</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('')
                    setFilters({})
                    setPagination(prev => ({ ...prev, page: 1 }))
                  }}
                >
                  Clear all filters
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {!loading && universities.length > 0 && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .slice(
                    Math.max(0, pagination.page - 3),
                    Math.min(pagination.totalPages, pagination.page + 2)
                  )
                  .map((page) => (
                    <Button
                      key={page}
                      variant={pagination.page === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
              </div>

              <Button
                variant="outline"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}