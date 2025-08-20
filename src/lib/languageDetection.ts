import { franc } from 'franc';

export interface LanguageDetection {
  language: string;
  confidence: number;
  languageName: string;
}

// Language code mapping
const LANGUAGE_NAMES: Record<string, string> = {
  'eng': 'English',
  'spa': 'Spanish',
  'fra': 'French',
  'deu': 'German',
  'ita': 'Italian',
  'por': 'Portuguese',
  'rus': 'Russian',
  'jpn': 'Japanese',
  'kor': 'Korean',
  'cmn': 'Chinese (Mandarin)',
  'ara': 'Arabic',
  'hin': 'Hindi',
  'tur': 'Turkish',
  'pol': 'Polish',
  'nld': 'Dutch',
  'swe': 'Swedish',
  'dan': 'Danish',
  'nor': 'Norwegian',
  'fin': 'Finnish',
  'ces': 'Czech',
  'hun': 'Hungarian',
  'ron': 'Romanian',
  'bul': 'Bulgarian',
  'hrv': 'Croatian',
  'slk': 'Slovak',
  'slv': 'Slovenian',
  'est': 'Estonian',
  'lav': 'Latvian',
  'lit': 'Lithuanian',
  'ell': 'Greek',
  'heb': 'Hebrew',
  'tha': 'Thai',
  'vie': 'Vietnamese',
  'ind': 'Indonesian',
  'msa': 'Malay',
  'tgl': 'Filipino',
  'ukr': 'Ukrainian',
  'bel': 'Belarusian',
  'cat': 'Catalan',
  'eus': 'Basque',
  'glg': 'Galician',
  'gle': 'Irish',
  'cym': 'Welsh',
  'isl': 'Icelandic',
  'mlt': 'Maltese',
  'sqi': 'Albanian',
  'mkd': 'Macedonian',
  'srp': 'Serbian',
  'bos': 'Bosnian',
  'mon': 'Mongolian',
  'geo': 'Georgian',
  'arm': 'Armenian',
  'aze': 'Azerbaijani',
  'kaz': 'Kazakh',
  'kir': 'Kyrgyz',
  'uzb': 'Uzbek',
  'tgk': 'Tajik',
  'tkm': 'Turkmen',
  'prs': 'Dari',
  'pus': 'Pashto',
  'urd': 'Urdu',
  'ben': 'Bengali',
  'guj': 'Gujarati',
  'pan': 'Punjabi',
  'tam': 'Tamil',
  'tel': 'Telugu',
  'kan': 'Kannada',
  'mal': 'Malayalam',
  'ori': 'Odia',
  'mar': 'Marathi',
  'nep': 'Nepali',
  'sin': 'Sinhala',
  'mya': 'Burmese',
  'khm': 'Khmer',
  'lao': 'Lao',
  'amh': 'Amharic',
  'orm': 'Oromo',
  'som': 'Somali',
  'swa': 'Swahili',
  'hau': 'Hausa',
  'yor': 'Yoruba',
  'ibo': 'Igbo',
  'zul': 'Zulu',
  'xho': 'Xhosa',
  'afr': 'Afrikaans'
};

export function detectLanguage(text: string): LanguageDetection {
  if (!text || text.trim().length < 10) {
    return {
      language: 'eng',
      confidence: 0,
      languageName: 'English'
    };
  }
  
  try {
    const detected = franc(text, { minLength: 3 });
    const confidence = text.length > 50 ? 0.8 : 0.6; // Simple confidence estimation
    
    return {
      language: detected,
      confidence,
      languageName: LANGUAGE_NAMES[detected] || 'Unknown'
    };
  } catch (error) {
    return {
      language: 'eng',
      confidence: 0,
      languageName: 'English'
    };
  }
}

// Simple translation using pre-defined common phrases
const BASIC_TRANSLATIONS: Record<string, Record<string, string>> = {
  'hello': {
    'spa': 'hola',
    'fra': 'bonjour',
    'deu': 'hallo',
    'ita': 'ciao',
    'por': 'olá',
    'rus': 'привет',
    'jpn': 'こんにちは',
    'kor': '안녕하세요',
    'cmn': '你好',
    'ara': 'مرحبا'
  },
  'goodbye': {
    'spa': 'adiós',
    'fra': 'au revoir',
    'deu': 'auf wiedersehen',
    'ita': 'arrivederci',
    'por': 'tchau',
    'rus': 'до свидания',
    'jpn': 'さようなら',
    'kor': '안녕히 가세요',
    'cmn': '再见',
    'ara': 'مع السلامة'
  },
  'thank you': {
    'spa': 'gracias',
    'fra': 'merci',
    'deu': 'danke',
    'ita': 'grazie',
    'por': 'obrigado',
    'rus': 'спасибо',
    'jpn': 'ありがとう',
    'kor': '감사합니다',
    'cmn': '谢谢',
    'ara': 'شكرا'
  }
};

export function basicTranslate(text: string, targetLang: string): string | null {
  const normalizedText = text.toLowerCase().trim();
  
  for (const [english, translations] of Object.entries(BASIC_TRANSLATIONS)) {
    if (normalizedText.includes(english) && translations[targetLang]) {
      return text.replace(new RegExp(english, 'gi'), translations[targetLang]);
    }
  }
  
  return null;
}

export function getCommonLanguages(): Array<{ code: string; name: string }> {
  const common = ['eng', 'spa', 'fra', 'deu', 'ita', 'por', 'rus', 'jpn', 'kor', 'cmn', 'ara', 'hin'];
  
  return common.map(code => ({
    code,
    name: LANGUAGE_NAMES[code] || code
  }));
}