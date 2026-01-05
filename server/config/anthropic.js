const Anthropic = require('@anthropic-ai/sdk');

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.warn('⚠️  ANTHROPIC_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.');
}

const anthropic = new Anthropic({
  apiKey: apiKey || '',
});

// 기본 모델 설정
const DEFAULT_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';
const MAX_TOKENS = 16000;

module.exports = {
  anthropic,
  DEFAULT_MODEL,
  MAX_TOKENS
};
