const API_URL = 'http://localhost:3000';

console.log('CIPROAI FRONT-END 2.0 CARREGADO!');

// Função para rolar o chat para o final automaticamente
function scrollChatToBottom() {
    const container = document.getElementById('chat-messages');
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

// Adiciona os balões de mensagem na tela com segurança
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

// Recupera ou cria um cliente ID único no localStorage
async function obterClienteId() {
    let clienteId = localStorage.getItem('clienteId');
    if (clienteId) return clienteId;

    const response = await fetch(`${API_URL}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nome: 'Visitante Site',
            telefone: 'nao-informado'
        })
    });

    if (!response.ok) throw new Error('Falha ao registrar cliente');

    const novoCliente = await response.json();
    clienteId = novoCliente.id;
    localStorage.setItem('clienteId', clienteId);
    return clienteId;
}

// Função principal de envio tratada para evitar qualquer reload
async function processarEnvio() {
    const input = document.getElementById('userInput');
    if (!input) return;

    const textoMensagem = input.value.trim();
    if (!textoMensagem) return;

    // Renderiza a mensagem do usuário na tela imediatamente
    adicionarMensagem(textoMensagem, 'user');
    input.value = '';

    try {
        const clienteId = await obterClienteId();

        const response = await fetch(`${API_URL}/conversas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clienteId: clienteId,
                remetente: 'cliente',
                mensagem: textoMensagem
            })
        });

        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

        const data = await response.json();
        const respostaIa = data.respostaIa || data.mensagem || data.response || 'Resposta vazia da IA';

        // Renderiza a resposta da IA na tela
        adicionarMensagem(respostaIa, 'ia');

    } catch (error) {
        console.error('Erro na comunicação:', error);
        adicionarMensagem('Erro de conexão com o servidor da IA.', 'ia', true);
    }
}

// Vinculação de eventos com prevenção absoluta de recarregamento
window.addEventListener('DOMContentLoaded', () => {
    const btnEnviar = document.getElementById('btnEnviar');
    const inputUser = document.getElementById('userInput');

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