const API_URL = 'http://localhost:3000';
const EMPRESA_ID = new URLSearchParams(window.location.search).get('empresa');
const CHAVE_CLIENTE = `clienteId_${EMPRESA_ID}`;

console.log('CIPROAI FRONT-END 2.0 CARREGADO!');

// Função para rolar o chat para o final automaticamente
function scrollChatToBottom() {
    const container = document.getElementById('chat-messages');
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

// Adiciona os balões de mensagem na tela com segurança (textContent evita injeção de HTML)
function adicionarMensagem(texto, remetente, isError = false) {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    const div = document.createElement('div');
    div.classList.add('message', remetente);
    if (isError) div.classList.add('error');

    div.textContent = texto;
    container.appendChild(div);
    scrollChatToBottom();
}

// Reabre a conversa: mostra as mensagens anteriores deste visitante, se existirem
async function carregarHistorico() {
    const clienteId = localStorage.getItem(CHAVE_CLIENTE);
    if (!clienteId) return;

    try {
        const response = await fetch(`${API_URL}/conversas/historico/${clienteId}`);

        // ID salvo no navegador inválido ou que não existe mais no banco: esquece
        if (response.status === 404 || response.status === 400) {
            localStorage.removeItem(CHAVE_CLIENTE);
            return;
        }
        if (!response.ok) return;

        const mensagens = await response.json();
        mensagens.forEach((m) => {
            adicionarMensagem(m.mensagem, m.remetente === 'cliente' ? 'user' : 'ia');
        });
    } catch (error) {
        console.error('Não foi possível carregar o histórico:', error);
    }
}

// Recupera ou cria o cliente desta empresa (um ID por empresa no localStorage)
async function obterClienteId() {
    const salvo = localStorage.getItem(CHAVE_CLIENTE);
    if (salvo) return salvo;

    const response = await fetch(`${API_URL}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nome: 'Visitante Site',
            telefone: 'nao-informado',
            empresaId: EMPRESA_ID
        })
    });

    if (!response.ok) throw new Error('Falha ao registrar cliente');

    const novoCliente = await response.json();
    localStorage.setItem(CHAVE_CLIENTE, novoCliente.id);
    return novoCliente.id;
}

// Envia a mensagem para o backend
function enviarParaIa(clienteId, mensagem) {
    return fetch(`${API_URL}/conversas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clienteId, mensagem })
    });
}

// Função principal de envio
async function processarEnvio() {
    const input = document.getElementById('userInput');
    if (!input || !EMPRESA_ID) return;

    const textoMensagem = input.value.trim();
    if (!textoMensagem) return;

    // Renderiza a mensagem do usuário na tela imediatamente
    adicionarMensagem(textoMensagem, 'user');
    input.value = '';

    try {
        let clienteId = await obterClienteId();
        let response = await enviarParaIa(clienteId, textoMensagem);

        // Cliente salvo no navegador não existe mais no banco:
        // esquece o ID e tenta uma vez com um cliente novo
        if (response.status === 404) {
            localStorage.removeItem(CHAVE_CLIENTE);
            clienteId = await obterClienteId();
            response = await enviarParaIa(clienteId, textoMensagem);
        }

        // Empresa desativada
        if (response.status === 403) {
            adicionarMensagem('Atendimento indisponível no momento.', 'ia', true);
            return;
        }

        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

        const data = await response.json();
        adicionarMensagem(data.respostaIa || 'Resposta vazia da IA', 'ia');

    } catch (error) {
        console.error('Erro na comunicação:', error);
        adicionarMensagem('Erro de conexão com o servidor da IA.', 'ia', true);
    }
}

// Vinculação de eventos com prevenção de recarregamento
window.addEventListener('DOMContentLoaded', () => {
    const btnEnviar = document.getElementById('btnEnviar');
    const inputUser = document.getElementById('userInput');

    // Sem ?empresa=ID na URL o chat não sabe qual bot usar
    if (!EMPRESA_ID) {
        adicionarMensagem('Link inválido: empresa não informada.', 'ia', true);
        if (inputUser) inputUser.disabled = true;
        if (btnEnviar) btnEnviar.disabled = true;
        return;
    }

    carregarHistorico();

    if (btnEnviar) {
        btnEnviar.addEventListener('click', (e) => {
            e.preventDefault();
            processarEnvio();
        });
    }

    if (inputUser) {
        inputUser.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                processarEnvio();
            }
        });
    }
});
