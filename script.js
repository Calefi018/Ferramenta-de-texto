// --- LÓGICA DO MENU, TEMA E GERAL ---
function toggleSidebar() { document.body.classList.toggle('sidebar-collapsed'); }
function showTool(toolId) {
    document.querySelectorAll('.tool-container').forEach(c => c.style.display = 'none');
    document.getElementById(toolId).style.display = 'block';
}
function toggleTheme() { document.body.classList.toggle('dark-theme'); }
(function () { showTool('formatter-container'); })();
const RENDER_URL = 'https://render-server-blgr.onrender.com';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const cleanField = (text) => text ? text.trim().replace(/^"|"$/g, '') : '';
function copiarResultado(elementId) {
    const el = document.getElementById(elementId);
    if (!el.value) { alert("Nada para copiar!"); return; }
    navigator.clipboard.writeText(el.value).then(() => alert('Resultado copiado!'));
}
async function callApi(url, textPayload) {
    try {
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ texto: textPayload }) });
        if (!response.ok) return `Erro no servidor (${response.status})`;
        const data = await response.json();
        return data.resumo || data.periodo_contato || "Sem resposta da IA";
    } catch (error) { return "ERRO DE CONEXÃO"; }
}

// --- LÓGICA PRINCIPAL DO FORMATADOR ---
async function formatarDados() {
    const btn = document.getElementById('format-button');
    const outExterno = document.getElementById('outputExterno');
    const outRetiradas = document.getElementById('outputRetiradas');
    const progressContainer = document.getElementById('progress-container');
    const progressText = document.getElementById('progress-text');
    const progressBar = document.getElementById('progress-bar-foreground');

    btn.disabled = true; btn.textContent = 'Processando...';
    outExterno.value = ''; outRetiradas.value = '';
    progressContainer.style.display = 'block'; progressBar.style.width = '0%';
    
    const inputText = document.getElementById('csvInput').value.trim();
    const rawLines = inputText.split('\n');

    const headerIndex = rawLines.findIndex(line => line.toLowerCase().includes('cliente') && line.toLowerCase().includes('assunto'));
    if (headerIndex === -1) {
        alert('Erro: Cabeçalho não encontrado no CSV.');
        btn.disabled = false; btn.textContent = 'Formatar e Separar Dados';
        progressContainer.style.display = 'none';
        return;
    }
    
    const header = rawLines[headerIndex].split(';').map(h => cleanField(h.toLowerCase()));
    const expectedColumnCount = header.length;
    const headerMap = {
        cliente: header.indexOf('cliente'),
        assunto: header.indexOf('assunto'),
        mensagem: header.indexOf('mensagem'),
        bairro: header.indexOf('bairro'),
        whatsapp: header.indexOf('whatsapp')
    };
    
    let logicalRecords = [];
    let currentRecordParts = [];
    for (let i = headerIndex + 1; i < rawLines.length; i++) {
        const line = rawLines[i].trim();
        if (!line) continue;
        if (line.split(';').length >= expectedColumnCount - 3) {
            if (currentRecordParts.length > 0) logicalRecords.push(currentRecordParts.join('\n'));
            currentRecordParts = [line];
        } else {
            currentRecordParts.push(line);
        }
    }
    if (currentRecordParts.length > 0) logicalRecords.push(currentRecordParts.join('\n'));

    if (logicalRecords.length === 0) {
        alert("Nenhum registro de dados válido encontrado após o cabeçalho.");
        btn.disabled = false; btn.textContent = 'Formatar e Separar Dados';
        progressContainer.style.display = 'none';
        return;
    }
    
    progressText.textContent = `Identificados ${logicalRecords.length} registros. Iniciando...`;
    
    let externoLines = [], retiradasLines = [];
    for (let i = 0; i < logicalRecords.length; i++) {
        const percentage = Math.round(((i + 1) / logicalRecords.length) * 100);
        progressText.textContent = `Processando ${i + 1} de ${logicalRecords.length}...`;
        progressBar.style.width = `${percentage}%`;

        const columns = logicalRecords[i].split(';');
        const assunto = cleanField(columns[headerMap.assunto] || '');
        const cliente = cleanField(columns[headerMap.cliente] || '');
        const bairro = cleanField(columns[headerMap.bairro] || '');
        const mensagem = cleanField(columns[headerMap.mensagem] || '');
        const whatsapp = cleanField(columns[headerMap.whatsapp] || '');

        if (assunto.toLowerCase().includes('retirada')) {
            const periodo = await callApi(`${RENDER_URL}/extrair-retirada`, mensagem);
            retiradasLines.push(`${cliente} - ${bairro} - cancelamento - ${periodo} - ${whatsapp}`);
        } else {
            const resumo = await callApi(`${RENDER_URL}/resumir`, mensagem);
            externoLines.push(`${cliente} - ${bairro} - ${resumo} - ${whatsapp} - D1`);
        }
        
        if (i < logicalRecords.length - 1) await sleep(4000);
    }

    outExterno.value = externoLines.join('\n');
    outRetiradas.value = retiradasLines.join('\n');
    progressText.textContent = `Concluído! ${logicalRecords.length} registros processados.`;
    btn.disabled = false; btn.textContent = 'Formatar e Separar Dados';
}