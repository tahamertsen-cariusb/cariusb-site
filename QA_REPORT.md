# QA Raporu — Landing → Chat Handoff & Streaming

**Tarih:** 2024  
**Kapsam:** First-release öncesi QA kontrolü  
**Not:** Kod değişikliği yapılmadı, sadece analiz yapıldı.

---

## ✅ Tamam: Landing → Chat Handoff

### lib/handoff.ts
- ✅ Dosya mevcut (`lib/handoff.ts`)
- ✅ `setHandoff()` fonksiyonu sessionStorage'a yazıyor
- ✅ `consumeHandoff()` fonksiyonu sessionStorage'dan okuyup hemen temizliyor (tek seferlik)
- ✅ 90 saniye expiry kontrolü var
- ✅ SSR-safe (window kontrolü)

### Landing Sayfası (HeroInputDock + IntentSuggestion)
- ✅ `HeroInputDock.tsx` (satır 71): `setHandoff()` doğru çağrılıyor
- ✅ `IntentSuggestion.tsx` (satır 89): `setHandoff()` doğru çağrılıyor
- ✅ Her iki component de deepsearch mode'u handoff'a ekliyor
- ✅ user_plan, user_id, guest_id doğru set ediliyor

### Chat Sayfası (/chat)
- ✅ `app/chat/page.tsx` (satır 152): `consumeHandoff()` mount'ta çağrılıyor
- ✅ `handoffProcessedRef` ile tek seferlik çalışma garantisi var
- ✅ Handoff varsa hemen stream başlatılıyor (satır 185-199)
- ✅ SessionStorage temizleniyor (`consumeHandoff()` içinde otomatik)

---

## ⚠️ Eksik / Hata: Chat Streaming Format Uyumsuzluğu

### Kritik Sorun: API NDJSON Döndürmüyor

**Dosya:** `app/api/chat/route.ts` (satır 350-370)

**Sorun:**
- API endpoint'i `text/plain; charset=utf-8` content-type ile düz metin chunk'ları gönderiyor
- `chatClient.ts` ise NDJSON formatı bekliyor (satır 130-160)
- API'den gelen response NDJSON değil, sadece plain text chunk'ları

**Kod İncelemesi:**
```typescript
// app/api/chat/route.ts (satır 350-370)
const parts = chunkString(assistantText, 48);
const stream = new ReadableStream({
  start(controller) {
    let i = 0;
    const tick = () => {
      if (i >= parts.length) return controller.close();
      controller.enqueue(encoder.encode(parts[i++]));
      setTimeout(tick, 8);
    };
    tick();
  },
});

return new Response(stream, {
  headers: {
    "content-type": "text/plain; charset=utf-8",  // ⚠️ Plain text, NDJSON değil
    "cache-control": "no-store",
  },
});
```

**chatClient.ts Beklentisi:**
```typescript
// lib/chatClient.ts (satır 138-160)
// Try to parse as JSON (NDJSON)
try {
  const data = JSON.parse(trimmed);
  if (data.type === "agent" && data.payload) {
    yield { type: "agent", payload: data.payload };
  } else if (data.type === "text" && data.delta) {
    yield { type: "text", delta: data.delta };
  } else if (data.type === "done") {
    yield { type: "done", usage: data.usage };
    return;
  }
} catch {
  // Not JSON, treat as plain text delta
  yield { type: "text", delta: trimmed + "\n" };
}
```

**Çözüm Önerisi:**
1. API'yi NDJSON formatına çevir:
   - Her chunk'ı `{"type":"text","delta":"..."}\n` formatında gönder
   - Content-type: `application/x-ndjson` veya `text/plain` (ama NDJSON formatında)
   - Son chunk: `{"type":"done","usage":{...}}\n`

2. VEYA chatClient.ts'yi plain text'e uyarla (ama bu daha az esnek)

**Etki:**
- Şu anda çalışıyor gibi görünüyor çünkü catch bloğu plain text'i delta olarak işliyor
- Ancak `done`, `error`, `agent` event'leri çalışmıyor olabilir
- Type safety ve hata yönetimi eksik

---

## ✅ Tamam: Chat Streaming (Diğer Özellikler)

### Timeout & Retry
- ✅ `chatClient.ts` (satır 30): 40 saniye timeout var
- ✅ `chatClient.ts` (satır 33): maxRetries = 1 (upstream_timeout için)
- ✅ Retry mantığı doğru çalışıyor (satır 168-179)

### Error Handling
- ✅ `limit_exceeded` yakalanıyor (satır 61-68)
- ✅ `upstream_timeout` yakalanıyor (satır 168-179)
- ✅ `upstream_failed` yakalanıyor (satır 70-90)
- ✅ `invalid_request` yakalanıyor (satır 52-58)

### Stream Parsing
- ✅ `chatClient.ts` satır bazlı parse ediyor (`\n` split, satır 131)
- ✅ Buffer yönetimi doğru (incomplete line korunuyor, satır 132)

### UI Delta Append
- ✅ `app/chat/page.tsx` (satır 202-211): Streaming sırasında delta append ediliyor
- ✅ `updateMessage()` ile mesaj güncelleniyor
- ✅ State güncellemesi doğru (`setConv(getConversation(...))`)

---

## ✅ Tamam: Deepsearch State

### Store Yapısı
- ✅ `store/useDeepsearch.ts` mevcut (zustand + persist)
- ✅ localStorage'da `deepsearch_mode` key'i ile saklanıyor
- ✅ Landing ve chat arasında shared (aynı store kullanılıyor)

### Toggle Senkronizasyonu
- ✅ `DeepsearchToggle.tsx` landing ve chat'te kullanılıyor
- ✅ `useDeepsearchStore` her iki yerde de aynı instance
- ✅ Toggle değişikliği anında yansıyor

**Not:** Dosya adı `lib/deepsearchStore.ts` değil, `store/useDeepsearch.ts` — bu normal, yapı doğru.

---

## ✅ Tamam: Limit & Guest Handling

### Guest Deepsearch Limit
- ✅ `app/chat/page.tsx` (satır 141-143): Guest ve deepsearch_limit === 0 kontrolü var
- ✅ `LimitBubble` component'i mevcut (`components/chat/limit-bubble.tsx`)
- ✅ Limit bubble gösteriliyor (satır 396-398)

### limit_exceeded Hata Yakalama
- ✅ `chatClient.ts` (satır 61-68): `limit_exceeded` kodu yakalanıyor
- ✅ `app/chat/page.tsx` (satır 224-236): `limit_exceeded` event'i handle ediliyor
- ✅ Toast mesajı gösteriliyor
- ✅ Usage refresh ediliyor

---

## ✅ Tamam: UI & A11y

### aria-live & role="status"
- ✅ `typing-indicator.tsx` (satır 13-16): `role="status"`, `aria-live="polite"` var
- ✅ `message-list.tsx` (satır 37-38): `aria-live="polite"`, `aria-atomic="false"` var
- ✅ `limit-bubble.tsx` (satır 32-33): `role="alert"`, `aria-live="polite"` var

### Focus Ring
- ✅ `chat-input.tsx` (satır 92): `focus-ring` class kullanılıyor
- ✅ `HeroInputDock.tsx` (satır 121): `focus-ring` class kullanılıyor
- ✅ `DeepsearchToggle.tsx` (satır 98): `focus:ring-2 focus:ring-accent/50` var

### Header DS Counter
- ✅ `chat-header.tsx` (satır 67-79): Deepsearch counter gösteriliyor
- ✅ Format: `DS: {used}/{limit}`
- ✅ Usage data periyodik refresh ediliyor (30 saniye, satır 27)

### Input Dock Focus Glow
- ✅ `HeroInputDock.tsx` (satır 92-95): Focus durumunda glow var
- ✅ `chat-input.tsx` (satır 60-63): Focus durumunda glow var

### Keyboard Shortcuts
- ✅ `chat-input.tsx` (satır 71-77): Enter=send, Shift+Enter=newline, Esc=blur
- ✅ `chat-input.tsx` (satır 36-39): "/" ile focus
- ✅ `HeroInputDock.tsx` (satır 103-106): Enter=send

---

## ✅ Tamam: Env & Güvenlik

### Server-Side Env Vars
- ✅ `N8N_WEBHOOK_URL`: Sadece `app/api/chat/route.ts` içinde (server-side)
- ✅ `N8N_WEBHOOK_SECRET`: Sadece `app/api/chat/route.ts` içinde (server-side)
- ✅ `REQUEST_TIMEOUT_MS`: Sadece `app/api/chat/route.ts` içinde (server-side)
- ✅ `SUPABASE_SERVICE_ROLE_KEY`: Sadece `lib/supabaseAdmin.ts` içinde (server-side)

### Client-Side Env Vars
- ✅ `NEXT_PUBLIC_SUPABASE_URL`: Client bundle'a giriyor (doğru, public key)
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Client bundle'a giriyor (doğru, anon key güvenli)

### Validation
- ✅ `lib/validateEnv.ts`: Server ve client env validation var
- ✅ `app/api/chat/route.ts` (satır 12-17): Module load'da validation çağrılıyor

**Güvenlik Notu:**
- ✅ Gizli anahtarlar (`N8N_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) client bundle'a girmiyor
- ✅ Sadece `NEXT_PUBLIC_*` prefix'li değişkenler client'a expose ediliyor

---

## ✅ Tamam: Dosya Varlığı

### Gerekli Dosyalar
- ✅ `lib/handoff.ts` — mevcut
- ✅ `lib/chatClient.ts` — mevcut
- ✅ `lib/usageClient.ts` — mevcut
- ✅ `components/chat/chat-header.tsx` — mevcut
- ✅ `components/chat/typing-indicator.tsx` — mevcut
- ✅ `components/chat/limit-bubble.tsx` — mevcut
- ✅ `store/useDeepsearch.ts` — mevcut (not `lib/deepsearchStore.ts`, ama yapı doğru)

### Import Kontrolü
- ✅ `app/chat/page.tsx`: Tüm importlar mevcut
- ✅ `components/HeroInputDock.tsx`: Tüm importlar mevcut
- ✅ `components/IntentSuggestion.tsx`: Tüm importlar mevcut

---

## 💡 Öneriler

### 1. Streaming Format Standardizasyonu
**Öncelik: Yüksek**

API'yi NDJSON formatına çevir:
```typescript
// app/api/chat/route.ts (satır 350-370)
// Şu anki: Plain text chunk'lar
// Önerilen: NDJSON format

const encoder = new TextEncoder();
const parts = chunkString(assistantText, 48);
const stream = new ReadableStream({
  start(controller) {
    let i = 0;
    const tick = () => {
      if (i >= parts.length) {
        // Son chunk: done event
        controller.enqueue(
          encoder.encode(JSON.stringify({ type: "done", usage: {} }) + "\n")
        );
        return controller.close();
      }
      // Her chunk: text event
      controller.enqueue(
        encoder.encode(
          JSON.stringify({ type: "text", delta: parts[i++] }) + "\n"
        )
      );
      setTimeout(tick, 8);
    };
    tick();
  },
});

return new Response(stream, {
  headers: {
    "content-type": "application/x-ndjson", // veya "text/plain" (ama NDJSON formatında)
    "cache-control": "no-store",
  },
});
```

**Fayda:**
- Type-safe event handling
- `done`, `error`, `agent` event'leri düzgün çalışır
- Daha iyi hata yönetimi

### 2. Handoff Double-Send Önleme
**Öncelik: Orta**

`HeroInputDock` ve `IntentSuggestion`'da navigation öncesi debounce ekle:
```typescript
// HeroInputDock.tsx (satır 63-83)
const send = () => {
  const text = value.trim();
  if (!text || disabled) return;
  
  // Debounce: Eğer zaten navigate ediliyorsa, tekrar gönderme
  if (isNavigating) return;
  setIsNavigating(true);
  
  // ... rest of the code
};
```

**Fayda:**
- Çift gönderim riskini azaltır
- Daha iyi UX

### 3. Stream Reader Cleanup
**Öncelik: Düşük**

`chatClient.ts`'de reader cleanup'ı zaten var (satır 162-164), ancak error durumlarında da garantile:
```typescript
// lib/chatClient.ts
try {
  // ... stream reading
} catch (err) {
  // Reader'ı her durumda release et
  try {
    reader.releaseLock();
  } catch {}
  // ... error handling
}
```

**Not:** Zaten `finally` bloğunda var, ama ekstra güvenlik için.

### 4. Usage Refresh Optimizasyonu
**Öncelik: Düşük**

`chat-header.tsx`'deki 30 saniyelik interval yerine, stream `done` event'inde refresh et:
```typescript
// app/chat/page.tsx (satır 212-220)
} else if (event.type === "done") {
  setIsTyping(false);
  // Refresh usage immediately
  getUsage().then((data) => {
    setUsage({
      deepsearch_used: data.deepsearch_used,
      deepsearch_limit: data.deepsearch_limit,
    });
  });
}
```

**Fayda:**
- Daha güncel usage gösterimi
- Gereksiz polling azalır

---

## 📝 Özet

### ✅ Çalışan Özellikler
- Landing → Chat handoff mekanizması
- SessionStorage temizleme
- Deepsearch state senkronizasyonu
- Limit & guest handling
- UI & A11y özellikleri
- Env güvenliği
- Tüm gerekli dosyalar mevcut

### ⚠️ Düzeltilmesi Gerekenler
1. **Kritik:** API streaming formatı NDJSON değil, plain text — bu uyumsuzluk var
   - Şu anda çalışıyor (catch bloğu sayesinde) ama type-safe değil
   - `done`, `error`, `agent` event'leri düzgün çalışmayabilir

### 💡 İyileştirme Önerileri
1. API'yi NDJSON formatına çevir
2. Handoff'ta double-send önleme
3. Stream reader cleanup garantisi
4. Usage refresh optimizasyonu

---

## 🎯 Sonuç

Proje genel olarak iyi durumda. **Tek kritik sorun:** API streaming formatı NDJSON değil, plain text. Bu uyumsuzluk şu anda catch bloğu sayesinde çalışıyor gibi görünse de, type safety ve event handling açısından sorunlu. NDJSON formatına geçilmesi önerilir.

**First-release için:**
- ✅ Handoff mekanizması çalışıyor
- ✅ Streaming çalışıyor (ama format uyumsuz)
- ✅ Limit handling çalışıyor
- ⚠️ Streaming format standardizasyonu önerilir


