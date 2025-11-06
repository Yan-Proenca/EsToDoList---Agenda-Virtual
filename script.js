// =============================================================
//  EsToDoList - Sistema completo de tarefas
// =============================================================

// -------------------------------
// 1. Selecionar os elementos do DOM
// -------------------------------
const campoTitulo = document.getElementById('nova-tarefa-input')
const campoDescricao = document.getElementById('descricao-tarefa-input')
const botaoAdicionar = document.getElementById('adicionar-tarefa-btn')
const campoPesquisa = document.getElementById('pesquisar-input')
const listaTarefas = document.getElementById('listas-de-tarefas')

const filtroTodas = document.getElementById('filtro-todas')
const filtroConcluidas = document.getElementById('filtro-concluidas')
const filtroPrazos = document.getElementById('filtro-prazos')

let tarefas = []
let filtroAtual = 'todas'

// -------------------------------
// 2. Carregar tarefas salvas
// -------------------------------
function carregarTarefasSalvas() {
  const tarefasSalvas = localStorage.getItem('tarefas')
  if (tarefasSalvas) tarefas = JSON.parse(tarefasSalvas)
  exibirTarefas(tarefas)
}

// -------------------------------
// 3. Salvar tarefas
// -------------------------------
function salvarTarefas() {
  localStorage.setItem('tarefas', JSON.stringify(tarefas))
}

// -------------------------------
// 4. Adicionar nova tarefa
// -------------------------------
function adicionarTarefa() {
  const titulo = campoTitulo.value.trim()
  const descricao = campoDescricao.value.trim()

  if (!titulo) return alert('Digite um título para a tarefa!')

  tarefas.push({
    id: Date.now(),
    titulo,
    descricao,
    prazo: null,
    concluida: false,
    mostrarDescricao: false,
    editando: false
  })

  salvarTarefas()
  exibirTarefas(tarefas)

  campoTitulo.value = ''
  campoDescricao.value = ''
  campoTitulo.focus()
}

// -------------------------------
// 5. Exibir tarefas
// -------------------------------
function exibirTarefas(lista) {
  listaTarefas.innerHTML = ''
  const termo = campoPesquisa.value.toLowerCase()

  const filtradas = lista.filter(t => {
    const pesquisaOk =
      t.titulo.toLowerCase().includes(termo) ||
      (t.descricao && t.descricao.toLowerCase().includes(termo))

    if (!pesquisaOk) return false
    if (filtroAtual === 'concluidas') return t.concluida
    if (filtroAtual === 'prazos') return t.prazo
    return true
  })

  if (filtradas.length === 0) {
    listaTarefas.innerHTML = `
      <li class="text-center text-gray-500 dark:text-gray-400 py-8">
        <i class="fas fa-inbox text-3xl mb-2"></i>
        <p>Nenhuma tarefa encontrada</p>
      </li>`
    return
  }

  filtradas.forEach(tarefa => {
    const li = document.createElement('li')
    li.className = `
      tarefa flex flex-col gap-3 p-4 rounded-lg border
      bg-gray-50 dark:bg-zinc-700 border-gray-200 dark:border-zinc-600
      hover:bg-blue-50 dark:hover:bg-zinc-600 transition
      ${tarefa.concluida ? 'opacity-60' : ''}
    `

    // --- modo edição ---
    if (tarefa.editando) {
      li.innerHTML = `
        <div class="flex flex-col gap-2 dark:text-gray-200">
          <input id="edit-titulo-${tarefa.id}" value="${tarefa.titulo}" class="p-2 border rounded"/>
          <textarea id="edit-descricao-${tarefa.id}" class="p-2 border rounded" rows="2">${tarefa.descricao || ''}</textarea>
          <input type="date" id="edit-prazo-${tarefa.id}" value="${tarefa.prazo || ''}" class="p-2 border rounded"/>
          <div class="flex gap-2 mt-2">
            <button class="save-btn bg-blue-500 text-white px-3 py-1 rounded">Salvar</button>
            <button class="cancel-btn bg-gray-400 text-white px-3 py-1 rounded">Cancelar</button>
          </div>
        </div>
      `
      li.querySelector('.save-btn').addEventListener('click', () => salvarEdicao(tarefa.id))
      li.querySelector('.cancel-btn').addEventListener('click', () => cancelarEdicao(tarefa.id))
      listaTarefas.appendChild(li)
      return
    }

    // --- modo visual normal ---
    li.innerHTML = `
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2 flex-grow">
          <input type="checkbox" class="concluir-tarefa w-5 h-5 text-gray-200"
            ${tarefa.concluida ? 'checked' : ''}>
          <span class="task-text font-medium dark:text-gray-200">${tarefa.titulo}</span>
          ${tarefa.prazo ? `<span class="text-xs text-yellow-600 font-semibold">📅 ${tarefa.prazo}</span>` : ''}
        </div>
        <div class="flex items-center justify-evenly gap-4">
          <button class="mostrar-descricao-btn text-green-500 hover:text-green-700"><i class="fas fa-eye"></i></button>
          <button class="prazo-btn text-purple-500 hover:text-purple-700"><i class="fas fa-clock"></i></button>
          <button class="edit-btn text-blue-500 hover:text-blue-700"><i class="fas fa-edit"></i></button>
          <button class="delete-btn text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      ${tarefa.mostrarDescricao && tarefa.descricao
        ? `<p class="text-sm text-gray-600  dark:text-gray-200 mt-2">${tarefa.descricao}</p>`
        : ''}
    `

    li.querySelector('.concluir-tarefa').addEventListener('change', () => alternarConclusao(tarefa.id))
    li.querySelector('.delete-btn').addEventListener('click', () => excluirTarefa(tarefa.id))
    li.querySelector('.edit-btn').addEventListener('click', () => editarTarefa(tarefa.id))
    li.querySelector('.prazo-btn').addEventListener('click', () => adicionarPrazo(tarefa.id))
    li.querySelector('.mostrar-descricao-btn').addEventListener('click', () => toggleDescricao(tarefa.id))

    listaTarefas.appendChild(li)
  })
}

// -------------------------------
// 6. Alternar conclusão
// -------------------------------
function alternarConclusao(id) {
  tarefas = tarefas.map(t => t.id === id ? { ...t, concluida: !t.concluida } : t)
  salvarTarefas()
  exibirTarefas(tarefas)
}

// -------------------------------
// 7. Editar tarefa
// -------------------------------
function editarTarefa(id) {
  tarefas = tarefas.map(t => ({ ...t, editando: t.id === id }))
  exibirTarefas(tarefas)
}

// -------------------------------
// 8. Salvar edição
// -------------------------------
function salvarEdicao(id) {
  const titulo = document.getElementById(`edit-titulo-${id}`).value.trim()
  const descricao = document.getElementById(`edit-descricao-${id}`).value.trim()
  const prazo = document.getElementById(`edit-prazo-${id}`).value || null

  tarefas = tarefas.map(t =>
    t.id === id ? { ...t, titulo: titulo || t.titulo, descricao, prazo, editando: false } : t
  )
  salvarTarefas()
  exibirTarefas(tarefas)
}

function cancelarEdicao(id) {
  tarefas = tarefas.map(t => ({ ...t, editando: false }))
  exibirTarefas(tarefas)
}

// -------------------------------
// 9. Excluir tarefa
// -------------------------------
function excluirTarefa(id) {
  if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
    tarefas = tarefas.filter(t => t.id !== id)
    salvarTarefas()
    exibirTarefas(tarefas)
  }
}

// -------------------------------
// 10. Adicionar prazo (atalho)
// -------------------------------
function adicionarPrazo(id) {
  const data = prompt('Digite o prazo (AAAA-MM-DD):')
  if (data) {
    tarefas = tarefas.map(t => t.id === id ? { ...t, prazo: data } : t)
    salvarTarefas()
    exibirTarefas(tarefas)
  }
}

// -------------------------------
// 11. Mostrar / ocultar descrição
// -------------------------------
function toggleDescricao(id) {
  tarefas = tarefas.map(t => t.id === id ? { ...t, mostrarDescricao: !t.mostrarDescricao } : t)
  salvarTarefas()
  exibirTarefas(tarefas)
}

// -------------------------------
// 12. Pesquisa e filtros
// -------------------------------
function pesquisarTarefas() {
  exibirTarefas(tarefas)
}

function aplicarFiltro(tipo) {
  filtroAtual = tipo
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'))
  document.getElementById(`filtro-${tipo}`).classList.add('active')
  exibirTarefas(tarefas)
}

// -------------------------------
// 13. Eventos
// -------------------------------
botaoAdicionar.addEventListener('click', adicionarTarefa)
campoTitulo.addEventListener('keypress', e => e.key === 'Enter' && adicionarTarefa())
campoPesquisa.addEventListener('input', pesquisarTarefas)
filtroTodas.addEventListener('click', () => aplicarFiltro('todas'))
filtroConcluidas.addEventListener('click', () => aplicarFiltro('concluidas'))
filtroPrazos.addEventListener('click', () => aplicarFiltro('prazos'))

// -------------------------------
// 14. Inicialização
// -------------------------------
window.addEventListener('DOMContentLoaded', carregarTarefasSalvas)
