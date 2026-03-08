import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, User, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // ใช้ LocalStorage เก็บประวัติการแชทจำลองเหมือนที่เพื่อนใช้เก็บข้อมูลสุขภาพ
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('health_chat_history');
    return saved ? JSON.parse(saved) : [
      { role: 'assistant', content: 'สวัสดีค่ะ! ระบบเชื่อมต่อสำเร็จแล้ว มีอะไรให้ช่วยไหมคะ? (โหมดทดสอบ)' }
    ];
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('health_chat_history', JSON.stringify(messages));
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ฟังก์ชันจำลองการตอบกลับแบบ Mockup เพื่อเช็ค UI
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // จำลองการคิดของ AI 1 วินาที
    setTimeout(() => {
      const botMsg: Message = { 
        role: 'assistant', 
        content: `ได้รับข้อความ "${userMsg.content}" แล้วค่ะ! ระบบเชื่อมต่อหน้าจอและ Routing ทำงานปกติแล้ว` 
      };
      setMessages(prev => [...prev, botMsg]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50">
      {/* Header พร้อมปุ่มย้อนกลับตามโครงสร้างเว็บเพื่อน */}
      <div className="bg-white border-b p-4 flex items-center gap-3 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <div className="bg-green-100 p-2 rounded-lg">
          <Sparkles className="text-green-600" size={20} />
        </div>
        <div>
          <h1 className="font-bold text-gray-800 text-lg">Selfcare Assistant</h1>
          <p className="text-xs text-green-600 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            เชื่อมต่อสำเร็จ (Mockup Mode)
          </p>
        </div>
      </div>

      {/* ช่องแชทโชว์ข้อความ */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                msg.role === 'user' ? 'bg-blue-500' : 'bg-green-500'
              }`}>
                {msg.role === 'user' ? <User size={16} color="white" /> : <Sparkles size={16} color="white" />}
              </div>
              <div className={`p-3 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                ? 'bg-green-600 text-white rounded-tr-none' 
                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <Loader2 size={16} color="white" className="animate-spin" />
            </div>
            <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm">
              <p className="text-sm text-gray-400 italic">บอทกำลังพิมพ์...</p>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* ส่วนอินพุตข้อความ */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto flex gap-2 bg-gray-100 p-1.5 rounded-full items-center px-4 focus-within:ring-2 focus-within:ring-green-400 transition-all">
          <input 
            className="flex-1 bg-transparent border-none outline-none py-2 text-sm text-gray-700"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="ลองพิมพ์ทดสอบการเชื่อมต่อ..."
          />
          <button 
            onClick={handleSend}
            className={`p-2 rounded-full transition-all ${
              !input.trim() || isLoading ? 'bg-gray-300' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            <Send size={18} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
