import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState, useEffect } from 'react'

function HomePage() {
  const { user } = useAuth()
  const [typedText, setTypedText] = useState('')
  const [currentExample, setCurrentExample] = useState(0)

  const examples = [
    '계산기 만들어줘',
    '포모도로 타이머 만들어줘',
    '할일 목록 앱 만들어줘',
    '가위바위보 게임 만들어줘',
  ]

  // 타이핑 효과
  useEffect(() => {
    const text = examples[currentExample]
    let index = 0
    setTypedText('')

    const typeInterval = setInterval(() => {
      if (index < text.length) {
        setTypedText(text.slice(0, index + 1))
        index++
      } else {
        clearInterval(typeInterval)
        setTimeout(() => {
          setCurrentExample((prev) => (prev + 1) % examples.length)
        }, 2000)
      }
    }, 100)

    return () => clearInterval(typeInterval)
  }, [currentExample])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100/50 via-white to-purple-100/50 dark:from-primary-900/20 dark:via-gray-950 dark:to-purple-900/20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 dark:bg-primary-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl"></div>

        {/* 그리드 패턴 */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 text-primary-700 dark:text-primary-400 rounded-full text-sm font-medium mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full mr-2 animate-pulse"></span>
              AI 코드 생성 + 코드 설명 모드
            </div>
            <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 tracking-tight">
              말로 설명하면
              <br />
              <span className="bg-gradient-to-r from-primary-500 via-primary-600 to-purple-600 dark:from-primary-400 dark:via-primary-500 dark:to-purple-500 bg-clip-text text-transparent">
                AI가 앱을 만들어요
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4">
              자연어로 원하는 앱을 설명하세요.
              <br className="hidden xs:block" />
              <span className="xs:hidden"> </span>
              AI가 완전히 동작하는 코드를 생성하고, 코드를 설명해드립니다.
            </p>

            {/* 타이핑 데모 */}
            <div className="max-w-xl mx-auto mb-8 sm:mb-12 px-4">
              <div className="bg-white dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-3 text-xs text-gray-500 font-mono">Mini App Generator</span>
                </div>
                <div className="bg-gray-100 dark:bg-gray-950/50 rounded-xl p-5 min-h-[70px] flex items-center border border-gray-200 dark:border-gray-800">
                  <span className="text-gray-800 dark:text-gray-200 text-lg font-medium">
                    "{typedText}"
                    <span className="animate-pulse text-primary-500 ml-0.5">|</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center px-4">
              {user ? (
                <Link
                  to="/generator"
                  className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 transition-all hover:scale-105 shadow-xl shadow-primary-600/25"
                >
                  앱 만들기 시작
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 transition-all hover:scale-105 shadow-xl shadow-primary-600/25"
                  >
                    무료로 시작하기
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all hover:scale-105 backdrop-blur-sm"
                  >
                    로그인
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 차별화 포인트 */}
      <div className="bg-white dark:bg-gray-950 py-16 sm:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-100/50 dark:from-gray-900/50 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">다른 AI 코드 생성기와 뭐가 다른가요?</h2>
            <p className="text-gray-500">핵심 차별화 포인트</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '💡',
                title: '코드 설명 모드',
                description: '생성된 코드를 한 줄씩 설명해드려요. 코딩을 배우면서 앱을 만들 수 있어요.',
                gradient: 'from-yellow-500 to-orange-500',
              },
              {
                icon: '💬',
                title: '대화형 수정',
                description: '"버튼 색 바꿔줘"처럼 자연어로 코드를 수정할 수 있어요.',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                icon: '🇰🇷',
                title: '한국어 최적화',
                description: '한국어 입력과 출력이 자연스러워요. 100% 한국어 지원.',
                gradient: 'from-purple-500 to-pink-500',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group bg-gray-50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900/80 transition-all duration-300"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 앱 예시 마퀴 슬라이드 */}
      <div className="py-12 sm:py-20 bg-gray-100 dark:bg-gray-900 overflow-hidden">
        <div className="text-center mb-8 sm:mb-12 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">이런 앱을 만들 수 있어요</h2>
          <p className="text-gray-500">아이디어만 있으면 무엇이든 가능합니다</p>
        </div>

        {/* 첫 번째 줄 - 왼쪽으로 흐름 */}
        <div className="relative mb-4">
          <div className="flex animate-marquee">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex gap-4 px-2">
                {[
                  { emoji: '🧮', title: '계산기', desc: '기본/공학용 계산기' },
                  { emoji: '⏱️', title: '포모도로 타이머', desc: '집중력 향상 도구' },
                  { emoji: '✅', title: '할일 목록', desc: '투두리스트 앱' },
                  { emoji: '🎮', title: '가위바위보', desc: '간단한 게임' },
                  { emoji: '📝', title: '메모장', desc: '노트 앱' },
                  { emoji: '🔢', title: '카운터', desc: '클릭 카운터' },
                ].map((app, index) => (
                  <div
                    key={`${setIndex}-${index}`}
                    className="flex-shrink-0 w-64 bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:border-primary-500/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{app.emoji}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{app.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{app.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 두 번째 줄 - 오른쪽으로 흐름 */}
        <div className="relative">
          <div className="flex animate-marquee-reverse">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex gap-4 px-2">
                {[
                  { emoji: '🎨', title: '컬러 피커', desc: '색상 선택 도구' },
                  { emoji: '📊', title: '차트 생성기', desc: '데이터 시각화' },
                  { emoji: '🎲', title: '주사위 게임', desc: '랜덤 숫자 생성' },
                  { emoji: '💰', title: '환율 계산기', desc: '통화 변환' },
                  { emoji: '📅', title: 'D-Day 카운터', desc: '날짜 계산' },
                  { emoji: '🔐', title: '비밀번호 생성기', desc: '보안 도구' },
                ].map((app, index) => (
                  <div
                    key={`${setIndex}-${index}`}
                    className="flex-shrink-0 w-64 bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:border-primary-500/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{app.emoji}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{app.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{app.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 쇼케이스 섹션 */}
      <div className="bg-white dark:bg-gray-950 py-16 sm:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-100/50 dark:from-gray-900/50 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-100 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 bg-yellow-500 dark:bg-yellow-400 rounded-full mr-2"></span>
              커뮤니티 쇼케이스
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">사용자들이 만든 앱</h2>
            <p className="text-gray-500">다른 사용자들이 만든 멋진 앱들을 구경해보세요</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: '스톱워치', author: 'user1', score: 92, emoji: '⏱️', gradient: 'from-blue-600 to-cyan-600' },
              { title: '가계부', author: 'user2', score: 88, emoji: '💰', gradient: 'from-green-600 to-emerald-600' },
              { title: '퀴즈 게임', author: 'user3', score: 95, emoji: '🎯', gradient: 'from-purple-600 to-pink-600' },
            ].map((app, index) => (
              <div
                key={index}
                className="group bg-gray-50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 shadow-sm"
              >
                <div className={`h-44 bg-gradient-to-br ${app.gradient} flex items-center justify-center relative`}>
                  <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
                  <span className="text-6xl relative z-10 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                    {app.emoji}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{app.title}</h3>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-medium rounded-full border border-green-200 dark:border-green-500/30">
                      {app.score}점
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                      {app.author.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-sm text-gray-500">by {app.author}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-gray-500 dark:text-gray-600 text-sm">
              앱을 만들면 여기에 전시될 수 있어요!
            </p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-gray-100 dark:bg-gray-900 py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white dark:from-gray-950 via-transparent to-white dark:to-gray-950"></div>
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 text-primary-700 dark:text-primary-400 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full mr-2"></span>
              간단한 3단계
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">3단계로 끝나는 앱 만들기</h2>
            <p className="text-gray-500">복잡한 코딩 없이 말로 설명하세요</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: '1',
                title: '원하는 앱 설명',
                description: '"공학용 계산기 만들어줘"처럼 자연어로 설명하세요',
                icon: '💭',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                step: '2',
                title: 'AI와 대화',
                description: 'AI가 세부 기능을 물어보고 요구사항을 정리합니다',
                icon: '🤖',
                gradient: 'from-primary-500 to-purple-500',
              },
              {
                step: '3',
                title: '앱 완성',
                description: '30초 만에 완전히 동작하는 앱이 생성됩니다',
                icon: '🚀',
                gradient: 'from-orange-500 to-red-500',
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-14 left-1/2 w-full h-px bg-gradient-to-r from-gray-300 dark:from-gray-700 via-primary-500/50 to-gray-300 dark:to-gray-700"></div>
                )}
                <div className="text-center relative z-10">
                  <div className={`w-28 h-28 bg-gradient-to-br ${item.gradient} rounded-3xl flex items-center justify-center text-5xl mx-auto mb-8 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-bold mb-5 text-primary-600 dark:text-primary-400 shadow-sm">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 코드 설명 모드 미리보기 */}
      <div className="bg-white dark:bg-gray-950 py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-green-500/5 dark:bg-green-500/10 rounded-full blur-3xl -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
                <span className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mr-2"></span>
                핵심 기능
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                코드 설명 모드로
                <br />
                <span className="bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">코딩도 배우세요</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 leading-relaxed">
                생성된 코드가 어떻게 동작하는지 궁금하신가요?
                코드 설명 모드를 켜면 AI가 코드를 한 줄씩 친절하게 설명해드립니다.
              </p>
              <ul className="space-y-4">
                {[
                  '각 코드 블록의 역할 설명',
                  '초보자도 이해하기 쉬운 한국어 설명',
                  '프로그래밍 개념 학습',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-500/20 rounded-lg flex items-center justify-center border border-green-200 dark:border-green-500/30">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-900 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-3 text-xs text-gray-500 font-mono">code-explanation.js</span>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-950/50 rounded-lg p-3 border border-gray-800">
                  <code className="text-green-400 font-mono text-sm">const button = document.querySelector('.btn');</code>
                </div>
                <div className="bg-blue-500/10 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <p className="text-blue-300 text-sm leading-relaxed">
                    <span className="font-bold text-blue-400">설명:</span> HTML에서 'btn' 클래스를 가진 요소를 찾아서 button 변수에 저장합니다.
                  </p>
                </div>
                <div className="bg-gray-950/50 rounded-lg p-3 border border-gray-800">
                  <code className="text-green-400 font-mono text-sm">button.addEventListener('click', handleClick);</code>
                </div>
                <div className="bg-blue-500/10 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <p className="text-blue-300 text-sm leading-relaxed">
                    <span className="font-bold text-blue-400">설명:</span> 버튼이 클릭될 때마다 handleClick 함수가 실행되도록 이벤트를 연결합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-16 sm:py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-500 to-purple-600"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-400/30 rounded-full blur-3xl"></div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 tracking-tight">
            지금 바로 시작하세요
          </h2>
          <p className="text-lg sm:text-xl text-white/80 mb-8 sm:mb-12 max-w-2xl mx-auto">
            복잡한 설정 없이, 바로 앱을 만들어보세요.
            <br className="hidden xs:block" />
            <span className="xs:hidden"> </span>
            아이디어를 현실로 만드는 가장 빠른 방법입니다.
          </p>
          <Link
            to={user ? '/generator' : '/register'}
            className="group inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-semibold rounded-2xl text-primary-600 bg-white hover:bg-gray-50 transition-all hover:scale-105 shadow-2xl shadow-black/20"
          >
            {user ? '앱 만들러 가기' : '무료로 시작하기'}
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">🧩</span>
              </div>
              <div>
                <span className="font-bold text-gray-900 dark:text-white block">Mini App Generator</span>
                <span className="text-xs text-gray-500">AI 코드 생성 플랫폼</span>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 15v-4H8l4-6v4h3l-4 6z"/>
                </svg>
                <span className="hidden xs:inline">Powered by</span> Claude AI
              </span>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <span>© 2025</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
