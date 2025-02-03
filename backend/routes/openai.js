const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Değer çıkarma fonksiyonu
function extractValueFromCode(code) {
    const cleanCode = code.trim();
    const assignmentMatch = cleanCode.match(/(\w+)\s*=\s*([^;]+)/);
    
    if (assignmentMatch) {
        const [, variableName, value] = assignmentMatch;
        // Değeri temizle ve parse et
        const cleanValue = value.trim();
        
        // String kontrolü
        if (cleanValue.startsWith('"') || cleanValue.startsWith("'")) {
            return {
                type: 'string',
                value: cleanValue.slice(1, -1),
                raw: cleanValue
            };
        }
        
        // Boolean kontrolü
        if (cleanValue === 'True' || cleanValue === 'False') {
            return {
                type: 'boolean',
                value: cleanValue === 'True',
                raw: cleanValue
            };
        }
        
        // Sayı kontrolü
        const numberValue = Number(cleanValue);
        if (!isNaN(numberValue)) {
            return {
                type: 'number',
                value: numberValue,
                raw: cleanValue
            };
        }
        
        return {
            type: 'unknown',
            value: cleanValue,
            raw: cleanValue
        };
    }
    
    return null;
}

// Değer çıkarma fonksiyonu (görev için)
function extractValueFromTask(description) {
    const assignmentMatch = description.match(/(\w+)\s*=\s*([^;,\s]+)/);
    
    if (assignmentMatch) {
        const [, variableName, value] = assignmentMatch;
        const cleanValue = value.trim();
        
        // String kontrolü
        if (cleanValue.startsWith('"') || cleanValue.startsWith("'")) {
            return {
                type: 'string',
                value: cleanValue.slice(1, -1),
                raw: cleanValue
            };
        }
        
        // Boolean kontrolü
        if (cleanValue === 'True' || cleanValue === 'False') {
            return {
                type: 'boolean',
                value: cleanValue === 'True',
                raw: cleanValue
            };
        }
        
        // Sayı kontrolü
        const numberValue = Number(cleanValue);
        if (!isNaN(numberValue)) {
            return {
                type: 'number',
                value: numberValue,
                raw: cleanValue
            };
        }
        
        return {
            type: 'unknown',
            value: cleanValue,
            raw: cleanValue
        };
    }
    
    return null;
}

router.post('/check-code', async (req, res) => {
    try {
        const { code, question } = req.body;

        // Boş kod kontrolü
        if (!code || code.trim() === '') {
            return res.json({
                isCorrect: false,
                feedback: "🌟 Henüz kod yazmamışsın! Hadi başlayalım! ✨",
                lineComments: []
            });
        }

        // Görevden ve öğrenci kodundan değerleri çıkar
        const taskValue = extractValueFromTask(question.description);
        const studentValue = extractValueFromCode(code);

        // Değer kontrolü
        if (taskValue && studentValue && 
            taskValue.type === studentValue.type && 
            taskValue.value !== studentValue.value) {
            return res.json({
                isCorrect: false,
                feedback: `🤔 Değer kontrolü başarısız! Görevde ${taskValue.raw} isteniyor, sen ${studentValue.raw} yazmışsın. ✨`,
                lineComments: [{
                    lineNumber: 1,
                    content: `❗ Beklenen değer: ${taskValue.raw}`
                }]
            });
        }

        // OpenAI API'ye gönderilecek prompt
        const prompt = `
        Sen ilkokul öğrencilerine Python öğreten bir öğretmensin.
        Öğrencinin kodunu çok dikkatli kontrol etmelisin.

        SORU:
        ${question.title}

        GÖREV:
        ${question.description}

        ÖĞRENCİNİN KODU:
        ${code.trim()}

        SIKI KONTROL KURALLARI:
        1. String (metin) değişkenleri için:
           - Değer mutlaka tek tırnak (') veya çift tırnak (") içinde olmalı
           - Örnek doğru: ad = "Mehmet" veya ad = 'Mehmet'
           - Örnek yanlış: ad = Mehmet

        2. Sayısal değişkenler için:
           - Tam sayılar direkt yazılmalı: sayi = 20
           - Ondalıklı sayılar nokta ile: sicaklik = 23.5
           - Tırnak işareti olmamalı

        3. Değişken adı kontrolü:
           - Görevde istenen değişken adı tam olarak kullanılmalı
           - Büyük-küçük harf duyarlı kontrol yapılmalı

        4. Python syntax kontrolü:
           - = işareti olmalı (== değil)
           - Gereksiz boşluk veya noktalama işareti olmamalı

        5. Python'un anahtar kelimeleri doğru kullanılmalı:
           - True, False, None gibi ifadeler büyük harfle başlamalıdır.
           - Örnek doğru: durum = True
           - Örnek yanlış: durum = true
           - Öğrenci küçük harfle yazmışsa uyarılmalı

        DOĞRULUK KONTROLÜ:
        1. Önce görevin ne istediğini tam olarak anla
        2. Öğrencinin kodunu karakter karakter kontrol et
        3. Sadece tam olarak doğru olan kodu kabul et
        4. Yakın cevapları bile yanlış say

        GERİ BİLDİRİM KURALLARI:
        1. Her mesajın başında ve sonunda emoji kullan
        2. Yanlışı açıkça belirt
        3. Doğru örneği göster
        4. Basit ve anlaşılır dil kullan

        YANITINI BU FORMATTA VER:
        {
          "isCorrect": boolean (sadece tam olarak doğruysa true),
          "feedback": "Emojili geri bildirim mesajı",
          "lineComments": [
            {
              "lineNumber": number,
              "content": "Emojili satır yorumu"
            }
          ]
        }`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `Sen çok titiz bir Python öğretmenisin.
                    Kodları çok sıkı kontrol edersin.
                    Sadece %100 doğru olan kodları kabul edersin.
                    Her küçük hatayı yakalar ve nazikçe açıklarsın.
                    Her zaman emoji kullanırsın.
                    Öğrencilerin anlayacağı dilde konuşursun.`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.3,
        });

        const openAiResponse = JSON.parse(completion.choices[0].message.content);

        // OpenAI yanıtı ve değer kontrolünü birleştir
        const response = {
            isCorrect: taskValue && studentValue ? 
                      (taskValue.type === studentValue.type && 
                       taskValue.value === studentValue.value && 
                       openAiResponse.isCorrect) : 
                      openAiResponse.isCorrect,
            feedback: openAiResponse.feedback,
            lineComments: openAiResponse.lineComments
        };

        // Yanıt kontrolü
        if (response.isCorrect) {
            response.feedback = "🎉 Harika! Kodu tam olarak doğru yazdın! 🌟";
        }

        // Emoji kontrolü
        if (!response.feedback.match(/^\p{Emoji}/u)) {
            response.feedback = `🌟 ${response.feedback}`;
        }
        if (!response.feedback.match(/\p{Emoji}$/u)) {
            response.feedback = `${response.feedback} ⭐`;
        }

        res.json(response);

    } catch (error) {
        console.error('Hata:', error);
        res.json({
            isCorrect: false,
            feedback: "🤔 Bir hata oluştu. Tekrar dener misin? ⭐",
            lineComments: []
        });
    }
});

module.exports = router;