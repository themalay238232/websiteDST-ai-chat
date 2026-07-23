# Persistent Website Chat and Image Analysis

## Goal

Keep an anonymous customer's website conversation available for 30 days and allow the customer to send an image that Gemini can analyze. Bot-sent and customer-sent images must also appear in the customer chat and the unified admin inbox.

## User experience

- Closing or reloading the page does not end the conversation.
- Returning in the same browser within 30 days restores the conversation history.
- The customer can attach one JPEG, PNG, or WebP image to a message.
- The chat shows an image preview before sending and clear upload, validation, and retry states.
- Gemini answers using both the optional text and the uploaded image.
- Bot-selected portfolio or reference images continue to render in the chat.
- The current `Kết thúc` action becomes `Xóa cuộc trò chuyện` and requires confirmation.
- Incognito mode, clearing browser data, switching devices, or explicitly deleting the conversation starts a new anonymous session.

## Architecture

### Persistent anonymous session

- Extend the signed guest session lifetime from one hour to 30 days.
- Store the signed guest session in `localStorage`, never in source code or logs.
- Add an authenticated `GET /api/web-history` endpoint.
- The endpoint derives the conversation ID only from the verified bearer session and never accepts another customer's ID.
- The website restores the archived thread after validating the local session.

### Customer image upload

- Resize/compress images in the browser to a maximum dimension of 1600 pixels and a maximum encoded size of 2 MB.
- Upload raw image bytes to `POST /api/web-upload` with the signed guest session.
- Accept only JPEG, PNG, and WebP and verify both `Content-Type` and file magic bytes.
- Allow one uploaded image per chat message and apply session/IP rate limits.
- Store the image in the existing Cloudflare KV namespace with a random, unguessable ID and a 30-day TTL.
- Return a capability URL plus an internal image ID bound to the verified guest session.
- Reject remote URLs supplied by customers.

### Gemini analysis and storage

- `POST /api/web-chat` accepts optional text and one server-issued upload ID.
- The Worker verifies upload ownership, reads the validated image bytes, and passes inline image data to the existing Gemini multimodal path.
- The archived user message stores the safe image URL and optional text; the assistant message stores its answer and selected images.
- The unified admin inbox renders both customer and assistant images.

### Image delivery

- `GET /web-upload/:id` serves only validated image bytes with the stored MIME type, `X-Content-Type-Options: nosniff`, and a conservative cache policy.
- Upload IDs use cryptographically random values and expire with the underlying KV object.
- No Gemini key, Meta token, guest bearer token, or admin token is returned in image URLs or logs.

## Failure handling

- Invalid format: explain that JPEG, PNG, or WebP is required.
- Oversized image: ask the customer to choose a smaller image.
- Upload or Gemini failure: preserve the typed message and image preview so the customer can retry.
- Expired session: create a new anonymous session without exposing another customer's history.
- Missing historical image: keep the message text and show a neutral unavailable-image state.

## Limits

- Session and conversation retention: 30 days.
- One customer image per message.
- Maximum processed image size: 2 MB.
- Maximum image dimension before upload: 1600 px.
- Supported types: JPEG, PNG, WebP.
- Cross-device history is out of scope because the chat remains anonymous.

## Verification

- Unit tests for 30-day session issuance and expiry.
- API tests for authenticated history, upload ownership, MIME/magic-byte validation, size limits, and rate limits.
- Integration test that a website image reaches Gemini as inline data and is archived with the reply.
- Frontend tests for local restoration, image preview, error states, and history rendering.
- Browser checks on desktop and mobile for text-only, image-only, and text-plus-image messages.
- Existing Messenger, website chat, admin inbox, lint, typecheck, build, and deployment tests must continue to pass.
