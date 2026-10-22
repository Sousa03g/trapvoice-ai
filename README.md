# 🎙️ TrapVoice AI - Conversor e Clonador de Voz para Músicas

Aplicação Full-Stack completa para substituir a voz de qualquer música (gerada no Suno, Udio ou gravação) pela sua voz real clonada.

## 🏗️ Arquitetura
* **Frontend & Gateway (Hospedado na Vercel):** Interface moderna em Next.js 14, Tailwind CSS, gravação de microfone direto no browser, player de áudio integrado e gerenciamento de arquivos.
* **Motor de IA (GPU Gratuita no Google Colab):** Servidor FastAPI executando Demucs (separação de stems) e RVC v2 (Retrieval-based Voice Conversion com HiFi-GAN e HuBERT) em uma placa de vídeo NVIDIA T4 gratuita do Google.

---

## 🚀 Como Hospedar na Vercel em 3 Passos

### Passo 1: Subir o Projeto para o seu GitHub
1. Abra o terminal nesta pasta (`voice_converter_app`).
2. Inicialize o repositório e envie para o seu GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - TrapVoice AI"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/trapvoice-ai.git
   git push -u origin main
   ```

### Passo 2: Importar na Vercel
1. Acesse **[vercel.com](https://vercel.com)** e faça login com seu GitHub.
2. Clique em **"Add New..."** -> **"Project"**.
3. Selecione o repositório `trapvoice-ai`.
4. Nas **Environment Variables** (Variáveis de Ambiente), adicione:
   * **Nome:** `GPU_BACKEND_URL`
   * **Valor:** A URL gerada pelo Google Colab no Passo 3.
5. Clique em **Deploy**.

---

### Passo 3: Iniciar o Motor de GPU Gratuito (Google Colab)
1. Acesse o **[Google Colab](https://colab.research.google.com)** (é 100% gratuito).
2. Vá em **Editar** -> **Configurações do Notebook** -> Selecione **GPU T4**.
3. Cole o script localizado em `colab/rvc_gpu_worker.py`.
4. Execute o script. Ele gerará uma URL pública (ex: `https://xxxx.ngrok-free.app`).
5. Cole essa URL na Vercel em `GPU_BACKEND_URL`.

Pronto! Qualquer pessoa que acessar o seu site na Vercel poderá enviar o áudio da própria voz, a música, e receber a faixa cantada com o timbre clonado em alta definição!
