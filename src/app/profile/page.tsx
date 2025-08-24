'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const profileFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email format'),
  graduationYear: z.string().optional(),
  gpa: z.string().optional(),
  satScore: z.string().optional(),
  actScore: z.string().optional(),
  targetCountries: z.array(z.string()).optional(),
  intendedMajors: z.array(z.string()).optional(),
})

type ProfileFormData = z.infer<typeof profileFormSchema>

interface ProfileData {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
  }
  student: {
    id: string | null
    graduationYear: number | null
    gpa: number | null
    satScore: number | null
    actScore: number | null
    targetCountries: string[]
    intendedMajors: string[]
  }
}

const majorOptions = [
  'Computer Science',
  'Data Science',
  'Mathematics',
  'Engineering',
  'Business Administration',
  'Economics',
  'Psychology',
  'Biology',
  'Chemistry',
  'Physics',
  'English Literature',
  'History',
  'Political Science',
  'Art',
  'Music',
  'Philosophy',
  'Nursing',
  'Medicine',
  'Law',
  'Education'
]

const countryOptions = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'Germany',
  'France',
  'Netherlands',
  'Singapore',
  'Japan',
  'South Korea',
  'China',
  'Hong Kong'
]

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [selectedMajors, setSelectedMajors] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      graduationYear: '',
      gpa: '',
      satScore: '',
      actScore: '',
      targetCountries: [],
      intendedMajors: [],
    },
  })

  // Redirect if not student
  useEffect(() => {
    if (user && user.role !== 'student') {
      router.push('/dashboard')
    }
  }, [user, router])

  // Fetch profile data
  useEffect(() => {
    if (user?.role === 'student') {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/student/profile')
      const data = await response.json()

      if (response.ok && data.data) {
        setProfileData(data.data)
        setSelectedMajors(data.data.student.intendedMajors || [])
        setSelectedCountries(data.data.student.targetCountries || [])
        
        // Set form values
        form.reset({
          firstName: data.data.user.firstName,
          lastName: data.data.user.lastName,
          email: data.data.user.email,
          graduationYear: data.data.student.graduationYear?.toString() || '',
          gpa: data.data.student.gpa?.toString() || '',
          satScore: data.data.student.satScore?.toString() || '',
          actScore: data.data.student.actScore?.toString() || '',
          targetCountries: data.data.student.targetCountries || [],
          intendedMajors: data.data.student.intendedMajors || [],
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      toast.error('Failed to load profile', {
        description: 'Unable to fetch your profile data. Please refresh the page.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSaving(true)
      
      // Convert string values to numbers where needed
      const submitData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        graduationYear: data.graduationYear ? parseInt(data.graduationYear) : undefined,
        gpa: data.gpa ? parseFloat(data.gpa) : undefined,
        satScore: data.satScore ? parseInt(data.satScore) : undefined,
        actScore: data.actScore ? parseInt(data.actScore) : undefined,
        targetCountries: selectedCountries,
        intendedMajors: selectedMajors,
      }

      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const result = await response.json()

      if (response.ok) {
        // Update profile data
        setProfileData(result.data)
        toast.success('Profile updated successfully!', {
          description: 'Your personal information has been saved.',
        })
      } else {
        const errorMsg = result.error?.message || 'Failed to update profile'
        toast.error('Update failed', {
          description: errorMsg,
        })
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Update failed', {
        description: 'Failed to update profile. Please try again.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const addMajor = (major: string) => {
    if (!selectedMajors.includes(major)) {
      setSelectedMajors([...selectedMajors, major])
    }
  }

  const removeMajor = (major: string) => {
    setSelectedMajors(selectedMajors.filter(m => m !== major))
  }

  const addCountry = (country: string) => {
    if (!selectedCountries.includes(country)) {
      setSelectedCountries([...selectedCountries, country])
    }
  }

  const removeCountry = (country: string) => {
    setSelectedCountries(selectedCountries.filter(c => c !== country))
  }

  if (!user || user.role !== 'student') {
    return <LoadingSpinner />
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Personal Profile</h1>
        <p className="text-gray-600 mt-2">
          Manage your personal information and academic details
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
            <CardDescription>
              Your educational background and test scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="graduationYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Graduation Year</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select graduation year" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 11 }, (_, i) => 2020 + i).map(year => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gpa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GPA</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          max="4.0" 
                          placeholder="Enter your GPA (0.00-4.00)" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Enter your GPA on a 4.0 scale
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="satScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SAT Score</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="400" 
                          max="1600" 
                          placeholder="Enter your SAT score (400-1600)" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="actScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ACT Score</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="36" 
                          placeholder="Enter your ACT score (1-36)" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </CardContent>
        </Card>

        {/* Target Countries */}
        <Card>
          <CardHeader>
            <CardTitle>Target Countries</CardTitle>
            <CardDescription>
              Countries where you want to study
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select onValueChange={addCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Add a target country" />
                </SelectTrigger>
                <SelectContent>
                  {countryOptions
                    .filter(country => !selectedCountries.includes(country))
                    .map(country => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <div className="flex flex-wrap gap-2">
                {selectedCountries.map(country => (
                  <div
                    key={country}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {country}
                    <button
                      type="button"
                      onClick={() => removeCountry(country)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intended Majors */}
        <Card>
          <CardHeader>
            <CardTitle>Intended Majors</CardTitle>
            <CardDescription>
              Academic programs you're interested in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select onValueChange={addMajor}>
                <SelectTrigger>
                  <SelectValue placeholder="Add an intended major" />
                </SelectTrigger>
                <SelectContent>
                  {majorOptions
                    .filter(major => !selectedMajors.includes(major))
                    .map(major => (
                      <SelectItem key={major} value={major}>
                        {major}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <div className="flex flex-wrap gap-2">
                {selectedMajors.map(major => (
                  <div
                    key={major}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {major}
                    <button
                      type="button"
                      onClick={() => removeMajor(major)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-center">
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSaving}
          className="px-8 py-2"
        >
          {isSaving ? (
            <>
              <LoadingSpinner className="mr-2 h-4 w-4" />
              Saving...
            </>
          ) : (
            'Save Profile'
          )}
        </Button>
      </div>
    </div>
  )
} 