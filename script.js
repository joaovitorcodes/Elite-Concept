let currentItem = {};

// 1. Iniciar o processo de compra
function startOrder(name, price, img) {
    const basePrice = parseFloat(price.replace(',', '.'));
    currentItem = { name, price: basePrice };
    
    const profile = JSON.parse(localStorage.getItem('elite_account'));
    if (profile) {
        if(document.getElementById('fName')) document.getElementById('fName').value = profile.name || "";
        if(document.getElementById('fTel')) document.getElementById('fTel').value = profile.tel || "";
        if(document.getElementById('fCep')) document.getElementById('fCep').value = profile.cep || "";
        if(document.getElementById('fRua')) document.getElementById('fRua').value = profile.rua || "";
        if(document.getElementById('fNum')) document.getElementById('fNum').value = profile.num || "";
    }

    const loader = document.getElementById('loader');
    const bar = document.getElementById('bar');
    
    loader.style.display = 'flex';
    setTimeout(() => { bar.style.width = '100%'; }, 100);

    setTimeout(() => {
        loader.style.display = 'none';
        document.getElementById('checkout').style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        document.getElementById('fTitle').innerText = name;
        document.getElementById('fImg').src = img;

        const currentCep = document.getElementById('fCep').value;
        atualizarValores(currentCep);

        confetti({
            particleCount: 100,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#00f2ff', '#ffffff', '#c5a059']
        });
    }, 1200);
}

// 2. Cálculo de Frete e Desconto (Privacidade Protegida)
function atualizarValores(cepRaw) {
    const cep = cepRaw.replace(/\D/g, '');
    let taxaEntrega = 0;
    let desconto = 0;
    
    // Lógica de Frete por Faixa de CEP (O usuário não vê sua localização)
    if (cep.length === 8) {
        // Ex: Faixa de CEP aproximada do Jardim Jacira e arredores de Itapecerica
        if (cep.startsWith('06864') || cep.startsWith('06866') || cep.startsWith('06867')) {
            taxaEntrega = 3.00; // Frete "Bairro Vizinho"
        } 
        // Restante de Itapecerica da Serra / Embu
        else if (cep.startsWith('068')) {
            taxaEntrega = 7.00;
        }
        // São Paulo Capital e Grande SP (Regiões 01 a 09)
        else if (cep.startsWith('0')) {
            taxaEntrega = 12.00;
        }
        // Outros estados
        else {
            taxaEntrega = 25.00;
        }
    }

    // Lógica de Cupom: Reconhecer se o cupom é de outra pessoa
    const cupomDigitado = document.getElementById('fCupom').value.trim().toUpperCase();
    const profile = JSON.parse(localStorage.getItem('elite_account'));
    const meuProprioCupom = profile ? profile.cupom : "";

    // Se houver um cupom e ele NÃO for o meu, aplica desconto de indicação
    if (cupomDigitado !== "" && cupomDigitado !== meuProprioCupom) {
        desconto = 2.00; 
    }

    const valorBase = currentItem.price;
    const totalFinal = (valorBase + taxaEntrega) - desconto;

    // Atualiza a tela de resumo
    document.getElementById('fPrice').innerText = `R$ ${valorBase.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    
    const freteElement = document.getElementById('fFrete');
    if (freteElement) {
        freteElement.innerText = `R$ ${taxaEntrega.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    }

    document.getElementById('fTotal').innerText = `R$ ${totalFinal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
}

// 3. Funções de interface e Perfil
function cancelOrder() {
    document.getElementById('checkout').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('bar').style.width = '0%';
}

function toggleUserPanel() {
    const panel = document.getElementById('userPanel');
    panel.classList.toggle('active');
    loadUserProfile();
}

function loadUserProfile() {
    const saved = localStorage.getItem('elite_account');
    if (saved) {
        const data = JSON.parse(saved);
        document.getElementById('uName').value = data.name || '';
        document.getElementById('uEmail').value = data.email || '';
        document.getElementById('uTel').value = data.tel || '';
        document.getElementById('uCep').value = data.cep || '';
        document.getElementById('uNum').value = data.num || '';
        document.getElementById('uRua').value = data.rua || '';
        document.getElementById('userGeneratedCupom').innerText = data.cupom || '---';
    } else {
        document.getElementById('userGeneratedCupom').innerText = "CADASTRE-SE";
    }
}

document.getElementById('profileSaveForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('uName').value;
    const saved = JSON.parse(localStorage.getItem('elite_account')) || {};
    
    // Gera um cupom único baseado no nome se não existir um
    const firstName = name.split(' ')[0].toUpperCase() || "ELITE";
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const finalCupom = saved.cupom || `${firstName}${randomSuffix}`;

    const profileData = {
        name: name,
        email: document.getElementById('uEmail').value,
        tel: document.getElementById('uTel').value,
        cep: document.getElementById('uCep').value,
        num: document.getElementById('uNum').value,
        rua: document.getElementById('uRua').value,
        cupom: finalCupom
    };

    localStorage.setItem('elite_account', JSON.stringify(profileData));
    alert("PERFIL SINCRONIZADO COM SUCESSO!");
    loadUserProfile();
});

// 4. Integração ViaCEP
const cepInput = document.getElementById('fCep');
cepInput.addEventListener('blur', async () => {
    const cep = cepInput.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
            document.getElementById('fRua').value = data.logradouro;
            document.getElementById('fBairro').value = data.bairro;
            document.getElementById('fCidade').value = `${data.localidade} / ${data.uf}`;
            document.getElementById('check').style.opacity = '1';
            
            // Recalcula o frete ocultamente após validar o CEP
            atualizarValores(cep);
            document.getElementById('fNum').focus();
        } else {
            alert("CEP não encontrado.");
        }
    } catch (e) {
        console.error("Erro ao buscar CEP");
    }
});

document.getElementById('fCupom').addEventListener('input', function() {
    atualizarValores(document.getElementById('fCep').value);
});

// 5. Envio Final (WhatsApp)
document.getElementById('finalForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const fone = "5511977194531"; 
    
    const nome = document.getElementById('fName').value;
    const cupom = document.getElementById('fCupom').value.toUpperCase() || "NENHUM"; 
    const rua = document.getElementById('fRua').value;
    const num = document.getElementById('fNum').value;
    const bairro = document.getElementById('fBairro').value;
    const cidade = document.getElementById('fCidade').value;
    const cep = document.getElementById('fCep').value;
    const pagamento = document.getElementById('fPay').value;
    const totalTexto = document.getElementById('fTotal').innerText;

    const mensagem = `*NOVA ORDEM DE AQUISIÇÃO*
---------------------------------
*PRODUTO:* ${currentItem.name}
*TOTAL FINAL:* ${totalTexto}
---------------------------------
*CLIENTE:* ${nome}
*CUPOM USADO:* ${cupom}
*(Validar recompensa para o dono deste cupom)*

*ENDEREÇO:*
${rua}, Nº ${num} - ${bairro}
${cidade} | CEP: ${cep}

*PAGAMENTO:* ${pagamento}
---------------------------------
_Enviado via Elite Shadow Market_`;

    window.location.href = `https://wa.me/${fone}?text=${encodeURIComponent(mensagem)}`;
});

loadUserProfile();
