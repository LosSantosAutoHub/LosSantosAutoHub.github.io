// script.js

const vehicles = {
    "Albany": ["Cavalcade", "Emperor", "Hermes"],
    "Annis": ["Elegy", "RE-7B", "Savestra"],
    "Bravado": ["Banshee", "Buffalo", "Gauntlet"],
    // Diğer markalar ve modeller eklenecek
};

// Simüle edilmiş "sunucu" verisi
let serverData = JSON.parse(localStorage.getItem('serverData')) || { listings: [], users: [], messages: {} };

// Veriyi "sunucu"ya kaydetme fonksiyonu
function saveToServer() {
    localStorage.setItem('serverData', JSON.stringify(serverData));
}

// Veriyi "sunucu"dan alma fonksiyonu
function getFromServer() {
    serverData = JSON.parse(localStorage.getItem('serverData')) || { listings: [], users: [], messages: {} };
    return serverData;
}

// Her sayfa yüklendiğinde ve önemli işlemlerden sonra veriyi güncelle
function refreshData() {
    const data = getFromServer();
    listings = data.listings;
    messages = data.messages;
    // Mevcut kullanıcıyı koru
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
}

let listings = [];
let currentUser = null;
let messages = {};

function saveListings() {
    serverData.listings = listings;
    saveToServer();
}

function saveMessages() {
    serverData.messages = messages;
    saveToServer();
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
                            ${currentUser && currentUser.email === listing.userEmail ? 
                                `<button class="delete-btn" onclick="deleteListing(${index})">İlanı Sil</button>` : ''}
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

function deleteListing(index) {
    if (currentUser && currentUser.email === listings[index].userEmail) {
        if (confirm('Bu ilanı silmek istediğinizden emin misiniz?')) {
            listings.splice(index, 1);
            saveListings();
            refreshData();
            showHomePage();
        }
    } else {
        alert('Bu ilanı silme yetkiniz yok!');
    }
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

        const users = serverData.users;
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            alert('Giriş başarılı!');
            refreshData();
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

        const users = serverData.users;
        if (users.some(user => user.email === email)) {
            alert('Bu e-posta adresi zaten kullanılıyor!');
            return;
        }

        const newUser = { name, email, password };
        users.push(newUser);
        serverData.users = users;
        saveToServer();

        alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        showLoginForm();
    });
}

function showNewListingForm() {
    let brandOptions = '<option value="">Marka Seçin</option>';
    for (let brand in vehicles) {
        brandOptions += `<option value="${brand}">${brand}</option>`;
    }
    brandOptions += '<option value="other">Diğer</option>';

    const content = `
        <h2>Yeni İlan Ver</h2>
        <form id="newListingForm">
            <select id="vehicleType" required>
                <option value="">Araç Tipi Seçin</option>
                <option value="car">Araba</option>
                <option value="motorcycle">Motosiklet</option>
                <option value="bicycle">Bisiklet</option>
            </select>
            <select id="brand" required>
                ${brandOptions}
            </select>
            <select id="model" required>
                <option value="">Önce Marka Seçin</option>
            </select>
            <input type="number" id="price" placeholder="Fiyat (GTA$)" required>
            <select id="platform" required>
                <option value="">Platform Seçin</option>
                <option value="fivem">FiveM</option>
                <option value="other">Diğer</option>
            </select>
            <input type="text" id="otherPlatform" placeholder="Diğer Platform" style="display:none;">
            <textarea id="description" placeholder="Açıklama"></textarea>
            <select id="accidentHistory" required>
                <option value="">Kaza Kaydı</option>
                <option value="no">Yok</option>
                <option value="yes">Var</option>
            </select>
            <input type="file" id="images" accept="image/*" multiple required>
            <button type="submit">İlan Ver</button>
        </form>
    `;
    document.getElementById('mainContent').innerHTML = content;

    document.getElementById('brand').addEventListener('change', function() {
        const brand = this.value;
        let modelOptions = '<option value="">Model Seçin</option>';
        if (brand && brand !== 'other') {
            for (let model of vehicles[brand]) {
                modelOptions += `<option value="${model}">${model}</option>`;
            }
        }
        document.getElementById('model').innerHTML = modelOptions;
    });

    document.getElementById('platform').addEventListener('change', function() {
        const otherPlatform = document.getElementById('otherPlatform');
        otherPlatform.style.display = this.value === 'other' ? 'block' : 'none';
    });

    document.getElementById('newListingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const newListing = {
            vehicleType: document.getElementById('vehicleType').value,
            brand: document.getElementById('brand').value,
            model: document.getElementById('model').value,
            price: document.getElementById('price').value,
            platform: document.getElementById('platform').value,
            description: document.getElementById('description').value,
            accidentHistory: document.getElementById('accidentHistory').value,
            images: ['placeholder-image.jpg'], // Gerçek dosya yükleme işlemi burada yapılmalı
            userEmail: currentUser.email
        };
        listings.push(newListing);
        saveListings();
        refreshData();
        alert('İlan başarıyla eklendi!');
        showHomePage();
    });
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
        refreshData();
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
            if (listing) { // Eğer ilan hala mevcutsa
                content += `
                    <div class="chat-preview">
                        <h3>${listing.brand} ${listing.model}</h3>
                        <p>Son mesaj: ${messages[currentUser.email][listingIndex][messages[currentUser.email][listingIndex].length - 1].content}</p>
                        <button onclick="showChat(${listingIndex})">Sohbeti Görüntüle</button>
                    </div>
                `;
            }
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
        refreshData();
        document.getElementById('chatMessageContent').value = '';
        updateChatMessages();
    });
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    refreshData();
    showHomePage();
}

// Sayfa yüklendiğinde veriyi yenile ve ana sayfayı göster
window.onload = function() {
    refreshData();
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

// Menü linklerine tıklandığında ilgili sayfaları göster ve veriyi yenile
document.getElementById('homeLink').addEventListener('click', function() {
    refreshData();
    showHomePage();
});
document.getElementById('loginLink').addEventListener('click', showLoginForm);
document.getElementById('registerLink').addEventListener('click', showRegisterForm);
document.getElementById('newListingLink').addEventListener('click', showNewListingForm);