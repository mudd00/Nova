const { anthropic, DEFAULT_MODEL, MAX_TOKENS } = require('../config/anthropic');
const { supabaseAdmin } = require('../config/database');
const appGenerationPrompt = require('../prompts/appGenerationPrompt');
const requirementPrompt = require('../prompts/requirementPrompt');

class AppGeneratorService {
  constructor() {
    this.stages = ['initial', 'gathering', 'confirming', 'generating'];
  }

  /**
   * 사용자 메시지 처리 및 AI 응답 생성
   */
  async processMessage(session, userMessage) {
    const { stage, requirements, conversation_history } = session;

    // 대화 히스토리 구성
    const messages = this.buildMessages(conversation_history, userMessage, stage, requirements);

    try {
      // Claude API 호출
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: 2000,
        system: requirementPrompt.getSystemPrompt(stage),
        messages
      });

      const aiMessage = response.content[0].text;

      // 단계 전환 및 요구사항 추출
      const { newStage, extractedRequirements, canGenerate } =
        this.analyzeResponse(aiMessage, stage, requirements, userMessage);

      return {
        message: aiMessage,
        stage: newStage,
        requirements: { ...requirements, ...extractedRequirements },
        canGenerate
      };
    } catch (error) {
      console.error('AI 응답 생성 오류:', error);
      throw new Error('AI 응답 생성 중 오류가 발생했습니다.');
    }
  }

  /**
   * 앱 생성
   */
  async generateApp(session, progressCallback) {
    const { requirements, user_id } = session;

    try {
      // 1단계: 요구사항 분석
      progressCallback(10, '요구사항을 분석하고 있습니다...');
      await this.delay(500);

      // 2단계: 프롬프트 구성
      progressCallback(25, '최적의 앱 구조를 설계하고 있습니다...');
      const prompt = appGenerationPrompt.buildPrompt(requirements);
      await this.delay(500);

      // 3단계: AI 코드 생성
      progressCallback(40, 'AI가 코드를 생성하고 있습니다...');
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: MAX_TOKENS,
        system: appGenerationPrompt.getSystemPrompt(),
        messages: [{ role: 'user', content: prompt }]
      });

      progressCallback(70, '생성된 코드를 검증하고 있습니다...');
      await this.delay(500);

      // 4단계: 코드 파싱
      const generatedCode = response.content[0].text;
      const { html, css, js, title, description, appType } = this.parseGeneratedCode(generatedCode);

      // 5단계: 품질 점수 계산 (간단한 버전)
      progressCallback(85, '품질 점수를 계산하고 있습니다...');
      const qualityScore = this.calculateQualityScore(html, css, js);

      // 6단계: DB 저장
      progressCallback(95, '앱을 저장하고 있습니다...');
      const { data: app, error } = await supabaseAdmin
        .from('generated_apps')
        .insert({
          user_id,
          title: title || requirements.appName || '새 앱',
          description: description || requirements.description || '',
          app_type: appType || requirements.appType || 'custom',
          html_code: html,
          css_code: css,
          js_code: js,
          original_prompt: JSON.stringify(requirements),
          quality_score: qualityScore
        })
        .select()
        .single();

      if (error) throw error;

      progressCallback(100, '앱 생성이 완료되었습니다!');

      return {
        app,
        qualityScore
      };
    } catch (error) {
      console.error('앱 생성 오류:', error);
      throw new Error('앱 생성 중 오류가 발생했습니다: ' + error.message);
    }
  }

  /**
   * 메시지 배열 구성
   */
  buildMessages(history, userMessage, stage, requirements) {
    const messages = history.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // 현재 메시지 추가
    messages.push({
      role: 'user',
      content: userMessage
    });

    return messages;
  }

  /**
   * AI 응답 분석 및 단계 전환
   */
  analyzeResponse(aiMessage, currentStage, requirements, userMessage) {
    let newStage = currentStage;
    let extractedRequirements = {};
    let canGenerate = false;

    // 키워드 기반 요구사항 추출
    const lowerMessage = userMessage.toLowerCase();

    if (currentStage === 'initial') {
      // 앱 타입 감지
      if (lowerMessage.includes('계산기') || lowerMessage.includes('calculator')) {
        extractedRequirements.appType = 'calculator';
      } else if (lowerMessage.includes('타이머') || lowerMessage.includes('timer')) {
        extractedRequirements.appType = 'timer';
      } else if (lowerMessage.includes('할일') || lowerMessage.includes('todo')) {
        extractedRequirements.appType = 'todo';
      } else if (lowerMessage.includes('메모') || lowerMessage.includes('memo')) {
        extractedRequirements.appType = 'memo';
      } else if (lowerMessage.includes('카운터') || lowerMessage.includes('counter')) {
        extractedRequirements.appType = 'counter';
      }

      if (extractedRequirements.appType) {
        newStage = 'gathering';
      }
    }

    // 확인 단계로 전환
    if (currentStage === 'gathering') {
      // 충분한 정보가 모이면 확인 단계로
      if (aiMessage.includes('생성') && aiMessage.includes('?')) {
        newStage = 'confirming';
      }
    }

    // 생성 가능 여부 확인
    if (currentStage === 'confirming') {
      if (lowerMessage.includes('네') || lowerMessage.includes('좋') ||
          lowerMessage.includes('생성') || lowerMessage.includes('만들')) {
        canGenerate = true;
        newStage = 'generating';
      }
    }

    return { newStage, extractedRequirements, canGenerate };
  }

  /**
   * 생성된 코드 파싱
   */
  parseGeneratedCode(generatedCode) {
    let html = '';
    let css = '';
    let js = '';
    let title = '';
    let description = '';
    let appType = 'custom';

    // HTML 추출
    const htmlMatch = generatedCode.match(/```html\n([\s\S]*?)```/);
    if (htmlMatch) {
      html = htmlMatch[1].trim();
    }

    // CSS 추출
    const cssMatch = generatedCode.match(/```css\n([\s\S]*?)```/);
    if (cssMatch) {
      css = cssMatch[1].trim();
    }

    // JavaScript 추출
    const jsMatch = generatedCode.match(/```(?:javascript|js)\n([\s\S]*?)```/);
    if (jsMatch) {
      js = jsMatch[1].trim();
    }

    // 제목 추출
    const titleMatch = generatedCode.match(/(?:제목|Title):\s*(.+)/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }

    // 설명 추출
    const descMatch = generatedCode.match(/(?:설명|Description):\s*(.+)/i);
    if (descMatch) {
      description = descMatch[1].trim();
    }

    // 앱 타입 추출
    const typeMatch = generatedCode.match(/(?:타입|Type):\s*(.+)/i);
    if (typeMatch) {
      appType = typeMatch[1].trim().toLowerCase();
    }

    // HTML이 없으면 전체를 HTML로 처리
    if (!html && generatedCode.includes('<')) {
      html = generatedCode;
    }

    return { html, css, js, title, description, appType };
  }

  /**
   * 코드 품질 점수 계산 (간단한 버전)
   */
  calculateQualityScore(html, css, js) {
    let score = 60; // 기본 점수

    // HTML 검사
    if (html) {
      if (html.includes('<!DOCTYPE')) score += 5;
      if (html.includes('<meta')) score += 3;
      if (html.includes('lang=')) score += 2;
      if (html.includes('class=') || html.includes('id=')) score += 5;
    }

    // CSS 검사
    if (css) {
      if (css.length > 100) score += 5;
      if (css.includes(':hover')) score += 3;
      if (css.includes('transition')) score += 2;
      if (css.includes('flex') || css.includes('grid')) score += 5;
    }

    // JavaScript 검사
    if (js) {
      if (js.length > 100) score += 5;
      if (js.includes('addEventListener')) score += 3;
      if (js.includes('const') || js.includes('let')) score += 2;
      if (!js.includes('var ')) score += 3; // var 미사용 보너스
    }

    return Math.min(score, 100);
  }

  /**
   * 딜레이 유틸리티
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = AppGeneratorService;
