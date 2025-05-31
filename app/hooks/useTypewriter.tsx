'use client';

import { useState, useEffect } from 'react';

interface UseTypewriterOptions {
  messages: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseTime?: number;
  isActive?: boolean;
}

export function useTypewriter({
  messages,
  typeSpeed = 100,
  deleteSpeed = 50,
  pauseTime = 1500,
  isActive = true
}: UseTypewriterOptions) {
  const [currentText, setCurrentText] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isActive || messages.length === 0) {
      setCurrentText('');
      return;
    }

    const currentMessage = messages[currentMessageIndex];
    
    let timeout: NodeJS.Timeout;

    if (isPaused) {
      // Pause before starting to delete
      timeout = setTimeout(() => {
        setIsPaused(false);
        setIsTyping(false);
      }, pauseTime);
    } else if (isTyping) {
      // Typing phase
      if (currentText.length < currentMessage.length) {
        timeout = setTimeout(() => {
          setCurrentText(currentMessage.slice(0, currentText.length + 1));
        }, typeSpeed);
      } else {
        // Finished typing, start pause
        setIsPaused(true);
      }
    } else {
      // Deleting phase
      if (currentText.length > 0) {
        timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, deleteSpeed);
      } else {
        // Finished deleting, move to next message
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [currentText, currentMessageIndex, isTyping, isPaused, messages, typeSpeed, deleteSpeed, pauseTime, isActive]);

  // Reset when messages change or becomes inactive
  useEffect(() => {
    if (!isActive) {
      setCurrentText('');
      setCurrentMessageIndex(0);
      setIsTyping(true);
      setIsPaused(false);
    }
  }, [isActive, messages]);

  return currentText;
} 