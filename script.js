let currentItem = {};

// --- SISTEMA DE CAPTURA DE LINK DE INDICAÇÃO ---
// Verifica se o usuário acessou via link de convite (ex: site.com/?ref=JOAO123)
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
        // Salva o código de quem indicou para usar no checkout
        localStorage.setItem('elite_referred_by', refCode.toUpperCase());
    }
});

// 1. Iniciar o processo de compra
function startOrder(name, price, img) {
    currentItem = {name, price};
    
    const profile = JSON.parse(localStorage.getItem('elite_account'));
    const referredBy = localStorage.getItem('elite_referred_by'); // Pega o código do link
    
    if (profile) {
        if(document.getElementById('fName')) document.getElementById('fName').value = profile.name || "";
        if(document.getElementById('fTel')) document.getElementById('fTel').value = profile.tel || "";
        if(document.getElementById('fCep')) document.getElementById('fCep').value = profile.cep || "";
        if(document.getElementById('fRua')) document.getElementById('fRua').value = profile.rua || "";
        if(document.getElementById('fNum')) document.getElementById('fNum').value = profile.num || "";
    }

    // Se o cliente acessou pelo link de alguém, preenche o cupom automaticamente
    if (referredBy && document.getElementById('fCupom')) {
        document.getElementById('fCupom').value = referredBy;
    } else if (document.getElementById('fCupom')) {
        document.getElementById('fCupom').value = "";
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
            colors:['#00f2ff', '#ffffff', '#c5a059']
        });
    }, 1200);
}

// 2. Cancelar e fechar checkout
function cancelOrder() {
    document.getElementById('checkout').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('bar').style.width = '0%';
}

// --- LOGICA DE PERFIL E GERAÇÃO DE CÓDIGO ---

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
        document.getElementById('userGeneratedCupom').innerText = data.cupom || 'NENHUM CÓDIGO';
    } else {
        document.getElementById('userGeneratedCupom').innerText = "CRIE SEU PERFIL";
    }
}

// Nova função: Gerar código manualmente (Padrão)
function generateCupom() {
    const nameInput = document.getElementById('uName').value.trim();
    
    if (!nameInput) {
        alert("⚠️ Por favor, digite seu NOME COMPLETO primeiro para gerar um código.");
        return;
    }

    let saved = JSON.parse(localStorage.getItem('elite_account')) || {};
    
    if (saved.cupom) {
        alert("✔️ Você já possui o código: " + saved.cupom + "\n\nSe quiser mudar, clique no botão 'ALTERAR'.");
        return;
    }

    // Gera o código: Primeiro Nome + 4 números aleatórios
    const firstName = nameInput.split(' ')[0].toUpperCase();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const finalCupom = `${firstName}${randomSuffix}`;

    saved.name = nameInput; // Salva o nome preenchido
    saved.cupom = finalCupom; // Salva o novo cupom
    
    localStorage.setItem('elite_account', JSON.stringify(saved));
    document.getElementById('userGeneratedCupom').innerText = finalCupom;
    
    alert(`🎉 Seu código foi gerado: ${finalCupom}\n\nAgora você já pode copiar o seu link de indicação.`);
    loadUserProfile();
}

// NOVA FUNÇÃO: Alterar ou personalizar o código
function changeCupom() {
    let saved = JSON.parse(localStorage.getItem('elite_account')) || {};
    
    // Pede ao usuário para digitar o novo código
    let novoCodigo = prompt("Digite seu novo código personalizado (Ex: VIP10, PROMOJOAO):");
    
    // Se o usuário digitou algo e clicou em OK
    if (novoCodigo) {
        // Remove espaços, caracteres especiais e deixa tudo maiúsculo
        novoCodigo = novoCodigo.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        
        if (novoCodigo.length < 3) {
            alert("⚠️ O código deve ter pelo menos 3 letras ou números.");
            return;
        }

        saved.cupom = novoCodigo;
        localStorage.setItem('elite_account', JSON.stringify(saved));
        
        document.getElementById('userGeneratedCupom').innerText = novoCodigo;
        alert(`✨ Sucesso! Seu código foi alterado para: ${novoCodigo}`);
        loadUserProfile();
    }
}

// Nova função: Compartilhar Link
function copyShareLink() {
    const saved = JSON.parse(localStorage.getItem('elite_account')) || {};
    
    if (!saved.cupom) {
        alert("⚠️ Você precisa GERAR ou ALTERAR SEU CÓDIGO primeiro!");
        return;
    }
    
    // Pega o endereço atual do site e adiciona o "?ref=SEUCODIGO"
    const baseUrl = window.location.origin + window.location.pathname;
    const shareLink = `${baseUrl}?ref=${saved.cupom}`;
    
    navigator.clipboard.writeText(shareLink).then(() => {
        alert(`🔗 Link copiado com sucesso!\n\nEnvie este link para seus clientes/amigos:\n${shareLink}`);
    }).catch(err => {
        alert("❌ Erro ao copiar o link. Seu link é: " + shareLink);
    });
}

document.getElementById('profileSaveForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('uName').value;
    const saved = JSON.parse(localStorage.getItem('elite_account')) || {};

    const profileData = {
        name: name,
        email: document.getElementById('uEmail').value,
        tel: document.getElementById('uTel').value,
        cep: document.getElementById('uCep').value,
        num: document.getElementById('uNum').value,
        rua: document.getElementById('uRua').value,
        cupom: saved.cupom // Mantém o cupom atual se existir
    };

    localStorage.setItem('elite_account', JSON.stringify(profileData));
    alert("PERFIL SINCRONIZADO COM SUCESSO!");
    loadUserProfile();
});

// --- FIM LÓGICA DE PERFIL ---

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

// 🔐 LOGIN ADMIN
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

function toggleAdminLogin(){
    document.getElementById("adminLogin").classList.toggle("active");
}

function toggleAdminPanel(){
    document.getElementById("adminPanel").classList.toggle("active");
    renderAdminData();
}

function adminLogin(){
    const user = document.getElementById("adminUser").value;
    const pass = document.getElementById("adminPass").value;

    if(user === ADMIN_USER && pass === ADMIN_PASS){
        toggleAdminLogin();
        toggleAdminPanel();
    } else {
        alert("ACESSO NEGADO");
    }
}

// 👥 DADOS ADMIN
function renderAdminData(){
    const account = JSON.parse(localStorage.getItem("elite_account"));
    const ranking = JSON.parse(localStorage.getItem("elite_ranking")) || {};
    const adminMembers = document.getElementById("adminMembers");
    const adminRanking = document.getElementById("adminRanking");

    adminMembers.innerHTML = account ? `
        NOME: ${account.name}<br>
        CUPOM: ${account.cupom || "Nenhum gerado"}<br>
        INDICAÇÕES: ${account.indicacoes || 0}
    ` : "NENHUM MEMBRO";

    const sorted = Object.entries(ranking).sort((a,b)=>b[1]-a[1]);

    if(sorted.length > 0) {
        adminRanking.innerHTML = sorted.map((item,i)=>`
            ${i+1}º ${item[0]} - ${item[1]}
        `).join("<br>");
    } else {
        adminRanking.innerHTML = "SEM INDICAÇÕES AINDA";
    }
}
