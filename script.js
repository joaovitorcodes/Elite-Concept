let currentItem = {};

// 1. Iniciar o processo de compra (PUXANDO DADOS DO PERFIL)
function startOrder(name, price, img) {
    currentItem = {name, price};
    
    // O SISTEMA PEGA AS INFORMAÇÕES DO PERFIL AQUI
    const profile = JSON.parse(localStorage.getItem('elite_account'));
    if (profile) {
        if(document.getElementById('fName')) document.getElementById('fName').value = profile.name || "";
        if(document.getElementById('fTel')) document.getElementById('fTel').value = profile.tel || "";
        if(document.getElementById('fCep')) document.getElementById('fCep').value = profile.cep || "";
        if(document.getElementById('fRua')) document.getElementById('fRua').value = profile.rua || "";
        if(document.getElementById('fNum')) document.getElementById('fNum').value = profile.num || "";
        if(document.getElementById('fCupom')) document.getElementById('fCupom').value = profile.cupom || "";
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
        document.getElementById('fPrice').innerText = 'R$ ' + price;
        document.getElementById('fTotal').innerText = 'R$ ' + price;
        document.getElementById('fImg').src = img;

        confetti({
            particleCount: 100,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#00f2ff', '#ffffff', '#c5a059']
        });
    }, 1200);
}

// 2. Cancelar e fechar checkout
function cancelOrder() {
    document.getElementById('checkout').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('bar').style.width = '0%';
}

// --- LOGICA DE PERFIL COM CAMPOS SEPARADOS ---

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
    
    // Mantém o cupom antigo se já existir, senão gera um novo
    const saved = JSON.parse(localStorage.getItem('elite_account')) || {};
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

// --- FIM LOGICA DE PERFIL ---

// 3. ViaCEP Checkout
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
            document.getElementById('fNum').focus();
        } else {
            alert("CEP não encontrado.");
        }
    } catch (e) {
        console.error("Erro ao buscar CEP");
    }
});

// 4. Envio para o WhatsApp
document.getElementById('finalForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const fone = "5511977194531"; 
    
    const nome = document.getElementById('fName').value;
    const tel = document.getElementById('fTel').value;
    const cupom = document.getElementById('fCupom').value || "NENHUM"; 
    const rua = document.getElementById('fRua').value;
    const num = document.getElementById('fNum').value;
    const bairro = document.getElementById('fBairro').value;
    const cidade = document.getElementById('fCidade').value;
    const cep = document.getElementById('fCep').value;
    const pagamento = document.getElementById('fPay').value;

    const mensagem = `*NOVA ORDEM DE AQUISIÇÃO*
---------------------------------
*PRODUTO:* ${currentItem.name}
*VALOR:* R$ ${currentItem.price}
---------------------------------
*CLIENTE:* ${nome}
*CONTATO:* ${tel}
*CUPOM/INDICAÇÃO:* ${cupom}

*ENDEREÇO DE ENTREGA:*
${rua}, Nº ${num}
${bairro} - ${cidade}
CEP: ${cep}

*PAGAMENTO:* ${pagamento}
---------------------------------
_O cliente aguarda validação do cupom e processamento._`;

    const encodedMsg = encodeURIComponent(mensagem);
    window.location.href = `https://wa.me/${fone}?text=${encodedMsg}`;
});

loadUserProfile();
