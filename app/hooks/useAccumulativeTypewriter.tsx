'use client';

import { useState, useEffect, useRef } from 'react';

interface UseAccumulativeTypewriterOptions {
  messages: string[];
  typeSpeed?: number;
  pauseBetweenMessages?: number;
  isActive?: boolean;
}

export function useAccumulativeTypewriter({
  messages,
  typeSpeed = 80,
  pauseBetweenMessages = 1000,
  isActive = true
}: UseAccumulativeTypewriterOptions) {
  const [completedMessages, setCompletedMessages] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset when isActive changes or messages change
  useEffect(() => {
    if (!isActive) {
      setCompletedMessages([]);
      setCurrentMessage('');
      setCurrentMessageIndex(0);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Start the typing process when activated
    if (isActive && messages.length > 0 && currentMessageIndex === 0 && completedMessages.length === 0) {
      startTypingMessage(0);
    }
  }, [isActive, messages]);

  const startTypingMessage = (messageIndex: number) => {
    if (messageIndex >= messages.length) return;
    
    const targetMessage = messages[messageIndex];
    let charIndex = 0;
    
    const typeNextChar = () => {
      if (charIndex <= targetMessage.length) {
        setCurrentMessage(targetMessage.slice(0, charIndex));
        charIndex++;
        
        if (charIndex <= targetMessage.length) {
          timeoutRef.current = setTimeout(typeNextChar, typeSpeed);
        } else {
          // Finished typing this message - use a single state update to avoid flicker
          timeoutRef.current = setTimeout(() => {
            // Atomic state update to prevent double rendering
            setCompletedMessages(prev => [...prev, targetMessage]);
            setCurrentMessage('');
            setCurrentMessageIndex(messageIndex + 1);
            
            // Start next message after a brief pause
            if (messageIndex + 1 < messages.length) {
              timeoutRef.current = setTimeout(() => {
                startTypingMessage(messageIndex + 1);
              }, pauseBetweenMessages);
            }
          }, 100); // Small delay to prevent visual conflicts
        }
      }
    };
    
    typeNextChar();
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    completedMessages,
    currentMessage,
    isComplete: currentMessageIndex >= messages.length && !currentMessage
  };
} 