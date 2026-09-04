import { useState, useCallback, useRef, useEffect } from 'react';
import { voiceApi } from '../services/api';
import { decayDetector } from '../services/linguisticDecay';

const LANG_BCP47 = {
  English: 'en-IN',
  Assamese: 'as-IN',
  Bengali: 'bn-IN',
  Hindi: 'hi-IN',
  Khasi: 'en-IN',
  Mizo: 'en-IN',
  Nagamese: 'bn-IN',
  Manipuri: 'mni-IN',
  Nepali: 'ne-NP',
};

const LANG_RESPONSES = {
  English: { error: "Sorry, I couldn't process that. Please try again.", noIntent: "I didn't quite catch that. Say 'help' to hear what I can do.", help: 'You can say: "play memory game", "open reminders", "open games", "go to settings", or "how am I doing".', couldNotHear: "Couldn't hear you — try again.", greeting: 'Hello! How can I help you today?', opening: (p) => `Opening ${p} for you now.` },
  Hindi: { error: "माफ़ करें, कुछ गलत हो गया। फिर से कोशिश करें।", noIntent: "मैं समझ नहीं पाया। 'मदद' बोलें।", help: 'आप बोल सकते हैं: "खेल खेलें", "रिमाइंडर खोलें", "गेम्स खोलें", या "सेटिंग्स"।', couldNotHear: "सुन नहीं पाए — फिर से कोशिश करें।", greeting: 'नमस्ते! मैं आपकी क्या मदद कर सकता हूँ?', opening: (p) => `${p} खोल रहा हूँ।` },
  Bengali: { error: "দুঃখিত, কিছু ভুল হয়েছে। আবার চেষ্টা করুন।", noIntent: "আমি বুঝতে পারিনি। 'সাহায্য' বলুন।", help: 'আপনি বলতে পারেন: "মেমরি খেলা", "রিমাইন্ডার খুলুন", "গেম্স খুলুন"।', couldNotHear: "শোনা যায়নি — আবার চেষ্টা করুন।", greeting: 'নমস্কার! আমি কীভাবে সাহায্য করতে পারি?', opening: (p) => `${p} খুলে দিচ্ছি।` },
  Assamese: { error: "দুঃখিত, কিবা ভুল হ'ল। পুনৰ চেষ্টা কৰক।", noIntent: "মই বুজিব পৰা নালোৱা। 'সাহায্য' ক'ব।", help: 'আপুনি ক\'ব পাৰে: "মেমৰি খেলা", "ৰিমাইণ্ডাৰ খোলক", "গেম্স খোলক"।', couldNotHear: "শুনিব পৰা নগ'ল — পুনৰ চেষ্টা কৰক।", greeting: 'নমস্কাৰ!', opening: (p) => `${p} খোলি দিছো।` },
  Khasi: { error: "Sngew u, kin ba long word. Phar don u.", noIntent: "Ngai lait ban daka. 'Help' lait ka ngai ki da don.", help: 'Phi ktien: "phan ngike", "reminder khana", "games khana".', couldNotHear: "Ngai ba khyntieh long thohne — phar don u.", greeting: 'Khublei!', opening: (p) => `${p} phi phar khazara.` },
  Mizo: { error: "Ka lawm, a na tinah buai. Phar hla rawh.", noIntent: "Ka ngaih theih loh. 'Help' hriattir ka ngeih erawh.", help: 'I khian tawng: "kawlhran hlawh", "reminder khuanlh", "games khuanlh".', couldNotHear: "Ngaih theih loh — phar hla rawh.", greeting: 'Chibai!', opening: (p) => `${p} i phar khazara.` },
  Nagamese: { error: "Khoma, ki ba hua. Abar coba koro.", noIntent: "Moi bujhi parilu nai. 'Sahay' bolo.", help: 'Tumi bolo para: "memory khel", "reminder khul", "games khul".', couldNotHear: "Sunite parilu nai — abar coba koro.", greeting: 'Namaskar!', opening: (p) => `${p} tumar khabar kholise.` },
  Manipuri: { error: "Yadne, ki ba haidra. Akhoi coba.", noIntent: "Nga mada hri. 'Help' phangjo.", help: 'Nadi phangjo: "memory phang", "reminder kh drums", "games kh drums".', couldNotHear: "Mada keire — akhoi coba.", greeting: 'Khurumjee!', opening: (p) => `${p} nadi phang khara.` },
  Nepali: { error: "Maafi, kesar bhayo. Feri prayash gar.", noIntent: "Bujhina. 'Sahay' bhana.", help: 'Tapai bhanna: "memory khel", "reminder khol", "games khol".', couldNotHear: "Sakina — feri prayash gar.", greeting: 'Namaste!', opening: (p) => `${p} tapaiko lagi kholera.` },
};

const NAV_COMMANDS = [
  { pattern: /memory|yaad|match/i, target: '/games/memory-match', label: 'Memory Match', simplifiedKey: 'play_game' },
  { pattern: /pattern|sequence|nishan|shape/i, target: '/games/pattern-recognition', label: 'Pattern Recognition', simplifiedKey: 'play_game' },
  { pattern: /routine|daily|chores|kaam|roz|habit/i, target: '/games/daily-routine-recall', label: 'Daily Routine', simplifiedKey: 'play_game' },
  { pattern: /play.*game|game.*play|khel|start.*game/i, target: '/games', label: 'Games', simplifiedKey: 'play_game' },
  { pattern: /reminder|remind|medicine|meds|pill|dawa|yad|schedule/i, target: '/reminders', label: 'Reminders', simplifiedKey: 'check_reminders' },
  { pattern: /setting|preference/i, target: '/settings', label: 'Settings', simplifiedKey: null },
  { pattern: /home|dashboard|main|wapas|back/i, target: '/home', label: 'Dashboard', simplifiedKey: null },
  { pattern: /caregiver|carer/i, target: '/caregiver', label: 'Caregiver', simplifiedKey: null },
  { pattern: /help|assist|sahay|madad/i, target: null, label: null, simplifiedKey: 'help' },
  { pattern: /mood|feel|feeling|kaisa|lag/i, target: '/home', label: 'mood check-in', simplifiedKey: null },
];

export function useVoiceAssistant({ patientId, voiceVolume = 70, language = 'English', onAction } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);
  const [decayStatus, setDecayStatus] = useState(decayDetector.getStatus());
  const recognitionRef = useRef(null);
  const langRef = useRef(language);
  const interactionStartRef = useRef(null);

  useEffect(() => { langRef.current = language; decayDetector.setOriginalLanguage(language); }, [language]);

  useEffect(() => {
    const unsub = decayDetector.onDecayChange(() => {
      setDecayStatus(decayDetector.getStatus());
    });
    return unsub;
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setIsSupported(false); return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = decayDetector.getSpeechLangCode();

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      handleCommand(text);
    };
    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        setError('no-speech');
      } else {
        setError(event.error);
      }
      setIsListening(false);
      decayDetector.recordInteraction({ transcript: '', isError: true });
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    return () => { try { recognition.abort(); } catch {} };
  }, []);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = Math.max(0, Math.min(1, voiceVolume / 100));
    utterance.rate = decayDetector.getVoiceRate();
    utterance.lang = decayDetector.getSpeechLangCode();
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [voiceVolume]);

  const getSimplifiedResponse = useCallback((key) => {
    return decayDetector.getSimplifiedResponse(key);
  }, []);

  const handleCommand = useCallback(async (text) => {
    setError(null);
    const lang = langRef.current;
    const s = LANG_RESPONSES[lang] || LANG_RESPONSES.English;
    const startTime = Date.now();
    const lowerText = text.toLowerCase().trim();

    for (const cmd of NAV_COMMANDS) {
      if (cmd.pattern.test(lowerText)) {
        let finalSpeech;
        if (cmd.simplifiedKey === 'help') {
          finalSpeech = getSimplifiedResponse('help') || s.help;
        } else if (cmd.simplifiedKey) {
          finalSpeech = getSimplifiedResponse(cmd.simplifiedKey) || s.opening(cmd.label);
        } else {
          finalSpeech = s.opening(cmd.label);
        }

        setLastResponse(finalSpeech);
        speak(finalSpeech);
        if (onAction && cmd.target) {
          onAction({ action: 'navigate', target: cmd.target });
        }
        decayDetector.recordInteraction({ transcript: text, isError: false, timestamp: Date.now(), responseTime: Date.now() - startTime });
        return;
      }
    }

    try {
      const res = await voiceApi.command({ patientId, transcript: text, language: lang });
      const { speech, action, target } = res.data;

      let finalSpeech = speech;
      if (action === 'help') {
        finalSpeech = getSimplifiedResponse('help') || speech;
      }

      setLastResponse(finalSpeech);
      speak(finalSpeech);
      if (onAction && action) onAction({ action, target });
    } catch {
      const fallback = getSimplifiedResponse('error') || s.error;
      setLastResponse(fallback);
      speak(fallback);
    }

    decayDetector.recordInteraction({ transcript: text, isError: false, timestamp: Date.now(), responseTime: Date.now() - startTime });
  }, [patientId, speak, onAction, getSimplifiedResponse]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    setTranscript('');
    setLastResponse('');
    recognitionRef.current.lang = decayDetector.getSpeechLangCode();
    interactionStartRef.current = Date.now();
    try { recognitionRef.current.start(); setIsListening(true); } catch {}
  }, []);

  const stopListening = useCallback(() => { recognitionRef.current?.stop(); setIsListening(false); }, []);

  return {
    isSupported, isListening, isSpeaking, transcript, lastResponse, error,
    startListening, stopListening, speak, sendTextCommand: handleCommand,
    decayStatus,
  };
}
