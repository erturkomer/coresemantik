CoreSemantik

Proje Yapısı
│── backend/      # Node.js + Express Backend
│── frontend/     # React Frontend
│── README.md     # Proje açıklaması

Kurulum
Projeyi çalıştırmak için aşağıdaki adımları takip edebilirsiniz.

1. Depoyu Klonlayın

git clone <repo-url>
cd project-root

2. Backend Kurulumu

cd backend
npm install
npm run start

Bu adımlar, backend için gerekli bağımlılıkları yükleyecek ve sunucuyu başlatacaktır.

3. Frontend Kurulumu

Yeni bir terminal açın ve frontend dizinine giderek aşağıdaki komutları çalıştırın:

cd frontend
npm install
npm run dev

Bu adımlar, frontend için gerekli bağımlılıkları yükleyecek ve geliştirme sunucusunu başlatacaktır.

Çalıştırma

Proje başarıyla çalıştırıldıktan sonra:

Backend varsayılan olarak http://localhost:5000 portunda çalışır.
Frontend varsayılan olarak http://localhost:5173 portunda çalışır.

Tarayıcınızda http://localhost:5173 adresine giderek projeyi görebilirsiniz.

Çevre Değişkenleri
Eğer çevre değişkenleri kullanıyorsanız, backend ve frontend dizinleri içinde .env dosyanızın olduğundan emin olun.
Katkıda Bulunma
Projeye katkıda bulunmak için:

Fork edin 📌

Kendi branch'inizi oluşturun (git checkout -b feature-branch)

Değişiklik yapıp commit atın (git commit -m 'Yeni özellik ekledim')

Push edin (git push origin feature-branch)

Pull request açın 🚀