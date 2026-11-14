"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { buildDrawSequence } from "../lib/draw-sequence";

type Photo = { id: string; name: string; url: string; roleTitle?: string };
type DrawData = { photos: Photo[]; winners: Record<string, string> };
type Result = { place: number; photo: Photo };

export function WinnerDraw({ eventId }: { eventId: string }) {
  const modal = useRef<HTMLDialogElement>(null);
  const [modalResult, setModalResult] = useState<Result>();
  const [data, setData] = useState<DrawData>();
  const [rail, setRail] = useState<Photo[]>([]);
  const [index, setIndex] = useState(2);
  const [spinning, setSpinning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState("");
  const [duration, setDuration] = useState(6500);
  const [flipPhoto, setFlipPhoto] = useState<Photo>();
  const [flipped, setFlipped] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const frame = useRef<number | undefined>(undefined);
  const locked = useRef(false);
  const alive = useRef(true);
  function nextPlace(current: DrawData | undefined) {
    return [3, 2, 1].find((rank) => current?.winners[String(rank)] && current.photos.some((photo) => photo.id === current.winners[String(rank)]) && !results.some((result) => result.place === rank)) ?? 0;
  }
  const place = nextPlace(data);

  useEffect(() => {
    const dialog = modal.current;
    if (!modalResult || !dialog) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();
    return () => { if (dialog.open) dialog.close(); document.body.style.overflow = previousOverflow; };
  }, [modalResult]);

  async function load() {
    const response = await fetch(`/api/draw?eventId=${encodeURIComponent(eventId)}`, { cache: "no-store" });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Не удалось загрузить фотографии.");
    return body as DrawData;
  }
  useEffect(() => {
    alive.current = true;
    let active = true;
    void load().then((body) => {
      if (!active) return;
      setData(body);
      setRail(Array.from({ length: Math.max(5, body.photos.length) }, (_, i) => body.photos[i % body.photos.length]).filter(Boolean));
    }).catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : "Ошибка загрузки."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; alive.current = false; clearTimeout(timer.current); if (frame.current !== undefined) cancelAnimationFrame(frame.current); };
  }, [eventId]);

  async function start() {
    if (locked.current || place < 1) return;
    locked.current = true; setLoading(true); setError(""); setRevealed(false); setFlipped(false); setFlipPhoto(undefined);
    try {
      const fresh = await load();
      if (!alive.current) return;
      setData(fresh);
      const drawPlace = nextPlace(fresh);
      if (!drawPlace) throw new Error("Нет назначенных победителей для следующего выбора.");
      const target = fresh.photos.find((photo) => photo.id === fresh.winners[String(drawPlace)]);
      if (!target?.url) throw new Error(`Фото победителя ${drawPlace}-го места недоступно.`);
      if (results.some((result) => result.photo.id === target.id)) throw new Error("Эта фотография уже получила место. Обратитесь к организатору.");
      const candidates = fresh.photos.filter((photo) => photo.url);
      const sequence = buildDrawSequence(candidates, target);
      const ms = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 250 : 6500;
      setDuration(0); setIndex(2); setRail(sequence); setSpinning(true); setLoading(false);
      frame.current = requestAnimationFrame(() => {
        frame.current = requestAnimationFrame(() => {
          setDuration(ms); setIndex(48);
          timer.current = setTimeout(() => {
            setFlipPhoto(target);
            setFlipped(true);
            setRevealed(true);
            timer.current = setTimeout(() => {
              setResults((current) => [...current, { place: drawPlace, photo: target }]);
              setSpinning(false); locked.current = false;
              setModalResult({ place: drawPlace, photo: target });
            }, ms === 250 ? 400 : 1400);
          }, ms + 100);
        });
      });
    } catch (caught) { if (alive.current) setError(caught instanceof Error ? caught.message : "Не удалось запустить выбор."); locked.current = false; }
    finally { if (alive.current) setLoading(false); }
  }

  const last = results[results.length - 1];
  return <main className={`aiDraw ${spinning ? "isSpinning" : ""} ${revealed ? "isRevealed" : ""}`}>
    <div className="aiDrawGrid" aria-hidden="true" />
    <header className="aiDrawHeader"><a href="/">← Fake Wedding</a><button onClick={() => { if (!document.fullscreenElement) void document.documentElement.requestFullscreen().catch(() => setError("Полноэкранный режим недоступен.")); else void document.exitFullscreen(); }}>На весь экран ↗</button></header>
    <section className="aiDrawIntro"><h1>В центре внимания.<br /><em>Один из вас.</em></h1><span>Три места. Три момента славы.</span></section>
    <section className="aiDrawMachine" aria-label="Карусель фотографий">
      <div className="aiDrawPointer" aria-hidden="true">▼</div>
      <div className="aiDrawViewport"><div className="aiDrawRail" style={{ "--draw-index": index, transitionDuration: `${duration}ms` } as CSSProperties}>{rail.map((photo, i) => <div className={`aiDrawCard ${i === index ? "focused" : ""}`} key={`${i}-${photo.id}`}><div className={`aiDrawRailFlip ${results.some((result) => result.photo.id === photo.id) || (i === index && flipped) ? "flipped" : ""}`}><div className="aiDrawMysteryInner"><div className="aiDrawMysteryFront" aria-label="Закрытая карточка"><span>?</span></div><div className="aiDrawMysteryBack">{results.some((result) => result.photo.id === photo.id) ? <img src={photo.url} alt="Объявленный победитель" /> : i === index && flipPhoto ? <img src={flipPhoto.url} alt="Победитель" /> : null}</div></div></div></div>)}</div>{!rail.length && <div className="aiDrawNoPhoto">{loading ? "Загружаем фотографии…" : "Добавьте фотографии в галерею мероприятия"}</div>}<div className="aiDrawSelection" aria-hidden="true" /></div>
      <div className="aiDrawMachineBottom"><div className="aiDrawBars" aria-hidden="true">{Array.from({ length: 24 }, (_, i) => <i key={i} style={{ animationDelay: `${i * 0.09}s` }} />)}</div></div>
    </section>
    <section className="aiDrawControls" aria-live="polite">
      <p>{spinning ? `Выбираем ${place}-е место` : revealed && last ? `ПОБЕДИТЕЛЬ · ${last.place}-Е МЕСТО` : place > 0 ? `НА ОЧЕРЕДИ · ${place}-Е МЕСТО` : results.length ? "ВСЕ ПОБЕДИТЕЛИ ОБЪЯВЛЕНЫ" : "ПОБЕДИТЕЛИ ЕЩЁ НЕ НАЗНАЧЕНЫ"}</p>
      {revealed && last && <h2>{last.place === 1 ? "Главный момент вечера!" : "Ваш момент славы!"}</h2>}
      {error && <div className="aiDrawError" role="alert">{error}</div>}
      <button className="aiDrawStart" disabled={loading || spinning || place < 1 || !data?.photos.length} onClick={() => void start()}>{spinning ? "ВЫБИРАЕМ…" : loading ? "ЗАГРУЗКА…" : place < 1 ? (results.length ? "РОЗЫГРЫШ ЗАВЕРШЁН" : "ОЖИДАЕМ ПОБЕДИТЕЛЕЙ") : `Выбрать ${place}-е место`}<span>↗</span></button>
    </section>
    {results.length > 0 && <section className="aiDrawPodium" aria-label="Победители">{results.map((result) => <article key={result.place} className="opened"><span>0{result.place}</span><img src={result.photo.url} alt={`Победитель: ${result.place}-е место`} /><strong>{result.place}-е место</strong><small>{result.photo.roleTitle || "ПОБЕДИТЕЛЬ ОБЪЯВЛЕН"}</small></article>)}</section>}

    <dialog ref={modal} className="aiWinnerModal" aria-labelledby="winner-modal-title" onClose={() => setModalResult(undefined)} onClick={(event) => { if (event.target === event.currentTarget) modal.current?.close(); }}>
      {modalResult && <div className="aiWinnerModalContent">
        <button className="aiWinnerModalClose" aria-label="Закрыть окно победителя" onClick={() => modal.current?.close()}>×</button>
        <p className="aiWinnerModalCaption">{modalResult.place === 1 ? "Главный победитель вечера!" : "Ваш момент славы!"}</p>
        <h2 id="winner-modal-title">{modalResult.photo.roleTitle || "Победитель"}</h2>
        <div className="aiWinnerModalPhoto"><img src={modalResult.photo.url} alt={`Победитель: ${modalResult.place}-е место`} /><span>0{modalResult.place}</span></div>
        <p className="aiWinnerModalRole">{modalResult.place}-е место</p>
        <button autoFocus className="aiDrawStart" onClick={() => modal.current?.close()}>{modalResult.place > 1 ? "ПРОДОЛЖИТЬ" : "К РЕЗУЛЬТАТАМ"}<span>↗</span></button>
      </div>}
    </dialog>
  </main>;
}
