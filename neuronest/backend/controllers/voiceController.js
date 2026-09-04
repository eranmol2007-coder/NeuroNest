const asyncHandler = require('express-async-handler');
const { getModels } = require('../utils/modelResolver');

const INTENTS = {
  English: [
    { pattern: /\b(play|start|open)\b.*\b(memory|match)\b/, intent: 'play_game', gameType: 'memoryMatch' },
    { pattern: /\b(play|start|open)\b.*\b(pattern)\b/, intent: 'play_game', gameType: 'patternRecognition' },
    { pattern: /\b(play|start|open)\b.*\b(routine|daily)\b/, intent: 'play_game', gameType: 'dailyRoutineRecall' },
    { pattern: /\b(remind|reminder|medicine|medication)\b/, intent: 'check_reminders', filter: 'medicine' },
    { pattern: /\b(water|drink)\b/, intent: 'check_reminders', filter: 'water' },
    { pattern: /\b(appointment|doctor|visit)\b/, intent: 'check_reminders', filter: 'appointment' },
    { pattern: /\b(how am i doing|my score|my progress)\b/, intent: 'check_progress' },
    { pattern: /\b(help|what can you do)\b/, intent: 'help' },
    { pattern: /\b(mood|feeling|how do i feel)\b/, intent: 'mood_checkin' },
  ],
  Assamese: [
    { pattern: /\b(খেলা|খেলক|মেমৰি|পেটাৰ্ন|ৰুটিন)\b/, intent: 'play_game', gameType: 'memoryMatch' },
    { pattern: /\b(সোঁৱৰণি|ওষুধ|ঔষধ)\b/, intent: 'check_reminders', filter: 'medicine' },
    { pattern: /\b(পানী)\b/, intent: 'check_reminders', filter: 'water' },
    { pattern: /\b(সাক্ষাৎ|ডাক্তৰ)\b/, intent: 'check_reminders', filter: 'appointment' },
    { pattern: /\b(অগ্ৰগতি|স্কৰ)\b/, intent: 'check_progress' },
    { pattern: /\b(সাহায্য|কি কৰিব)\b/, intent: 'help' },
    { pattern: /\b(মুড|অনুভৱ|কেনে)\b/, intent: 'mood_checkin' },
  ],
  Bengali: [
    { pattern: /\b(খেলা|খেলুন|মেমরি|প্যাটার্ন|রুটিন)\b/, intent: 'play_game', gameType: 'memoryMatch' },
    { pattern: /\b(রিমাইন্ডার|ওষুধ|ঔষধ)\b/, intent: 'check_reminders', filter: 'medicine' },
    { pattern: /\b(পানি)\b/, intent: 'check_reminders', filter: 'water' },
    { pattern: /\b(অ্যাপয়েন্টমেন্ট|ডাক্তার)\b/, intent: 'check_reminders', filter: 'appointment' },
    { pattern: /\b(অগ্রগতি|স্কোর)\b/, intent: 'check_progress' },
    { pattern: /\b(সাহায্য|কি করতে পারি)\b/, intent: 'help' },
    { pattern: /\b(মুড|অনুভব|কেমন)\b/, intent: 'mood_checkin' },
  ],
  Hindi: [
    { pattern: /\b(खेल|खेलें|खेलो|याद|दवा)\b/, intent: 'play_game', gameType: 'memoryMatch' },
    { pattern: /\b(रिमाइंडर|दवा|दवाई|औषध)\b/, intent: 'check_reminders', filter: 'medicine' },
    { pattern: /\b(पानी|पियो)\b/, intent: 'check_reminders', filter: 'water' },
    { pattern: /\b(अपॉइंटमेंट|डॉक्टर|मिलना)\b/, intent: 'check_reminders', filter: 'appointment' },
    { pattern: /\b(प्रगति|अंक|स्कोर)\b/, intent: 'check_progress' },
    { pattern: /\b(मदद|सहायता|क्या कर सकते)\b/, intent: 'help' },
    { pattern: /\b(मूड|महसूस|कैसा हूँ)\b/, intent: 'mood_checkin' },
  ],
  Khasi: [
    { pattern: /\b(phan|ngike|khel|kawlhran)\b/, intent: 'play_game', gameType: 'memoryMatch' },
    { pattern: /\b(iing kyntiew|medicine)\b/, intent: 'check_reminders', filter: 'medicine' },
    { pattern: /\b(duh|pani)\b/, intent: 'check_reminders', filter: 'water' },
    { pattern: /\b(meeting|doctor)\b/, intent: 'check_reminders', filter: 'appointment' },
    { pattern: /\b(progress|score)\b/, intent: 'check_progress' },
    { pattern: /\b(help|sahay)\b/, intent: 'help' },
    { pattern: /\b(mood|longkam|hrisel)\b/, intent: 'mood_checkin' },
  ],
  Mizo: [
    { pattern: /\b(kawlhran|phan|khel)\b/, intent: 'play_game', gameType: 'memoryMatch' },
    { pattern: /\b(hriattir|medicine)\b/, intent: 'check_reminders', filter: 'medicine' },
    { pattern: /\b(tui|pani)\b/, intent: 'check_reminders', filter: 'water' },
    { pattern: /\b(meeting|doctor)\b/, intent: 'check_reminders', filter: 'appointment' },
    { pattern: /\b(progress|score)\b/, intent: 'check_progress' },
    { pattern: /\b(help|lawm)\b/, intent: 'help' },
    { pattern: /\b(mood|hrisel|feeling)\b/, intent: 'mood_checkin' },
  ],
  Nagamese: [
    { pattern: /\b(khel|khelo|memory|dawa)\b/, intent: 'play_game', gameType: 'memoryMatch' },
    { pattern: /\b(yad|dawa|medicine)\b/, intent: 'check_reminders', filter: 'medicine' },
    { pattern: /\b(pani)\b/, intent: 'check_reminders', filter: 'water' },
    { pattern: /\b(bhet|doctor)\b/, intent: 'check_reminders', filter: 'appointment' },
    { pattern: /\b(progress|number)\b/, intent: 'check_progress' },
    { pattern: /\b(sahay|madad)\b/, intent: 'help' },
    { pattern: /\b(mood|feel|lagise)\b/, intent: 'mood_checkin' },
  ],
  Manipuri: [
    { pattern: /\b(phang|phangjo|khel|phang-thiba)\b/, intent: 'play_game', gameType: 'memoryMatch' },
    { pattern: /\b(eikhoi|medicine)\b/, intent: 'check_reminders', filter: 'medicine' },
    { pattern: /\b(dah|pani)\b/, intent: 'check_reminders', filter: 'water' },
    { pattern: /\b(mee|doctor)\b/, intent: 'check_reminders', filter: 'appointment' },
    { pattern: /\b(progress|score)\b/, intent: 'check_progress' },
    { pattern: /\b(help|help)\b/, intent: 'help' },
    { pattern: /\b(mood|yadne|feeling)\b/, intent: 'mood_checkin' },
  ],
  Nepali: [
    { pattern: /\b(खेल|खेल्न|memory|दवा)\b/, intent: 'play_game', gameType: 'memoryMatch' },
    { pattern: /\b(याद|दवा|dawa|medicine)\b/, intent: 'check_reminders', filter: 'medicine' },
    { pattern: /\b(पानी|pani)\b/, intent: 'check_reminders', filter: 'water' },
    { pattern: /\b(भेट|doctor)\b/, intent: 'check_reminders', filter: 'appointment' },
    { pattern: /\b(प्रगति|number|progress)\b/, intent: 'check_progress' },
    { pattern: /\b(सहाय|sahay|help)\b/, intent: 'help' },
    { pattern: /\b(मुड|feel|lagiracha)\b/, intent: 'mood_checkin' },
  ],
};

const SPEECH = {
  English: {
    opening: (g) => `Opening ${g} for you now.`,
    remindersCount: (c, t, title, time) => `You have ${c} ${t} reminder${c > 1 ? 's' : ''} coming up. The next one is "${title}" at ${time}.`,
    noReminders: (t) => `You have no pending ${t} reminders right now. Well done!`,
    profileNeeded: "Please sign in or select your profile first to use this feature.",
    progress: "Let's take a look at your progress on the dashboard.",
    moodCheckin: 'How are you feeling today? You can tap a face on your home screen to tell me.',
    help: 'You can say things like: "play memory game", "do I have any medicine reminders", or "how am I doing". You can also tap any button on the screen.',
    unknown: "I didn't quite catch that. You can say 'help' to hear what I can do.",
  },
  Assamese: {
    opening: (g) => `${g} আপোনাৰ বাবে খোলি দিছো।`,
    remindersCount: (c, t, title, time) => `আপোনাৰ ${c}টা ${t} সোঁৱৰণি আছে। পৰৱৰ্তীটো "${title}" ${time} বজাত।`,
    noReminders: (t) => `আপোনাৰ এতিয়া কোনো ${t} সোঁৱৰণি নাই। বহুত ভাল!`,
    profileNeeded: 'অনুগ্ৰহ কৰি প্ৰথমে আপোনাৰ প্ৰফাইল বাছনি কৰক।',
    progress: 'ডেস্কবৰ্ডত আপোনাৰ অগ্ৰগতি চাওক।',
    moodCheckin: 'আপুনি আজি কেনে অনুভৱ কৰি আছে? হোম স্ক্ৰিনত এটা মুখ টেপ কৰক।',
    help: 'আপুনি এনেকুৱা ক\'ব পাৰে: "মেমৰি খেলা খেলক", "মোৰ কোনো ওষুধৰ সোঁৱৰণি আছে নেকি", বা "মোৰ অৱস্থা কেনে"।',
    unknown: 'মই বুজিব পৰা নালোৱা। \'সাহায্য\' ক\'ব আমি কি কৰিব পাৰো।',
  },
  Bengali: {
    opening: (g) => `${g} আপনার জন্য খুলে দিচ্ছি।`,
    remindersCount: (c, t, title, time) => `আপনার ${c}টি ${t} রিমাইন্ডার আছে। পরবর্তীটি "${title}" ${time} বজায়।`,
    noReminders: (t) => `আপনার এখন কোনো ${t} রিমাইন্ডার নেই। ভালো কাজ!`,
    profileNeeded: 'অনুগ্রহ করে প্রথমে সাইন ইন করুন।',
    progress: 'ড্যাশবোর্ডে আপনার অগ্রগতি দেখুন।',
    moodCheckin: 'আজ আপনি কেমন অনুভব করছেন? হোম স্ক্রিনে একটি মুখ ট্যাপ করুন।',
    help: 'আপনি বলতে পারেন: "মেমরি খেলা খেলুন", "আমার কি ওষুধের রিমাইন্ডার আছে", বা "আমার অবস্থা কেমন"।',
    unknown: 'আমি বুঝতে পারিনি। \'সাহায্য\' বলুন দেখুন আমি কি করতে পারি।',
  },
  Hindi: {
    opening: (g) => `आपके लिए ${g} खोल रहा हूँ।`,
    remindersCount: (c, t, title, time) => `आपके ${c} ${t} रिमाइंडर हैं। अगला "${title}" ${time} बजे।`,
    noReminders: (t) => `अभी कोई ${t} रिमाइंडर नहीं। बहुत अच्छा!`,
    profileNeeded: 'कृपया पहले अपनी प्रोफ़ाइल चुनें।',
    progress: 'डैशबोर्ड पर अपनी प्रगति देखें।',
    moodCheckin: 'आज आप कैसा महसूस कर रहे हैं? होम स्क्रीन पर एक चेहरा टैप करें।',
    help: 'आप बोल सकते हैं: "खेल खेलें", "मेरी दवा का रिमाइंडर है", या "मैं कैसा हूँ"।',
    unknown: 'मैं समझ नहीं पाया। \'मदद\' बोलें।',
  },
  Khasi: {
    opening: (g) => `${g} phi phar khazara.`,
    remindersCount: (c, t, title, time) => `Phi na ${c} ${t} iing kyntiew mawh. Tang ban "${title}" ${time}.`,
    noReminders: (t) => `Phi na ${t} iing kyntiew long thohne. Kuler dei!`,
    profileNeeded: 'Sngewbha sign in shwa.',
    progress: 'Dashboard na phi progress lait.',
    moodCheckin: 'Phi kine longkam da dei? Home screen na tap u.',
    help: 'Phi ktien ba khana: "phan ngike", "medicine iing kyntiew long da nang", ban "longkam khang dei".',
    unknown: 'Ngai lait ban daka. \'Help\' lait ka ngai ki da don.',
  },
  Mizo: {
    opening: (g) => `${g} i phar khazara.`,
    remindersCount: (c, t, title, time) => `I na ${c} ${t} hriattir mawh. A hnuaih ber "${title}" ${time} ah.`,
    noReminders: (t) => `I na ${t} hriattir khatmah awm lo. Hrisel em!`,
    profileNeeded: 'Khawngaihin sign in hmasa rawh.',
    progress: 'Dashboard ah i progress hmuh.',
    moodCheckin: 'I ni tinah hriselna tak erawh? Home screen ah tap rawh.',
    help: 'I khian tawng khuanlh: "kawlhran hlawh", "medicine hriattir mawh nang", dam "ka hriselna dei".',
    unknown: 'Ka ngaih theih loh. \'Help\' hriattir ka ngeih erawh.',
  },
  Nagamese: {
    opening: (g) => `${g} tumar khabar kholise.`,
    remindersCount: (c, t, title, time) => `Tumar ${c} ta ${t} yad ase. Agila "${title}" ${time} ot.`,
    noReminders: (t) => `Tumar ${t} yad nai etyao. Bhalo!`,
    profileNeeded: 'Doya kori prothom sign in koro.',
    progress: 'Dashboard ot tumar progress dekho.',
    moodCheckin: 'Tumi aj kene feel koriso? Home screen ot ek mukh tap koro.',
    help: 'Tumi bolo para: "memory khel", "mora dawa yad ase", ba "mora obostha kene".',
    unknown: 'Moi bujhi parilu nai. \'Sahay\' bolo moi ki koribo pari.',
  },
  Manipuri: {
    opening: (g) => `${g} nadi phang khara.`,
    remindersCount: (c, t, title, time) => `Nadi ${c} ${t} eikhoi mmi. Aga "${title}" ${time} ot.`,
    noReminders: (t) => `Nadi ${t} eikhoi yakta idou. Yadne!`,
    profileNeeded: 'Chanbina hanna sign in toubiyu.',
    progress: 'Dashboard ot nadi progress keire.',
    moodCheckin: 'Adum nadi eikhoi yadne? Home screen a tap ju.',
    help: 'Nadi phangjo: "memory phang", "nga medicine eikhoi mmi", ba "nga eikhoi yadne".',
    unknown: 'Nga mada hri. \'Help\' phangjo.',
  },
  Nepali: {
    opening: (g) => `${g} tapaiko lagi kholera.`,
    remindersCount: (c, t, title, time) => `Tapai ko ${c} wota ${t} yad cha. Agaali "${title}" ${time} ma.`,
    noReminders: (t) => `Tapai ko ${t} yad chaina ahile. Ramro!`,
    profileNeeded: 'Kripaya pahila sign in garnuhos.',
    progress: 'Dashboard ma tapaiko progress hera.',
    moodCheckin: 'Tapai aaja kasto lagiracha? Home screen ma tap gar.',
    help: 'Tapai bhanna saknu: "memory khel", "mero dawa yaad cha", wa "mero haalat kasto".',
    unknown: 'Bujhina. \'Sahay\' bhana.',
  },
};

const GAME_NAMES = {
  English: { memoryMatch: 'Memory Match', patternRecognition: 'Pattern Recognition', dailyRoutineRecall: 'Daily Routine Recall' },
  Assamese: { memoryMatch: 'মেমৰি মেচ', patternRecognition: 'পেটাৰ্ন চিনাক্তকৰণ', dailyRoutineRecall: 'দৈনিক কাম' },
  Bengali: { memoryMatch: 'মেমরি ম্যাচ', patternRecognition: 'প্যাটার্ন সনাক্তকরণ', dailyRoutineRecall: 'দৈনিক কাজ' },
  Hindi: { memoryMatch: 'मेमोरी मैच', patternRecognition: 'पैटर्न पहचान', dailyRoutineRecall: 'दैनिक काम' },
  Khasi: { memoryMatch: 'Yad da match', patternRecognition: 'Pattern iak pomtied', dailyRoutineRecall: 'Nongngei kam' },
  Mizo: { memoryMatch: 'Yad tlinnawnh', patternRecognition: 'Tawng phaithlakna', dailyRoutineRecall: 'Ni tin thawhna' },
  Nagamese: { memoryMatch: 'Memory match', patternRecognition: 'Nishan pehchano', dailyRoutineRecall: 'Roz ka kaj' },
  Manipuri: { memoryMatch: 'Yad match', patternRecognition: 'Tanthabagi puthok', dailyRoutineRecall: 'Nungai khangneiba' },
  Nepali: { memoryMatch: 'Memory match', patternRecognition: 'Nishan pehchan', dailyRoutineRecall: 'Dainik kaam' },
};

function parseIntent(transcript, lang) {
  const text = transcript.toLowerCase().trim();
  
  // We combine English, Hindi, and Hinglish keywords to be incredibly smart
  // without needing an external AI API key. It just scans for contextual keywords.
  
  // 1. Specific Games
  if (/(memory|yaad|match)/i.test(text)) {
    return { intent: 'play_game', gameType: 'memoryMatch' };
  }
  if (/(pattern|sequence|nishan|shape)/i.test(text)) {
    return { intent: 'play_game', gameType: 'patternRecognition' };
  }
  if (/(routine|daily|chores|kaam|roz|habit)/i.test(text)) {
    return { intent: 'play_game', gameType: 'dailyRoutineRecall' };
  }
  
  // 2. General Games
  if (/(play|game|khel|start|open.*game)/i.test(text)) {
    return { intent: 'play_game', gameType: null };
  }
  
  // 3. Reminders
  if (/(remind|medicine|meds|pill|dawa|yad|schedule)/i.test(text)) {
    return { intent: 'check_reminders', filter: 'medicine' };
  }
  if (/(water|drink|pani|pina)/i.test(text)) {
    return { intent: 'check_reminders', filter: 'water' };
  }
  if (/(doctor|appointment|visit|meet|bhet)/i.test(text)) {
    return { intent: 'check_reminders', filter: 'appointment' };
  }
  if (/(reminder|reminders|notification)/i.test(text)) {
    return { intent: 'check_reminders', filter: null };
  }

  // 4. Navigate to specific pages
  if (/(open|go to|show|take me to|navigate).*(reminder)/i.test(text)) {
    return { intent: 'navigate_page', target: '/reminders' };
  }
  if (/(open|go to|show|take me to|navigate).*(setting)/i.test(text)) {
    return { intent: 'navigate_page', target: '/settings' };
  }
  if (/(open|go to|show|take me to|navigate).*(game)/i.test(text)) {
    return { intent: 'navigate_page', target: '/games' };
  }
  if (/(open|go to|show|take me to|navigate).*(home|dashboard)/i.test(text)) {
    return { intent: 'navigate_page', target: '/home' };
  }
  if (/(open|go to|show|take me to|navigate).*(caregiver)/i.test(text)) {
    return { intent: 'navigate_page', target: '/caregiver' };
  }

  // 5. Progress & Dashboard
  if (/(progress|score|doing)/i.test(text)) {
    return { intent: 'check_progress' };
  }
  if (/(home|main|wapas|back)/i.test(text)) {
    return { intent: 'navigate_home' };
  }
  
  // 6. Mood
  if (/(mood|feel|feeling|kaisa|lag)/i.test(text)) {
    return { intent: 'mood_checkin' };
  }
  
  // 7. Help
  if (/(help|assist|what|sahay|madad)/i.test(text)) {
    return { intent: 'help' };
  }

  // Fallback
  return { intent: 'unknown' };
}

const processVoiceCommand = asyncHandler(async (req, res) => {
  const { Reminder } = getModels();
  const { patientId, transcript, language = 'English' } = req.body;

  if (!transcript) { res.status(400); throw new Error('transcript is required'); }

  const parsed = parseIntent(transcript, language);
  const lang = language;
  const s = SPEECH[lang] || SPEECH.English;
  const gNames = GAME_NAMES[lang] || GAME_NAMES.English;
  let speech = '';
  let data = null;

  switch (parsed.intent) {
    case 'play_game': {
      if (patientId) {
        let routePath = '';
        if (parsed.gameType === 'memoryMatch') { routePath = '/games/memory-match'; speech = s.opening(gNames.memoryMatch); }
        else if (parsed.gameType === 'patternRecognition') { routePath = '/games/pattern-recognition'; speech = s.opening(gNames.patternRecognition); }
        else if (parsed.gameType === 'dailyRoutineRecall') { routePath = '/games/daily-routine-recall'; speech = s.opening(gNames.dailyRoutineRecall); }
        else { routePath = '/games'; speech = s.opening('Games'); }
        data = { action: 'navigate', target: routePath };
      } else {
        speech = s.profileNeeded;
      }
      break;
    }
    case 'check_reminders': {
      if (patientId) {
        const filter = parsed.filter;
        const query = { patientId, status: 'pending' };
        if (filter) query.type = filter;
        
        const reminders = await Reminder.find(query).sort({ time: 1 });
        if (reminders.length > 0) {
          speech = s.remindersCount(reminders.length, filter || 'any', reminders[0].title, reminders[0].time);
        } else {
          speech = s.noReminders(filter || 'any');
        }
        data = { action: 'show_reminders', reminders };
      } else {
        speech = s.profileNeeded;
      }
      break;
    }
    case 'check_progress': { 
      if (patientId) {
        speech = s.progress; 
        data = { action: 'navigate', target: '/home' }; 
      } else {
        speech = s.profileNeeded;
      }
      break; 
    }
    case 'navigate_home': {
      if (patientId) {
        speech = s.opening('Dashboard');
        data = { action: 'navigate', target: '/home' };
      } else {
        speech = s.profileNeeded;
      }
      break;
    }
    case 'mood_checkin': { 
      if (patientId) {
        speech = s.moodCheckin; 
        data = { action: 'navigate', target: '/home' }; 
      } else {
        speech = s.profileNeeded;
      }
      break; 
    }
    case 'help': { speech = s.help; break; }
    case 'navigate_page': {
      const PAGE_NAMES = { '/reminders': 'Reminders', '/settings': 'Settings', '/games': 'Games', '/home': 'Dashboard', '/caregiver': 'Caregiver' };
      speech = s.opening(PAGE_NAMES[parsed.target] || 'that page');
      data = { action: 'navigate', target: parsed.target };
      break;
    }
    default: { speech = s.unknown; }
  }

  res.json({ success: true, data: { transcript, parsedIntent: parsed, speech, ...data } });
});

module.exports = { processVoiceCommand };
