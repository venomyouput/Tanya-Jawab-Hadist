
import { GoogleGenAI, Chat } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function findAndAnalyzeHadith(topic: string): Promise<string> {
  const prompt = `
Anda adalah seorang ahli dalam 'Ulum al-Hadith (Ilmu Hadis).
Seorang pengguna ingin membahas topik berikut: "${topic}"

Tugas Anda adalah:
1.  Temukan satu Hadis yang sangat relevan dan terkenal terkait dengan topik ini.
2.  Sediakan teks lengkap Hadis dalam bahasa Arab dan terjemahannya dalam bahasa Indonesia.
3.  Berikan analisis terperinci tentang Hadis tersebut, dengan fokus khusus pada rantai transmisinya (sanad).

Analisis harus mencakup:
- **Hadis yang Ditemukan:** Sebutkan hadis dengan jelas (Teks Arab dan Terjemahan).
- **Rantai Transmisi (Sanad):** Sebutkan perawi-perawi utama yang diketahui dalam rantai untuk narasi spesifik ini.
- **Penilaian Sanad:** Bahas penilaian umum terhadap rantai ini. Apakah para perawi dikenal dapat diandalkan ('thiqah')? Apakah rantainya terhubung ('muttasil')?
- **Metode Transmisi & Otentisitas:** Ini adalah bagian terpenting. Jelaskan secara rinci bagaimana perbedaan dalam rantai transmisi (sanad) dapat memengaruhi keaslian dan penilaian hadis. Gunakan Hadis spesifik ini sebagai contoh. Bahas konsep-konsep seperti 'Sahih', 'Hasan', 'Da'if' dan bagaimana penerapannya berdasarkan Sanad.
- **Relevansi dengan Topik:** Jelaskan secara singkat bagaimana Hadis ini menjawab topik pengguna.

Strukturkan seluruh respons Anda menggunakan Markdown. Gunakan judul yang jelas untuk setiap bagian.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error finding and analyzing Hadith:", error);
    throw new Error("Model AI gagal menghasilkan analisis untuk topik tersebut.");
  }
}

export function createDiscussionChat(topic: string, analysis: string): Chat {
  const systemInstruction = `Anda adalah asisten ahli dalam 'Ulum al-Hadith (Ilmu Hadis). Anda sedang mendiskusikan sebuah topik dan hadis terkait dengan pengguna.
Topik awal adalah: "${topic}"

Hadis yang ditemukan dan analisisnya adalah:
"${analysis}"

Jawab pertanyaan lanjutan dari pengguna secara ringkas dan akurat, selalu dalam konteks ilmu hadis dan informasi yang telah diberikan. Format jawaban Anda menggunakan markdown.`;

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
    },
  });
  return chat;
}
