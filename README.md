# Campanha do Leão 2026

Simulador da campanha do Vitória na Série A 2026, em PWA estático. Mostra a situação na tabela, projeta a pontuação final conforme o aproveitamento da reta final e deixa o torcedor marcar os resultados rodada a rodada (salvos no aparelho via `localStorage`).

Sem backend, sem build, sem dependências — é HTML/CSS/JS puro hospedável em qualquer lugar que sirva arquivos estáticos por HTTPS.

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | App inteiro (markup, estilos e lógica) |
| `manifest.json` | Metadados do PWA (nome, ícones, cores) |
| `sw.js` | Service worker (offline + cache versionado) |
| `icon-192.png` / `icon-512.png` | Ícones do app |
| `icon-maskable-512.png` | Ícone maskable (Android adaptativo) |
| `apple-touch-icon.png` | Ícone da tela inicial no iOS |

## Rodar localmente

PWA exige HTTPS ou `localhost` — abrir por duplo-clique (`file://`) **não** registra o service worker. Pra testar a experiência completa, sirva a pasta:

```bash
cd campanha-do-leao
python3 -m http.server 8000
# abra http://localhost:8000
```

## Publicar no GitHub Pages

```bash
git init
git add .
git commit -m "Campanha do Leão 2026"
git branch -M main
gh repo create campanha-do-leao --public --source=. --push
```

Depois: Settings → Pages → Source = `Deploy from a branch`, branch `main`, pasta `/ (root)`. Em 1–2 min sai em `https://SEU_USUARIO.github.io/campanha-do-leao/`.

O primeiro deploy pode dar 404 por alguns instantes — espere e recarregue.

## Atualizar a cada rodada

Toda a manutenção fica em `index.html`, no bloco `<script>` no fim do arquivo.

### 1. Ajustar a base (depois que a rodada do jogo marcado vira oficial)

No topo do script:

```js
var BASE_PTS = 22;    // pontos do Vitória
var BASE_GAMES = 16;  // jogos disputados
var TOTAL = 38;       // total de jogos do Brasileirão
```

Conforme o campeonato avança, atualize `BASE_PTS` e `BASE_GAMES` com os números oficiais e **remova da lista os jogos já consolidados** (próximo item). Assim a base reflete a realidade e o rastreador cuida só dos jogos à frente.

### 2. Trocar os jogos da lista

A lista de confrontos fica no array `fx`:

```js
var fx = [
  {rd:18, opp:'Santos', loc:'Fora · 30/05', tag:'Confronto direto', cls:'dir'},
  // rd  = número da rodada
  // opp = adversário
  // loc = mando e data ('Casa · 22/07' ou 'Fora · 30/05')
  // tag = etiqueta de dificuldade (texto livre)
  // cls = cor da etiqueta: 'dir' (amarelo), 'facil' (verde),
  //       'dificil' (vermelho) ou 'equil' (cinza)
];
```

Adicione as próximas rodadas ou remova as já jogadas. A lista pode ter quantos jogos você quiser.

### 3. Atualizar o cabeçalho e a tabela do topo

- Linha "Atualizado após a 17ª rodada...": é dinâmica quando há jogo marcado, mas o **padrão** (sem nada marcado) está no texto da função `updateHeader()`.
- O bloco `.standing` (Posição / Pontos / Jogos / Aproveit. / Folga p/ Z-4) é fixo no HTML — edite os valores à mão quando a posição oficial mudar.

### 4. Forçar atualização nos aparelhos já instalados

Quando mudar qualquer arquivo **além** do `index.html` (ícones, `manifest.json`), suba a versão do cache no `sw.js` pra invalidar o antigo:

```js
const CACHE = 'leao-2026-v1';  // → 'leao-2026-v2'
```

O `index.html` usa estratégia *network-first*, então mudanças nele já aparecem sozinhas na próxima abertura com internet.

### 5. Commitar

```bash
git add . && git commit -m "Atualiza tabela pós-rodada XX" && git push
```

O Pages republica sozinho em ~1 min.

## Notas

- **Dados por aparelho:** os resultados marcados ficam no `localStorage` de cada navegador. Não há sincronização entre torcedores — cada um acompanha o seu.
- **Linhas de corte:** baseadas no histórico da Série A de 20 clubes (rebaixamento ~42–45, Sul-Americana ~G8, Libertadores ~G6/G7). É projeção estatística, não previsão.
- **Sem vínculo oficial** com o Esporte Clube Vitória. Os ícones usam um lettermark genérico, não o escudo do clube.
