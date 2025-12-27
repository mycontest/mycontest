'use client'

import { useEffect, useState } from 'react'
import { discussionsApi } from '@/lib/api'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageSquare, Plus, User } from 'lucide-react'

export default function DiscussPage() {
  const [discussions, setDiscussions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDiscussions()
  }, [])

  const loadDiscussions = async () => {
    try {
      setLoading(true)
      const response = await discussionsApi.getAll({})
      setDiscussions(response.data || [])
    } catch (error) {
      console.error('Failed to load discussions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Discussions</h1>
          <p className="text-muted-foreground">General chat and problem discussions</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Discussion
        </Button>
      </div>

      {/* Discussions List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-muted-foreground">Loading discussions...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {discussions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No discussions yet. Start a new one!
            </div>
          ) : (
            discussions.map((discussion) => (
              <Link
                key={discussion.id}
                href={`/discuss/${discussion.id}`}
                className="block border border-border rounded-lg p-6 hover:shadow-md transition-all hover:border-primary"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium flex-shrink-0">
                    {discussion.username?.[0]?.toUpperCase() || 'U'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{discussion.username || 'Unknown'}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(discussion.created_at)}
                      </span>
                    </div>
                    <p className="text-muted-foreground line-clamp-2">
                      {discussion.content}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{discussion.replies_count || 0} replies</span>
                      </div>
                    </div>
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
