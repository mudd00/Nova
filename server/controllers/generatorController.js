const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/database');
const AppGeneratorService = require('../services/AppGeneratorService');
const CodeExplainerService = require('../services/CodeExplainerService');
const { getIO } = require('../config/socket');

const generatorService = new AppGeneratorService();
const explainerService = new CodeExplainerService();

/**
 * 대화 세션 시작
 */
exports.startSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sessionId = uuidv4();

    // DB에 세션 생성
    const { data, error } = await supabaseAdmin
      .from('chat_sessions')
      .insert({
        id: sessionId,
        user_id: userId,
        stage: 'initial',
        requirements: {},
        conversation_history: []
      })
      .select()
      .single();

    if (error) throw error;

    const welcomeMessage = {
      role: 'assistant',
      content: '안녕하세요! 어떤 미니앱을 만들어 드릴까요? 예를 들어 "계산기", "타이머", "할일 목록" 등을 만들 수 있어요.',
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      sessionId,
      welcomeMessage
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 대화 메시지 전송
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    // 세션 조회
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        success: false,
        error: '세션을 찾을 수 없습니다.'
      });
    }

    // AI 응답 생성
    const response = await generatorService.processMessage(session, message);

    // 대화 히스토리 업데이트
    const updatedHistory = [
      ...session.conversation_history,
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: response.message, timestamp: new Date().toISOString() }
    ];

    await supabaseAdmin
      .from('chat_sessions')
      .update({
        conversation_history: updatedHistory,
        stage: response.stage,
        requirements: response.requirements || session.requirements
      })
      .eq('id', sessionId);

    res.json({
      success: true,
      response: {
        message: response.message,
        stage: response.stage,
        canGenerate: response.canGenerate || false
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 앱 생성 요청
 */
exports.generateApp = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // 세션 조회
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        success: false,
        error: '세션을 찾을 수 없습니다.'
      });
    }

    // Socket.IO로 진행률 전송
    const io = getIO();
    const progressCallback = (percentage, message) => {
      io.to(sessionId).emit('generation-progress', {
        sessionId,
        percentage,
        message
      });
    };

    // 앱 생성
    const result = await generatorService.generateApp(session, progressCallback);

    // 생성 완료 이벤트
    io.to(sessionId).emit('generation-complete', {
      sessionId,
      app: result.app,
      qualityScore: result.qualityScore
    });

    res.json({
      success: true,
      app: result.app,
      qualityScore: result.qualityScore
    });
  } catch (error) {
    // 에러 이벤트
    try {
      const io = getIO();
      io.to(req.params.sessionId).emit('generation-error', {
        sessionId: req.params.sessionId,
        error: error.message
      });
    } catch (e) {}
    next(error);
  }
};

/**
 * 생성 상태 조회
 */
exports.getSessionStatus = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: '세션을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      session: data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 코드 설명 요청
 */
exports.explainCode = async (req, res, next) => {
  try {
    const { code, language } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: '설명할 코드를 입력해주세요.'
      });
    }

    const explanations = await explainerService.explainCode(code, language || 'javascript');

    res.json({
      success: true,
      explanations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 코드 수정 요청 (Phase 2)
 */
exports.modifyCode = async (req, res, next) => {
  try {
    res.status(501).json({
      success: false,
      error: '이 기능은 아직 구현되지 않았습니다.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 코드 품질 점수 조회 (Phase 2)
 */
exports.getQualityScore = async (req, res, next) => {
  try {
    res.status(501).json({
      success: false,
      error: '이 기능은 아직 구현되지 않았습니다.'
    });
  } catch (error) {
    next(error);
  }
};
