"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";

type Item = {
  id: string;
  file: File;
  url: string;
  duration: number; // сек на кадр
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [building, setBuilding] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const fps = 30;
  const width = 1280;
  const height = 720;

  // загрузка нескольких изображений
  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const mapped = files
      .filter((f) => f.type.startsWith("image/"))
      .map((f, i) => ({
        id: `${Date.now()}-${i}`,
        file: f,
        url: URL.createObjectURL(f),
        duration: 2, // по умолчанию 2 сек
      }));
    setItems((prev) => [...prev, ...mapped]);
    e.currentTarget.value = "";
  };

  const move = (idx: number, dir: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev];
      const t = idx + dir;
      if (t < 0 || t >= next.length) return prev;
      [next[idx], next[t]] = [next[t], next[idx]];
      return next;
    });
  };

  const removeAt = (idx: number) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const totalSec = useMemo(
    () => items.reduce((s, it) => s + (Number(it.duration) || 0), 0),
    [items]
  );

  const buildVideo = async () => {
    if (!items.length) return;

    setBuilding(true);
    setProgress("Загружаю ffmpeg…");
    setVideoUrl(null);

    // динамически импортируем только в браузере
    const { createFFmpeg, fetchFile } = await import("@ffmpeg/ffmpeg");
    const ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();

    try {
      setProgress("Готовлю изображения…");
      // пишем картинки во внутреннюю FS ffmpeg
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const data = await fetchFile(it.file);
        ffmpeg.FS("writeFile", `img_${i}.png`, data);
      }

      // из каждой картинки делаем mp4-сегмент нужной длительности
      // кодек mpeg4 совместим в браузерах и доступен в ffmpeg.wasm
      for (let i = 0; i < items.length; i++) {
        const d = Math.max(0.5, Number(items[i].duration) || 2);
        setProgress(`Рендер ${i + 1}/${items.length} (≈${d}s)…`);
        await ffmpeg.run(
          "-loop", "1",
          "-t", String(d),
          "-i", `img_${i}.png`,
          "-vf",
          `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
          "-r", String(fps),
          "-pix_fmt", "yuv420p",
          "-c:v", "mpeg4",
          `seg_${i}.mp4`
        );
      }

      // собираем список для concat
      const concatTxt = items.map((_, i) => `file 'seg_${i}.mp4'`).join("\n");
      ffmpeg.FS("writeFile", "list.txt", new TextEncoder().encode(concatTxt));

      setProgress("Склеиваю сегменты…");
      await ffmpeg.run(
        "-f", "concat",
        "-safe", "0",
        "-i", "list.txt",
        "-c", "copy",
        "out.mp4"
      );

      const out = ffmpeg.FS("readFile", "out.mp4");
      const url = URL.createObjectURL(new Blob([out.buffer], { type: "video/mp4" }));
      setVideoUrl(url);
      setProgress("Готово ✅");
    } catch (e) {
      console.error(e);
      setProgress("Ошибка при сборке видео");
    } finally {
      setBuilding(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <Card>
        <h1 className="text-2xl font-bold mb-2 text-center">🖼️ → 🎬 Слайд-видео</h1>
        <p className="text-sm text-gray-500 mb-4 text-center">
          Загрузите несколько изображений, задайте порядок и длительность. Мы склеим их в MP4 прямо в браузере.
        </p>

        <div className="flex flex-col gap-3">
          <Input type="file" accept="image/*" multiple onChange={onFiles} />

          {!!items.length && (
            <div className="flex flex-col gap-3">
              {items.map((it, idx) => (
                <div key={it.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <img src={it.url} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-700 truncate">{it.file.name}</div>
                    <div className="text-xs text-gray-500">Длительность (сек):</div>
                    <input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={it.duration}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setItems((prev) => {
                          const next = [...prev];
                          next[idx] = { ...next[idx], duration: v };
                          return next;
                        });
                      }}
                      className="mt-1 w-28 px-3 py-1 rounded-lg border border-gray-300"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button type="button" onClick={() => move(idx, -1)} variant="secondary">▲</Button>
                    <Button type="button" onClick={() => move(idx, +1)} variant="secondary">▼</Button>
                  </div>

                  <Button type="button" onClick={() => removeAt(idx)} variant="secondary">Удалить</Button>
                </div>
              ))}
              <div className="text-sm text-gray-600">
                Кадров: {items.length} · Итого: ~{totalSec}s · {fps} FPS · {width}×{height}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="button" onClick={buildVideo} disabled={!items.length || building}>
              {building ? "Собираю…" : "Собрать видео (MP4)"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setItems([]); setVideoUrl(null); setProgress(""); }}
            >
              Очистить проект
            </Button>
          </div>

          {!!progress && (
            <div className="text-sm text-gray-700">{progress}</div>
          )}

          {videoUrl && (
            <div className="mt-3">
              <video src={videoUrl} controls className="w-full rounded-xl border" />
              <div className="mt-2">
                <a
                  href={videoUrl}
                  download="slideshow.mp4"
                  className="underline text-blue-600"
                >
                  Скачать MP4
                </a>
              </div>
            </div>
          )}
        </div>
      </Card>
    </main>
  );
}
