// =============================================================
//  EsToDoList - Sistema completo de tarefas
//  Autores - Yan Matheus e auxilio do Profº Rafael
// =============================================================

// -------------------------------
// 1. Seleção de elementos
// -------------------------------
const campoTitulo = document.getElementById('nova-tarefa-input')
const campoDescricao = document.getElementById('descricao-tarefa-input')
const botaoAdicionar = document.getElementById('adicionar-tarefa-btn')
const campoPesquisa = document.getElementById('pesquisar-input')
const listaTarefas = document.getElementById('listas-de-tarefas')

const filtroTodas = document.getElementById('filtro-todas')
const filtroPendentes = document.getElementById('filtro-pendentes')
const filtroConcluidas = document.getElementById('filtro-concluidas')
const filtroPrazos = document.getElementById('filtro-prazos')

const progressoBarra = document.getElementById('progresso-barra')
const progressoTexto = document.getElementById('progresso-texto')
const progressoPorcentagem = document.getElementById('progresso-porcentagem')
const contadorTarefas = document.getElementById('contador-tarefas')

let tarefas = []
let filtroAtual = 'todas'

// -------------------------------
// 2. Carregar / Salvar
// -------------------------------
function carregarTarefasSalvas() {
  const dados = localStorage.getItem('tarefas')
  if (dados) {
    try { tarefas = JSON.parse(dados) } catch { tarefas = [] }
  }
  exibirTarefas()
}

function salvarTarefas() {
  localStorage.setItem('tarefas', JSON.stringify(tarefas))
}

// -------------------------------
// 3. Toast notifications
// -------------------------------
function mostrarToast(msg, tipo = 'info') {
  const container = document.getElementById('toast-container')
  const cores = {
    sucesso: 'bg-emerald-500 text-white',
    erro: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    alerta: 'bg-amber-500 text-white'
  }
  const icones = {
    sucesso: 'fa-circle-check',
    erro: 'fa-circle-xmark',
    info: 'fa-circle-info',
    alerta: 'fa-triangle-exclamation'
  }
  const toast = document.createElement('div')
  toast.className = `toast px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${cores[tipo] || cores.info}`
  toast.innerHTML = `<i class="fas ${icones[tipo] || icones.info}"></i>${msg}`
  container.appendChild(toast)
  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease'
    toast.style.opacity = '0'
    toast.style.transform = 'translateX(100%)'
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

// -------------------------------
// 4. Confirm
// -------------------------------
function mostrarConfirm(msg) {
  return window.confirm(msg)
}

// -------------------------------
// 5. Adicionar tarefa
// -------------------------------
function adicionarTarefa() {
  const titulo = campoTitulo.value.trim()
  const descricao = campoDescricao.value.trim()

  if (!titulo) {
    mostrarToast('Digite um título para a tarefa!', 'alerta')
    campoTitulo.focus()
    return
  }

  tarefas.push({
    id: Date.now(),
    titulo,
    descricao,
    prazo: null,
    concluida: false,
    mostrarDescricao: false,
    editando: false,
    criadoEm: new Date().toISOString()
  })

  salvarTarefas()
  exibirTarefas()
  campoTitulo.value = ''
  campoDescricao.value = ''
  campoTitulo.focus()
  mostrarToast('Tarefa adicionada com sucesso!', 'sucesso')
}

// -------------------------------
// 6. Atualizar progresso e contador
// -------------------------------
function atualizarProgresso() {
  const total = tarefas.length
  const concluidas = tarefas.filter(t => t.concluida).length
  const pendentes = total - concluidas
  const comPrazo = tarefas.filter(t => t.prazo).length
  const pct = total === 0 ? 0 : Math.round((concluidas / total) * 100)

  progressoBarra.style.width = `${pct}%`
  progressoTexto.textContent = `${concluidas} de ${total} concluída${total !== 1 ? 's' : ''}`
  progressoPorcentagem.textContent = `${pct}%`
  contadorTarefas.textContent = `${pendentes} pendente${pendentes !== 1 ? 's' : ''}`

  const elTodas = document.getElementById('contador-todas')
  const elPendentes = document.getElementById('contador-pendentes')
  const elConcluidas = document.getElementById('contador-concluidas')
  const elPrazos = document.getElementById('contador-prazos')
  if (elTodas) elTodas.textContent = total
  if (elPendentes) elPendentes.textContent = pendentes
  if (elConcluidas) elConcluidas.textContent = concluidas
  if (elPrazos) elPrazos.textContent = comPrazo
}

// -------------------------------
// 7. Exibir tarefas
// -------------------------------
function exibirTarefas() {
  listaTarefas.innerHTML = ''
  const termo = campoPesquisa.value.toLowerCase().trim()
  const style = getComputedStyle(document.documentElement)
  const v = (name) => style.getPropertyValue(name).trim()

  // Filtrar
  const filtradas = tarefas.filter(tarefa => {
    const correspondePesquisa = !termo ||
      tarefa.titulo.toLowerCase().includes(termo) ||
      (tarefa.descricao && tarefa.descricao.toLowerCase().includes(termo))

    if (!correspondePesquisa) return false
    if (filtroAtual === 'pendentes') return !tarefa.concluida
    if (filtroAtual === 'concluidas') return tarefa.concluida
    if (filtroAtual === 'prazos') return tarefa.prazo
    return true
  })

  // Estado vazio
  if (filtradas.length === 0) {
    const isSearch = termo !== ''
    listaTarefas.innerHTML = `
      <div class="text-center py-10">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3"
          style="background: ${v('--empty-icon-bg')};">
          <i class="fas ${isSearch ? 'fa-search' : 'fa-inbox'} text-2xl"
            style="color: ${v('--empty-icon-color')};"></i>
        </div>
        <p class="font-medium" style="color: ${v('--empty-text')};">${isSearch ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa ainda'}</p>
        <p class="text-sm mt-1" style="color: ${v('--empty-sub')};">${isSearch ? 'Tente outro termo de pesquisa' : 'Adicione sua primeira tarefa acima!'}</p>
      </div>`
    atualizarProgresso()
    return
  }

  // Renderizar cada tarefa
  filtradas.forEach(tarefa => {
    const item = document.createElement('li')
    item.setAttribute('data-id', tarefa.id)

    const taskBg = tarefa.concluida ? v('--task-completed-bg') : v('--task-bg')
    const taskBorder = tarefa.concluida ? v('--task-completed-border') : v('--task-border')
    const taskHoverBorder = v('--task-hover-border')
    const taskHoverShadow = v('--task-hover-shadow')
    const taskText = tarefa.concluida ? v('--task-completed-text') : v('--task-text')
    const textDecoration = tarefa.concluida ? 'line-through' : 'none'

    item.className = 'task-card flex flex-col p-4 rounded-xl border transition-all duration-300'
    item.style.cssText = `
      background: ${taskBg};
      border-color: ${taskBorder};
    `
    item.addEventListener('mouseenter', () => {
      item.style.borderColor = taskHoverBorder
      item.style.boxShadow = taskHoverShadow
    })
    item.addEventListener('mouseleave', () => {
      item.style.borderColor = taskBorder
      item.style.boxShadow = ''
    })

    // --- Modo edição ---
    if (tarefa.editando) {
      item.innerHTML = `
        <div class="flex flex-col gap-3">
          <input id="edit-titulo-${tarefa.id}" value="${escapeHtml(tarefa.titulo)}"
            style="background: var(--edit-bg); border-color: var(--edit-border); color: var(--edit-text);"
            class="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm font-medium"/>
          <textarea id="edit-descricao-${tarefa.id}"
            style="background: var(--edit-bg); border-color: var(--edit-border); color: var(--edit-text);"
            class="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none text-sm" rows="2">${escapeHtml(tarefa.descricao || '')}</textarea>
          <input type="date" id="edit-prazo-${tarefa.id}" value="${tarefa.prazo || ''}"
            style="background: var(--edit-bg); border-color: var(--edit-border); color: var(--edit-text);"
            class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"/>
          <div class="flex gap-2">
            <button data-action="salvar-edicao"
              class="flex-1 py-2 rounded-lg font-medium text-sm transition-all text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg">
              <i class="fas fa-check mr-1"></i>Salvar
            </button>
            <button data-action="cancelar-edicao"
              style="background: var(--edit-cancel-bg); color: var(--text-secondary);"
              class="flex-1 py-2 rounded-lg font-medium text-sm transition-all hover:opacity-80">
              <i class="fas fa-xmark mr-1"></i>Cancelar
            </button>
          </div>
        </div>
      `
      item.querySelector('[data-action="salvar-edicao"]').onclick = () => salvarEdicao(tarefa.id)
      item.querySelector('[data-action="cancelar-edicao"]').onclick = cancelarEdicao
      listaTarefas.appendChild(item)
      atualizarProgresso()
      return
    }

    // --- Modo normal ---
    const prazoBadge = formatarPrazoBadge(tarefa.prazo)
    const hasDescricao = !!tarefa.descricao

    item.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-3 flex-grow min-w-0">
          <input type="checkbox" class="custom-checkbox" ${tarefa.concluida ? 'checked' : ''}>
          <div class="flex flex-col min-w-0 flex-grow">
            <span class="task-text font-medium text-sm truncate"
              style="color: ${taskText}; text-decoration: ${textDecoration};">${escapeHtml(tarefa.titulo)}</span>
            ${prazoBadge ? `<span class="mt-1 self-start text-xs px-2 py-0.5 rounded-full font-semibold ${prazoBadge}"><i class="fas fa-calendar-day mr-1"></i>${tarefa.prazo}</span>` : ''}
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button data-action="mostrar-descricao"
            class="action-btn p-2 rounded-lg transition-colors"
            style="color: ${hasDescricao ? v('--task-action') : v('--text-muted')}; ${!hasDescricao ? 'opacity:0.5;cursor:not-allowed' : ''}"
            title="Ver descrição">
            <i class="fas fa-eye text-sm"></i>
          </button>
          <button data-action="adicionar-prazo"
            class="action-btn p-2 rounded-lg transition-colors hover:text-violet-500"
            style="color: var(--task-action);" title="Prazo">
            <i class="fas fa-clock text-sm"></i>
          </button>
          <button data-action="editar"
            class="action-btn p-2 rounded-lg transition-colors hover:text-blue-500"
            style="color: var(--task-action);" title="Editar">
            <i class="fas fa-pen text-sm"></i>
          </button>
          <button data-action="excluir"
            class="action-btn p-2 rounded-lg transition-colors hover:text-red-500"
            style="color: var(--task-action);" title="Excluir">
            <i class="fas fa-trash text-sm"></i>
          </button>
        </div>
      </div>
      ${tarefa.mostrarDescricao && tarefa.descricao
        ? `<div class="mt-3 pt-3" style="border-top: 1px solid ${v('--task-desc-border')};">
             <p class="text-xs leading-relaxed" style="color: ${v('--task-desc-text')};">${escapeHtml(tarefa.descricao)}</p>
           </div>`
        : ''}
    `

    // Bind events
    item.querySelector('input[type="checkbox"]').addEventListener('change', () => alternarConclusao(tarefa.id))
    if (hasDescricao) {
      item.querySelector('[data-action="mostrar-descricao"]').onclick = () => toggleDescricao(tarefa.id)
    }
    item.querySelector('[data-action="editar"]').onclick = () => editarTarefa(tarefa.id)
    item.querySelector('[data-action="adicionar-prazo"]').onclick = () => adicionarPrazo(tarefa.id)
    item.querySelector('[data-action="excluir"]').onclick = () => excluirTarefa(tarefa.id)

    listaTarefas.appendChild(item)
  })

  atualizarProgresso()
}

// Escapar HTML para prevenir XSS
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// Formatar badge do prazo
function formatarPrazoBadge(prazo) {
  if (!prazo) return ''
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const dataPrazo = new Date(prazo + 'T00:00:00')
  const diff = dataPrazo - hoje
  const msPorDia = 1000 * 60 * 60 * 24
  const dias = Math.ceil(diff / msPorDia)

  if (dias < 0) return 'prazo-vencido'
  if (dias === 0) return 'prazo-proximo'
  if (dias <= 2) return 'prazo-proximo'
  return 'prazo-futuro'
}

// -------------------------------
// 8. Alternar conclusão
// -------------------------------
function alternarConclusao(id) {
  const tarefa = tarefas.find(t => t.id === id)
  if (tarefa) {
    tarefa.concluida = !tarefa.concluida
    salvarTarefas()
    exibirTarefas()
    mostrarToast(tarefa.concluida ? 'Tarefa concluída!' : 'Tarefa reaberta.', tarefa.concluida ? 'sucesso' : 'info')
  }
}

// -------------------------------
// 9. Editar tarefa
// -------------------------------
function editarTarefa(id) {
  tarefas = tarefas.map(t => ({ ...t, editando: t.id === id }))
  exibirTarefas()
}

function salvarEdicao(id) {
  const titulo = document.getElementById(`edit-titulo-${id}`).value.trim()
  const descricao = document.getElementById(`edit-descricao-${id}`).value.trim()
  const prazo = document.getElementById(`edit-prazo-${id}`).value || null

  if (!titulo) {
    mostrarToast('O título não pode estar vazio!', 'alerta')
    return
  }

  tarefas = tarefas.map(t =>
    t.id === id ? { ...t, titulo, descricao, prazo, editando: false } : t
  )
  salvarTarefas()
  exibirTarefas()
  mostrarToast('Tarefa atualizada!', 'sucesso')
}

function cancelarEdicao() {
  tarefas = tarefas.map(t => ({ ...t, editando: false }))
  exibirTarefas()
}

// -------------------------------
// 10. Excluir tarefa
// -------------------------------
function excluirTarefa(id) {
  if (mostrarConfirm('Tem certeza que deseja excluir esta tarefa?')) {
    tarefas = tarefas.filter(t => t.id !== id)
    salvarTarefas()
    exibirTarefas()
    mostrarToast('Tarefa excluída.', 'erro')
  }
}

// -------------------------------
// 11. Adicionar prazo
// -------------------------------
function adicionarPrazo(id) {
  const data = window.prompt('Digite o prazo (AAAA-MM-DD):')
  if (data) {
    tarefas = tarefas.map(t => t.id === id ? { ...t, prazo: data } : t)
    salvarTarefas()
    exibirTarefas()
    mostrarToast(`Prazo definido: ${data.split('-').reverse().join('/')}`, 'sucesso')
  }
}

// -------------------------------
// 12. Toggle descrição
// -------------------------------
function toggleDescricao(id) {
  const tarefa = tarefas.find(t => t.id === id)
  if (tarefa && tarefa.descricao) {
    tarefa.mostrarDescricao = !tarefa.mostrarDescricao
    salvarTarefas()
    exibirTarefas()
  }
}

// -------------------------------
// 13. Pesquisa e filtros
// -------------------------------
function pesquisarTarefas() {
  exibirTarefas()
}

function aplicarFiltro(tipo) {
  filtroAtual = tipo
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'))
  const el = document.getElementById(`filtro-${tipo}`)
  if (el) el.classList.add('active')
  exibirTarefas()
}

// -------------------------------
// 14. Sistema de Temas
// -------------------------------
function initTheme() {
  const html = document.documentElement
  const themeToggleBtn = document.getElementById('theme-toggle-btn')
  const themePanel = document.getElementById('theme-panel')

  const temas = ['blue', 'dark', 'gold-dark', 'gold-light', 'mono']
  const nomes = { blue: 'Azul Claro', dark: 'Dark', 'gold-dark': 'Dourado Dark', 'gold-light': 'Dourado Claro', mono: 'Preto & Branco' }

  // Carregar tema salvo
  const temaSalvo = localStorage.getItem('tema') || 'blue'
  html.setAttribute('data-theme', temaSalvo)

  // Toggle panel
  themeToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    themePanel.classList.toggle('open')
  })

  // Fechar panel ao clicar fora
  document.addEventListener('click', (e) => {
    if (!themePanel.contains(e.target) && e.target !== themeToggleBtn) {
      themePanel.classList.remove('open')
    }
  })

  // Opções de tema
  document.querySelectorAll('.theme-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const tema = opt.getAttribute('data-theme-value')
      html.setAttribute('data-theme', tema)
      localStorage.setItem('tema', tema)
      themePanel.classList.remove('open')
      mostrarToast(`Tema ${nomes[tema]} ativado`, 'info')
    })
  })
}

// -------------------------------
// 15. Eventos
// -------------------------------
botaoAdicionar.addEventListener('click', adicionarTarefa)
campoTitulo.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); adicionarTarefa() } })
campoPesquisa.addEventListener('input', pesquisarTarefas)
campoDescricao.addEventListener('keydown', e => { if (e.key === 'Enter' && e.ctrlKey) adicionarTarefa() })

filtroTodas.addEventListener('click', () => aplicarFiltro('todas'))
filtroPendentes.addEventListener('click', () => aplicarFiltro('pendentes'))
filtroConcluidas.addEventListener('click', () => aplicarFiltro('concluidas'))
filtroPrazos.addEventListener('click', () => aplicarFiltro('prazos'))

// -------------------------------
// 16. Inicialização
// -------------------------------
window.addEventListener('DOMContentLoaded', () => {
  initTheme()
  carregarTarefasSalvas()
})
