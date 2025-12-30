# Bilingual Support (Nepali/English)

The application now supports both Nepali and English languages to make it accessible for all users.

## Features

### Language Switcher
- Located in the top navigation bar
- Toggle between Nepali (नेपाली) and English
- Persists across page navigation
- Easy one-click switching

### Translated Content
All major sections are translated:
- Navigation menu
- Hero section
- Features section
- How It Works section
- Call-to-action section
- Footer

### Default Language
- **Nepali** is the default language
- Automatically loads in Nepali for better accessibility to local farmers

## Usage

### For Users
1. Click the language button in the navbar
2. Switch between "नेपाली" and "English"
3. All content updates instantly

### For Developers

**Adding New Translations:**

Edit `src/context/LanguageContext.tsx`:

```typescript
const translations = {
  ne: {
    'your.key': 'नेपाली पाठ',
  },
  en: {
    'your.key': 'English text',
  },
};
```

**Using Translations in Components:**

```typescript
import { useLanguage } from '../context/LanguageContext';

function MyComponent() {
  const { t } = useLanguage();
  
  return <h1>{t('your.key')}</h1>;
}
```

**Switching Language Programmatically:**

```typescript
const { language, setLanguage } = useLanguage();

// Switch to English
setLanguage('en');

// Switch to Nepali
setLanguage('ne');
```

## Benefits

1. **Accessibility** - Farmers with limited English can use the app in Nepali
2. **Inclusivity** - Reaches both educated and less-educated users
3. **User-Friendly** - Simple toggle button, no complex settings
4. **Instant** - Language changes apply immediately without page reload

## Future Enhancements

- Add more languages (Hindi, Maithili, etc.)
- Voice-based navigation for illiterate users
- Image-based instructions
- Audio translations
