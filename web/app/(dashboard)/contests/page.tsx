'use client'

import { useEffect, useState } from 'react'
import { contestsApi } from '@/lib/api'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, Calendar, Users } from 'lucide-react'

export default function ContestsPage() {
  const [contests, setContests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'finished'>('all')

  useEffect(() => {
    loadContests()
  }, [filter])

  const loadContests = async () => {
    try {
      setLoading(true)
      const response = await contestsApi.getAll({
        status: filter === 'all' ? undefined : filter
      })
      setContests(response.data || [])
    } catch (error) {
      console.error('Failed to load contests:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-blue-500">Upcoming</Badge>
      case 'ongoing':
        return <Badge className="bg-green-500">Ongoing</Badge>
      case 'finished':
        return <Badge className="bg-gray-500">Finished</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contests</h1>
          <p className="text-muted-foreground">Compete with others and climb the leaderboard</p>
        </div>
        <Button>
          <Trophy className="h-4 w-4 mr-2" />
          Create Contest
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'upcoming', 'ongoing', 'finished'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f as any)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Contests Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-muted-foreground">Loading contests...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contests.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No contests found
            </div>
          ) : (
            contests.map((contest) => (
              <Link
                key={contest.id}
                href={`/contests/${contest.id}`}
                className="block border border-border rounded-lg p-6 hover:shadow-lg transition-all hover:border-primary"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold">{contest.title}</h3>
                  {getStatusBadge(contest.status)}
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {contest.description}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(contest.start_time).toLocaleDateString()} - {' '}
                      {new Date(contest.end_time).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{contest.participants_count || 0} participants</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
