const API_URL = 'https://mini-projeto-m2-1.onrender.com/api/tarefas';
const form = document.querySelector('form');
const tituloInput = document.getElementById('titulo');
const descricaoInput = document.getElementById('descricao');
const statusInput = document.getElementById('status');
const tarefasSection = document.querySelector('section:nth-of-type(2)');

// Carregar tarefas ao iniciar
document.addEventListener('DOMContentLoaded', carregarTarefas);

// Criar tarefa
form.addEventListener('submit', async function (event) {
  event.preventDefault();

  const titulo = tituloInput.value.trim();
  const descricao = descricaoInput.value.trim();
  const status = statusInput.value;

  if (!titulo || !descricao) {
    alert('Preencha todos os campos');
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ titulo, descricao, status })
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar tarefa: ${response.status}`);
    }

    const novaTarefa = await response.json();
    console.log('Tarefa criada:', novaTarefa);

    tituloInput.value = '';
    descricaoInput.value = '';
    statusInput.value = 'pendente';

    carregarTarefas();
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao criar tarefa');
  }
});

// Carregar e exibir todas as tarefas
async function carregarTarefas() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Erro ao carregar tarefas: ${response.status}`);
    }

    const tarefas = await response.json();
    console.log('Tarefas carregadas:', tarefas);

    // Limpar tarefas anteriores (mantém o h2)
    const tarefasExistentes = tarefasSection.querySelectorAll('article');
    tarefasExistentes.forEach(article => article.remove());

    // Exibir tarefas
    if (tarefas.length === 0) {
      const mensagem = document.createElement('p');
      mensagem.textContent = 'Nenhuma tarefa ainda. Crie uma!';
      tarefasSection.appendChild(mensagem);
      return;
    }

    tarefas.forEach(tarefa => {
      criarElementoTarefa(tarefa);
    });
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao carregar tarefas');
  }
}

// Criar elemento HTML da tarefa
function criarElementoTarefa(tarefa) {
  const article = document.createElement('article');
  article.innerHTML = `
    <h3>${tarefa.titulo}</h3>
    <p>${tarefa.descricao}</p>
    <p><small>Status: ${tarefa.status || 'pendente'}</small></p>
    <div class="acoes-tarefa">
      <button class="btn-editar" data-id="${tarefa.id}">Editar</button>
      <button class="btn-status" data-id="${tarefa.id}">Marcar como ${tarefa.status === 'concluido' ? 'pendente' : 'concluído'}</button>
      <button class="btn-deletar" data-id="${tarefa.id}">Deletar</button>
    </div>
  `;

  // Eventos dos botões
  article.querySelector('.btn-editar').addEventListener('click', () => editarTarefa(tarefa.id, tarefa.titulo, tarefa.descricao));
  article.querySelector('.btn-status').addEventListener('click', () => atualizarStatus(tarefa.id, tarefa.status));
  article.querySelector('.btn-deletar').addEventListener('click', () => deletarTarefa(tarefa.id));

  tarefasSection.appendChild(article);
}

// Atualizar tarefa
async function editarTarefa(id, tituloAtual, descricaoAtual) {
  const novoTitulo = prompt('Novo título:', tituloAtual);
  if (novoTitulo === null) return;

  const novaDescricao = prompt('Nova descrição:', descricaoAtual);
  if (novaDescricao === null) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ titulo: novoTitulo, descricao: novaDescricao })
    });

    if (!response.ok) {
      throw new Error(`Erro ao atualizar tarefa: ${response.status}`);
    }

    console.log('Tarefa atualizada');
    carregarTarefas();
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao atualizar tarefa');
  }
}

// Atualizar status
async function atualizarStatus(id, statusAtual) {
  const novoStatus = statusAtual === 'concluido' ? 'pendente' : 'concluido';

  try {
    const response = await fetch(`${API_URL}/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: novoStatus })
    });

    if (!response.ok) {
      throw new Error(`Erro ao atualizar status: ${response.status}`);
    }

    console.log('Status atualizado');
    carregarTarefas();
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao atualizar status');
  }
}

// Deletar tarefa
async function deletarTarefa(id) {
  if (!confirm('Tem certeza que deseja deletar esta tarefa?')) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Erro ao deletar tarefa: ${response.status}`);
    }

    console.log('Tarefa deletada');
    carregarTarefas();
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao deletar tarefa');
  }
}
