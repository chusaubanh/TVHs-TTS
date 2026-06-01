# Thanh Vinh Studio Frontend UX/UI Redesign

## Muc tieu

Thiet ke lai toan bo frontend Thanh Vinh Studio thanh mot voice-production workstation noi bo de hieu, thao tac nhanh va nhat quan. Giao dien phai phuc vu duoc nhan su khong chuyen ky thuat, dong thoi van cho phep nguoi van hanh truy cap model, LoRA va thong tin phan cung khi can.

Redesign chi thay doi cach to chuc va trinh bay frontend. Backend FastAPI, API contract, logic tao audio, logic tai model va cac URL chinh duoc giu nguyen.

## Design Read

Day la ung dung desktop noi bo cho team san xuat audio, khong phai dashboard phan tich va cung khong phai landing page thuong mai thuan tuy. Ngon ngu thiet ke phu hop la workstation gon, chuyen nghiep va co thu tu uu tien ro rang.

Thong so thiet ke:

- `DESIGN_VARIANCE: 4`
- `MOTION_INTENSITY: 3`
- `VISUAL_DENSITY: 6`
- Theme co dinh: dark charcoal
- He thong bo goc: panel `8px`, control `6px`, nut hanh dong chinh `8px`
- Font: `Outfit` cho heading va nhan quan trong, `Inter` cho noi dung thao tac de doc

## Mau Thuong Hieu

Giu nguyen bang mau Thanh Vinh Holdings dang co:

- Nen chinh: `#0c0c0c`
- Surface: `#141517`
- Surface nang: `#1e1f23`
- Surface hover: `#26282d`
- Accent vang: `#c5a059`
- Accent vang sang: `#e0c286`
- Text chinh: `#ededed`
- Text phu: `#8a8d93`
- Text muted: `#5e6065`

Quy tac mau:

- Vang thuong hieu la accent duy nhat cho lua chon, focus, CTA va trang thai active.
- Xanh la chi dung cho thanh cong va san sang.
- Do chi dung cho loi va hanh dong xoa.
- Amber chi dung cho canh bao.
- Loai bo tim va xanh duong dang dung de trang tri model, LoRA, voice type hoac quick action.
- Gradient vang chi dung co tiet che cho CTA chinh va selected state quan trong.

## Kien Truc Thong Tin

### Dieu huong chinh trong ung dung

Sidebar ung dung co icon kem nhan, thay cho icon-only sidebar:

1. `Tong quan`
2. `Tao audio`
3. `Thu vien giong`
4. `Lich su`
5. `Cai dat`

Dieu huong phu:

1. `Tinh nang`
2. `Huong dan`

`OmniVoice` khong con la mot muc dieu huong cap cao. Chuc nang nay duoc dat trong `Tao audio` voi nhan huong nguoi dung la `Thiet ke giong AI`.

### URL va kha nang tuong thich

- Giu `/`, `/studio`, `/features`, `/guide`.
- Giu query `?tab=` cho cac trang trong Studio.
- Ho tro query cu `?tab=omnivoice` bang cach mo `Tao audio` va chon che do `Thiet ke giong AI`.
- Khong doi endpoint backend.

## Landing Page

Landing page `/` van la trang gioi thieu day du nhung gon hon:

- Header mot dong, logo va dieu huong ro rang.
- Hero dat thuong hieu `Thanh Vinh Studio` la tin hieu chinh trong viewport dau.
- CTA chinh `Mo Studio`, CTA phu dan den khu vuc tinh nang.
- Khong dung hero center qua dai, quote trang tri, scroll cue hoac card tinh nang chen vao hero.
- Dua cac khoi `Tinh nang chinh`, `Quy trinh`, `Chay noi bo` va CTA cuoi trang thanh cac section rieng co nhip doc ro.
- Giu nen charcoal va vang thuong hieu; giam liquid blob de landing khong bi choi va khong anh huong hieu nang.

## App Shell

`/studio` mo vao `Tong quan` theo mac dinh.

Shell gom:

- Sidebar rong vua du icon va nhan, co trang thai active bang vien hoac nen vang nhat.
- Topbar chi hien ten khu vuc, breadcrumb ngan va trang thai he thong can thiet.
- Loai bo o tim kiem va notification button neu chua co logic that.
- Content area co max-width phu hop cho trang tong quan, thu vien, lich su va cai dat.
- Workspace tao audio chiem toan bo chieu rong con lai khi can.
- Responsive: sidebar thu gon tren man hinh hep, nhung van co nut mo menu ro rang.

## Dashboard Tong Quan

Dashboard la diem vao chinh, khong chi la trang thong ke.

Thu tu noi dung:

1. Header chao va tom tat trang thai he thong.
2. Cum hanh dong nhanh: `Tao tu giong co san`, `Clone giong`, `Tao doi thoai`, `Thiet ke giong AI`.
3. Thong tin can biet: model hien tai, trang thai san sang, LoRA neu dang bat.
4. Audio gan day voi nut nghe lai va lien ket mo lich su.
5. So lieu tom tat phu: tong audio, tong thoi luong, so giong.

Loai bo card bang mau tim, xanh duong va xanh la trang tri. Cac so lieu phu dung neutral surface; mau trang thai chi xuat hien khi co y nghia.

## Workspace Tao Audio

Workspace duy nhat gom bon tab:

1. `Giong co san`
2. `Clone giong`
3. `Doi thoai`
4. `Thiet ke giong AI`

### Bo cuc

- Tab mode nam o dau workspace.
- Vung noi dung chinh nam giua.
- Player co dinh o day workspace.
- Panel cau hinh ben phai hoac ben trai tuy viewport.
- Cau hinh thuong dung hien ngay.
- `Nang cao` co the mo de truy cap engine, LoRA, hardware detect va streaming.

### Giong co san

- Chon voice, phong cach doc, khoang lang va chen pause.
- Textarea la diem nhan lon nhat cua workspace.
- Lich su rut gon khong chen vao panel cau hinh; dashboard va trang Lich su da phu trach viec nay.

### Clone giong

- Upload audio tham chieu, transcript va van ban can doc theo thu tu tung buoc.
- Hien ro yeu cau file va yeu cau transcript khop noi dung.
- Trang thai file da chon phai de nhan biet.

### Doi thoai

- Moi dong thoai la mot item co so thu tu, voice, phong cach, noi dung va khoang dung.
- Hanh dong them dong ro rang.
- Empty state huong dan nguoi dung tao dong dau tien.

### Thiet ke giong AI

- Tich hop giao dien OmniVoice vao workspace chung.
- Giu cac luong tai model, khoi dong model, TTS, clone voice va saved voices.
- Doi nhan ky thuat sang nhan de hieu; van co the hien `OmniVoice` trong mo ta hoac trang thai ky thuat.
- Khi model chua co, hien setup state tai cho thay vi chuyen sang mot khu vuc giao dien khac.

## Trang Phu

### Thu vien giong

- Giu luoi voice hien tai nhung chuan hoa card, selected state va empty state.
- Dung metadata ngan gon, khong dung mau phu trang tri.
- Co hanh dong chon voice de quay ve workspace tao audio.

### Lich su

- Giu bang danh sach de scan nhanh.
- Chuan hoa badge loai audio bang neutral surface va vang accent.
- Giu play, delete va metadata file.
- Ho tro overflow ngang tren viewport hep.

### Cai dat

- Nhom thanh `Model`, `Phan cung`, `Xuat file`, `Gioi thieu`.
- Viet hoa nhan.
- Dua thong tin ky thuat vao day va khu vuc `Nang cao` cua workspace, khong chen vao luong tao audio co ban.

### Tinh nang va Huong dan

- Giu `/features` va `/guide`.
- Viet hoa nhan, cap nhat noi dung theo dieu huong moi.
- Giam card long nhau va emoji trong noi dung.
- Dung icon tu thu vien hien co.

## Trang Thai Giao Dien

Can giu va chuan hoa cac state:

- Loading khi kiem tra backend va model.
- Setup khi backend chua san sang.
- Setup khi model chua tai.
- Download progress.
- Error inline khi tai model that bai.
- Empty state cho thu vien giong, lich su, saved voices va doi thoai.
- Disabled state cho hanh dong chua the dung.
- Focus visible cho button, input, textarea va select.
- Pressed feedback nhe cho nut bam.
- Ho tro `prefers-reduced-motion`.

## Refactor Frontend

Refactor chi nham phuc vu redesign va giam lap lai:

- Tao mot cau hinh dieu huong dung chung cho app shell.
- Dung mot app shell duy nhat cho `/studio`, `/features` va `/guide`.
- Tach workspace tao audio thanh component theo mode.
- Tao UI primitive nho cho panel, button, icon button, status badge, segmented control va empty state.
- Chuyen inline style lap lai sang token hoac class trong `globals.css`.
- Gom gradient vang va mau state vao token.
- Xoa wrapper component chi re-export neu khong con can.
- Loai bo SVG viet tay khi icon tu `lucide-react` da co san.
- Chuan hoa chuoi hien thi tieng Viet; khong doi payload API hoac gia tri enum backend.

Khong doi icon library trong dot redesign nay. Repo da dung `lucide-react`; thay thu vien icon se tang blast radius ma khong cai thien luong nguoi dung.

## Kiem Thu Va Xac Minh

### Static verification

- Chay `npm run lint`.
- Chay `npm run build`.
- Kiem tra khong con mau tim va xanh duong trang tri trong app workspace.
- Kiem tra cac query `?tab=dashboard`, `?tab=studio`, `?tab=omnivoice`, `?tab=voices`, `?tab=history`, `?tab=settings`.

### Visual verification

Kiem tra bang trinh duyet o desktop va viewport hep:

- Landing page khong overflow va CTA ro rang.
- Sidebar app co the dieu huong tat ca muc.
- Dashboard hien dung uu tien hanh dong.
- Bon mode tao audio chuyen doi dung.
- Panel `Nang cao` mo dong dung.
- Player khong che textarea.
- Lich su co the cuon ngang tren viewport hep.
- Focus state hien ro khi dung ban phim.

### Regression verification

- Giu luong tai base model.
- Giu luong tao audio preset va clone.
- Giu cac hook va API call dang co.
- Giu luong tai, khoi dong va go OmniVoice.
- Giu delete va play file lich su.

## Ngoai Pham Vi

- Khong sua backend.
- Khong thay doi API contract.
- Khong them authentication.
- Khong them notification center hoac global search khi chua co logic.
- Khong them framework UI moi.
- Khong doi logo, URL chinh hoac mau thuong hieu.
- Khong sua cac script cai dat dang co thay doi trong worktree.

## Thu Tu Trien Khai

1. Chuan hoa token va UI primitive.
2. Tao app shell va dieu huong dung chung.
3. Redesign Dashboard.
4. Gom workspace tao audio va tich hop `Thiet ke giong AI`.
5. Redesign Thu vien giong, Lich su va Cai dat.
6. Redesign landing, Tinh nang va Huong dan.
7. Clean code, lint, build va visual QA.

