"use client";

import { useEffect, useRef, useState } from "react";

export function PhotoPreview({ src, title, className = "" }: { src: string; title: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!open || !element) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    return () => { element.close(); document.body.style.overflow = previous; };
  }, [open]);
  return <>
    <button type="button" className={`adminPhotoTrigger ${className}`} aria-label={`Открыть фото: ${title}`} onClick={() => setOpen(true)}><img src={src} alt={title} /><span className="adminPhotoZoom" aria-hidden="true">⤢</span></button>
    <dialog ref={dialog} className="adminPhotoDialog" aria-label={title} onClose={() => setOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="adminPhotoDialogContent"><header><h2>{title}</h2><button type="button" autoFocus onClick={() => dialog.current?.close()} aria-label="Закрыть фото">×</button></header><img src={src} alt={title} /></div>
    </dialog>
  </>;
}
