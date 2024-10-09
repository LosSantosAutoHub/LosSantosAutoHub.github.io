// script.js

const vehicles = {
    "Albany": ["Cavalcade", "Emperor", "Hermes"],
    "Annis": ["Elegy", "RE-7B", "Savestra"],
    "Bravado": ["Banshee", "Buffalo", "Gauntlet"],
    // Diğer markalar ve modeller eklenecek
};

// IndexedDB için değişkenler ve fonksiyonlar
let db;
const dbName = "GtaMarketDB";
const dbVersion = 1;

const request = indexedDB.open(dbName, dbVersion);

request.onerror = function(event) {
    console.error("IndexedDB hatası:", event.target.error);
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log("IndexedDB başarıyla açıldı");
    refreshData();
};

request.onupgradeneeded = function(event) {
    db = event.target.result;
    const objectStore = db.createObjectStore("listings", { keyPath: "id", autoIncrement: true });
    const messagesStore = db.createObjectStore("messages", { keyPath: "id", autoIncrement: true });
};

function saveToDatabase(storeName, data) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], "readwrite");
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.add(data);
        
        request.onerror = function(event) {
            reject("Veri eklenirken hata oluştu");
        };
        
        request.onsuccess = function(event) {
            resolve(event.target.result);
        };
    });
}

function getFromDatabase(storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName]);
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.getAll();
        
        request.onerror = function(event) {
            reject("Veriler alınırken hata oluştu");
        };
        
        request.onsuccess = function(event) {
            resolve(event.target.result);
        };
    });
}

let listings = [];
let currentUser = null;
let messages = {};

async function refreshData() {
    try {
        listings = await getFromDatabase("listings");
        messages = await getFromDatabase("messages");
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        showHomePage();
    } catch (error) {
        console.error("Veri yenileme hatası:", error);
    }
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
        content += '<button onclick="showChatsPage()">Sohbetler</button>';
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

        getFromDatabase("users").then(users => {
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                alert('Giriş başarılı!');
                refreshData();
            } else {
                alert('Geçersiz e-posta veya şifre!');
            }
        });
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

        const newUser = { name, email, password };
        saveToDatabase("users", newUser).then(() => {
            alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
            showLoginForm();
        }).catch(error => {
            alert('Kayıt olurken bir hata oluştu: ' + error);
        });
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
        saveToDatabase("listings", newListing).then(() => {
            alert('İlan başarıyla eklendi!');
            refreshData();
        }).catch(error => {
            alert('İlan eklenirken bir hata oluştu: ' + error);
        });
    });
}

function showChatsPage() {
    let content = '<h2>Sohbetler</h2>';
    if (messages.length === 0) {
        content += '<p>Henüz hiç sohbetiniz yok.</p>';
    } else {
        content += '<div class="chat-list">';
        messages.forEach((chat, index) => {
            content += `
                <div class="chat-item" onclick="showChat(${index})">
                    <img src="${chat.avatar || '/placeholder-avatar.jpg'}" alt="${chat.name}" class="chat-avatar">
                    <div class="chat-info">
                        <h3>${chat.name}</h3>
                        <p>${chat.lastMessage}</p>
                    </div>
                </div>
            `;
        });
        content += '</div>';
    }
    document.getElementById('mainContent').innerHTML = content;
}

function showChat(index) {
    const chat = messages[index];
    let content = `<h2>${chat.name} ile Sohbet</h2>`;
    content += '<div id="chatMessages"></div>';
    content += `
        <form id="chatForm">
            <input type="hidden" id="chatIndex" value="${index}">
            <textarea id="chatMessageContent" placeholder="Mesajınızı yazın" required></textarea>
            <button type="submit">Gönder</button>
        </form>
    `;
    document.getElementById('mainContent').innerHTML = content;

    function updateChatMessages() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';
        for (const message of chat.messages) {
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
        chat.messages.push({
            sender: currentUser.email,
            content: messageContent,
            timestamp: new Date().toISOString()
        });
        saveToDatabase("messages", messages[index]).then(() => {
            document.getElementById('chatMessageContent').value = '';
            updateChatMessages();
        }).catch(error => {
            alert('Mesaj gönderilirken bir hata oluştu: ' + error);
        });
    });
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    refreshData();
}

// Sayfa yüklendiğinde veriyi yenile ve ana sayfayı göster
window.onload = function() {
    refreshData();
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
document.getElementById('homeLink').addEventListener('click', () => { refreshData(); showHomePage(); });
document.getElementById('loginLink').addEventListener('click', showLoginForm);
document.getElementById('registerLink').addEventListener('click', showRegisterForm);
document.getElementById('newListingLink').addEventListener('click', showNewListingForm);
document.getElementById('chatsLink').addEventListener('click', showChatsPage);