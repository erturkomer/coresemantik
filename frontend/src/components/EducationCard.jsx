import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import axios from 'axios';

const EducationCard = ({ education, user }) => {
  const navigate = useNavigate();

  const findFirstLesson = async () => {
    try {
      // Lessons'ı educationId ile çek
      const response = await axios.get(`http://localhost:5000/api/lessons?educationId=${education._id}`);
      
      // İlk dersin ID'sini al ve o derse git
      if (response.data && response.data.length > 0) {
        const firstLessonId = response.data[0]._id;
        navigate(`/lesson/${firstLessonId}`);
      } else {
        console.error("Bu eğitime ait ders bulunamadı");
      }
    } catch (error) {
      console.error("Ders bulunurken hata:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
          {education.name}
        </h3>

        <div className="flex items-center justify-between pt-4 border-t">
          {user ? (
            <button
              onClick={findFirstLesson}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium 
                hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-center
                flex items-center justify-center
                transform hover:scale-[1.02] active:scale-[0.98]
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Play className="w-4 h-4 mr-2" />
              Eğitime Başla
            </button>
          ) : (
            <button
              onClick={() => navigate("/auth/login")}
              className="w-full bg-gray-100 text-gray-800 px-4 py-2.5 rounded-lg text-sm font-medium 
                hover:bg-gray-200 transition-all duration-300
                transform hover:scale-[1.02] active:scale-[0.98]
                focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            >
              Giriş Yapın
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EducationCard;