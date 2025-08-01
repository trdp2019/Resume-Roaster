import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload, FileText, Zap, Star, Smile, AlertCircle,
  Brain, Coffee, Flame, Skull, Heart, Laugh,
  Target, Rocket, Trophy, Crown, Bomb, Sparkles,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CritiqueRequest, CritiqueResponse } from "@shared/critique";
import html2canvas from "html2canvas";

interface CritiqueResult {
  id: string;
  filename: string;
  text: string;
  critique: string;
  timestamp: Date;
  score: number;
  roastLevel: "mild" | "medium" | "spicy" | "nuclear";
}

const roastIcons = {
  mild: <Heart className="w-5 h-5 text-fun-green animate-pulse" />,
  medium: <Smile className="w-5 h-5 text-fun-yellow animate-bounce" />,
  spicy: <Flame className="w-5 h-5 text-fun-orange animate-wiggle" />,
  nuclear: <Bomb className="w-5 h-5 text-red-500 animate-ping" />
};

const roastLabels = {
  mild: "Gentle Roast ❤️",
  medium: "Medium Roast 😄",
  spicy: "Spicy Roast 🌶️",
  nuclear: "Nuclear Roast 💀"
};

export default function Index() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentCritique, setCurrentCritique] = useState<CritiqueResult | null>(null);
  const [error, setError] = useState<string>("");
  const [savedCritiques, setSavedCritiques] = useState<CritiqueResult[]>(() => {
    const saved = localStorage.getItem('resume-critiques');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((critique: any) => ({
        ...critique,
        timestamp: new Date(critique.timestamp)
      }));
    }
    return [];
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const critiqueCardRef = useRef<HTMLDivElement>(null);
  const critiqueContentRef = useRef<HTMLDivElement>(null);

  const downloadCritiqueAsImage = useCallback(async () => {
    if (!critiqueContentRef.current || !currentCritique) return;

    try {
      const canvas = await html2canvas(critiqueContentRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: critiqueContentRef.current.offsetWidth,
        height: critiqueContentRef.current.offsetHeight
      });

      const link = document.createElement('a');
      link.download = `resume-critique-${currentCritique.filename.replace('.pdf', '')}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      setError('Failed to generate image. Please try again! 📸');
    }
  }, [currentCritique]);





  const generateCritique = useCallback(async (resumeText: string, filename: string): Promise<CritiqueResult | null> => {
    try {
      const request: CritiqueRequest = {
        resumeText,
        filename
      };

      const response = await fetch('/api/critique', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      return {
        id: Date.now().toString(),
        filename,
        text: resumeText,
        critique: data.critique,
        timestamp: new Date(),
        score: data.score,
        roastLevel: data.roastLevel
      };
    } catch (error) {
      console.error('Error generating critique:', error);
      throw error;
    }
  }, []);

  const extractTextFromPDF = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;

          // Import PDF.js dynamically
          const pdfjsLib = await import('pdfjs-dist');

          // Use jsDelivr CDN with a proven stable version
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

          // Load the PDF document
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

          let fullText = '';

          // Extract text from each page
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();

            // Combine all text items from the page
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(' ');

            fullText += pageText + '\n\n';
          }

          if (!fullText.trim()) {
            throw new Error('No text found in PDF. The PDF might be image-based or encrypted.');
          }

          resolve(fullText.trim());
        } catch (error) {
          console.error('PDF parsing error:', error);
          reject(new Error(
            error instanceof Error
              ? `Failed to parse PDF: ${error.message}`
              : 'Failed to parse PDF. Please ensure it\'s a valid PDF file with extractable text.'
          ));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.includes('pdf')) {
      setError('Please upload a PDF file! 📄');
      return;
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large! Please upload a PDF smaller than 10MB. 📏');
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const text = await extractTextFromPDF(file);

      // Check if extracted text is substantial enough
      if (text.length < 100) {
        throw new Error('This PDF seems to have very little text. Please ensure it\'s a text-based resume and not just images.');
      }

      const critique = await generateCritique(text, file.name);

      if (critique) {
        setCurrentCritique(critique);

        // Save to local storage
        const updated = [critique, ...savedCritiques];
        setSavedCritiques(updated);
        localStorage.setItem('resume-critiques', JSON.stringify(updated));
      }
    } catch (error: any) {
      console.error('Error processing file:', error);

      // Provide specific error messages for common issues
      let errorMessage = 'Something went wrong! Our AI is probably laughing too hard to respond. 😂';

      if (error.message.includes('PDF')) {
        errorMessage = error.message;
      } else if (error.message.includes('text')) {
        errorMessage = 'This PDF appears to be image-based or encrypted. Please upload a text-based PDF resume. 📄';
      } else if (error.message.includes('Server error')) {
        errorMessage = 'Our roasting server is taking a coffee break! ☕️ Please try again in a moment.';
      }

      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [extractTextFromPDF, generateCritique, savedCritiques]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <Trophy className="w-6 h-6 text-fun-yellow animate-bounce" />;
    if (score >= 80) return <Crown className="w-6 h-6 text-fun-purple animate-pulse" />;
    if (score >= 70) return <Target className="w-6 h-6 text-fun-blue animate-wiggle" />;
    if (score >= 60) return <Rocket className="w-6 h-6 text-fun-green animate-float" />;
    return <Skull className="w-6 h-6 text-red-500 animate-ping" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fun-purple via-fun-blue to-fun-pink">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 animate-bounce-gentle">
            <Brain className="inline-block w-16 h-16 mr-2 animate-pulse" />
            Resume <span className="text-fun-yellow animate-wiggle inline-block">Roaster</span>
            <Flame className="inline-block w-16 h-16 ml-2 text-fun-orange animate-wiggle" />
          </h1>
          <p className="text-2xl text-white/90 mb-2 animate-float">
            Get <span className="text-fun-yellow font-bold">BRUTALLY</span> honest AI feedback on your resume
          </p>
          <p className="text-lg text-white/70 flex items-center justify-center gap-2 cursor-pointer hover:text-yellow-400 transition" onClick={() => window.open("https://github.com/trdp2019/resume-roaster", "_blank")}>
            <Star className="w-6 h-6 animate-bounce" />
            If you like it, do it. Give us a star on GitHub!
            <Laugh className="w-6 h-6 animate-bounce" />
          </p>
        </div>

        {error && (
          <Card className="max-w-2xl mx-auto mb-8 bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="w-8 h-8 animate-wiggle" />
                <p className="text-lg font-semibold">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!currentCritique ? (
          /* Upload Section */
          <Card className="max-w-2xl mx-auto mb-8 overflow-hidden">
            <CardContent className="p-0">
              <div
                className={cn(
                  "border-4 border-dashed transition-all duration-300 p-12 text-center cursor-pointer",
                  isDragOver
                    ? "border-fun-purple bg-fun-purple/10 scale-105"
                    : "border-gray-300 hover:border-fun-blue hover:bg-fun-blue/5"
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {isProcessing ? (
                  <div className="animate-pulse-fun">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <Brain className="w-16 h-16 text-fun-purple animate-wiggle" />
                      <Coffee className="w-12 h-12 text-fun-orange animate-bounce" />
                      <Sparkles className="w-14 h-14 text-fun-yellow animate-ping" />
                    </div>
                    <p className="text-xl font-semibold text-gray-700">
                      🧠 AI is analyzing your resume with surgical precision...
                    </p>
                    <p className="text-gray-500 mt-2">
                      Preparing the roast of a lifetime! ☕️🔥
                    </p>
                    <div className="mt-4 flex justify-center">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-fun-pink rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-3 h-3 bg-fun-blue rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-3 h-3 bg-fun-purple rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="animate-float">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <Upload className="w-16 h-16 text-fun-blue animate-bounce-gentle" />
                      <FileText className="w-12 h-12 text-fun-green animate-wiggle" />
                    </div>
                    <p className="text-xl font-semibold text-gray-700 mb-2">
                      Drop your resume PDF here or click to upload
                    </p>
                    <p className="text-gray-500 mb-3 flex items-center justify-center gap-2">
                      <Flame className="w-5 h-5 text-fun-orange animate-pulse" />
                      Ready to get absolutely ROASTED?
                      <Laugh className="w-5 h-5 text-fun-pink animate-wiggle" />
                    </p>
                    <div className="text-sm text-gray-400 flex items-center justify-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>PDF files only • Max 10MB • Text-based resumes work best</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Critique Results */
          <div className="max-w-4xl mx-auto">
            <Card className="mb-8 overflow-hidden shadow-2xl">
              <CardContent ref={critiqueContentRef} className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-fun-green/20 rounded-full animate-pulse">
                    <FileText className="w-8 h-8 text-fun-green" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      {currentCritique.filename}
                      <Sparkles className="w-6 h-6 text-fun-yellow animate-wiggle" />
                    </h2>
                    <p className="text-gray-600">
                      Roasted on {currentCritique.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-fun-yellow/20 px-4 py-2 rounded-full">
                      {getScoreIcon(currentCritique.score)}
                      <span className="font-bold text-fun-orange">
                        {currentCritique.score}/100
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                      {roastIcons[currentCritique.roastLevel]}
                      <span className="text-sm font-medium">
                        {roastLabels[currentCritique.roastLevel]}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <div className="bg-gradient-to-r from-fun-blue/10 to-fun-purple/10 p-6 rounded-lg border border-fun-blue/20">
                    {currentCritique.critique.split('\n').filter(line => line.trim() !== '').map((line, index) => (
                      <p key={index} className="mb-4 last:mb-0 text-gray-700 leading-relaxed">
                        {line.trim()}
                      </p>
                    ))}

                    {/* Attribution */}
                    <div className="mt-6 pt-4 border-t border-fun-blue/20 text-center">
                      <p className="text-sm text-gray-500 italic">
                        Generated from Resume Roaster by <span className="font-semibold text-fun-purple">TRIDIP</span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons - Outside card so they're not included in image */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                onClick={() => setCurrentCritique(null)}
                className="bg-fun-purple hover:bg-fun-purple/80 text-white transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Roast Another Resume
                <Flame className="w-4 h-4 animate-wiggle" />
              </Button>

              <Button
                onClick={downloadCritiqueAsImage}
                variant="outline"
                className="border-fun-blue text-fun-blue hover:bg-fun-blue hover:text-white transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download as Image
              </Button>
            </div>
          </div>
        )}

        {/* Previous Critiques */}
        {savedCritiques.length > 0 && (
          <div className="max-w-4xl mx-auto mt-12">
            <h3 className="text-3xl font-bold text-white mb-6 text-center flex items-center justify-center gap-4">
              <Flame className="w-8 h-8 animate-wiggle" />
              Previous Roasts
              <Flame className="w-8 h-8 animate-wiggle" />
            </h3>
            <div className="grid gap-4">
              {savedCritiques.slice(0, 3).map((critique) => (
                <Card
                  key={critique.id}
                  className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl animate-float"
                  onClick={() => setCurrentCritique(critique)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-fun-green/20 rounded-full animate-pulse">
                          <FileText className="w-6 h-6 text-fun-green" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                            {critique.filename}
                            {roastIcons[critique.roastLevel]}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {critique.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getScoreIcon(critique.score)}
                        <span className="font-bold text-fun-orange">
                          {critique.score}/100
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Fun Features */}
        <div className="mt-16 text-center">
          <h3 className="text-3xl font-bold text-white mb-8 flex items-center justify-center gap-4">
            <Brain className="w-8 h-8 animate-pulse" />
            Why Choose Resume Roaster?
            <Zap className="w-8 h-8 animate-wiggle" />
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:scale-105 transition-all duration-300 animate-float">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center gap-2 mb-4">
                  <Laugh className="w-8 h-8 text-fun-yellow animate-bounce" />
                  <Flame className="w-8 h-8 text-fun-orange animate-wiggle" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Brutally Hilarious</h4>
                <p className="text-white/80">
                  Our AI doesn't hold back! Get roasted harder than a marshmallow at a campfire! 🔥
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:scale-105 transition-all duration-300 animate-float [animation-delay:0.2s]">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center gap-2 mb-4">
                  <Brain className="w-8 h-8 text-fun-purple animate-pulse" />
                  <Sparkles className="w-8 h-8 text-fun-yellow animate-ping" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">AI-Powered Genius</h4>
                <p className="text-white/80">
                  Llama3-70B analyzes your resume like a caffeinated Gordon Ramsay! ☕️
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:scale-105 transition-all duration-300 animate-float [animation-delay:0.4s]">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center gap-2 mb-4">
                  <Heart className="w-8 h-8 text-fun-pink animate-pulse" />
                  <AlertCircle className="w-8 h-8 text-fun-green animate-bounce" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Secure & Private</h4>
                <p className="text-white/80">
                  Your embarrassing resume stays safe while getting absolutely demolished! 💀
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Roast Level Guide */}
        <div className="mt-16 max-w-2xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-8 text-center">
              <h4 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-2">
                <Flame className="w-8 h-8 animate-wiggle" />
                Roast Level Guide
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center gap-2">
                  {roastIcons.mild}
                  <span className="text-white text-sm font-medium">Gentle</span>
                  <span className="text-white/70 text-xs">90+ score</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  {roastIcons.medium}
                  <span className="text-white text-sm font-medium">Medium</span>
                  <span className="text-white/70 text-xs">75-89 score</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  {roastIcons.spicy}
                  <span className="text-white text-sm font-medium">Spicy</span>
                  <span className="text-white/70 text-xs">60-74 score</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  {roastIcons.nuclear}
                  <span className="text-white text-sm font-medium">Nuclear</span>
                  <span className="text-white/70 text-xs">&lt; 60 score</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/10 backdrop-blur-sm border-t border-white/20 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white/80 space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>
                <strong>Disclaimer:</strong> This is an AI-powered tool for entertainment and educational purposes.
                Resume critiques are generated by AI and should be considered as suggestions, not professional career advice.
              </span>
            </div>

            <div className="border-t border-white/20 pt-4">
              <p className="text-white/90 font-medium flex items-center justify-center gap-2">
                <Heart className="w-4 h-4 text-fun-pink animate-pulse" />
                Built with ❤️ and lots of ☕️ by <a href="https://googleit.in" target="_blank" rel="noopener noreferrer" className="text-fun-yellow hover:text-fun-orange transition-colors font-bold">TRIDIP</a>
                <Coffee className="w-4 h-4 text-fun-orange animate-wiggle" />
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
