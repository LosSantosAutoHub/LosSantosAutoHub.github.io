// script.js
const vehicles = {
    "Albany": ["Cavalcade", "Emperor", "Hermes"],
    "Annis": ["Elegy", "RE-7B", "Savestra"],
    "Bravado": ["Banshee", "Buffalo", "Gauntlet"],
    // Diğer markalar ve modeller eklenecek
};

let listings = []; // İlanları saklamak için boş bir dizi

function showHomePage() {
    let content = '<h2>Son İlanlar</h2>';
    if (listings.length === 0) {
        content += '<p>Henüz ilan bulunmamaktadır.</p>';
    } else {
        listings.forEach(listing => {
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
                            <button class="message-btn">Mesaj At</button>
                            <button class="buy-btn">Satın Al</button>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    document.getElementById('mainContent').innerHTML = content;
}

function showLoginForm() {
    const content = `
        <h2>Giriş Yap</h2>
        <form id="loginForm">
            <input type="email" id="loginEmail" placeholder="E-posta" required>
            <input type="password" id="loginPassword" placeholder="Şifre" required>
            <label><input type="checkbox" id="rememberMe"> Beni hatırla</label>
            <button type="submit">Giriş Yap</button>
        </form>
    `;
    document.getElementById('mainContent').innerHTML = content;
    
    // Kayıtlı bilgileri doldur
    const savedEmail = localStorage.getItem('userEmail');
    const savedPassword = localStorage.getItem('userPassword');
    if (savedEmail && savedPassword) {
        document.getElementById('loginEmail').value = savedEmail;
        document.getElementById('loginPassword').value = savedPassword;
        document.getElementById('rememberMe').checked = true;
    }

    // Giriş formunu dinle
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        if (rememberMe) {
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userPassword', password);
        } else {
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userPassword');
        }

        // Burada normalde sunucu tarafında kimlik doğrulama yapılır
        alert('Giriş başarılı!');
        // Giriş başarılı olduktan sonra
         // veya uygun sayfa URL'si
    });
}

function showRegisterForm() {
    const content = `
        <h2>Kayıt Ol</h2>
        <form id="registerForm">
            <input type="text" placeholder="Ad Soyad" required>
            <input type="email" placeholder="E-posta" required>
            <input type="password" placeholder="Şifre" required>
            <input type="password" placeholder="Şifre Tekrar" required>
            <button type="submit">Kayıt Ol</button>
        </form>
    `;
    document.getElementById('mainContent').innerHTML = content;
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

    // Marka seçimine göre model listesini güncelle
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

    // Platform seçimine göre "Diğer" input'unu göster/gizle
    document.getElementById('platform').addEventListener('change', function() {
        const otherPlatform = document.getElementById('otherPlatform');
        otherPlatform.style.display = this.value === 'other' ? 'block' : 'none';
    });

    // İlan verme formunu dinle
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
            images: ['placeholder-image.jpg'] // Gerçek dosya yükleme işlemi burada yapılmalı
        };
        listings.push(newListing);
        alert('İlan başarıyla eklendi!');
        showHomePage();
    });
}

// Sayfa yüklendiğinde ana sayfayı göster
window.onload = showHomePage;

// Menü linklerine tıklandığında ilgili sayfaları göster
document.getElementById('homeLink').addEventListener('click', showHomePage);
document.getElementById('loginLink').addEventListener('click', showLoginForm);
document.getElementById('registerLink').addEventListener('click', showRegisterForm);
document.getElementById('newListingLink').addEventListener('click', showNewListingForm);