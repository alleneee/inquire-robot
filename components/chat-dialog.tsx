'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

export default function ChatDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        size="lg"
        variant="outline"
        className="flex items-center gap-2 bg-white hover:bg-gray-100"
        onClick={() => setIsOpen(true)}
      >
        <Bot className="w-5 h-5" />
        AI 助手
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0">
          <iframe
            src="http://192.168.3.9/chat/7qSR13dEgdqQXKRB"
            width="100%"
            height="600px"
            frameBorder="0"
            allow="clipboard-write"
            className="rounded-lg"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}