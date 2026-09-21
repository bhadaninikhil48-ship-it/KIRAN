import { useState, useEffect, useRef } from "react";
import { Mic, X, Volume2, Sparkles, AlertCircle } from "lucide-react";
import { api } from "../services/api";

export function FloatingVoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState("hi-IN");
  const [voiceStatus, setVoiceStatus] = useState("Ready");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceResponse, setVoiceResponse] = useState("");
  const [marketPrices, setMarketPrices] = useState([]);
  const recognitionRef = useRef(null);
  const panelRef = useRef(null);

  // Load live APMC prices to match crop queries accurately
  useEffect(() => {
    let isMounted = true;
    const loadPrices = async () => {
      try {
        const res = await api.get("/api/market/prices");
        if (isMounted && res?.prices) {
          setMarketPrices(res.prices);
        }
      } catch {
        // Non-blocking fallback
      }
    };
    loadPrices();
    return () => {
      isMounted = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const speakMessage = (text, lang) => {
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = lang || language;
        speech.rate = 0.95;
        window.speechSynthesis.speak(speech);
      } catch (err) {
        console.warn("Speech synthesis error:", err);
      }
    }
  };

  const processQuery = (rawText) => {
    const text = rawText.toLowerCase();
    setVoiceTranscript(rawText);
    setVoiceStatus("Response Ready");

    let matchedPrice = null;
    for (const p of marketPrices) {
      if (text.includes(p.crop_name.toLowerCase())) {
        matchedPrice = p;
        break;
      }
    }

    let message = "";
    if (matchedPrice) {
      const modal = Number(matchedPrice.modal_price).toLocaleString();
      const unit = matchedPrice.arrival_unit || "quintal";
      const mandi = matchedPrice.market_name;
      if (language === "hi-IN") {
        message = `${matchedPrice.crop_name} का आज का मॉडल भाव ₹${modal} प्रति ${unit} है, ${mandi} मंडी में।`;
      } else {
        message = `Today's ${matchedPrice.crop_name} modal price is ₹${modal} per ${unit} at ${mandi} mandi.`;
      }
    } else if (marketPrices.length > 0) {
      const sample = marketPrices[0];
      if (language === "hi-IN") {
        message = `उपलब्ध मंडी भाव: ${sample.crop_name} ₹${Number(sample.modal_price).toLocaleString()} प्रति क्विंटल (${sample.market_name})। आप टमाटर, आलू, प्याज या गेहूं का भाव पूछ सकते हैं।`;
      } else {
        message = `Available live price in ${sample.market_name}: ${sample.crop_name} at ₹${Number(sample.modal_price).toLocaleString()}/quintal. You can ask for Tomato, Potato, Onion, or Wheat rates.`;
      }
    } else {
      if (language === "hi-IN") {
        message = `सुनाई दिया: "${rawText}"। कृपया टमाटर, आलू, प्याज या गेहूं का लाइव मंडी भाव पूछें।`;
      } else {
        message = `Heard: "${rawText}". Please ask for current Mandi rates of Tomato, Potato, Onion, or Wheat.`;
      }
    }

    setVoiceResponse(message);
    speakMessage(message, language);
  };

  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = language;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setVoiceStatus("Listening...");
    setIsListening(true);
    setVoiceTranscript("");
    setVoiceResponse("");

    recognition.onstart = () => {
      setVoiceStatus("Listening...");
      setIsListening(true);
    };

    recognition.onspeechstart = () => {
      setVoiceStatus("Processing...");
    };

    recognition.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript || "";
      processQuery(text);
    };

    recognition.onerror = (e) => {
      setIsListening(false);
      setVoiceStatus("Ready");
      if (e.error !== "no-speech") {
        setVoiceResponse(
          language === "hi-IN"
            ? "आवाज़ स्पष्ट नहीं सुनाई दी। कृपया दोबारा प्रयास करें।"
            : "Could not clearly understand your voice. Please try again."
        );
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setTimeout(() => {
        setVoiceStatus((prev) => (prev === "Response Ready" ? prev : "Ready"));
      }, 800);
    };

    try {
      recognition.start();
    } catch (err) {
      console.warn("Speech recognition error:", err);
      setIsListening(false);
      setVoiceStatus("Ready");
    }
  };

  const handleChipClick = (query) => {
    processQuery(query);
  };

  return (
    <>
      {/* Global Floating Voice Assistant Access Button (Fixed at bottom-right of viewport) */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 select-none print:hidden">
        {/* Hover label for desktop */}
        {!isOpen && (
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900/90 text-white text-xs font-medium shadow-lg backdrop-blur-xs transition-opacity pointer-events-none">
            <Sparkles size={13} className="text-emerald-400" />
            <span>Voice Assistant</span>
          </span>
        )}

        <button
          type="button"
          onClick={() => {
            if (!isOpen) {
              setIsOpen(true);
            } else {
              setIsOpen(false);
              if (recognitionRef.current) {
                try {
                  recognitionRef.current.abort();
                } catch {
                  // ignore
                }
              }
            }
          }}
          aria-label="Toggle KIRAN Multilingual Voice Assistant"
          title="KIRAN Multilingual Voice Assistant"
          className={`relative h-13 w-13 sm:h-14 sm:w-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-200 cursor-pointer active:scale-95 ${
            isOpen
              ? "bg-gray-800 hover:bg-gray-900 ring-4 ring-gray-300/40"
              : isListening
              ? "bg-red-600 hover:bg-red-700 ring-4 ring-red-400/50 animate-pulse"
              : "bg-gradient-to-tr from-emerald-700 to-emerald-500 hover:from-emerald-800 hover:to-emerald-600 ring-4 ring-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105"
          }`}
        >
          {isOpen ? <X size={22} /> : <Mic size={24} />}

          {/* Pulse ping indicator when listening */}
          {isListening && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border border-white"></span>
            </span>
          )}
        </button>
      </div>

      {/* Floating Assistant Popover Interface */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="KIRAN Voice Assistant"
          className="fixed bottom-20 right-3 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-96 max-w-sm bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn text-gray-900"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-emerald-800 to-emerald-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center">
                <Mic size={16} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold leading-none">
                  KIRAN Voice Assistant
                </h3>
                <span className="text-[10px] text-emerald-200">
                  {language === "hi-IN" ? "मल्टीलिंगुअल आवाज़ सहायक" : "Speech Intelligence"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  voiceStatus === "Listening..."
                    ? "bg-red-500 text-white animate-pulse"
                    : voiceStatus === "Processing..."
                    ? "bg-amber-400 text-gray-900"
                    : voiceStatus === "Response Ready"
                    ? "bg-emerald-400 text-emerald-950"
                    : "bg-white/20 text-white"
                }`}
              >
                {voiceStatus}
              </span>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close voice assistant"
                className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3.5">
            {/* Language Selector */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <span className="text-xs font-semibold text-gray-600">Language / भाषा:</span>
              <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                <button
                  type="button"
                  onClick={() => setLanguage("hi-IN")}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                    language === "hi-IN"
                      ? "bg-white text-emerald-700 shadow-2xs font-bold"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  हिंदी (Hindi)
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en-IN")}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                    language === "en-IN"
                      ? "bg-white text-emerald-700 shadow-2xs font-bold"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Interactive Mic Button */}
            <div className="flex flex-col items-center justify-center py-2">
              <button
                type="button"
                onClick={startVoice}
                className={`relative h-16 w-16 rounded-full flex items-center justify-center text-white transition-all duration-200 cursor-pointer shadow-md ${
                  isListening
                    ? "bg-red-600 hover:bg-red-700 ring-8 ring-red-100 animate-pulse"
                    : "bg-emerald-600 hover:bg-emerald-700 ring-4 ring-emerald-100 hover:scale-105"
                }`}
                aria-label={isListening ? "Listening active" : "Tap to speak"}
              >
                <Mic size={26} />
              </button>
              <p className="text-xs text-gray-500 mt-2 font-medium text-center">
                {isListening
                  ? language === "hi-IN"
                    ? "सुन रहे हैं... फसल का नाम बोलें"
                    : "Listening... Speak crop name now"
                  : language === "hi-IN"
                  ? "माइक दबाकर बोलें"
                  : "Tap mic & speak your query"}
              </p>
            </div>

            {/* Voice Output / Results Area */}
            {(voiceTranscript || voiceResponse) && (
              <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3 space-y-2 text-xs">
                {voiceTranscript && (
                  <div className="flex items-start gap-1.5 text-gray-600">
                    <span className="font-semibold text-gray-800 shrink-0">
                      {language === "hi-IN" ? "आपने पूछा:" : "You asked:"}
                    </span>
                    <span className="italic truncate">"{voiceTranscript}"</span>
                  </div>
                )}

                {voiceResponse && (
                  <div className="flex items-start gap-2 bg-emerald-50 text-emerald-900 p-2.5 rounded-lg border border-emerald-200/80">
                    <Volume2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-medium leading-relaxed">{voiceResponse}</span>
                  </div>
                )}
              </div>
            )}

            {/* Quick Sample Queries */}
            <div className="pt-2 border-t border-gray-100">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                {language === "hi-IN" ? "त्वरित प्रश्न (Quick Questions):" : "Suggested Queries:"}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(language === "hi-IN"
                  ? ["टमाटर का भाव", "गेहूं का भाव", "प्याज का रेट", "आलू मंडी भाव"]
                  : ["Tomato APMC rate", "Wheat price", "Onion rate", "Potato price"]
                ).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleChipClick(q)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 font-medium transition-colors cursor-pointer border border-gray-200/60"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FloatingVoiceAssistant;
