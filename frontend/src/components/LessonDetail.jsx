import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import AnimatedText from "./AnimatedText";
import CustomCodeEditor from "./CustomCodeEditor";
import SuccessModal from "./SuccessModal";

const LessonDetail = () => {
  const [lesson, setLesson] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userCode, setUserCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isEditorDisabled, setIsEditorDisabled] = useState(true);
  const [readonlyComments, setReadonlyComments] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    setIsEditorDisabled(true);
    const timer = setTimeout(() => {
      setIsEditorDisabled(false);
    }, 2600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/lessons/${id}`);
        setLesson(response.data);
        setQuestions(response.data.questions);
      } catch (error) {
        console.error("Ders yüklenirken hata:", error);
      }
    };

    fetchLesson();
  }, [id]);

  useEffect(() => {
    if (!questions[currentQuestionIndex]) return;

    if (currentStepIndex < questions[currentQuestionIndex].steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex, questions, currentQuestionIndex]);

  const checkAnswer = async () => {
    setLoading(true);
    setReadonlyComments([]); // Reset comments

    // Boş kod kontrolü
    if (!userCode || userCode.trim() === '') {
      setReadonlyComments([{
        line: 0,
        text: "🤔 Henüz kod yazmamışsın! Hadi birlikte yazmaya başlayalım!"
      }]);
      setLoading(false);
      return;
    }

    try {
      const currentQuestion = questions[currentQuestionIndex];
      
      const response = await axios.post("http://localhost:5000/api/openai/check-code", {
        code: userCode,
        question: {
          title: currentQuestion.title,
          description: currentQuestion.steps.map(step => step.content).join('\n')
        }
      });

      const { isCorrect, feedback, lineComments } = response.data;

      // Ana feedback'i ilk satıra yorum olarak ekle
      const allComments = [{
        line: 0,
        text: feedback
      }];

      // Varsa satır yorumlarını ekle
      if (lineComments && lineComments.length > 0) {
        lineComments.forEach(comment => {
          allComments.push({
            line: comment.lineNumber - 1,
            text: comment.content
          });
        });
      }

      setReadonlyComments(allComments);

      if (isCorrect) {
        setIsSuccessModalOpen(true);
      }

    } catch (error) {
      console.error("Kod kontrolü sırasında hata:", error);
      setReadonlyComments([{
        line: 0,
        text: "Bir hata oluştu. Lütfen tekrar deneyin."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    setIsSuccessModalOpen(false);
    setUserCode("");
    setReadonlyComments([]);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentStepIndex(0);
    }
  };

  if (!lesson || !questions.length) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#121221]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121221] text-gray-100">
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#1e1e2e] shadow-md py-4 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{lesson.name}</h1>
              <div className="mt-3 flex items-center space-x-2">
                {questions.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 w-10 rounded-full transition-colors ${
                      index === currentQuestionIndex
                        ? "bg-cyan-600"
                        : index < currentQuestionIndex
                        ? "bg-green-500"
                        : "bg-gray-700"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Soru {currentQuestionIndex + 1} / {questions.length}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto px-4 py-6 bg-[#121221]">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Question Steps and GIF */}
            <div className="bg-[#1e1e2e] rounded-xl shadow-lg p-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                  <h2 className="text-xl font-semibold mb-4">
                    {questions[currentQuestionIndex].title}
                  </h2>
                  <div className="space-y-4">
                    {questions[currentQuestionIndex].steps.map((step, index) => (
                      <div
                        key={index}
                        className={`flex items-start space-x-4 transition-all duration-500
                          ${
                            index <= currentStepIndex
                              ? "opacity-100 translate-y-0"
                              : "opacity-0 translate-y-10"
                          }`}
                      >
                        <div className="flex-shrink-0 mt-1">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-500 text-sm font-medium">
                            {index + 1}
                          </span>
                        </div>
                        <p className="text-gray-300 flex-1">
                          {index === currentStepIndex ? (
                            <AnimatedText text={step.content} speed={10} />
                          ) : (
                            step.content
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Code Editor Section */}
            <div className="bg-[#1e1e2e] rounded-xl shadow-lg overflow-hidden">
              <div className="border-b border-gray-700 bg-[#121221] px-4 py-2 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex space-x-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                  <span className="ml-4 text-sm text-gray-400 font-mono">
                    script.js
                  </span>
                </div>
                <span className="text-sm text-gray-400 font-mono">
                  AI Yorumları
                </span>
              </div>
              <div className="h-[calc(100vh-500px)] min-h-[300px]">
                <CustomCodeEditor
                  value={userCode}
                  onChange={setUserCode}
                  disabled={isEditorDisabled}
                  readonlyComments={readonlyComments}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation and Control */}
        <div className="bg-[#1e1e2e] border-t border-gray-700 py-4 px-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
                  setCurrentStepIndex(0);
                }}
                disabled={currentQuestionIndex === 0}
                className="px-5 py-2.5 bg-gray-700 text-gray-100 rounded-lg disabled:opacity-50
                         hover:bg-gray-600 transition-colors flex items-center space-x-2"
              >
                <span>←</span>
                <span>Önceki</span>
              </button>
              <button
                onClick={() => {
                  setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1));
                  setCurrentStepIndex(0);
                }}
                disabled={currentQuestionIndex === questions.length - 1}
                className="px-5 py-2.5 bg-gray-700 text-gray-100 rounded-lg disabled:opacity-50
                         hover:bg-gray-600 transition-colors flex items-center space-x-2"
              >
                <span>Sonraki</span>
                <span>→</span>
              </button>
            </div>
            <button
              onClick={checkAnswer}
              disabled={loading || isEditorDisabled}
              className="px-6 py-2.5 bg-cyan-600 text-white rounded-lg disabled:opacity-50
                       hover:bg-cyan-700 transition-colors font-medium min-w-[140px]"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Kontrol...</span>
                </div>
              ) : (
                "Kontrol Et"
              )}
            </button>
          </div>
        </div>

        {/* Success Modal */}
        <SuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          onNextQuestion={handleNextQuestion}
        />
      </div>
    </div>
  );
};

export default LessonDetail;