# SSC CGL Tier-1 Mock Test Platform

A minimal, distraction-free MCQ test platform specifically designed for SSC CGL Tier-1 exam preparation with **1000+ questions** organized into **10 test sets**.

## 🎯 Features

### Core Features
- **1000+ Questions** - Comprehensive question bank
- **10 Test Sets** - 100 questions each, organized by categories
- **Clean, Minimal Interface** - No ads, no login, pure study focus
- **60-minute Timer** - Real exam simulation with auto-submit
- **SSC CGL Marking Scheme** - +2 for correct, -0.5 for incorrect
- **Question Navigation** - Easy navigation between questions
- **Question Palette** - Visual overview of all questions
- **Mark for Review** - Flag questions for later review
- **Detailed Results** - Comprehensive performance analysis
- **Answer Review** - Review all questions with correct answers

### User Experience
- **Test Set Selection** - Choose from 10 different test sets
- **Category Tags** - See which subjects are covered in each set
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Distraction-Free** - Clean white background with minimal UI
- **Real-time Timer** - Visual countdown with warning indicators
- **Progress Tracking** - See answered, marked, and current questions
- **Auto-save** - Answers are automatically saved

## 📁 File Structure

```
SSC-CGL-Test-Platform/
├── index.html              # Main HTML file
├── css/
│   └── style.css          # All styling
├── js/
│   └── app.js             # Main JavaScript functionality
├── data/
│   └── questions.json     # 1000+ questions bank
└── README.md              # This file
```

## 🚀 How to Use

### For Students
1. **Open `index.html`** in any modern web browser
2. **Choose a Test Set** from the available 10 sets
3. **Read Instructions** and test details
4. **Click "Start Test Set X"** to begin
5. **Answer Questions** by clicking on options
6. **Navigate** using Previous/Next buttons or question palette
7. **Mark Questions** for review if needed
8. **Submit** when finished or wait for auto-submit
9. **Review Results** and check detailed analysis
10. **Review Answers** to see correct solutions

### Test Set Information
- **Test Set 1**: Questions 1-100
- **Test Set 2**: Questions 101-200
- **Test Set 3**: Questions 201-300
- **Test Set 4**: Questions 301-400
- **Test Set 5**: Questions 401-500
- **Test Set 6**: Questions 501-600
- **Test Set 7**: Questions 601-700
- **Test Set 8**: Questions 701-800
- **Test Set 9**: Questions 801-900
- **Test Set 10**: Questions 901-1000

### For Teachers/Content Creators
1. **Replace `data/questions.json`** with your question bank
2. **Follow the JSON structure** shown in the sample file
3. **Add your questions** in the same format
4. **Test the platform** to ensure everything works

## 📝 Question Format

Each question should follow this JSON structure:

```json
{
  "id": 1,
  "question": "Your question text here?",
  "options": {
    "A": "Option A",
    "B": "Option B", 
    "C": "Option C",
    "D": "Option D"
  },
  "correctAnswer": "B",
  "category": "Subject Name",
  "explanation": "Optional explanation for the answer"
}
```

## 🎨 Customization

### Colors
- Primary Blue: `#007bff`
- Success Green: `#28a745`
- Warning Yellow: `#ffc107`
- Danger Red: `#dc3545`
- Background: `#ffffff`
- Text: `#1a1a1a`

### Font
- **Inter** - Clean, modern sans-serif font
- Responsive sizing for all devices

### Timer Warnings
- **10 minutes remaining**: Yellow warning
- **5 minutes remaining**: Red danger with pulse animation

## 📱 Responsive Design

The platform is fully responsive and works on:
- **Desktop** (1200px+): Full layout with sidebar
- **Tablet** (768px-1199px): Adjusted grid layout
- **Mobile** (480px-767px): Single column layout
- **Small Mobile** (<480px): Compact design

## 🔧 Technical Details

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Features
- **Local Storage** - Saves progress automatically
- **No Internet Required** - Works offline after initial load
- **Fast Loading** - Optimized for quick startup
- **Accessibility** - Keyboard navigation support

## 📊 Scoring System

- **Correct Answer**: +2 marks
- **Incorrect Answer**: -0.5 marks
- **Unattempted**: 0 marks
- **Total Possible**: 200 marks (100 questions × 2 marks)

## 🎯 SSC CGL Specific Features

### Exam Simulation
- **60-minute duration** matching real exam
- **100 questions per set** like actual Tier-1
- **Negative marking** as per SSC pattern
- **Auto-submit** when time expires

### Question Categories
- **General Intelligence & Reasoning**
- **General Knowledge & General Awareness**
- **Quantitative Aptitude**
- **English Language**
- **History**
- **Geography**
- **Science**
- **Mathematics**

## 🚀 Getting Started

1. **Download** all files to a folder
2. **Replace** `data/questions.json` with your questions (or use existing 1000+ questions)
3. **Open** `index.html` in a web browser
4. **Choose a test set** and start testing immediately!

## 📈 Test Set Benefits

### For Students
- **Variety**: 10 different test sets for comprehensive practice
- **Progressive Learning**: Start with Set 1 and progress through all sets
- **Category Focus**: Each set contains mixed categories for balanced practice
- **Performance Tracking**: Track improvement across different sets

### For Teachers
- **Organized Content**: Questions automatically organized into manageable sets
- **Easy Management**: Add more questions to expand the bank
- **Flexible Testing**: Students can choose specific sets for targeted practice

## 📞 Support

For questions or customization help:
- Check the code comments for detailed explanations
- Modify CSS variables for easy color changes
- Add more questions to the JSON file

## 🔄 Updates

### Version 2.0
- **1000+ questions** organized into 10 test sets
- **Test set selection** interface
- **Category tags** for each test set
- **Enhanced navigation** between test sets
- **Improved results** with test set information

### Version 1.0
- Initial release
- Complete test functionality
- Responsive design
- SSC CGL specific features

---

**Note**: This platform is designed for educational purposes and exam preparation. The platform automatically organizes your questions into test sets of 100 questions each for optimal practice sessions. 