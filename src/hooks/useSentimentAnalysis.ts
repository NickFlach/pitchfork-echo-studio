import { useState, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

interface EmotionScore {
  emotion: string;
  intensity: number;
  confidence: number;
}

interface SentimentResult {
  overall: 'positive' | 'negative' | 'neutral';
  polarity: number; // -1 to 1
  confidence: number;
  emotions: EmotionScore[];
  themes: string[];
  subjectivity: number; // 0 to 1
  complexity: number; // 0 to 1
  consciousnessIndicators: {
    selfAwareness: number;
    introspection: number;
    growthMindset: number;
    systemicThinking: number;
  };
}

// Enhanced emotion lexicon for consciousness analysis
const EMOTION_LEXICON = {
  // Positive consciousness emotions
  'awareness': { base: 0.8, consciousness: 0.9 },
  'clarity': { base: 0.7, consciousness: 0.8 },
  'insight': { base: 0.8, consciousness: 0.9 },
  'breakthrough': { base: 0.9, consciousness: 1.0 },
  'understanding': { base: 0.6, consciousness: 0.8 },
  'peace': { base: 0.7, consciousness: 0.6 },
  'centered': { base: 0.6, consciousness: 0.7 },
  'aligned': { base: 0.7, consciousness: 0.8 },
  'connected': { base: 0.6, consciousness: 0.7 },
  'expanded': { base: 0.8, consciousness: 0.9 },
  
  // Challenging but growth-oriented emotions
  'curious': { base: 0.5, consciousness: 0.7 },
  'questioning': { base: 0.3, consciousness: 0.6 },
  'uncertain': { base: -0.3, consciousness: 0.4 },
  'confused': { base: -0.5, consciousness: 0.2 },
  'challenged': { base: -0.2, consciousness: 0.5 },
  'struggling': { base: -0.6, consciousness: 0.3 },
  
  // Negative emotions
  'frustrated': { base: -0.7, consciousness: -0.2 },
  'stuck': { base: -0.6, consciousness: -0.1 },
  'overwhelmed': { base: -0.8, consciousness: -0.3 },
  'anxious': { base: -0.7, consciousness: -0.4 },
  'fear': { base: -0.8, consciousness: -0.3 },
  'angry': { base: -0.8, consciousness: -0.2 },
  
  // Neutral/transitional
  'reflecting': { base: 0.2, consciousness: 0.6 },
  'processing': { base: 0.1, consciousness: 0.5 },
  'observing': { base: 0.3, consciousness: 0.7 },
  'noticing': { base: 0.2, consciousness: 0.6 },
};

// Consciousness pattern indicators
const CONSCIOUSNESS_PATTERNS = {
  selfAwareness: [
    'I notice', 'I realize', 'I see that', 'I recognize', 'I am aware',
    'I observe', 'I feel', 'I sense', 'I understand', 'I acknowledge'
  ],
  introspection: [
    'looking within', 'deeper meaning', 'what this means', 'why I',
    'inner voice', 'core belief', 'underlying pattern', 'my tendency'
  ],
  growthMindset: [
    'learning', 'growing', 'developing', 'improving', 'evolving',
    'opportunity', 'challenge', 'experiment', 'try', 'explore'
  ],
  systemicThinking: [
    'connected to', 'relationship between', 'pattern', 'system',
    'holistic', 'interconnected', 'broader context', 'bigger picture'
  ],
};

export function useSentimentAnalysis() {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<Array<{
    text: string;
    result: SentimentResult;
    timestamp: Date;
  }>>([]);

  const analyzeText = useCallback(async (text: string): Promise<SentimentResult> => {
    if (!text.trim()) {
      throw new Error('Text is required for sentiment analysis');
    }

    setIsAnalyzing(true);

    try {
      // Enhanced sentiment analysis for consciousness content
      const result = performConsciousnessSentimentAnalysis(text);
      
      // Store in history
      setAnalysisHistory(prev => [
        { text, result, timestamp: new Date() },
        ...prev.slice(0, 49) // Keep last 50 analyses
      ]);

      return result;
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Failed to analyze sentiment. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  const performConsciousnessSentimentAnalysis = (text: string): SentimentResult => {
    const lowercaseText = text.toLowerCase();
    const words = lowercaseText.split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());

    // Emotion detection
    const emotions: EmotionScore[] = [];
    let polaritySum = 0;
    let emotionCount = 0;

    Object.entries(EMOTION_LEXICON).forEach(([emotion, scores]) => {
      const regex = new RegExp(`\\b${emotion}\\b`, 'gi');
      const matches = text.match(regex);
      
      if (matches) {
        const intensity = Math.min(1, matches.length * 0.3);
        emotions.push({
          emotion,
          intensity,
          confidence: 0.7 + (intensity * 0.3),
        });
        
        polaritySum += scores.base * intensity;
        emotionCount++;
      }
    });

    // Calculate overall polarity
    const polarity = emotionCount > 0 ? polaritySum / emotionCount : 0;
    
    // Determine overall sentiment
    let overall: 'positive' | 'negative' | 'neutral';
    if (polarity > 0.2) overall = 'positive';
    else if (polarity < -0.2) overall = 'negative';
    else overall = 'neutral';

    // Consciousness indicators analysis
    const consciousnessIndicators = {
      selfAwareness: calculatePatternScore(text, CONSCIOUSNESS_PATTERNS.selfAwareness),
      introspection: calculatePatternScore(text, CONSCIOUSNESS_PATTERNS.introspection),
      growthMindset: calculatePatternScore(text, CONSCIOUSNESS_PATTERNS.growthMindset),
      systemicThinking: calculatePatternScore(text, CONSCIOUSNESS_PATTERNS.systemicThinking),
    };

    // Extract themes based on word frequency and context
    const themes = extractThemes(text, words);

    // Calculate complexity and subjectivity
    const complexity = calculateComplexity(sentences, words);
    const subjectivity = calculateSubjectivity(text);

    // Calculate confidence based on multiple factors
    const confidence = calculateConfidence(
      emotionCount,
      words.length,
      Object.values(consciousnessIndicators)
    );

    return {
      overall,
      polarity,
      confidence,
      emotions: emotions.sort((a, b) => b.intensity - a.intensity).slice(0, 5),
      themes,
      subjectivity,
      complexity,
      consciousnessIndicators,
    };
  };

  const calculatePatternScore = (text: string, patterns: string[]): number => {
    let score = 0;
    const lowercaseText = text.toLowerCase();
    
    patterns.forEach(pattern => {
      const regex = new RegExp(pattern.replace(/\s+/g, '\\s+'), 'gi');
      const matches = lowercaseText.match(regex);
      if (matches) {
        score += matches.length * 0.2;
      }
    });
    
    return Math.min(1, score);
  };

  const extractThemes = (text: string, words: string[]): string[] => {
    const themes: string[] = [];
    
    // Consciousness-related themes
    const themeCategories = {
      'self-discovery': ['self', 'identity', 'who', 'authentic', 'true'],
      'growth': ['grow', 'develop', 'improve', 'learn', 'progress'],
      'awareness': ['aware', 'conscious', 'mindful', 'present', 'attentive'],
      'emotions': ['feel', 'emotion', 'mood', 'heart', 'emotional'],
      'thinking': ['think', 'thought', 'mind', 'mental', 'cognitive'],
      'relationships': ['relationship', 'connect', 'bond', 'social', 'community'],
      'purpose': ['purpose', 'meaning', 'goal', 'mission', 'intention'],
      'challenges': ['challenge', 'difficult', 'struggle', 'problem', 'obstacle'],
    };

    Object.entries(themeCategories).forEach(([theme, keywords]) => {
      const score = keywords.reduce((acc, keyword) => {
        const matches = words.filter(word => word.includes(keyword)).length;
        return acc + matches;
      }, 0);
      
      if (score >= 2) {
        themes.push(theme);
      }
    });

    return themes.slice(0, 4); // Limit to top 4 themes
  };

  const calculateComplexity = (sentences: string[], words: string[]): number => {
    if (sentences.length === 0) return 0;
    
    const avgWordsPerSentence = words.length / sentences.length;
    const longWords = words.filter(word => word.length > 6).length;
    const longWordRatio = longWords / words.length;
    
    // Normalize complexity score
    const complexityScore = (avgWordsPerSentence / 20) + longWordRatio;
    return Math.min(1, complexityScore);
  };

  const calculateSubjectivity = (text: string): number => {
    const subjectiveIndicators = [
      'I feel', 'I think', 'I believe', 'my opinion', 'personally',
      'in my view', 'I sense', 'I notice', 'seems to me', 'I realize'
    ];
    
    let subjectiveCount = 0;
    const lowercaseText = text.toLowerCase();
    
    subjectiveIndicators.forEach(indicator => {
      const matches = lowercaseText.match(new RegExp(indicator, 'gi'));
      if (matches) {
        subjectiveCount += matches.length;
      }
    });
    
    return Math.min(1, subjectiveCount * 0.2);
  };

  const calculateConfidence = (
    emotionCount: number,
    wordCount: number,
    consciousnessScores: number[]
  ): number => {
    // Base confidence on multiple factors
    const emotionConfidence = Math.min(1, emotionCount * 0.2);
    const lengthConfidence = Math.min(1, wordCount / 50);
    const consciousnessConfidence = consciousnessScores.reduce((a, b) => a + b, 0) / consciousnessScores.length;
    
    return (emotionConfidence + lengthConfidence + consciousnessConfidence) / 3;
  };

  const getEmotionalProfile = useCallback((results: SentimentResult[]): {
    dominantEmotions: string[];
    emotionalRange: number;
    stability: number;
    growthIndicators: number;
  } => {
    if (results.length === 0) {
      return {
        dominantEmotions: [],
        emotionalRange: 0,
        stability: 0,
        growthIndicators: 0,
      };
    }

    // Find most frequent emotions
    const emotionFrequency: { [key: string]: number } = {};
    results.forEach(result => {
      result.emotions.forEach(emotion => {
        emotionFrequency[emotion.emotion] = (emotionFrequency[emotion.emotion] || 0) + emotion.intensity;
      });
    });

    const dominantEmotions = Object.entries(emotionFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([emotion]) => emotion);

    // Calculate emotional range (diversity of emotions)
    const uniqueEmotions = Object.keys(emotionFrequency).length;
    const emotionalRange = Math.min(1, uniqueEmotions / 10);

    // Calculate stability (consistency of polarity)
    const polarities = results.map(r => r.polarity);
    const avgPolarity = polarities.reduce((a, b) => a + b, 0) / polarities.length;
    const variance = polarities.reduce((acc, polarity) => acc + Math.pow(polarity - avgPolarity, 2), 0) / polarities.length;
    const stability = 1 - Math.min(1, variance);

    // Calculate growth indicators
    const growthIndicators = results.reduce((acc, result) => {
      return acc + Object.values(result.consciousnessIndicators).reduce((a, b) => a + b, 0);
    }, 0) / (results.length * 4);

    return {
      dominantEmotions,
      emotionalRange,
      stability,
      growthIndicators,
    };
  }, []);

  const recentAnalyses = useMemo(() => 
    analysisHistory.slice(0, 10), 
  [analysisHistory]);

  const emotionalProfile = useMemo(() => 
    getEmotionalProfile(analysisHistory.map(a => a.result)),
  [analysisHistory, getEmotionalProfile]);

  return {
    analyzeText,
    isAnalyzing,
    analysisHistory: recentAnalyses,
    emotionalProfile,
    clearHistory: () => setAnalysisHistory([]),
  };
}