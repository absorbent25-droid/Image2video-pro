"use client"

import { useState } from "react"
import { Card, CardContent } from "../components/ui/Card"
import { Input } from "../components/ui/Input"
import { Button } from "../components/ui/Button"

export default function Home() {
  const [text, setText] = useState("")

  return (
    <main className="flex items-center justify-center min-h-screen">
      <Card className="w-[400px]">
        <CardContent>
          <h1 className="text-2xl font-bold mb-4">Image2Video PRO</h1>
          <Input
            placeholder="Введите текст..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button className="mt-4 w-full">Сделать видео</Button>
        </CardContent>
      </Card>
    </main>
  )
}
