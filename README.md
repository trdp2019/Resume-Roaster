# Resume Roaster 🔥

A hilarious AI-powered resume critique app that roasts your resume with humor while providing constructive feedback!

## Features ✨

- **AI-Powered Critiques**: Uses Groq's Llama3-70b-8192 for brutally honest resume feedback
- **Real PDF Parsing**: Advanced PDF.js-powered text extraction from actual resume files
- **Smart Upload**: Drag & drop or click to upload PDF resumes (up to 10MB)
- **Humor Levels**: Gentle, Medium, Spicy, or Nuclear roasts based on your resume score
- **Local Storage**: All critiques saved locally in your browser
- **Beautiful UI**: Colorful, animated interface with custom hover effects
- **Error Handling**: Smart detection of image-based PDFs and parsing issues
- **Responsive**: Works perfectly on all devices

## One-Click Deployment 🚀

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/resume-roaster)

## Environment Variables 🔧

After deployment, add your Groq API key in Netlify:

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add: `GROQ_API_KEY` = `your-groq-api-key-here`

Get your free Groq API key at: https://console.groq.com/

## Local Development 💻

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Tech Stack 🛠️

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Express + Groq SDK
- **PDF Parsing**: PDF.js for real text extraction
- **UI Components**: Radix UI + Lucide Icons
- **Animations**: Custom CSS animations with Tailwind
- **Deployment**: Netlify Functions

## How It Works 🎭

1. **Upload**: Drag & drop or select your PDF resume (text-based PDFs work best)
2. **Real Parsing**: PDF.js extracts actual text content from your resume
3. **AI Analysis**: Groq's Llama3-70b-8192 analyzes your resume content
4. **Get Roasted**: Receive hilarious but constructive feedback
5. **Improve**: Use the actionable suggestions to enhance your resume
6. **Save**: All critiques are saved locally for future reference

### PDF Requirements 📄
- **Format**: PDF files only
- **Size**: Maximum 10MB
- **Type**: Text-based PDFs (not image/scanned documents)
- **Content**: Substantial text content for best results

## Roast Levels 🌶️

- **❤️ Gentle (90+ score)**: Light constructive feedback
- **😄 Medium (75-89)**: Balanced humor and advice  
- **🌶️ Spicy (60-74)**: More intense roasting
- **💀 Nuclear (<60)**: Brutal honesty mode activated

## Demo Mode 🎪

The app includes demo responses when no API key is configured, so you can test the interface immediately!

## Contributing 🤝

Feel free to submit issues and enhancement requests!

## License 📄

MIT License - feel free to use this for your own projects!

---

**Built with ❤️ and lots of ☕️ by [Tridip](https://googleit.in)**
