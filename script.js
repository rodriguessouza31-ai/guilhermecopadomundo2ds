/* =====================================================
   script.js — Lógica da página da Copa do Mundo
   - Base de dados estática com todas as edições
   - Renderização dinâmica da linha do tempo (bolinhas)
   - Atualização dinâmica do painel de detalhes ao clicar
   ===================================================== */
'use strict';
/**
 * Base de dados das edições da Copa do Mundo.
 * Os números de gols/cartões do campeão e vice referem-se à campanha
 * (somatório aproximado ao longo do torneio). Algumas edições antigas
 * não tinham registro oficial de cartões amarelos (introduzidos em 1970),
 * por isso usamos "—" para indicar dado indisponível.
 */
const worldCups = [
  { year: 1930, host: 'Uruguai',        champion: { country: 'Uruguai',     goals: 15, yellows: '—' }, runnerUp: { country: 'Argentina',  goals: 18, yellows: '—' } },
  { year: 1934, host: 'Itália',         champion: { country: 'Itália',      goals: 12, yellows: '—' }, runnerUp: { country: 'Tchecoslováquia', goals: 9, yellows: '—' } },
  { year: 1938, host: 'França',         champion: { country: 'Itália',      goals: 11, yellows: '—' }, runnerUp: { country: 'Hungria',    goals: 15, yellows: '—' } },
  { year: 1950, host: 'Brasil',         champion: { country: 'Uruguai',     goals: 15, yellows: '—' }, runnerUp: { country: 'Brasil',     goals: 22, yellows: '—' } },
  { year: 1954, host: 'Suíça',          champion: { country: 'Alemanha Ocidental', goals: 25, yellows: '—' }, runnerUp: { country: 'Hungria', goals: 27, yellows: '—' } },
  { year: 1958, host: 'Suécia',         champion: { country: 'Brasil',      goals: 16, yellows: '—' }, runnerUp: { country: 'Suécia',     goals: 12, yellows: '—' } },
  { year: 1962, host: 'Chile',          champion: { country: 'Brasil',      goals: 14, yellows: '—' }, runnerUp: { country: 'Tchecoslováquia', goals: 7, yellows: '—' } },
  { year: 1966, host: 'Inglaterra',     champion: { country: 'Inglaterra',  goals: 11, yellows: '—' }, runnerUp: { country: 'Alemanha Ocidental', goals: 9, yellows: '—' } },
  { year: 1970, host: 'México',         champion: { country: 'Brasil',      goals: 19, yellows: 4 }, runnerUp: { country: 'Itália',      goals: 10, yellows: 5 } },
  { year: 1974, host: 'Alemanha Ocid.', champion: { country: 'Alemanha Ocidental', goals: 13, yellows: 7 }, runnerUp: { country: 'Países Baixos', goals: 15, yellows: 6 } },
  { year: 1978, host: 'Argentina',      champion: { country: 'Argentina',   goals: 15, yellows: 10 }, runnerUp: { country: 'Países Baixos', goals: 15, yellows: 12 } },
  { year: 1982, host: 'Espanha',        champion: { country: 'Itália',      goals: 12, yellows: 8 }, runnerUp: { country: 'Alemanha Ocidental', goals: 12, yellows: 9 } },
  { year: 1986, host: 'México',         champion: { country: 'Argentina',   goals: 14, yellows: 9 }, runnerUp: { country: 'Alemanha Ocidental', goals: 8, yellows: 7 } },
  { year: 1990, host: 'Itália',         champion: { country: 'Alemanha Ocidental', goals: 15, yellows: 12 }, runnerUp: { country: 'Argentina', goals: 5, yellows: 18 } },
  { year: 1994, host: 'Estados Unidos', champion: { country: 'Brasil',      goals: 11, yellows: 13 }, runnerUp: { country: 'Itália',       goals: 8, yellows: 14 } },
  { year: 1998, host: 'França',         champion: { country: 'França',      goals: 15, yellows: 14 }, runnerUp: { country: 'Brasil',       goals: 14, yellows: 11 } },
  { year: 2002, host: 'Coreia/Japão',   champion: { country: 'Brasil',      goals: 18, yellows: 10 }, runnerUp: { country: 'Alemanha',     goals: 14, yellows: 13 } },
  { year: 2006, host: 'Alemanha',       champion: { country: 'Itália',      goals: 12, yellows: 16 }, runnerUp: { country: 'França',       goals: 9, yellows: 13 } },
  { year: 2010, host: 'África do Sul',  champion: { country: 'Espanha',     goals: 8,  yellows: 20 }, runnerUp: { country: 'Países Baixos', goals: 12, yellows: 23 } },
  { year: 2014, host: 'Brasil',         champion: { country: 'Alemanha',    goals: 18, yellows: 10 }, runnerUp: { country: 'Argentina',    goals: 8, yellows: 12 } },
  { year: 2018, host: 'Rússia',         champion: { country: 'França',      goals: 14, yellows: 12 }, runnerUp: { country: 'Croácia',      goals: 14, yellows: 15 } },
  { year: 2022, host: 'Catar',          champion: { country: 'Argentina',   goals: 15, yellows: 17 }, runnerUp: { country: 'França',       goals: 16, yellows: 8  } },
];
// Seletores principais
const $grid = document.getElementById('timeline-grid');
const $details = document.getElementById('details-content');
/**
 * Cria e injeta as "bolinhas" no grid da linha do tempo.
 * Cada bolinha recebe um data-attribute com o ano para identificação no clique.
 */
function renderTimeline() {
  // Usamos DocumentFragment para evitar múltiplos reflows
  const frag = document.createDocumentFragment();
  worldCups.forEach((cup) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ball';
    btn.dataset.year = String(cup.year);
    btn.setAttribute('role', 'listitem');
    btn.setAttribute('aria-label', `Copa do Mundo de ${cup.year}, sede ${cup.host}`);
    btn.innerHTML = `<span class="ball__year">${cup.year}</span>`;
    frag.appendChild(btn);
  });
  $grid.appendChild(frag);
}
/**
 * Renderiza o painel de detalhes para uma edição específica.
 * @param {object} cup - registro da Copa selecionada
 */
function renderDetails(cup) {
  // Helper para o template de cada time (campeão / vice)
  const teamBlock = (label, team, modifier) => `
    <article class="team-card team-card--${modifier}">
      <h4>${label}</h4>
      <div class="country">${team.country}</div>
      <div class="stats">
        <div><strong>${team.goals}</strong> Gols marcados</div>
        <div><strong>${team.yellows}</strong> Cartões amarelos</div>
      </div>
    </article>
  `;
  $details.innerHTML = `
    <header class="details-header">
      <h3>Copa do Mundo de ${cup.year}</h3>
      <span>Sede: ${cup.host}</span>
    </header>
    <div class="teams">
      ${teamBlock('Campeão', cup.champion, 'champion')}
      ${teamBlock('Vice-Campeão', cup.runnerUp, 'runner')}
    </div>
    <h4 class="muted" style="margin-bottom:10px;">Galeria da edição</h4>
    <div class="photos">
      <!-- Placeholders reservados para duas fotos relacionadas à edição -->
      <img src="" alt="Foto 1 da Copa de ${cup.year}" />
      <img src="" alt="Foto 2 da Copa de ${cup.year}" />
    </div>
  `;
}
/**
 * Marca visualmente a bolinha ativa e remove a marcação das demais.
 * @param {HTMLElement} target - bolinha clicada
 */
function setActiveBall(target) {
  $grid.querySelectorAll('.ball.is-active').forEach((el) => el.classList.remove('is-active'));
  target.classList.add('is-active');
}
/**
 * Delegação de eventos: um único listener no grid identifica
 * a bolinha clicada e dispara a atualização do painel.
 */
$grid.addEventListener('click', (event) => {
  const ball = event.target.closest('.ball');
  if (!ball) return;
  const year = Number(ball.dataset.year);
  const cup = worldCups.find((c) => c.year === year);
  if (!cup) return;
  renderDetails(cup);
  setActiveBall(ball);
  // Rola suavemente até o painel de detalhes
  document.getElementById('detalhes').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
// Inicialização ao carregar a página
renderTimeline();