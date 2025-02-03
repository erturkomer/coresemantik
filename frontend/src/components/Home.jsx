import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Code,
  Users,
  Award,
  Clock,
  ChevronRight,
} from "lucide-react";
import EducationCard from "./EducationCard";

const Home = () => {
  const [educations, setEducations] = useState([]); 
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    navigate("/");
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const tokenStr = localStorage.getItem("token");

    if (userStr && tokenStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        axios.defaults.headers.common["Authorization"] = `Bearer ${tokenStr}`;
      } catch (error) {
        console.log("Kullanıcı bilgisi parse edilemedi:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    const fetchEducations = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/educations");
        console.log("Fetchlenen eğitimler:", response.data);
        setEducations(response.data);
      } catch (error) {
        console.error("Eğitimler yüklenirken hata:", error);
        setEducations([]); // Hata durumunda boş dizi
      }
    };
    fetchEducations();
  }, []);

  // İstatistikler için örnek veriler
  const stats = [
    { icon: <BookOpen className="w-8 h-8" />, value: "100+", label: "Dersler" },
    { icon: <Users className="w-8 h-8" />, value: "5000+", label: "Öğrenci" },
    { icon: <Award className="w-8 h-8" />, value: "50+", label: "Eğitmen" },
    {
      icon: <Clock className="w-8 h-8" />,
      value: "1000+",
      label: "Saat İçerik",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white text-gray-800 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold flex items-center">
              <span className="text-blue-600 mr-2">⚡</span>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                Eğitim Platformu
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              {user?.email ? (
                <div className="flex items-center space-x-4">
                  <div className="hidden md:flex items-center space-x-2">
                    <img
                      src={
                        user.avatar ||
                        `https://ui-avatars.com/api/?name=${user.fullname}&background=random`
                      }
                      alt={user.fullname}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">
                        {user.fullname}
                      </span>
                      <span className="text-xs text-gray-500">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Çıkış
                  </button>
                </div>
              ) : (
                <div className="space-x-3">
                  <Link
                    to="/auth/login"
                    className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    to="/auth/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Geleceğinizi Bugün
            <br />
            Şekillendirin
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-2xl mx-auto">
            En güncel teknolojiler ve uzman eğitmenlerle kariyer yolculuğunuzda
            yanınızdayız.
          </p>
          {!user && (
            <div className="space-x-4">
              <Link
                to="/auth/register"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition font-semibold text-lg inline-flex items-center"
              >
                Hemen Başla
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* İstatistikler */}
      <div className="container mx-auto px-4 -mt-16">
        <div className="bg-white rounded-xl shadow-lg grid grid-cols-2 md:grid-cols-4 gap-8 p-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-blue-600 mb-2 flex justify-center">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {stat.value}
              </div>
              <div className="text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Popüler Eğitimler</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          En popüler eğitimlerimizle öğrenmeye başlayın. Her seviyeye uygun
          içeriklerle kendinizi geliştirin.
        </p>
        {/* Filtre Butonları */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <button className="px-4 py-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
            Tüm Eğitimler
          </button>
          <button className="px-4 py-2 rounded-full hover:bg-gray-100 transition-colors">
            Frontend
          </button>
          <button className="px-4 py-2 rounded-full hover:bg-gray-100 transition-colors">
            Backend
          </button>
          <button className="px-4 py-2 rounded-full hover:bg-gray-100 transition-colors">
            Mobile
          </button>
        </div>

        {/* Eğitimler Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {educations.length > 0 ? (
            educations.map((education) => (
              <EducationCard
                key={education._id}
                education={education}
                user={user}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-10">
              Henüz eğitim bulunmuyor.
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8 mt-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
                Eğitim Platformu
              </h3>
              <p className="text-gray-400 mb-6">
                Modern ve interaktif öğrenme platformu ile geleceğin
                teknolojilerini keşfedin. Size özel eğitim yolculuğunuzda
                yanınızdayız.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Hızlı Bağlantılar</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    to="/courses"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Tüm Dersler
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/codeplayground"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Code Playground
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">İletişim</h4>
              <ul className="space-y-2 text-gray-400">
                <li>info@egitimplatformu.com</li>
                <li>+90 555 123 45 67</li>
                <li>Ankara, Türkiye</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-500">
              © 2024 Eğitim Platformu. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;