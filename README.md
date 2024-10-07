# Kullanıcı Kimlik Doğrulama Uygulaması

Bu proje, kullanıcıların **login (giriş yapma)**, **register (kayıt olma)**, **verify-email (e-posta doğrulama)**, **password-change (şifre değiştirme)**, **forgot-password (şifre sıfırlama)**, **OTP (tek kullanımlık şifre)** ile e-posta doğrulama, **logout (çıkış yapma)** işlemleri ve **token** oluşturma ile doğrulama gibi adımları içeren bir kimlik doğrulama sistemidir.

## Kurulum Adımları

1. Terminal üzerinden aşağıdaki komutu çalıştırarak gerekli bağımlılıkları yükleyin:
services klasöründeki emailService dosyasına gidin ve auth parametresinin altındaki email ve pass alanlarını doldurun:

2. services klasöründeki emailService dosyasına gidin ve auth parametresinin altındaki email ve pass alanlarını doldurun:

<ul>
    <li>email: OTP ve e-posta doğrulama işlemleri için kullanılacak mail adresi.</li>
    <li>pass: Google hesabınız üzerinden uygulama şifresi oluşturmanız gerekmektedir. Doğrudan şifre girmek yerine uygulama şifresini kullanın.</li>
    <li>MongoDB bağlantısı için compress aktif olmalıdır. Eğer aktif değilse, veritabanı bağlantı ayarlarını database kısmında kendinize göre değiştirip istediğiniz veritabanına bağlanabilirsiniz.</li>
    <li>MongoDB bağlantısı başarılı olduktan sonra, authentication adında bir collection otomatik olarak oluşturulacaktır.</li>
    <li>Projeyi başlatmak için terminalde aşağıdaki komutu çalıştırın:</li>
    ```bash
    npm start
    ```
</ul>
    

## Uygulama Özellikleri

- **Kayıt Olma (Register):** Kullanıcılar e-posta ve şifre ile kayıt olabilir.
- **Giriş Yapma (Login):** E-posta ve şifre ile giriş yapılabilir.
- **E-posta Doğrulama (Verify Email):** Kayıt sonrası kullanıcının e-posta adresi doğrulanır.
- **Şifre Değiştirme (Password Change):** Kullanıcılar giriş yaptıktan sonra şifrelerini değiştirebilirler.
- **Şifre Sıfırlama (Forgot Password):** E-posta adresine gönderilen bağlantı ile kullanıcılar şifrelerini sıfırlayabilirler.
- **OTP Gönderimi:** Kullanıcılara tek kullanımlık şifre (OTP) ile doğrulama işlemleri yapılır.
- **Çıkış Yapma (Logout):** Kullanıcılar güvenli bir şekilde sistemden çıkış yapabilir.
- **Token Oluşturma ve Doğrulama:** Kullanıcılar giriş yaptıklarında bir token oluşturulur ve bu token kullanılarak doğrulama yapılır.

## Geliştirme Bilgileri

- Proje, Node.js ve Express.js üzerine inşa edilmiştir.
- E-posta doğrulama ve şifre sıfırlama işlemleri için [NodeMailer](https://nodemailer.com/) kullanılmıştır.
- Kimlik doğrulama işlemlerinde [JWT (JSON Web Token)](https://jwt.io/) kullanılmaktadır.
- MongoDB veritabanı kullanılmıştır; bağlantı için [Mongoose](https://mongoosejs.com/) kütüphanesi tercih edilmiştir.



# Uygulama Özeti

Bu uygulama, kullanıcı yönetimi ile ilgili temel işlevleri sağlamak amacıyla geliştirilmiştir. Aşağıda, uygulamanın sunduğu API uç noktaları ve bunların işleyişleri açıklanmaktadır.

## API Uç Noktaları

### 1. `POST /logout`
**Açıklama:** Kullanıcının çıkış yapmasını sağlar.  
**İşlem:**
- Authorization başlığından token alınır.
- Eğer token mevcutsa, bu token `tokenBlacklist` koleksiyonuna eklenir, böylece kullanıcı oturumu kapatılmış olur.

---

### 2. `POST /register`
**Açıklama:** Yeni bir kullanıcı kaydı oluşturur.  
**İşlem:**
- Gönderilen veriler `userValidationSchema` ile doğrulanır.
- Kullanıcı daha önce kayıtlıysa hata döner.
- Şifre bcrypt ile hashlenir.
- E-posta doğrulama token'ı oluşturulur ve doğrulama e-postası gönderilir.
- Kullanıcı veritabanına kaydedilir.

---

### 3. `POST /login`
**Açıklama:** Kullanıcının giriş yapmasını sağlar.  
**İşlem:**
- Gönderilen e-posta ile kullanıcı veritabanında aranır.
- Kullanıcının e-postası doğrulanmamışsa hata döner.
- Kullanıcının şifresi doğrulanır.
- Doğruysa, OTP (tek kullanımlık şifre) oluşturulur ve e-posta ile gönderilir.

---

### 4. `POST /forgot-password`
**Açıklama:** Kullanıcının şifresini unuttuğu durumda yeni bir OTP gönderir.  
**İşlem:**
- Gönderilen e-posta ile kullanıcı veritabanında aranır.
- Kullanıcı bulunursa, yeni bir OTP oluşturulur ve e-posta ile gönderilir.

---

### 5. `POST /verify-otp`
**Açıklama:** Gönderilen OTP'yi doğrular.  
**İşlem:**
- Gönderilen e-posta ve OTP kontrol edilir.
- Eğer doğruysa, login işlemi için token döner veya OTP doğrulama başarılı mesajı döner.

---

### 6. `POST /reset-password`
**Açıklama:** Kullanıcının şifresini sıfırlar.  
**İşlem:**
- Kullanıcının yeni şifre ve onay şifresi kontrol edilir.
- Kullanıcı e-posta ile bulunursa, şifre hashlenir ve güncellenir.

---

### 7. `GET /verify-email/`
**Açıklama:** E-posta doğrulama işlemi için token'ı kontrol eder.  
**İşlem:**
- Token'ın geçerliliği kontrol edilir ve daha önce kullanılıp kullanılmadığı kontrol edilir.
- Token geçerli ise, kullanıcının e-postası doğrulanır ve kullanıcı veritabanında güncellenir.

---

## Kullanım

Bu API uç noktalarını kullanarak kullanıcı kaydı, giriş işlemleri, şifre sıfırlama gibi işlemleri gerçekleştirebilirsiniz. Her bir işlem, ilgili açıklamalara ve işleyiş adımlarına göre yapılmalıdır.

## Gereksinimler

- Node.js
- Express
- Bcrypt
- JSON Web Token (JWT) gibi gerekli paketler.

## Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.
