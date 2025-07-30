'use client'

import { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import Typewriter from 'typewriter-effect'

export function TypewriterMarkdown({
    content,
    onInit,
    scrollRef
}: {
    content: string
    onInit?: (typewriter: any) => void
    scrollRef?: React.RefObject<HTMLDivElement>
}) {
    const [isTyping, setIsTyping] = useState(true)
    const markdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isTyping && scrollRef?.current && markdownRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [isTyping, scrollRef])

    if (isTyping) {
        return (
            <div ref={markdownRef}>
                <Typewriter
                    options={{
                        delay: 15,
                        cursor: '',
                    }}
                    onInit={(typewriter) => {
                        typewriter
                            .typeString(content)
                            .callFunction(() => setIsTyping(false))
                            .start()

                        if (onInit) onInit(typewriter)
                    }}
                />
            </div>
        )
    }

    return <ReactMarkdown>{content}</ReactMarkdown>
}