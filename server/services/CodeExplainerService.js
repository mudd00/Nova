const { anthropic, DEFAULT_MODEL } = require('../config/anthropic');

class CodeExplainerService {
  /**
   * 코드 설명 생성
   */
  async explainCode(code, language = 'javascript') {
    const systemPrompt = `당신은 친절한 코딩 선생님입니다.
주어진 코드를 초보자도 이해할 수 있도록 설명해주세요.

규칙:
1. 코드를 논리적인 섹션으로 나누어 설명합니다
2. 각 섹션에 대해 시작 라인과 끝 라인을 명시합니다
3. 전문 용어는 쉬운 말로 풀어서 설명합니다
4. 왜 이렇게 작성했는지 이유도 설명합니다
5. 응답은 JSON 형식으로 합니다

응답 형식:
{
  "explanations": [
    {
      "lineStart": 1,
      "lineEnd": 5,
      "title": "섹션 제목",
      "explanation": "이 부분은..."
    }
  ],
  "summary": "전체 코드 요약"
}`;

    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `다음 ${language} 코드를 설명해주세요:\n\n\`\`\`${language}\n${code}\n\`\`\``
          }
        ]
      });

      const content = response.content[0].text;

      // JSON 파싱 시도
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        // JSON 파싱 실패 시 텍스트 그대로 반환
        return {
          explanations: [
            {
              lineStart: 1,
              lineEnd: code.split('\n').length,
              title: '코드 설명',
              explanation: content
            }
          ],
          summary: content.substring(0, 200)
        };
      }

      return {
        explanations: [],
        summary: content
      };
    } catch (error) {
      console.error('코드 설명 생성 오류:', error);
      throw new Error('코드 설명 생성 중 오류가 발생했습니다.');
    }
  }

  /**
   * 특정 라인 설명
   */
  async explainLine(code, lineNumber, language = 'javascript') {
    const lines = code.split('\n');
    const targetLine = lines[lineNumber - 1];

    if (!targetLine) {
      throw new Error('해당 라인이 존재하지 않습니다.');
    }

    const contextStart = Math.max(0, lineNumber - 3);
    const contextEnd = Math.min(lines.length, lineNumber + 2);
    const context = lines.slice(contextStart, contextEnd).join('\n');

    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `다음 ${language} 코드에서 ${lineNumber}번 라인을 설명해주세요:

전체 컨텍스트:
\`\`\`${language}
${context}
\`\`\`

설명할 라인 (${lineNumber}번):
\`\`\`${language}
${targetLine}
\`\`\`

간결하고 이해하기 쉽게 설명해주세요.`
          }
        ]
      });

      return {
        lineNumber,
        code: targetLine,
        explanation: response.content[0].text
      };
    } catch (error) {
      console.error('라인 설명 생성 오류:', error);
      throw new Error('라인 설명 생성 중 오류가 발생했습니다.');
    }
  }
}

module.exports = CodeExplainerService;
