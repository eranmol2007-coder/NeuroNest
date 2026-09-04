const { Patient } = require('../utils/modelResolver');

const STORY_THEMES = {
  childhood_home: {
    title: 'My Childhood Home',
    icon: '🏡',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=900',
    color: '#7a9a7a',
    description: 'Relive the warmth and comfort of the home where your journey began.',
    chapters: [
      {
        title: 'The Front Door',
        text: 'The old wooden front door of your family home stands before you. You can almost feel the familiar grain under your fingertips as you reach for the handle. The paint has faded slightly over the years, but it still opens with the same gentle creak you remember. A wave of warmth washes over you as you step inside.',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=900',
        ambient: 'wind_birds',
      },
      {
        title: 'The Kitchen',
        text: 'The kitchen is alive with the aroma of your favorite meal. Sunlight streams through the window, casting golden patches on the worn wooden table where the family gathered every evening. You can hear the soft hum of the radio playing old songs, and somewhere nearby, a kettle begins to whistle.',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=900',
        ambient: 'kitchen',
      },
      {
        title: 'The Backyard',
        text: 'You push open the screen door and step into the backyard. The mango tree still stands tall, its branches heavy with fruit. The swing set your father built for you sways gently in the breeze. Grass tickles your bare feet as you walk to your favorite spot under the tree, where the world always felt safe.',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=900',
        ambient: 'nature',
      },
      {
        title: 'Your Room',
        text: 'Climbing the familiar stairs, each step creaking in a different tone, you reach your old room. The door is slightly ajar. Inside, everything is just as you left it. The faded posters on the wall, the books stacked on the shelf, the small window overlooking the garden. You sit on the bed and feel the memories flood back.',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=900',
        ambient: 'quiet',
      },
    ],
  },
  school_days: {
    title: 'School Days',
    icon: '🏫',
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=900',
    color: '#3b82f6',
    description: 'Walk the corridors of your school and revisit the lessons that shaped you.',
    chapters: [
      {
        title: 'The School Gate',
        text: 'You stand at the familiar school gate, the iron bars worn smooth by decades of students. The morning sun paints long shadows across the courtyard. You can hear children laughing and the distant sound of a school bell. Your feet remember every crack in the path leading to the main building.',
        image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=900',
        ambient: 'children_play',
      },
      {
        title: 'The Classroom',
        text: 'You step into your old classroom. The wooden desks are arranged in neat rows, each one carrying the carved initials of generations of students. The blackboard is freshly chalked. You find your seat by the window — the one where you used to watch clouds drift by during math lessons.',
        image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=900',
        ambient: 'classroom',
      },
      {
        title: 'The Playground',
        text: 'The playground echoes with phantom laughter. You can almost see your younger self running across the field, chasing friends with boundless energy. The old football goalpost still stands at one end. You remember the day you scored the winning goal and the entire school cheered your name.',
        image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=900',
        ambient: 'playground',
      },
      {
        title: 'The Library',
        text: 'The library is a sanctuary of quiet wisdom. Dust motes dance in the shafts of light that filter through tall windows. You run your fingers along the spines of books, each one a door to another world. You remember the first book that changed your life, the one you read cover to cover under this very roof.',
        image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=900',
        ambient: 'quiet',
      },
    ],
  },
  family_festival: {
    title: 'Family Festivals',
    icon: '🎉',
    image: 'https://images.unsplash.com/photo-1530025809667-1ac456d23238?q=80&w=900',
    color: '#f59e0b',
    description: 'Revisit the joy and togetherness of your family celebrations.',
    chapters: [
      {
        title: 'Preparing for the Festival',
        text: 'The house is bustling with preparation. Colorful decorations are being hung, the kitchen is filled with the delicious smell of festive sweets, and laughter echoes from every corner. You remember how everyone had a role — your job was always to string the marigold garlands.',
        image: 'https://images.unsplash.com/photo-1530025809667-1ac456d23238?q=80&w=900',
        ambient: 'celebration',
      },
      {
        title: 'The Family Gathering',
        text: 'The entire family has gathered together. Grandparents sitting on the porch, children running around with sparklers, cousins sharing stories from the year. The house is overflowing with love and warmth. You look around the table and feel a deep sense of gratitude for each person present.',
        image: 'https://images.unsplash.com/photo-1530025809667-1ac456d23238?q=80&w=900',
        ambient: 'family',
      },
      {
        title: 'The Evening Celebration',
        text: 'As the sun sets, the festival truly comes alive. Lamps are lit one by one, casting a warm golden glow across the courtyard. Music fills the air, and people begin to dance. You join in, clapping and swaying to rhythms that your body remembers even if your mind sometimes forgets.',
        image: 'https://images.unsplash.com/photo-1530025809667-1ac456d23238?q=80&w=900',
        ambient: 'music',
      },
      {
        title: 'The Quiet Moment',
        text: 'Later in the evening, you find a quiet moment. You sit on the doorstep, looking up at the sky. Fireflies dance in the garden. The distant sound of celebration continues, but here, in this moment, everything is peaceful. You feel the presence of loved ones, both near and far, wrapping you in warmth.',
        image: 'https://images.unsplash.com/photo-1530025809667-1ac456d23238?q=80&w=900',
        ambient: 'nature',
      },
    ],
  },
  first_job: {
    title: 'First Job Days',
    icon: '💼',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=900',
    color: '#8b5cf6',
    description: 'Step back into the days when your professional journey first began.',
    chapters: [
      {
        title: 'The First Morning',
        text: 'You wake up extra early, heart pounding with excitement and nervous energy. Your best clothes are laid out on the bed. You eat a quick breakfast, kiss your mother goodbye, and step out into the world with a new sense of purpose. Today is your first day of work.',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=900',
        ambient: 'morning',
      },
      {
        title: 'The Workplace',
        text: 'The office building towers before you, impressive and a little intimidating. You push through the glass doors and are greeted by friendly faces. Your desk is small but yours. You organize your things carefully, taking in every detail. This is where your story unfolds.',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=900',
        ambient: 'office',
      },
      {
        title: 'Meeting Colleagues',
        text: 'Your colleagues welcome you with warm handshakes and genuine smiles. Over chai breaks, you learn their stories — each one on their own unique journey. A kind mentor takes you under their wing, showing you the ropes with patience and encouragement. You feel at home.',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=900',
        ambient: 'conversation',
      },
      {
        title: 'First Achievement',
        text: 'At the end of your first week, your supervisor calls you into their office. Instead of criticism, you receive praise. "You have a natural talent for this," they say. Walking home that evening, the setting sun paints the sky in gold, and you carry that warmth inside you like a promise.',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=900',
        ambient: 'celebration',
      },
    ],
  },
  wedding_memories: {
    title: 'Wedding Memories',
    icon: '💒',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=900',
    color: '#ec4899',
    description: 'Relive the magical moments from your special day.',
    chapters: [
      {
        title: 'The Morning Preparations',
        text: 'The house is alive with excitement. The scent of jasmine and marigold fills every room. Family members bustle about, making final preparations. You sit before a mirror as loving hands help you dress in your finest, each piece of clothing carrying blessings and love.',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=900',
        ambient: 'celebration',
      },
      {
        title: 'The Procession',
        text: 'The music starts and the celebration begins. You emerge to the cheers of family and friends. The colors are vibrant — saffron, red, gold — painting a scene of pure joy. Every face you see is beaming with happiness, and the air itself seems to vibrate with love.',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=900',
        ambient: 'music',
      },
      {
        title: 'The Ceremony',
        text: 'Time seems to stand still during the ceremony. The sacred flames flicker gently as you take your vows. The world narrows down to just this moment — the promises you make, the circles you walk, the blessings that rain down upon you like flowers from heaven.',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=900',
        ambient: 'quiet',
      },
      {
        title: 'The Celebration',
        text: 'The feast is magnificent. The hall is filled with the aroma of delicacies and the sound of joyful conversations. You move from table to table, embracing loved ones, sharing laughter and tears of joy. Every dish is prepared with love, every smile a blessing.',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=900',
        ambient: 'family',
      },
    ],
  },
  nature_walks: {
    title: 'Nature Walks',
    icon: '🌿',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=900',
    color: '#10b981',
    description: 'Walk through the forests and fields that brought you peace.',
    chapters: [
      {
        title: 'The Forest Path',
        text: 'The trail begins at the edge of the forest, where tall trees stand like ancient guardians. The canopy above filters sunlight into dancing patterns on the forest floor. Each step on the soft earth feels like a conversation with nature. Birds call to each other in melodies you almost recognize.',
        image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=900',
        ambient: 'forest',
      },
      {
        title: 'The River',
        text: 'You follow the sound of water and find the river winding through a clearing. Its surface sparkles in the afternoon light. You remember coming here as a child, skipping stones across the water and watching them disappear beneath the surface. The river is the same, and so is the peace it brings.',
        image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=900',
        ambient: 'water',
      },
      {
        title: 'The Meadow',
        text: 'The forest opens into a vast meadow blanketed with wildflowers. The fragrance of grass and blossoms fills the air. You lie down and look up at the sky — a canvas of blue interrupted only by lazy, drifting clouds. A butterfly lands on your hand, its wings gentle as a whisper.',
        image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=900',
        ambient: 'nature',
      },
      {
        title: 'Sunset Ridge',
        text: 'As evening approaches, you reach the ridge. The world spreads out before you in every direction. The sun begins its descent, painting the horizon in shades of amber and rose. You sit in silence, feeling the cool breeze on your face. In this moment, everything is exactly as it should be.',
        image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=900',
        ambient: 'wind',
      },
    ],
  },
};

function personalizeText(text, patient) {
  if (!patient) return text;
  let result = text;
  if (patient.name) {
    const firstName = patient.name.split(' ')[0];
    result = result.replace(/\bYou\b/g, firstName);
  }
  return result;
}

function generateStory(themeKey, patient) {
  const theme = STORY_THEMES[themeKey];
  if (!theme) return null;

  const personalizedChapters = theme.chapters.map((ch, idx) => ({
    ...ch,
    index: idx,
    text: personalizeText(ch.text, patient),
  }));

  return {
    id: `story-${themeKey}-${Date.now()}`,
    theme: themeKey,
    title: theme.title,
    icon: theme.icon,
    image: theme.image,
    color: theme.color,
    description: theme.description,
    chapters: personalizedChapters,
    currentChapter: 0,
    completed: false,
    moodBefore: null,
    moodAfter: null,
    interactions: [],
    createdAt: new Date(),
  };
}

exports.getThemes = async (req, res) => {
  try {
    const themes = Object.entries(STORY_THEMES).map(([key, theme]) => ({
      key,
      title: theme.title,
      icon: theme.icon,
      image: theme.image,
      color: theme.color,
      description: theme.description,
      chapterCount: theme.chapters.length,
    }));
    res.json({ success: true, data: themes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.generateStory = async (req, res) => {
  try {
    const { themeKey, patientId } = req.body;
    if (!themeKey) {
      return res.status(400).json({ success: false, message: 'Theme key is required' });
    }

    let patient = null;
    if (patientId) {
      patient = await Patient.findById(patientId);
    }

    const story = generateStory(themeKey, patient);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Theme not found' });
    }

    res.json({ success: true, data: story });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getChapter = async (req, res) => {
  try {
    const { themeKey, chapterIndex } = req.params;
    const { patientId } = req.query;

    const theme = STORY_THEMES[themeKey];
    if (!theme) {
      return res.status(404).json({ success: false, message: 'Theme not found' });
    }

    const idx = parseInt(chapterIndex, 10);
    if (idx < 0 || idx >= theme.chapters.length) {
      return res.status(400).json({ success: false, message: 'Invalid chapter index' });
    }

    let patient = null;
    if (patientId) {
      patient = await Patient.findById(patientId);
    }

    const chapter = {
      ...theme.chapters[idx],
      index: idx,
      totalChapters: theme.chapters.length,
      text: personalizeText(theme.chapters[idx].text, patient),
    };

    res.json({ success: true, data: chapter });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.recordInteraction = async (req, res) => {
  try {
    const { themeKey, interactionType, chapterIndex } = req.body;
    if (!themeKey || !interactionType) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    res.json({
      success: true,
      data: {
        themeKey,
        interactionType,
        chapterIndex,
        timestamp: new Date(),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient ID is required' });
    }

    const themes = Object.entries(STORY_THEMES).map(([key, theme]) => ({
      key,
      title: theme.title,
      icon: theme.icon,
      totalChapters: theme.chapters.length,
    }));

    res.json({
      success: true,
      data: {
        patientId,
        themes,
        totalThemes: themes.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
