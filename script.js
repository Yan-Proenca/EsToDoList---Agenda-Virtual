// =============================================================
//  EsToDoList - Sistema completo de tarefas
//  Baseado no modelo original EsToDoList (Prof. Rafael Ribas)
// =============================================================

// -------------------------------
// 1. Selecionar os elementos da página
// -------------------------------
const campoTitulo = document.getElementById('nova-tarefa-input')
const campoDescricao = document.getElementById('descricao-tarefa-input')
const botaoAdicionar = document.getElementById('adicionar-tarefa-btn')
const campoPesquisa = document.getElementById('pesquisar-input')
const listaTarefas = document.getElementById('listas-de-tarefas')

const filtroTodas = document.getElementById('filtro-todas')
const filtroConcluidas = document.getElementById('filtro-concluidas')
const filtroPrazos = document.getElementById('filtro-prazos')

// Array principal que armazenará as tarefas
let tarefas = []
let filtroAtual = 'todas'

// -------------------------------
// 2. Carregar tarefas salvas no navegador
// -------------------------------
function carregarTarefasSalvas() {
  const tarefasSalvas = localStorage.getItem('tarefas')
  if (tarefasSalvas) {
    tarefas = JSON.parse(tarefasSalvas)
  }
  exibirTarefas(tarefas)
}

// -------------------------------
// 3. Salvar tarefas no navegador
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

  if (titulo === '') {
    alert('Digite um título para a tarefa!')
    return
  }

  const novaTarefa = {
    id: Date.now(),
    titulo,
    descricao,
    prazo: null,
    concluida: false,
    mostrarDescricao: false,
    editando: false
  }

  tarefas.push(novaTarefa)
  salvarTarefas()
  exibirTarefas(tarefas)

  campoTitulo.value = ''
  campoDescricao.value = ''
  campoTitulo.focus()
}

// -------------------------------
// 5. Exibir tarefas na tela
// -------------------------------
function exibirTarefas(lista) {
  listaTarefas.innerHTML = ''
  const termo = campoPesquisa.value.toLowerCase()

  // Filtrar pesquisa e tipo de filtro
  const filtradas = lista.filter(tarefa => {
    const correspondePesquisa =
      tarefa.titulo.toLowerCase().includes(termo) ||
      (tarefa.descricao && tarefa.descricao.toLowerCase().includes(termo))

    if (!correspondePesquisa) return false
    if (filtroAtual === 'concluidas') return tarefa.concluida
    if (filtroAtual === 'prazos') return tarefa.prazo
    return true
  })

  // Se não houver tarefas
  if (filtradas.length === 0) {
    listaTarefas.innerHTML = `
      <li class="text-center text-gray-500 dark:text-gray-400 py-8">
        <i class="fas fa-inbox text-3xl mb-2"></i>
        <p>Nenhuma tarefa encontrada</p>
      </li>`
    return
  }

  // Montar visual de cada tarefa
  filtradas.forEach(tarefa => {
    const item = document.createElement('li')
    item.className = `
      tarefa flex flex-col gap-3 p-4 rounded-lg border
      bg-gray-50 dark:bg-zinc-700 border-gray-200 dark:border-zinc-600
      hover:bg-blue-50 dark:hover:bg-zinc-600 transition
      ${tarefa.concluida ? 'concluida opacity-60' : ''}
    `

    // --- modo edição ---
    if (tarefa.editando) {
      item.innerHTML = `
        <div class="flex flex-col gap-2 dark:text-gray-200">
          <input id="edit-titulo-${tarefa.id}" value="${tarefa.titulo}" class="p-2 border rounded"/>
          <textarea id="edit-descricao-${tarefa.id}" class="p-2 border rounded" rows="2">${tarefa.descricao || ''}</textarea>
          <input type="date" id="edit-prazo-${tarefa.id}" value="${tarefa.prazo || ''}" class="p-2 border rounded"/>
          <div class="flex gap-2 mt-2">
            <button class="salvar-edicao bg-blue-500 text-white px-3 py-1 rounded">Salvar</button>
            <button class="cancelar-edicao bg-gray-400 text-white px-3 py-1 rounded">Cancelar</button>
          </div>
        </div>
      `
      item.querySelector('.salvar-edicao').onclick = () => salvarEdicao(tarefa.id)
      item.querySelector('.cancelar-edicao').onclick = () => cancelarEdicao()
      listaTarefas.appendChild(item)
      return
    }

    // --- modo normal ---
    item.innerHTML = `
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2 flex-grow">
          <input type="checkbox" class="concluir-tarefa w-5 h-5" ${tarefa.concluida ? 'checked' : ''}>
          <span class="task-text font-medium dark:text-gray-200">${tarefa.titulo}</span>
          ${tarefa.prazo ? `<span class="text-xs text-yellow-600 font-semibold">📅 ${tarefa.prazo}</span>` : ''}
        </div>
        <div class="flex gap-3">
          <button class="mostrar-descricao text-green-500 hover:text-green-700" title="Ver descrição"><i class="fas fa-eye"></i></button>
          <button class="prazo-btn text-purple-500 hover:text-purple-700" title="Adicionar prazo"><i class="fas fa-clock"></i></button>
          <button class="editar-btn text-blue-500 hover:text-blue-700" title="Editar"><i class="fas fa-edit"></i></button>
          <button class="excluir-btn text-red-500 hover:text-red-700" title="Excluir"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      ${tarefa.mostrarDescricao && tarefa.descricao
        ? `<p class="text-sm text-gray-600 dark:text-gray-200 mt-2">${tarefa.descricao}</p>`
        : ''}
    `

    // Eventos dos botões
    item.querySelector('.concluir-tarefa').onchange = () => alternarConclusao(tarefa.id)
    item.querySelector('.excluir-btn').onclick = () => excluirTarefa(tarefa.id)
    item.querySelector('.editar-btn').onclick = () => editarTarefa(tarefa.id)
    item.querySelector('.prazo-btn').onclick = () => adicionarPrazo(tarefa.id)
    item.querySelector('.mostrar-descricao').onclick = () => toggleDescricao(tarefa.id)

    listaTarefas.appendChild(item)
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
// 8. Salvar / cancelar edição
// -------------------------------
function salvarEdicao(id) {
  const titulo = document.getElementById(`edit-titulo-${id}`).value.trim()
  const descricao = document.getElementById(`edit-descricao-${id}`).value.trim()
  const prazo = document.getElementById(`edit-prazo-${id}`).value || null

  tarefas = tarefas.map(t =>
    t.id === id
      ? { ...t, titulo: titulo || t.titulo, descricao, prazo, editando: false }
      : t
  )

  salvarTarefas()
  exibirTarefas(tarefas)
}

function cancelarEdicao() {
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
// 10. Adicionar prazo
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
// 13. Eventos do usuário
// -------------------------------
botaoAdicionar.addEventListener('click', adicionarTarefa)
campoTitulo.addEventListener('keydown', e => e.key === 'Enter' && adicionarTarefa())
campoPesquisa.addEventListener('input', pesquisarTarefas)

filtroTodas.addEventListener('click', () => aplicarFiltro('todas'))
filtroConcluidas.addEventListener('click', () => aplicarFiltro('concluidas'))
filtroPrazos.addEventListener('click', () => aplicarFiltro('prazos'))

// -------------------------------
// 14. Inicialização da aplicação
// -------------------------------
window.addEventListener('DOMContentLoaded', carregarTarefasSalvas)

