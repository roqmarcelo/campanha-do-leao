import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const URL = 'https://ge.globo.com/futebol/brasileirao-serie-a/';
const VITORIA_ID = 287;
const OUT = 'data/standings.json';

const res = await fetch(URL, {
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LeaoBot/1.0)' },
});
if (!res.ok) {
  console.error(`HTTP ${res.status} ao buscar ${URL}`);
  process.exit(1);
}
const html = await res.text();

const match = html.match(/"classificacao":(\[.*?\}\])/);
if (!match) {
  console.error('Bloco "classificacao" não encontrado — markup do ge.globo pode ter mudado.');
  process.exit(1);
}

let tabela;
try {
  tabela = JSON.parse(match[1]);
} catch (e) {
  console.error('Falha ao parsear JSON da classificação:', e.message);
  process.exit(1);
}

if (tabela.length !== 20) {
  console.error(`Esperava 20 times, achei ${tabela.length}.`);
  process.exit(1);
}

const v = tabela.find((t) => t.equipe_id === VITORIA_ID);
if (!v) {
  console.error('Vitória (id 287) não encontrado na tabela.');
  process.exit(1);
}

const z4 = tabela[16];
if (!z4 || typeof z4.pontos !== 'number') {
  console.error('17º colocado ausente ou inválido.');
  process.exit(1);
}

const rodMatch = html.match(/"rodada":\{"atual":(\d+)/);
const rodadaAtual = rodMatch ? parseInt(rodMatch[1], 10) : null;

const out = {
  updatedAt: new Date().toISOString(),
  rodadaAtual,
  vitoria: {
    posicao: v.ordem,
    pontos: v.pontos,
    jogos: v.jogos,
    vitorias: v.vitorias,
    empates: v.empates,
    derrotas: v.derrotas,
    aproveitamento: v.aproveitamento,
    saldoGols: v.saldo_gols,
    folgaZ4: v.pontos - z4.pontos,
    ultimosJogos: v.ultimos_jogos,
  },
};

const next = JSON.stringify(out, null, 2) + '\n';
const prev = await readFile(OUT, 'utf8').catch(() => '');
const strip = (s) => s.replace(/"updatedAt":\s*"[^"]*",?\s*/, '');
if (strip(prev) === strip(next)) {
  console.log('Sem mudança nos dados, mantendo arquivo atual.');
  process.exit(0);
}

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, next);
console.log('Atualizado:', out.vitoria);
