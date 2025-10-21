import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const MatchingRoom = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState('');

  if (!id) return <div className="p-8 text-center">매칭방을 찾을 수 없습니다.</div>;

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { sender: '나', text: input }]);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">매칭방</h2>
      <div className="w-full max-w-xl border rounded bg-white p-4 flex flex-col gap-4">
        {/* 상대 프로필/매니저 정보 */}
        <div className="flex flex-col md:flex-row gap-4 items-center border-b pb-4 mb-2">
          {/* 커플 매니저 정보(샘플) */}
          <div className="flex-1 text-right">
            <div className="font-semibold">커플 매니저</div>
            <div className="text-sm">이름: 이루연</div>
            <div className="text-sm">전화: 02-514-3651</div>
          </div>
        </div>
        {/* 채팅 UI */}
        <div className="flex flex-col h-80 border rounded bg-gray-50 p-2 overflow-y-auto mb-2">
          {messages.length === 0 && <div className="text-gray-400 text-center my-auto">아직 메시지가 없습니다.</div>}
          {messages.map((msg, i) => (
            <div key={i} className={msg.sender === '나' ? 'text-right' : 'text-left'}>
              <span className={
                msg.sender === '나'
                  ? 'inline-block px-2 py-1 rounded bg-blue-100 my-1'
                  : 'inline-block px-2 py-1 rounded bg-gray-200 my-1'
              }>
                <span className="text-xs text-gray-500 mr-1">{msg.sender}</span>{msg.text}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            className="border p-2 rounded flex-1"
            placeholder="메시지 입력..."
          />
          <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-1 rounded">전송</button>
        </div>
      </div>
    </div>
  );
};

export default MatchingRoom; 