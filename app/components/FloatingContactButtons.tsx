"use client";

import { MessageCircle, Phone } from "lucide-react";
import { company } from "../../data/company";

type FloatingContactButtonsProps = { onOpenChat: () => void };

export function FloatingContactButtons({ onOpenChat }: FloatingContactButtonsProps) {
  return (
    <aside className="floating-actions" aria-label="Liên hệ nhanh">
      <a href={`tel:${company.phone}`} aria-label={`Gọi DST Group ${company.phoneDisplay}`} title={`Gọi ${company.phoneDisplay}`}><Phone size={19} aria-hidden="true" /></a>
      <a href={company.zaloUrl} target="_blank" rel="noreferrer" aria-label="Liên hệ DST Group qua Zalo" title="Liên hệ qua Zalo">Zalo</a>
      <button type="button" onClick={onOpenChat} aria-label="Mở Messenger DST Group" title="Chat Messenger"><MessageCircle size={19} aria-hidden="true" /></button>
    </aside>
  );
}
