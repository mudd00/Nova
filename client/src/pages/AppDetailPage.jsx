import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

function AppDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()

  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('preview')
  const [showExplanation, setShowExplanation] = useState(false)
  const [explanations, setExplanations] = useState(null)
  const [explaining, setExplaining] = useState(false)

  useEffect(() => {
    fetchApp()
  }, [id, session?.access_token])

  const fetchApp = async () => {
    if (!session?.access_token) return

    try {
      const response = await fetch(`/api/apps/${id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setApp(data.app)
      } else {
        toast.error('앱을 찾을 수 없습니다')
        navigate('/my-apps')
      }
    } catch (error) {
      console.error('Fetch app error:', error)
      toast.error('앱을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const explainCode = async () => {
    if (!app) return

    setExplaining(true)

    try {
      const response = await fetch('/api/generator/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          code: app.js_code || app.html_code,
          language: app.js_code ? 'javascript' : 'html'
        })
      })

      const data = await response.json()

      if (data.success) {
        setExplanations(data)
        setShowExplanation(true)
      }
    } catch (error) {
      console.error('Explain code error:', error)
      toast.error('코드 설명을 가져오는데 실패했습니다')
    } finally {
      setExplaining(false)
    }
  }

  const getFullHtml = () => {
    if (!app) return ''

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${app.title}</title>
  <style>${app.css_code || ''}</style>
</head>
<body>
${app.html_code || ''}
<script>${app.js_code || ''}</script>
</body>
</html>`
  }

  const copyCode = (code, type) => {
    navigator.clipboard.writeText(code)
    toast.success(`${type} 코드가 복사되었습니다`)
  }

  const downloadApp = async () => {
    try {
      const response = await fetch(`/api/apps/${id}/download`, {
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

  if (!app) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* 헤더 */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/my-apps')}
                  className="sm:hidden p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{app.title}</h1>
                <span className="flex-shrink-0 px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-xs sm:text-sm rounded-full">
                  {app.quality_score}점
                </span>
              </div>
              {app.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{app.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={downloadApp}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden sm:inline">다운로드</span>
                <span className="sm:hidden">ZIP</span>
              </button>
              <button
                onClick={() => navigate('/my-apps')}
                className="hidden sm:block px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                ← 목록으로
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 미리보기 */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <h2 className="font-medium text-gray-900 dark:text-white">미리보기</h2>
            </div>
            <div className="p-4 h-[300px] sm:h-[400px] lg:h-[500px]">
              <iframe
                srcDoc={getFullHtml()}
                title="App Preview"
                className="w-full h-full border border-gray-200 dark:border-gray-700 rounded-lg"
                sandbox="allow-scripts"
              />
            </div>
          </div>

          {/* 코드 */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto">
                  {['html', 'css', 'js'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors whitespace-nowrap ${
                        activeTab === tab
                          ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {tab.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={explainCode}
                    disabled={explaining}
                    className="flex-1 sm:flex-none px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {explaining ? '분석 중...' : '코드 설명'}
                  </button>
                  <button
                    onClick={() => {
                      const code = activeTab === 'html' ? app.html_code :
                                   activeTab === 'css' ? app.css_code : app.js_code
                      copyCode(code || '', activeTab.toUpperCase())
                    }}
                    className="flex-1 sm:flex-none px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    복사
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 overflow-auto bg-gray-900 dark:bg-gray-950 h-[300px] sm:h-[400px] lg:h-[500px]">
              <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap">
                {activeTab === 'html' && (app.html_code || '// HTML 코드 없음')}
                {activeTab === 'css' && (app.css_code || '// CSS 코드 없음')}
                {activeTab === 'js' && (app.js_code || '// JavaScript 코드 없음')}
              </pre>
            </div>
          </div>
        </div>

        {/* 코드 설명 */}
        {showExplanation && explanations && (
          <div className="mt-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
              <h2 className="font-medium text-gray-900 dark:text-white">코드 설명</h2>
              <button
                onClick={() => setShowExplanation(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              {explanations.explanations?.map((item, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400 text-xs rounded">
                      라인 {item.lineStart}-{item.lineEnd}
                    </span>
                    {item.title && (
                      <span className="font-medium text-gray-900 dark:text-white">{item.title}</span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{item.explanation}</p>
                </div>
              ))}
              {explanations.summary && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">요약</h3>
                  <p className="text-blue-800 dark:text-blue-200">{explanations.summary}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AppDetailPage
