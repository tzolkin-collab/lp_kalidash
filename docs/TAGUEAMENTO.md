# Tagueamento da LP — guia de referência

Como o rastreamento de conversão da landing page funciona, o que a LP entrega ao
GTM e o que precisa ser configurado **dentro do GTM** (lado Kalidash/Carol).

---

## Visão geral

- **Container GTM:** `GTM-WL5VKKV6` (carregado em `app/layout.tsx` via `@next/third-parties`).
- **Estratégia:** a LP **não** tem IDs de GA4/Meta/Clarity hardcoded. Todas as
  tags são configuradas como tags **dentro do container GTM**. A LP só empurra
  eventos de conversão para o `dataLayer`; o GTM decide o que fazer com eles.
- **Checkout:** Sympla — `https://www.sympla.com.br/evento/imersao-presencial-de-claude/3474828`
  (constante `CHECKOUT_URL` em `app/utilities/constants.ts`).
- **Atribuição de UTM:** script Utmify (`app/layout.tsx`) captura os UTMs e os
  repassa ao link de checkout, para a compra no Sympla ser atribuída à campanha.

---

## O evento que a LP dispara

Existe **um único evento**: `cta_garantir_vaga`, disparado em todos os 5 CTAs
"Garantir vaga" da página.

Payload enviado ao `dataLayer`:

```js
{
  event: "cta_garantir_vaga",
  location: "nav" | "sticky" | "hero" | "investimento" | "contato",
  lote: "01",
  value: 497,
  currency: "BRL"
}
```

- `location` distingue **qual** botão foi clicado (útil para saber qual seção
  converte mais).
- `value` / `currency` / `lote` são **iguais em todos os CTAs** — todos vendem o
  mesmo ingresso (lote 01, R$497). Isso é centralizado em `CHECKOUT_LOTE` no
  arquivo `app/utilities/track.ts`; não existe valor solto por componente.

---

## O que configurar dentro do GTM (lado Kalidash)

1. **Variável de camada de dados** para cada parâmetro que quiser usar:
   `location`, `value`, `currency`, `lote`.
2. **Trigger** do tipo *Custom Event* com nome do evento = `cta_garantir_vaga`.
3. **Tags de conversão** usando esse trigger:
   - **GA4:** enviar como o evento recomendado **`begin_checkout`**, mapeando
     `value` → `value` e `currency` → `currency`. (Opcionalmente montar o objeto
     `ecommerce` com `items`.)
   - **Meta Pixel:** disparar **`InitiateCheckout`** com `value` e `currency`.
   - **Clarity / outras:** livre.

> Nomear no GTM como `begin_checkout` / `InitiateCheckout` faz o GA4 e o Meta
> reconhecerem o evento como etapa de funil padrão, com valor de conversão.

---

## Limitação importante: a compra acontece no Sympla

A LP só consegue medir **intenção de compra** (checkout iniciado). A conversão
final (`Purchase`) acontece **dentro do Sympla**, fora do nosso controle.

- Para fechar o loop de compra é preciso que o **Sympla** tenha o próprio
  pixel/GTM configurado — isso não é feito na LP.
- Enquanto isso, o funil confiável termina em `begin_checkout` / `InitiateCheckout`.
- A ponte de atribuição (qual campanha trouxe o clique) é mantida pelo Utmify,
  que carrega os UTMs até o Sympla.

---

## Como o disparo é confiável (detalhe técnico)

CTA que redireciona tem um problema clássico: se o evento é empurrado e a página
descarrega no mesmo instante, o beacon do GA4/Meta pode ser cancelado e a
conversão **se perde**.

A LP resolve isso em `app/components/TrackedLink.tsx` + `app/utilities/track.ts`:

- No clique em navegação na mesma aba, o redirect é **segurado**
  (`e.preventDefault()`) e só ocorre quando o GTM confirma o disparo das tags
  (`eventCallback`).
- Há um **fallback de 1200ms** (`eventTimeout` + `setTimeout`): se nenhuma tag
  estiver mapeada ao evento, ou o GTM estiver bloqueado por ad-blocker, o usuário
  segue para o checkout mesmo assim. Ninguém fica preso.
- Cliques com Ctrl/Cmd/botão do meio (abrir em nova aba) usam push simples — a
  página atual não descarrega, então não há corrida.

---

## Como testar (QA rápido)

Na LP, abra o console do navegador e rode:

```js
// Vê os eventos que já entraram no dataLayer
window.dataLayer.filter(e => e.event === "cta_garantir_vaga");
```

Ou, para checar em tempo real, cole antes de clicar num CTA:

```js
const orig = window.dataLayer.push.bind(window.dataLayer);
window.dataLayer.push = (...a) => { console.log("dataLayer →", ...a); return orig(...a); };
```

Deve aparecer o objeto `cta_garantir_vaga` com `location`, `value:497`,
`currency:"BRL"`, `lote:"01"` a cada clique. Use também a **Preview/Debug do GTM**
para confirmar que as tags disparam no evento.

---

## Arquivos relevantes

| Arquivo | Papel |
|---|---|
| `app/layout.tsx` | Carrega o container GTM e o script Utmify |
| `app/utilities/track.ts` | Helper `track()`, `CHECKOUT_LOTE`, dispatch com `eventCallback` |
| `app/components/TrackedLink.tsx` | Âncora que empurra o evento e segura o redirect |
| `app/utilities/constants.ts` | `CHECKOUT_URL` (Sympla) e dados do lote |
| Seções (`Hero`, `Investment`, `Contact`) e layout (`NavHeader`, `StickyHeader`) | Usam `TrackedLink` com o `location` de cada CTA |
