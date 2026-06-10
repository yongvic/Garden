'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useI18n } from '@/lib/i18n/context'
import { formatDateShort } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Message = {
  id: string
  content: string
  createdAt: string
  senderId: string
  sender: { name: string | null; image: string | null }
}

type ChatPanelProps = {
  bookingId: string
}

export function ChatPanel({ bookingId }: ChatPanelProps) {
  const { data: session } = useSession()
  const { t, locale } = useI18n()
  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const userId = session?.user?.id

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/messages`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setMessages(data.messages ?? [])
    } catch {
      toast.error(t.messages.loadError)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 15000)
    return () => clearInterval(interval)
  }, [bookingId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!content.trim()) return
    setIsSending(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setMessages((prev) => [...prev, data.message])
      setContent('')
    } catch {
      toast.error(t.common.error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t.messages.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{t.messages.subtitle}</p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <ScrollArea className="h-[320px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">{t.messages.empty}</p>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isOwn = msg.senderId === userId
                return (
                  <div
                    key={msg.id}
                    className={cn('flex gap-2', isOwn ? 'flex-row-reverse' : 'flex-row')}
                  >
                    <Avatar className="size-8 shrink-0">
                      <AvatarImage src={msg.sender.image ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {msg.sender.name?.[0] ?? '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn('max-w-[75%] space-y-1', isOwn && 'items-end')}>
                      <div
                        className={cn(
                          'rounded-2xl px-4 py-2.5 text-sm',
                          isOwn
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-muted rounded-bl-sm'
                        )}
                      >
                        {msg.content}
                      </div>
                      <p className="text-[10px] text-muted-foreground px-1">
                        {isOwn ? t.messages.you : msg.sender.name ?? t.messages.host} ·{' '}
                        {formatDateShort(msg.createdAt, locale)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>

        <div className="flex gap-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t.messages.placeholder}
            rows={2}
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <Button
            size="icon"
            className="shrink-0 self-end"
            onClick={handleSend}
            disabled={isSending || !content.trim()}
          >
            {isSending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
