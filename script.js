// script.js
const vehicles = {
    "Albany": ["Cavalcade", "Emperor", "Hermes"],
    "Annis": ["Elegy", "RE-7B", "Savestra"],
    "Bravado": ["Banshee", "Buffalo", "Gauntlet"],
    // Diğer markalar ve modeller eklenecek
};

let listings = JSON.parse(localStorage.getItem('listings')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let messages = JSON.parse(localStorage.getItem('messages')) || {};

function saveListings() {
    localStorage.setItem('listings', JSON.stringify(listings));
}

function saveMessages() {
    localStorage.setItem('messages', JSON.stringify(messages));
}

function showHomePage() {
    let content = '<h2>Son İlanlar</h2>';
    if (listings.length === 0) {
        content += '<p>Henüz ilan bulunmamaktadır.</p>';
    } else {
        listings.forEach((listing, index) => {
            content += `
                <div class="listing">
                    <div class="listing-image">
                        <img src="${listing.images[0]}" alt="${listing.brand} ${listing.model}">
                    </div>
                    <div class="listing-details">
                        <h3>${listing.brand} ${listing.model}</h3>
                        <p>Fiyat: ${listing.price} GTA$</p>
                        <p>Platform: ${listing.platform}</p>
                        <div class="listing-buttons">
                            <button class="message-btn" onclick="showMessageForm(${index})">Mesaj At</button>
                            <button class="buy-btn">Satın Al</button>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    if (currentUser) {
        content += '<button onclick="showChatPage()">Sohbetler</button>';
    }
    document.getElementById('mainContent').innerHTML = content;
}

function showLoginForm() {
    const content = `
        <h2>Giriş Yap</h2>
        <form id="loginForm">
            <input type="email" id="loginEmail" placeholder="E-posta" required>
            <input type="password" id="loginPassword" placeholder="Şifre" required>
            <button type="submit">Giriş Yap</button>
        </form>
    `;
    document.getElementById('mainContent').innerHTML = content;

    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            alert('Giriş başarılı!');
            showHomePage();
        } else {
            alert('Geçersiz e-posta veya şifre!');
        }
    });
}

function showRegisterForm() {
    const content = `
        <h2>Kayıt Ol</h2>
        <form id="registerForm">
            <input type="text" id="registerName" placeholder="Ad Soyad" required>
            <input type="email" id="registerEmail" placeholder="E-posta" required>
            <input type="password" id="registerPassword" placeholder="Şifre" required>
            <button type="submit">Kayıt Ol</button>
        </form>
    `;
    document.getElementById('mainContent').innerHTML = content;

    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some(user => user.email === email)) {
            alert('Bu e-posta adresi zaten kullanılıyor!');
            return;
        }

        const newUser = { name, email, password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        showLoginForm();
    });
}

function showNewListingForm() {
    // ... (mevcut kod aynı kalabilir)
}

function showMessageForm(listingIndex) {
    if (!currentUser) {
        alert('Mesaj göndermek için giriş yapmalısınız!');
        return;
    }

    const listing = listings[listingIndex];
    const content = `
        <h2>Mesaj Gönder</h2>
        <form id="messageForm">
            <input type="hidden" id="listingIndex" value="${listingIndex}">
            <textarea id="messageContent" placeholder="Mesajınızı yazın" required></textarea>
            <button type="submit">Gönder</button>
        </form>
    `;
    document.getElementById('mainContent').innerHTML = content;

    document.getElementById('messageForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const listingIndex = document.getElementById('listingIndex').value;
        const messageContent = document.getElementById('messageContent').value;

        if (!messages[currentUser.email]) {
            messages[currentUser.email] = {};
        }
        if (!messages[currentUser.email][listingIndex]) {
            messages[currentUser.email][listingIndex] = [];
        }
        messages[currentUser.email][listingIndex].push({
            sender: currentUser.email,
            content: messageContent,
            timestamp: new Date().toISOString()
        });

        saveMessages();
        alert('Mesaj gönderildi!');
        showHomePage();
    });
}

function showChatPage() {
    let content = '<h2>Sohbetler</h2>';
    if (!messages[currentUser.email] || Object.keys(messages[currentUser.email]).length === 0) {
        content += '<p>Henüz hiç sohbetiniz yok.</p>';
    } else {
        for (const listingIndex in messages[currentUser.email]) {
            const listing = listings[listingIndex];
            content += `
                <div class="chat-preview">
                    <h3>${listing.brand} ${listing.model}</h3>
                    <p>Son mesaj: ${messages[currentUser.email][listingIndex][messages[currentUser.email][listingIndex].length - 1].content}</p>
                    <button onclick="showChat(${listingIndex})">Sohbeti Görüntüle</button>
                </div>
            `;
        }
    }
    document.getElementById('mainContent').innerHTML = content;
}

function showChat(listingIndex) {
    const listing = listings[listingIndex];
    let content = `<h2>${listing.brand} ${listing.model} İçin Sohbet</h2>`;
    content += '<div id="chatMessages"></div>';
    content += `
        <form id="chatForm">
            <input type="hidden" id="chatListingIndex" value="${listingIndex}">
            <textarea id="chatMessageContent" placeholder="Mesajınızı yazın" required></textarea>
            <button type="submit">Gönder</button>
        </form>
    `;
    document.getElementById('mainContent').innerHTML = content;

    function updateChatMessages() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';
        for (const message of messages[currentUser.email][listingIndex]) {
            chatMessages.innerHTML += `
                <div class="message ${message.sender === currentUser.email ? 'sent' : 'received'}">
                    <p>${message.content}</p>
                    <small>${new Date(message.timestamp).toLocaleString()}</small>
                </div>
            `;
        }
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    updateChatMessages();

    document.getElementById('chatForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const messageContent = document.getElementById('chatMessageContent').value;
        messages[currentUser.email][listingIndex].push({
            sender: currentUser.email,
            content: messageContent,
            timestamp: new Date().toISOString()
        });
        saveMessages();
        document.getElementById('chatMessageContent').value = '';
        updateChatMessages();
    });
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showHomePage();
}

// Sayfa yüklendiğinde ana sayfayı göster
window.onload = function() {
    showHomePage();
    // Kullanıcı girişi yapılmışsa, çıkış butonu ekle
    if (currentUser) {
        const nav = document.querySelector('nav ul');
        const logoutLi = document.createElement('li');
        const logoutLink = document.createElement('a');
        logoutLink.href = '#';
        logoutLink.textContent = 'Çıkış Yap';
        logoutLink.addEventListener('click', logout);
        logoutLi.appendChild(logoutLink);
        nav.appendChild(logoutLi);
    }
};

// Menü linklerine tıklandığında ilgili sayfaları göster
document.getElementById('homeLink').addEventListener('click', showHomePage);
document.getElementById('loginLink').addEventListener('click', showLoginForm);
document.getElementById('registerLink').addEventListener('click', showRegisterForm);
document.getElementById('newListingLink').addEventListener('click', showNewListingForm);