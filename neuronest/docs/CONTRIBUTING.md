# Contributing to NeuroNest

Thank you for your interest in contributing to NeuroNest! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences
- Accept responsibility for mistakes

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/neuronest.git
cd neuronest

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/neuronest.git
```

### 2. Set Up Development Environment

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

## Development Process

### Branch Naming Convention

- `feature/` - New features (e.g., `feature/voice-commands`)
- `fix/` - Bug fixes (e.g., `fix/reminder-notification`)
- `docs/` - Documentation updates (e.g., `docs/api-endpoints`)
- `refactor/` - Code refactoring (e.g., `refactor/mood-component`)
- `test/` - Adding tests (e.g., `test/game-score-api`)
- `style/` - UI/UX improvements (e.g., `style/responsive-navbar`)

### Making Changes

1. **Write clean, readable code**
   - Follow the project's coding standards
   - Add comments for complex logic
   - Keep functions small and focused

2. **Test your changes**
   - Test all affected functionality
   - Ensure no existing features break
   - Test on different screen sizes (mobile, tablet, desktop)

3. **Update documentation**
   - Update README.md if needed
   - Add/update JSDoc comments
   - Update API documentation for backend changes

## Coding Standards

### JavaScript/React

```javascript
/**
 * Calculate adaptive difficulty based on recent scores
 * @param {Array<Object>} scores - Array of game score objects
 * @param {number} scores[].accuracy - Score accuracy percentage
 * @returns {string} Difficulty level: 'easy', 'medium', or 'hard'
 */
function calculateDifficulty(scores) {
  if (scores.length < 3) return 'easy';
  
  const recentScores = scores.slice(-5);
  const avgAccuracy = recentScores.reduce((sum, s) => sum + s.accuracy, 0) / recentScores.length;
  
  if (avgAccuracy >= 80) return 'hard';
  if (avgAccuracy >= 60) return 'medium';
  return 'easy';
}
```

**Standards:**
- Use ES6+ features (arrow functions, destructuring, async/await)
- Prefer `const` over `let`, avoid `var`
- Use descriptive variable names (`userScore` not `us`)
- Add JSDoc comments for all functions
- Keep line length under 100 characters
- Use single quotes for strings
- Add semicolons consistently

### React Components

```jsx
/**
 * Display a patient's mood history
 * @param {Object} props - Component props
 * @param {string} props.patientId - Patient ID
 * @param {number} props.limit - Number of entries to display
 */
export default function MoodHistory({ patientId, limit = 7 }) {
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMoodHistory();
  }, [patientId]);

  const fetchMoodHistory = async () => {
    try {
      const data = await moodApi.getPatientMoods(patientId);
      setMoods(data.slice(0, limit));
    } catch (error) {
      console.error('Failed to fetch mood history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mood-history">
      {moods.map(mood => (
        <MoodCard key={mood._id} mood={mood} />
      ))}
    </div>
  );
}
```

**React Standards:**
- Use functional components with hooks
- Destructure props in parameters
- Use PropTypes or TypeScript for type checking
- Keep components under 200 lines
- Extract reusable logic into custom hooks
- Use meaningful component names (PascalCase)

### CSS/Tailwind

```css
/* Component-specific styles */
.mood-card {
  /* Layout */
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  /* Visual */
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  
  /* Effects */
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.mood-card:hover {
  transform: translateY(-4px);
}
```

**CSS Standards:**
- Group properties (layout, visual, effects)
- Use relative units (rem, em, %)
- Mobile-first approach
- Prefer Tailwind utilities for simple styles
- Custom CSS for complex/reusable styles
- Add comments for non-obvious styles

### Backend/API

```javascript
/**
 * Get patient dashboard with analytics
 * @route GET /api/patients/:id/dashboard
 * @param {string} req.params.id - Patient ID
 * @returns {Object} Dashboard data with scores, moods, and alerts
 */
const getPatientDashboard = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate patient exists
  const patient = await Patient.findById(id);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  // Fetch related data in parallel
  const [scores, moods, alerts] = await Promise.all([
    GameScore.find({ patientId: id }).sort({ date: -1 }).limit(10),
    MoodCheckin.find({ patientId: id }).sort({ date: -1 }).limit(7),
    Alert.find({ patientId: id, resolved: false }),
  ]);

  res.json({
    patient,
    scores,
    moods,
    alerts,
    statistics: {
      avgAccuracy: calculateAvgAccuracy(scores),
      moodTrend: calculateMoodTrend(moods),
    },
  });
});
```

**Backend Standards:**
- Use async/await with error handling
- Validate input data
- Return appropriate HTTP status codes
- Use descriptive route comments
- Keep controllers thin, move logic to services
- Add database indexes for performance

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, no logic change)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**

```bash
feat(games): add daily routine recall game

- Implement game logic with 5 routine scenarios
- Add adaptive difficulty based on response time
- Include voice prompts for accessibility

Closes #42
```

```bash
fix(reminders): prevent duplicate notifications

Fixed issue where recurring reminders sent multiple notifications
when app was offline and came back online.

Fixes #38
```

## Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] Added/updated documentation
- [ ] Tested on multiple screen sizes
- [ ] No console errors or warnings
- [ ] Commit messages follow guidelines

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Added comments for complex logic
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Tested thoroughly
```

### Review Process

1. Submit PR with descriptive title and complete template
2. Automated checks must pass
3. At least one maintainer approval required
4. Address review feedback promptly
5. Maintainer will merge when approved

## Testing

### Manual Testing

```bash
# Start both servers
cd backend && npm run dev
cd frontend && npm run dev

# Test checklist:
# - Create new patient profile
# - Play each game type
# - Submit mood check-in
# - Create and complete reminder
# - View caregiver dashboard
# - Test offline mode
# - Change language settings
# - Test voice commands
```

### Automated Testing (Future)

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test

# Run integration tests
npm run test:e2e
```

## Questions?

- Check existing issues and discussions
- Ask in pull request comments
- Contact maintainers

Thank you for contributing to NeuroNest! 🧠✨
