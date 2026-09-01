import { useState, useCallback, useRef, useEffect } from 'react';
import { voiceApi } from '../services/api';

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
  English: { error: "Sorry, I couldn't reach the server. Please try again.", noIntent: "I didn't quite catch that. You can say 'help' to hear what I can do.", help: 'You can say things like: "play memory game", "do I have any medicine reminders", or "how am I doing". You can also tap any button on the screen.', couldNotHear: "Couldn't hear you — try again." },
  Assamese: { error: "দুঃখিত, ছৰ্ভাৰলৈ সংযোগ কৰিব পৰা নগ'ল। পুনৰ চেষ্টা কৰক।", noIntent: "মই বুজিব পৰা নালোৱা। 'সাহায্য' ক'ব আমি কি কৰিব পাৰো।", help: 'আপুনি এনেকুৱা ক\'ব পাৰে: "মেমৰি খেলা খেলক", "মোৰ কোনো ওষুধৰ সোঁৱৰণি আছে নেকি", বা "মোৰ অৱস্থা কেনে"।', couldNotHear: "শুনিব পৰা নগ'ল — পুনৰ চেষ্টা কৰক।" },
  Bengali: { error: "দুঃখিত, সার্ভারে সংযোগ করা যায়নি। আবার চেষ্টা করুন।", noIntent: "আমি বুঝতে পারিনি। 'সাহায্য' বলুন দেখুন আমি কি করতে পারি।", help: 'আপনি বলতে পারেন: "মেমরি খেলা খেলুন", "আমার কি ওষুধের রিমাইন্ডার আছে", বা "আমার অবস্থা কেমন"।', couldNotHear: "শোনা যায়নি — আবার চেষ্টা করুন।" },
  Hindi: { error: "माफ़ करें, सर्वर से कनेक्ट नहीं हो पाया। फिर से कोशिश करें।", noIntent: "मैं समझ नहीं पाया। 'मदद' बोलें।", help: 'आप बोल सकते हैं: "खेल खेलें", "मेरी दवा का रिमाइंडर है", या "मैं कैसा हूँ"।', couldNotHear: "सुन नहीं पाए — फिर से कोशिश करें।" },
  Khasi: { error: "Sngew u, server na ka khyntieh pdot. Phar don u.", noIntent: "Ngai lait ban daka. 'Help' lait ka ngai ki da don.", help: 'Phi ktien ba khana: "phan ngike", "medicine iing kyntiew long da nang", ban "longkam khang dei".', couldNotHear: "Ngai ba khyntieh long thohne — phar don u." },
  Mizo: { error: "Ka lawm, server ah in kaih theih loh. Phar hla rawh.", noIntent: "Ka ngaih theih loh. 'Help' hriattir ka ngeih erawh.", help: 'I khian tawng khuanlh: "kawlhran hlawh", "medicine hriattir mawh nang", dam "ka hriselna dei".', couldNotHear: "Ngaih theih loh — phar hla rawh." },
  Nagamese: { error: "Khoma, server ot lagise nai. Abar coba koro.", noIntent: "Moi bujhi parilu nai. 'Sahay' bolo moi ki koribo pari.", help: 'Tumi bolo para: "memory khel", "mora dawa yad ase", ba "mora obostha kene".', couldNotHear: "Sunite parilu nai — abar coba koro." },
  Manipuri: { error: "Yadne, server ot mada keire. Akhoi coba.", noIntent: "Nga mada hri. 'Help' phangjo.", help: 'Nadi phangjo: "memory phang", "nga medicine eikhoi mmi", ba "nga eikhoi yadne".', couldNotHear: "Mada keire — akhoi coba." },
  Nepali: { error: "Maafi, server sanga bheta bhaena. Feri prayash gar.", noIntent: "Bujhina. 'Sahay' bhana.", help: 'Tapai bhanna saknu: "memory khel", "mero dawa yaad cha", wa "mero haalat kasto".', couldNotHear: "Sakina — feri prayash gar." },
};

export function useVoiceAssistant({ patientId, voiceVolume = 70, language = 'English', onAction } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const langRef = useRef(language);

  useEffect(() => { langRef.current = language; }, [language]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setIsSupported(false); return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = LANG_BCP47[langRef.current] || 'en-IN';

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      handleCommand(text);
    };
    recognition.onerror = (event) => { setError(event.error); setIsListening(false); };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    return () => { try { recognition.abort(); } catch {} };
  }, []);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = Math.max(0, Math.min(1, voiceVolume / 100));
    utterance.rate = 0.95;
    utterance.lang = LANG_BCP47[langRef.current] || 'en-IN';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [voiceVolume]);

  const handleCommand = useCallback(async (text) => {
    setError(null);
    try {
      const res = await voiceApi.command({ patientId, transcript: text, language: langRef.current });
      const { speech, action, target, reminders } = res.data;
      setLastResponse(speech);
      speak(speech);
      if (onAction && action) onAction({ action, target, reminders });
    } catch {
      const fallback = LANG_RESPONSES[langRef.current]?.error || LANG_RESPONSES.English.error;
      setLastResponse(fallback);
      speak(fallback);
    }
  }, [patientId, speak, onAction]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    setTranscript('');
    recognitionRef.current.lang = LANG_BCP47[langRef.current] || 'en-IN';
    try { recognitionRef.current.start(); setIsListening(true); } catch {}
  }, []);

  const stopListening = useCallback(() => { recognitionRef.current?.stop(); setIsListening(false); }, []);

  return { isSupported, isListening, isSpeaking, transcript, lastResponse, error, startListening, stopListening, speak, sendTextCommand: handleCommand };
}

