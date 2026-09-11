import { Link } from "react-router-dom";
import { Mic } from "lucide-react";
import { useState } from "react";

function Dashboard() {
    const [isListening, setIsListening] = useState(false);
    const [language, setLanguage] = useState("hi-IN");

    const startVoice = () => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Voice recognition is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();

        recognition.lang = language;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript.toLowerCase();

            if (text.includes("tomato" || text.includes("टमाटर"))) {
                const message =
                    "Today's Tomato Price is 2,750 rupees per quintal.";

                alert(message);

                const speech = new SpeechSynthesisUtterance(message);
                speech.lang = language;

                window.speechSynthesis.speak(speech);
            } else {
                const message =
                    "I could not understand the crop. Try asking about tomato prices.";

                alert(message);

                const speech = new SpeechSynthesisUtterance(message);
                speech.lang = language;

                window.speechSynthesis.speak(speech);
            }
        };

        setIsListening(false);

        recognition.onerror = () => {
            alert("Could not understand your voice. Please try again.");
        };

        setIsListening(true);

        recognition.start();
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Good Morning, Farmer 👋
                </h1>

                <p className="mt-2 text-gray-500">
                    Here's what's happening with your produce today.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Market Price */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <p className="text-sm text-gray-500">Today's Tomato Price</p>

                    <h2 className="text-3xl font-bold text-gray-900 mt-2">
                        ₹2,750
                        <span className="text-sm font-normal text-gray-500">
                            {" "} / quintal
                        </span>
                    </h2>

                    <p className="text-sm text-green-600 mt-2">
                        ↑ 8% from last week
                    </p>
                </div>

                {/* Your Produce */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <p className="text-sm text-gray-500">Your Produce</p>

                    <h2 className="text-3xl font-bold text-gray-900 mt-2">
                        800 kg
                    </h2>

                    <p className="text-sm text-gray-500 mt-2">
                        🍅 Tomato • Grade A
                    </p>
                </div>

                {/* Best Selling Opportunity */}
                <Link
                    to="/opportunities"
                    className="block bg-white border border-gray-200 rounded-xl p-5 mt-5 hover:border-green-500 hover:shadow-sm transition"
                >
                    <p className="text-sm text-gray-500">
                        Best Selling Opportunity
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                ₹2,520
                                <span className="text-sm font-normal text-gray-500">
                                    {" "} / quintal
                                </span>
                            </h2>

                            <p className="text-sm text-gray-600 mt-2">
                                FreshMart • Indore
                            </p>
                        </div>

                        <div className="text-left sm:text-right">
                            <p className="text-2xl font-bold text-green-600">
                                91/100
                            </p>

                            <p className="text-sm text-gray-500">
                                Opportunity Score
                            </p>
                        </div>
                    </div>
                </Link>

                {/* Voice Support */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 mt-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-gray-800">
                                Voice Support
                            </h2>

                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="mt-3 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="hi-IN">Hindi</option>
                                <option value="en-IN">English</option>
                            </select>

                            <p className="text-sm text-gray-500 mt-1">
                                {isListening
                                    ? "Listening... Please speak now."
                                    : "Speak your market query instead of typing."}
                            </p>
                        </div>

                        <button
                            onClick={startVoice}
                            className={`text-white p-3 rounded-full transition ${isListening
                                ? "bg-red-500 animate-pulse"
                                : "bg-green-600 hover:bg-green-700"
                                }`}
                        >
                            <Mic size={22} />
                        </button>
                    </div>
                </div>

                <div className="mt-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Quick Actions
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                        <Link
                            to="/sell"
                            className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-green-500 block"
                        >
                            <p className="font-medium text-gray-800">
                                Sell Produce
                            </p>

                            <p className="text-sm text-gray-500 mt-1">
                                List your crop
                            </p>
                        </Link>

                        <Link
                            to="/markets"
                            className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-green-500 block"
                        >
                            <p className="font-medium text-gray-800">
                                Market Prices
                            </p>

                            <p className="text-sm text-gray-500 mt-1">
                                Check today's prices
                            </p>
                        </Link>

                        <Link
                            to="/buyers"
                            className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-green-500 block"
                        >
                            <p className="font-medium text-gray-800">
                                Find Buyers
                            </p>

                            <p className="text-sm text-gray-500 mt-1">
                                Find the right buyer
                            </p>
                        </Link>

                        <Link
                            to="/transactions"
                            className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-green-500 block"
                        >
                            <p className="font-medium text-gray-800">
                                Transactions
                            </p>

                            <p className="text-sm text-gray-500 mt-1">
                                Track your deals
                            </p>
                        </Link>

                    </div>
                </div>

            </div>
        </div>
    );
}

export default Dashboard;