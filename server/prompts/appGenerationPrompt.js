/**
 * 앱 생성 프롬프트 템플릿
 */

const getSystemPrompt = () => `당신은 미니 웹 앱을 만드는 전문 개발자입니다.
사용자의 요구사항에 맞는 완전히 동작하는 HTML/CSS/JavaScript 코드를 생성합니다.

규칙:
1. 단일 HTML 파일로 모든 것을 포함합니다 (인라인 CSS와 JS)
2. 외부 라이브러리 없이 순수 JavaScript만 사용합니다
3. 모바일 반응형으로 만듭니다
4. 한국어 UI를 사용합니다
5. 깔끔하고 현대적인 디자인을 적용합니다
6. 코드는 명확하고 주석을 포함합니다

응답 형식:
제목: [앱 이름]
타입: [calculator/timer/todo/memo/counter/custom]
설명: [한 줄 설명]

\`\`\`html
[완전한 HTML 코드]
\`\`\``;

const buildPrompt = (requirements) => {
  const { appType, appName, description, features, style } = requirements;

  let prompt = `다음 요구사항에 맞는 미니 앱을 만들어주세요:\n\n`;

  if (appType) {
    prompt += `앱 종류: ${appType}\n`;
  }

  if (appName) {
    prompt += `앱 이름: ${appName}\n`;
  }

  if (description) {
    prompt += `설명: ${description}\n`;
  }

  if (features && features.length > 0) {
    prompt += `필요한 기능:\n`;
    features.forEach((feature, i) => {
      prompt += `- ${feature}\n`;
    });
  }

  if (style) {
    prompt += `스타일: ${style}\n`;
  }

  // 앱 타입별 추가 지침
  const typeInstructions = {
    calculator: `
계산기 앱 필수 기능:
- 숫자 버튼 (0-9)
- 연산자 버튼 (+, -, *, /)
- 등호 버튼 (=)
- 초기화 버튼 (C)
- 소수점 버튼 (.)
- 계산 결과 표시 화면
`,
    timer: `
타이머 앱 필수 기능:
- 시간 설정 (분, 초)
- 시작/일시정지 버튼
- 리셋 버튼
- 남은 시간 표시
- 알람 소리 또는 시각적 알림
`,
    todo: `
할일 목록 앱 필수 기능:
- 할일 입력 필드
- 추가 버튼
- 할일 목록 표시
- 완료 체크 기능
- 삭제 기능
- 로컬 스토리지 저장
`,
    memo: `
메모장 앱 필수 기능:
- 제목 입력 필드
- 내용 입력 영역
- 저장 버튼
- 메모 목록 표시
- 삭제 기능
- 로컬 스토리지 저장
`,
    counter: `
카운터 앱 필수 기능:
- 현재 숫자 표시
- 증가 버튼 (+)
- 감소 버튼 (-)
- 리셋 버튼
- 큰 숫자로 보기 좋게 표시
`
  };

  if (appType && typeInstructions[appType]) {
    prompt += typeInstructions[appType];
  }

  prompt += `\n완전히 동작하는 코드를 생성해주세요. HTML, CSS, JavaScript가 모두 포함된 단일 파일로 만들어주세요.`;

  return prompt;
};

module.exports = {
  getSystemPrompt,
  buildPrompt
};
