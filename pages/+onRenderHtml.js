import { escapeInject } from 'vike/server';

export function onRenderHtml(pageContext) {
  return escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head><title>Vike Promise plugin reproduction</title></head>
      <body><h1>${pageContext.Page}</h1></body>
    </html>`;
}
