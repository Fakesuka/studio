'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';
import { getTelegramUser } from '@/lib/telegram';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  orderId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

interface ChatProps {
  orderId: string;
  receiverId: string;
  receiverName: string;
}

export function Chat({ orderId, receiverId, receiverName }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const currentUser = getTelegramUser();

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await api.request(`/chat/orders/${orderId}`);
        setMessages(data);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [orderId]);

  // Setup WebSocket connection
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Chat WebSocket connected');
      // Join the order room
      ws.send(JSON.stringify({
        type: 'join_order',
        orderId: orderId
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message' && data.message.orderId === orderId) {
          setMessages(prev => [...prev, data.message]);
          // Mark as read if it's not from current user
          if (data.message.senderId !== currentUser?.id.toString()) {
            api.request(`/chat/messages/${data.message.id}/read`, {
              method: 'PUT'
            }).catch(console.error);
          }
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Chat WebSocket disconnected');
    };

    wsRef.current = ws;

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [orderId, currentUser?.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    try {
      const message = await api.request('/chat/messages', {
        method: 'POST',
        body: JSON.stringify({
          orderId,
          receiverId,
          content: newMessage.trim()
        })
      });

      // Message will be added via WebSocket
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Загрузка чата...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Чат с {receiverName}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
              <p>Нет сообщений</p>
              <p className="text-sm">Начните общение с отправки первого сообщения</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isCurrentUser = message.senderId === currentUser?.id.toString();
                return (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-2',
                      isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className={cn(
                        isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                      )}>
                        {isCurrentUser ? 'Я' : receiverName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        'flex flex-col gap-1 max-w-[70%]',
                        isCurrentUser ? 'items-end' : 'items-start'
                      )}
                    >
                      <div
                        className={cn(
                          'rounded-lg px-3 py-2',
                          isCurrentUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        <p className="text-sm break-words">{message.content}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.createdAt).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        {isCurrentUser && (
                          <span className="ml-1">
                            {message.isRead ? '✓✓' : '✓'}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        <form
          onSubmit={handleSendMessage}
          className="border-t p-4 flex gap-2"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="flex-1"
            maxLength={500}
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
