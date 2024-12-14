import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import './App.scss';
import { SendSvgrepoCom } from './icons/index';


const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 40%;
  height: 100vh;
  margin: 0 auto;
  background: linear-gradient(180deg, #FFFFFF 0%, #E0E0E0 100%);
  position: relative;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scroll-behavior: smooth;
  display: flex;
  flex-direction: column;
  
  /* Для Firefox */
  scrollbar-width: none;
  
  /* Для Chrome, Safari и других браузеров на основе WebKit */
  &::-webkit-scrollbar {
    display: none;
  }
  
  /* Для IE и Edge */
  -ms-overflow-style: none;
`;

const InputContainer = styled.div`
  padding: 20px;
  background: transparent;
  position: sticky;
  bottom: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ChatMessage = styled.div`
  background-color: #f5f5f5;
  border-radius: 10px;
  padding: 15px;
  margin: 8px 0;
  max-width: 80%;
  word-wrap: break-word;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);

  font-size: 18px;
  font-weight: 500;

  &.user-message {
    background-color: #FFFA00;
    margin-left: auto;
    border-bottom-right-radius: 0;
    animation: userMessageAppear 0.3s ease forwards;
  }
  
  &.ai-message {
    background-color: #6A0AAB;
    color: white;
    margin-right: auto;
    border-bottom-left-radius: 0;
    animation: aiMessageAppear 0.3s ease forwards;
  }

  @keyframes userMessageAppear {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes aiMessageAppear {
    from {
      opacity: 0;
      transform: translateX(-50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  p {
    margin: 0 30px 5px 0;
    word-break: break-word;
  }
  position: relative;
  overflow-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
  display: flex;
  flex-direction: column;
`;

const MessageTime = styled.span`
  position: absolute;
  right: 10px;
  bottom: 5px;
  text-align: right;
  font-size: 12px;
  opacity: 0.7;
  color: ${props => props.className?.includes('user-message') ? '#000' : '#fff'};
`;

const ChatInput = styled.input`
  width: 90%;
  height: 25px;
  padding: 20px;

  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 20px;
  margin: 10px 0;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #6A0AAB;
  }
`;

const ChatButton = styled.button`
  width: 9%;
  height: 67px;
  margin-left: 10px;
  background-color: ${props => props.disabled ? 'transparent' : '#6A0AAB'};
  color: ${props => props.disabled ? '#6A0AAB' : 'white'};
  border: ${props => props.disabled ? '1px solid #6A0AAB' : 'none'};
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  svg {
    color: inherit;
    fill: ${props => props.disabled ? '#6A0AAB' : 'white'};
    transition: fill 0.3s ease;
  }

  &:hover {
    background-color: #6A0AAB;
    color: white;
    
    svg {
      fill: white;
    }
  }

  &:active {
    background-color: #e479ff;
  }
`;

const LoadingDots = styled.div`
  display: inline-block;
  
  &::after {
    content: '...';
    animation: loading 1.5s infinite;
    font-size: 20px;
  }

  @keyframes loading {
    0% { content: '.'; }
    33% { content: '..'; }
    66% { content: '...'; }
  }
`;

const MessageText = styled.p`
  opacity: 0;
  animation: textAppear 0.3s ease forwards;
  animation-delay: 0.3s;
  margin: 0 30px 5px 0;
  word-break: break-word;

  @keyframes textAppear {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;


interface Message {
  id : number,
  text : string,
  role : string,
  isLoading : boolean,
  time : string,
}



function App() {
  const [state, setState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);



  const callBackendAPI = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/express_backend');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const body = await response.json();
      setState(body.express);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
      console.error('Ошибка:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    callBackendAPI();
  }, []);

  useEffect(() => {
    const chatContainer = document.querySelector('.chat__container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };
  const handleSendMessage = async () => {
    if (inputText.length > 0) {
        const userMessage = {
            id: messages.length + 1,
            text: inputText,
            role: 'user',
            isLoading: false,
            time: new Date().toLocaleTimeString().split(':').slice(0,2).join(':')
        };
        
        const loadingMessage = {
            id: messages.length + 2,
            text: '',
            role: 'ai',
            isLoading: true,
            time: new Date().toLocaleTimeString().split(':').slice(0,2).join(':')
        };
        
        setMessages(prev => [...prev, userMessage, loadingMessage]);
        setInputText('');

        try {
            const response = await fetch('http://localhost:5000/send_message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: inputText })
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 429) {
                    throw new Error(errorData.message || 'Слишком много запросов. Попробуйте через ' + 
                        (errorData.retryAfter || 30) + ' секунд.');
                }
                throw new Error(errorData.message || 'Ошибка сети');
            }

            const data = await response.json();
            
            setMessages(prev => prev.map(msg => 
                msg.id === loadingMessage.id 
                    ? {
                        ...msg,
                        text: data.response,
                        isLoading: false
                      }
                    : msg
            ));
            
        } catch (error) {
            console.error('Ошибка при отправке ообщения:', error);
            setMessages(prev => prev.map(msg => 
                msg.id === loadingMessage.id 
                    ? {
                        ...msg,
                        text: error instanceof Error ? error.message : 'Произошла ошибка',
                        isLoading: false,
                        role: 'error'
                      }
                    : msg
            ));
        }
    } 
};

  return (
    <div className="App">
      <ChatContainer className="chat__container">
        <MessagesContainer>
          {messages.map((message) => (
            <ChatMessage key={message.id} className={message.role === 'user' ? 'user-message' : 'ai-message'}>
              {message.isLoading ? (
                <LoadingDots />
              ) : (
                <>
                  <MessageText>{message.text}</MessageText>
                  <MessageTime className={message.role === 'user' ? 'user-message' : 'ai-message'}>
                    {message.time}
                  </MessageTime>
                </>
              )}
            </ChatMessage>
          ))}
        </MessagesContainer>

        <InputContainer>
          <ChatInput
            type="text"
            placeholder="Ask me something about traveling"
            value={inputText}
            onChange={handleInputChange}
          />
          <ChatButton 
            onClick={handleSendMessage} 
            disabled={inputText.length === 0}
          >
            <SendSvgrepoCom className="chat__sendButton--svg" />
          </ChatButton>
        </InputContainer>
      </ChatContainer>

    </div>
  );
}

export default App;