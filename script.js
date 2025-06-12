// --- LÓGICA DO MENU E DAS FERRAMENTAS ---

// Função para abrir/fechar o menu
function toggleSidebar() {
    document.body.classList.toggle('sidebar-collapsed');
}

// Função para mostrar a ferramenta selecionada e esconder as outras
function showTool(toolIdToShow) {
    // Pega todos os containers de ferramentas
    const toolContainers = document.querySelectorAll('.tool-container');
    
    // Esconde todos eles
    toolContainers.forEach(container => {
        container.style.display = 'none';
    });
    
    // Mostra apenas o que foi clicado
    const selectedTool = document.getElementById(toolIdToShow);
    if (selectedTool) {
        selectedTool.style.display = 'block';
    }
}


// --- LÓGICA DAS FERRAMENTAS (como antes) ---

function converterParaMaiusculas() {
    const inputElement = document.getElementById('upperInput');
    inputElement.value = inputElement.value.toUpperCase();
}

function copiarResultado(elementId) {
    const el = document.getElementById(elementId);
    if (!el.value) {
        alert("Nada para copiar!");
        return;
    }
    navigator.clipboard.writeText(el.value).then(() => alert('Resultado copiado!'));
}

// Para o formatador CSV, você pode adicionar a função completa que já tínhamos aqui.
// Por enquanto, o deixei fora para focarmos na estrutura do menu.
