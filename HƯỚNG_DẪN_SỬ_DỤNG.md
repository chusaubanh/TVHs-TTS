# Huong dan su dung ThanhVinhStudio

> Ung dung chuyen van ban thanh giong noi tieng Viet - don gian, de dung, khong can biet lap trinh.

---

## Mo dau su dung

### Buoc 1: Khoi dong ung dung

Mo file **`start.bat`** bang cach nhap dup chuot vao no. Cua so terminal se hien ra va tu dong chay may chu.

Neu khong co file `start.bat`, hay mo terminal (Command Prompt hoac PowerShell) va go lenh sau:

```
uv run python backend/api.py
```

Sau khi thay dong chu **"Uvicorn running on http://0.0.0.0:8000"** thi may chu da san sang.

### Buoc 2: Mo trinh duyet

Mo trinh duyet web (Chrome, Edge, Firefox...) va truy cap:

```
http://localhost:3000
```

### Buoc 3: Tai model lan dau

Lan dau mo ung dung, ban se thay man hinh huong dan tai model. Chi can:

1. Nhan nut **"Tai model & Bat dau"**
2. Cho tai xong (khoang 300MB, chi can tai 1 lan duy nhat)
3. Model se tu dong khoi dong sau khi tai xong

---

## Giao dien chinh

Giao dien gom 2 phan:

- **Thanh ben trai**: Chon model, giong noi, phong cach va cac thiet lap
- **Vung lam viec chinh**: Nhap van ban, xem noi dung va phat audio

---

## Ba che do chinh

O phia tren cung cua man hinh, ban se thay 3 the (tab). Moi the la mot che do khac nhau:

### 1. Giong co san (mac dinh)

Day la che do don gian nhat - ban chon giong noi san co va nhap van ban de doc.

**Cach su dung:**

1. **Chon phong cach** o thanh ben trai:
   - **Tu nhien**: Giong noi binh thuong, tu nhien
   - **Ke chuyen**: Giong noi co cam xuc, phu hop ke chuyen

2. **Chon giong noi** tu danh sach xuong (dropdown)

3. **Nhap van ban** vao khung lon o phai

4. Nhan nut **"Tao giong"** (mau xanh duoi cung) de tao audio

5. Nhan nut **Play** (hinh tam giac) de nghe

**Them dung im vao van ban:**

Neu ban muon giong noi tam dung giua cac doan, hay su dung thanh cong cu "Chen dung" phia tren khung nhap van ban:

- Nhan **250ms** de chen dung ngan (0,25 giay)
- Nhan **500ms** de chen dung trung binh (nua giay)
- Nhan **1s** de chen dung 1 giay
- Nhan **2s** de chen dung 2 giay

Noi dung se hien ra dang `[pause:500]` trong khung van ban. Ban co the chen nhieu noi khac nhau.

**Dieu chinh thoi gian im lang:**

O thanh ben trai, co mot thanh truot "Im lang" giup ban dieu chinh khoang im lang giua cac tu. Keo sang trai = it im lang, keo sang phai = nhieu im lang hon.

---

### 2. Clone giong noi

Che do nay giup ban tao audio bang mot giong noi khac - chi can cung cap 1 mau audio ngan.

**Cach su dung:**

1. Chuyen sang the **"Clone"** o thanh tren cung

2. **Tai len file audio mau** bang cach nhan vao vung keo tha hoac keo file tu may tinh vao:
   - Dinh dang: WAV hoac MP3
   - Thoi luong: 3-10 giay la tot nhat

3. **Nhap van ban tham chieu** - DAY LA PHAN QUAN TRONG:
   - Ban phai goi CHINH XAC noi dung cua file audio mau
   - Van ban phai khop 100% voi am thanh da tai len
   - Vi du: Neu audio noi "Xin chao cac ban" thi ban phai goi dung "Xin chao cac ban"

4. **Nhap van ban can doc** vao khung lon o phai

5. Nhan **"Tao giong"** de tao audio bang giong noi da clone

---

### 3. Doi thoai (nhieu giong)

Che do nay giup ban tao mot doan doi thoai giua nhieu nhan vat, moi nhan vat co giong noi khac nhau.

**Cach su dung:**

1. Chuyen sang the **"Doi thoai"** o thanh tren cung

2. O thanh ben trai, ban se thay cac dong doi thoai. Moi dong gom:
   - **Chon giong**: Chon giong noi cho nhan vat nay
   - **Chon phong cach**: Tu nhien hoac Ke chuyen
   - **Nhap noi dung**: Goi loi cua nhan vat
   - **Thoi gian dung**: Keo thanh truot de chinh thoi gian im sau khi nhan vat noi xong (0-3 giay)

3. Nhan nut **"Them dong"** de them nhan vat moi

4. Nhan nut **thung rac** (goc phai moi dong) de xoa dong

5. O vung lam viec chinh, ban se thay ban xem truoc toan bo doan doi thoai

6. Nhan **"Tao giong"** de tao file audio chua toan bo doan doi thoai

**Vi du:** Tao doan doi thoai gom 2 nhan vat:
- Dong 1: Giong "Vinh" - "Hom nay troi dep qua!" - Dung 0.5s
- Dong 2: Giong "Ngoc" - "Dung roi, di choi di!" - Dung 1s

---

## Chon Model (CPU / GPU / Turbo)

O thanh ben trai, phan "Model" cho phep ban chon model phu hop voi may tinh cua minh:

| Model | Phu hop voi | Uu diem | Nhuoc diem |
|-------|-------------|---------|------------|
| **CPU** (GGUF Q4) | Tat ca may tinh | De cai dat, on dinh, khong can card do hoa | Cham hon GPU |
| **GPU** (PyTorch) | May co card NVIDIA | Chat luong tot nhat, ho tro LoRA | Can card do hoa manh |
| **Turbo** | May yeu | Nhe nhat, nhanh nhat | Chat luong giam mot chut |

**Khuyen nghi tu dong:**

Nhan nut **"Tu dong phat hien phan cung"** de ung dung tu kiem tra may tinh cua ban va goi y model phu hop nhat. Sau do chi can nhan nut chuyen sang model do.

---

## LoRA Adapter (Giong noi dac biet)

LoRA la cac "bo giong noi dac biet" giup thay doi phong cach giong. Vi du: giong doc truyen, giong ban hang, giong phat thanh vien...

**Luu y quan trong:** LoRA chi hoat dong khi ban dang dung model **GPU (PyTorch)**. Neu dang dung model CPU, ban se thay canh bao "Can GPU".

**Cach su dung:**

1. Chuyen sang model **GPU** truoc
2. Mo phan "LoRA Adapter" o thanh ben trai
3. Nhan vao LoRA ban muon su dung (se tu dong tai neu chua co)
4. De go LoRA, nhan lai vao LoRA dang chon hoac nhan nut "Go LoRA"

---

## Phat audio va tai ve

Sau khi tao audio thanh cong, thanh phat audio se hien o duoi cung man hinh:

- **Nut Play/Pause** (hinh tam giac / 2 vach): Phat hoac dung audio
- **Thanh tien trinh**: Keo de tua den vi tri bat ky trong audio
- **Hien thi thoi gian**: Xem thoi gian hien tai / tong thoi luong
- **Nut quay lai** (mui ten sang trai): Phat lai tu dau
- **Nut tai ve** (mui ten xuong): Luu file audio ve may tinh (dinh dang WAV)

---

## Lich su audio

Moi audio ban tao ra deu duoc tu dong luu lai. De xem lai:

1. Mo phan **"Lich su"** o thanh ben trai (nhan de mo/duoi)
2. Danh sach 10 audio gan nhat se hien ra
3. Nhan vao bat ky audio nao de nghe lai ngay lap tuc

File audio duoc luu trong thu muc **`outputs/`** cua ung dung.

---

## Cau hoi thuong gap

**Q: Ung dung khong chay, hien loi "Backend chua chay"**
A: Ban can khoi dong may chu truoc. Mo file `start.bat` hoac go lenh `uv run python backend/api.py` trong terminal.

**Q: Tai model bi loi hoac cham**
A: Kiem tra ket noi internet. Model chi can tai 1 lan duy nhat, nhung lan sau se su dung tu bo nho may.

**Q: Giong noi nghe khong tu nhien**
A: Thu thay doi phong cach (Tu nhien / Ke chuyen), dieu chinh thanh truot "Im lang", hoac chen them dung im bang cong cu "Chen dung".

**Q: Muon su dung LoRA nhung thay canh bao "Can GPU"**
A: Ban can chuyen sang model GPU bang cach nhan nut "GPU" o phan Model. Luu y: may tinh can co card do hoa NVIDIA.

**Q: Clone giong noi nghe khong giong goc**
A: Dam bao van ban tham chieu khop 100% voi noi dung audio. File audio nen ro rang, khong co nhieu, 3-10 giay.

**Q: Lam sao tao doan doi thoai giua nhieu nguoi?**
A: Chuyen sang the "Doi thoai", them dong moi cho tung nhan vat, chon giong khac nhau cho moi dong, roi nhan "Tao giong".

**Q: File audio duoc luu o dau?**
A: Trong thu muc `outputs/` nam cung cap voi thu muc cua ung dung.

---

## Phim tat (Tuy chon)

Neu ban muon khoi dong nhanh, co the tao shortcut hoac them `start.bat` vao khoi dong cung Windows.

---

*ThanhVinhStudio v4.0 - VieNeu-TTS-v2*
*Ung dung tong hop giong noi tieng Viet*
