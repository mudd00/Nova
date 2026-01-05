import { useState, useEffect, useRef } from 'react'
import { useSocket } from '../hooks/useSocket'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

function GeneratorPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [progress, setProgress] = useState(null)
  const [generatedApp, setGeneratedApp] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [activeCodeTab, setActiveCodeTab] = useState('preview')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const { socket, connected } = useSocket()
  const { session } = useAuth()
  const navigate = useNavigate()

  // 빠른 시작 예시
  const quickPrompts = [
    { emoji: '🧮', text: '간단한 계산기 만들어줘' },
    { emoji: '⏱️', text: '포모도로 타이머 만들어줘' },
    { emoji: '✅', text: '할일 목록 앱 만들어줘' },
    { emoji: '🎮', text: '가위바위보 게임 만들어줘' },
  ]

  // 세션 시작
  useEffect(() => {
    if (session?.access_token) {
      startSession()
    }
  }, [session?.access_token])

  // 소켓 이벤트 리스너
  useEffect(() => {
    if (socket && sessionId) {
      socket.emit('join-session', { sessionId })

      socket.on('ai-message', (data) => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.message, timestamp: new Date() }
        ])
        setLoading(false)
      })

      socket.on('generation-progress', (data) => {
        setProgress({ percentage: data.percentage, message: data.message })
      })

      socket.on('generation-complete', (data) => {
        setGeneratedApp(data.app)
        setProgress(null)
        setLoading(false)
        toast.success('앱이 생성되었습니다!')
      })

      socket.on('generation-error', (data) => {
        toast.error(data.error || '앱 생성에 실패했습니다')
        setProgress(null)
        setLoading(false)
      })

      return () => {
        socket.off('ai-message')
        socket.off('generation-progress')
        socket.off('generation-complete')
        socket.off('generation-error')
      }
    }
  }, [socket, sessionId])

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 세션 시작
  const startSession = async () => {
    try {
      const response = await fetch('/api/generator/session/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setSessionId(data.sessionId)
        setMessages([
          { role: 'assistant', content: data.welcomeMessage.content, timestamp: new Date() }
        ])
      }
    } catch (error) {
      console.error('Session start error:', error)
      toast.error('세션 시작에 실패했습니다')
    }
  }

  // 새 대화 시작
  const startNewChat = () => {
    setMessages([])
    setGeneratedApp(null)
    setProgress(null)
    setSessionId(null)
    startSession()
  }

  // 메시지 전송
  const sendMessage = async (e) => {
    e?.preventDefault()

    if (!input.trim() || loading || !sessionId) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userMessage, timestamp: new Date() }
    ])
    setLoading(true)

    try {
      const response = await fetch(`/api/generator/session/${sessionId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ message: userMessage })
      })

      const data = await response.json()

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.response.message, timestamp: new Date() }
        ])

        // 생성 가능 상태면 자동으로 생성 시작
        if (data.response.canGenerate) {
          generateApp()
        }
      } else {
        toast.error(data.error || '메시지 전송에 실패했습니다')
      }
    } catch (error) {
      console.error('Send message error:', error)
      toast.error('메시지 전송에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  // 빠른 프롬프트 선택
  const handleQuickPrompt = (text) => {
    setInput(text)
    inputRef.current?.focus()
  }

  // 앱 생성
  const generateApp = async () => {
    if (!sessionId) return

    setLoading(true)
    setProgress({ percentage: 0, message: '생성 준비 중...' })

    try {
      const response = await fetch(`/api/generator/session/${sessionId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedApp(data.app)
      } else {
        toast.error(data.error || '앱 생성에 실패했습니다')
      }
    } catch (error) {
      console.error('Generate app error:', error)
      toast.error('앱 생성에 실패했습니다')
    } finally {
      setProgress(null)
      setLoading(false)
    }
  }

  // 코드 복사
  const copyCode = (code, type) => {
    navigator.clipboard.writeText(code)
    toast.success(`${type} 코드가 복사되었습니다`)
  }

  // 생성된 앱의 전체 HTML 코드
  const getFullHtml = () => {
    if (!generatedApp) return ''

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${generatedApp.title}</title>
  <style>${generatedApp.css_code || ''}</style>
</head>
<body>
${generatedApp.html_code || ''}
<script>${generatedApp.js_code || ''}</script>
</body>
</html>`
  }

  // 모바일에서 탭 전환
  const [mobileTab, setMobileTab] = useState('chat')

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-950">
      {/* 모바일 탭 전환 버튼 */}
      <div className="lg:hidden flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <button
          onClick={() => setMobileTab('chat')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mobileTab === 'chat'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          채팅
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mobileTab === 'preview'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          미리보기 {generatedApp && '✓'}
        </button>
      </div>

      {/* 채팅 영역 */}
      <div className={`${mobileTab === 'chat' ? 'flex' : 'hidden'} lg:flex w-full lg:w-1/2 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700`}>
        {/* 채팅 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">AI</span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">앱 생성기</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {connected ? '연결됨' : '연결 중...'}
              </p>
            </div>
          </div>
          <button
            onClick={startNewChat}
            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            + 새 대화
          </button>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message-enter flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* 아바타 */}
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs">AI</span>
                </div>
              )}
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600 dark:text-gray-300 text-xs">나</span>
                </div>
              )}

              {/* 메시지 */}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-md'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              </div>
            </div>
          ))}

          {/* 로딩 인디케이터 */}
          {loading && !progress && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs">AI</span>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-md">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full typing-dot"></div>
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full typing-dot"></div>
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full typing-dot"></div>
                </div>
              </div>
            </div>
          )}

          {/* 진행률 표시 */}
          {progress && (
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-2xl p-4 border border-primary-200 dark:border-primary-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center animate-pulse">
                  <span className="text-white text-lg">⚡</span>
                </div>
                <div>
                  <p className="font-medium text-primary-900 dark:text-primary-100">{progress.message}</p>
                  <p className="text-sm text-primary-600 dark:text-primary-400">{progress.percentage}% 완료</p>
                </div>
              </div>
              <div className="w-full bg-primary-200 dark:bg-primary-800 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full progress-active transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 빠른 시작 버튼 (메시지가 1개일 때만) */}
        {messages.length === 1 && !loading && (
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">빠른 시작</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickPrompt(prompt.text)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full transition-colors"
                >
                  <span>{prompt.emoji}</span>
                  <span>{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 입력 영역 */}
        <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="어떤 앱을 만들까요? 자유롭게 설명해주세요..."
              disabled={loading}
              className="flex-1 bg-transparent py-2 focus:outline-none disabled:text-gray-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* 미리보기 영역 */}
      <div className={`${mobileTab === 'preview' ? 'flex' : 'hidden'} lg:flex w-full lg:w-1/2 flex-col bg-gray-50 dark:bg-gray-950 flex-1`}>
        {generatedApp ? (
          <>
            {/* 탭 헤더 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 gap-3">
              <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex-shrink-0">
                  {['preview', 'html', 'css', 'js'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveCodeTab(tab)}
                      className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                        activeCodeTab === tab
                          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {tab === 'preview' ? '미리보기' : tab.toUpperCase()}
                    </button>
                  ))}
                </div>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-xs font-medium rounded-full flex-shrink-0">
                  {generatedApp.quality_score}점
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors whitespace-nowrap ${
                    showExplanation
                      ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  💡 설명
                </button>
                <button
                  onClick={() => navigate(`/app/${generatedApp.id}`)}
                  className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors whitespace-nowrap"
                >
                  상세 보기
                </button>
              </div>
            </div>

            {/* 콘텐츠 영역 */}
            <div className="flex-1 p-4 overflow-hidden">
              {activeCodeTab === 'preview' ? (
                <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <iframe
                    srcDoc={getFullHtml()}
                    title="App Preview"
                    className="w-full h-full border-0"
                    sandbox="allow-scripts"
                  />
                </div>
              ) : (
                <div className="h-full bg-gray-900 rounded-xl overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
                    <span className="text-gray-400 text-sm">
                      {activeCodeTab === 'html' && 'index.html'}
                      {activeCodeTab === 'css' && 'style.css'}
                      {activeCodeTab === 'js' && 'script.js'}
                    </span>
                    <button
                      onClick={() => {
                        const code = activeCodeTab === 'html' ? generatedApp.html_code :
                                     activeCodeTab === 'css' ? generatedApp.css_code : generatedApp.js_code
                        copyCode(code || '', activeCodeTab.toUpperCase())
                      }}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      복사
                    </button>
                  </div>
                  <pre className="flex-1 p-4 overflow-auto text-sm font-mono text-gray-300 whitespace-pre-wrap">
                    {activeCodeTab === 'html' && (generatedApp.html_code || '// HTML 코드 없음')}
                    {activeCodeTab === 'css' && (generatedApp.css_code || '// CSS 코드 없음')}
                    {activeCodeTab === 'js' && (generatedApp.js_code || '// JavaScript 코드 없음')}
                  </pre>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md px-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-800 dark:to-primary-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🚀</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                앱을 만들어보세요
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                왼쪽 채팅창에서 원하는 앱을 설명하면
                <br />
                AI가 코드를 생성해드려요
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {quickPrompts.slice(0, 3).map((prompt, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm rounded-full"
                  >
                    <span>{prompt.emoji}</span>
                    <span>{prompt.text.replace('만들어줘', '')}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GeneratorPage
