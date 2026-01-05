import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

function MyAppsPage() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const { session } = useAuth()

  useEffect(() => {
    fetchApps()
  }, [session?.access_token])

  const fetchApps = async () => {
    if (!session?.access_token) return

    try {
      const response = await fetch('/api/apps', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setApps(data.apps)
      }
    } catch (error) {
      console.error('Fetch apps error:', error)
      toast.error('앱 목록을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const deleteApp = async (appId) => {
    if (!confirm('정말로 이 앱을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/apps/${appId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setApps(apps.filter(app => app.id !== appId))
        toast.success('앱이 삭제되었습니다')
      }
    } catch (error) {
      console.error('Delete app error:', error)
      toast.error('앱 삭제에 실패했습니다')
    }
  }

  const getAppEmoji = (type) => {
    const emojis = {
      calculator: '🧮',
      timer: '⏱️',
      todo: '✅',
      memo: '📝',
      counter: '🔢',
      custom: '✨'
    }
    return emojis[type] || '✨'
  }

  const downloadApp = async (app) => {
    try {
      const response = await fetch(`/api/apps/${app.id}/download`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('다운로드 실패')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${app.title || 'app'}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('다운로드가 시작되었습니다')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('다운로드에 실패했습니다')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">내 앱</h1>
          <Link
            to="/generator"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            + 새 앱 만들기
          </Link>
        </div>

        {apps.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              아직 만든 앱이 없어요
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              첫 번째 미니앱을 만들어보세요!
            </p>
            <Link
              to="/generator"
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              앱 만들기 시작 →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
              <div
                key={app.id}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* 미리보기 */}
                <div className="h-40 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                  <iframe
                    srcDoc={`<!DOCTYPE html><html><head><style>${app.css_code || ''}</style></head><body>${app.html_code || ''}<script>${app.js_code || ''}</script></body></html>`}
                    title={app.title}
                    className="w-full h-full border-0 pointer-events-none transform scale-75 origin-top-left"
                    style={{ width: '133%', height: '133%' }}
                    sandbox=""
                  />
                </div>

                {/* 정보 */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getAppEmoji(app.app_type)}</span>
                      <h3 className="font-medium text-gray-900 dark:text-white">{app.title}</h3>
                    </div>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-xs rounded-full">
                      {app.quality_score}점
                    </span>
                  </div>

                  {app.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                      {app.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(app.created_at).toLocaleDateString('ko-KR')}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => downloadApp(app)}
                        className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title="다운로드"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      <Link
                        to={`/app/${app.id}`}
                        className="px-3 py-1.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                      >
                        보기
                      </Link>
                      <button
                        onClick={() => deleteApp(app.id)}
                        className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyAppsPage
