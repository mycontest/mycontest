'use client'

import { useEffect, useState } from 'react'
import { problemsApi } from '@/lib/api'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Filter } from 'lucide-react'

export default function ProblemsPage() {
  const [problems, setProblems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState<string>('')

  useEffect(() => {
    loadProblems()
  }, [page, difficulty])

  const loadProblems = async () => {
    try {
      setLoading(true)
      const response = await problemsApi.getAll({
        page,
        limit: 20,
        difficulty: difficulty || undefined,
        search: search || undefined
      })
      setProblems(response.data || [])
    } catch (error) {
      console.error('Failed to load problems:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'hard': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Problems</h1>
          <p className="text-muted-foreground">Practice and improve your coding skills</p>
        </div>
        <Button>
          Create Problem
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search problems..."
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadProblems()}
          />
        </div>
        <select
          className="px-4 py-2 border border-input rounded-md bg-background"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Problems List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-muted-foreground">Loading problems...</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-medium">Title</th>
                <th className="text-left p-4 font-medium">Difficulty</th>
                <th className="text-left p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {problems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-muted-foreground">
                    No problems found
                  </td>
                </tr>
              ) : (
                problems.map((problem) => (
                  <tr key={problem.id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <Link
                        href={`/problems/${problem.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {problem.title}
                      </Link>
                    </td>
                    <td className="p-4">
                      <Badge className={getDifficultyColor(problem.difficulty)}>
                        {problem.difficulty}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {problem.user_status?.solved ? (
                        <Badge variant="outline" className="border-green-500 text-green-500">
                          Solved
                        </Badge>
                      ) : problem.user_status?.attempts > 0 ? (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                          Attempted
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not Attempted</Badge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
