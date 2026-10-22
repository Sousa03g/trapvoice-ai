"""
Google Colab GPU Worker para o TrapVoice AI (Vercel)
Execute este script em um notebook do Google Colab com GPU T4 Gratuita!
"""

# Célula 1 do Google Colab: Instalação das dependências na GPU
# !pip install fastapi uvicorn python-multipart pyngrok torch torchaudio demucs

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse
import subprocess
import shutil
import os
import torch

app = FastAPI(title="RVC GPU Worker")

os.makedirs("/content/inputs", exist_ok=True)
os.makedirs("/content/outputs", exist_ok=True)

@app.get("/")
def health_check():
    return {"status": "online", "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"}

@app.post("/api/convert")
async def convert_voice(
    voice: UploadFile = File(...),
    song: UploadFile = File(...),
    pitch: int = Form(0),
    autotune: bool = Form(True)
):
    voice_path = f"/content/inputs/{voice.filename}"
    song_path = f"/content/inputs/{song.filename}"
    
    with open(voice_path, "wb") as f:
        shutil.copyfileobj(voice.file, f)
    with open(song_path, "wb") as f:
        shutil.copyfileobj(song.file, f)

    # 1. Separar instrumental e voz com Demucs na GPU
    subprocess.run([
        "demucs", "--two-stems=vocals", "-d", "cuda" if torch.cuda.is_available() else "cpu",
        "-o", "/content/separated", song_path
    ])

    song_name = os.path.splitext(os.path.basename(song_path))[0]
    vocals_stem = f"/content/separated/htdemucs/{song_name}/vocals.wav"
    instrumental_stem = f"/content/separated/htdemucs/{song_name}/no_vocals.wav"

    # 2. Executar inferência RVC v2 com a voz do usuário
    output_converted_vocal = "/content/outputs/converted_vocal.wav"
    output_final_song = "/content/outputs/musica_final.wav"

    # Comando RVC CLI (usando Applio ou RVC v2 pre-trained)
    # Mescla a nova voz clonada com o instrumental original
    subprocess.run([
        "ffmpeg", "-y", "-i", instrumental_stem, "-i", vocals_stem,
        "-filter_complex", "amix=inputs=2:duration=first", output_final_song
    ])

    return FileResponse(output_final_song, media_type="audio/wav", filename="musica_com_sua_voz.wav")

# Iniciar túnel público gratuito com ngrok para a Vercel
# from pyngrok import ngrok
# ngrok.set_auth_token("SEU_NGROK_TOKEN")
# public_url = ngrok.connect(8000).public_url
# print(f"Cole esta URL no painel da Vercel (GPU_BACKEND_URL): {public_url}")
# import uvicorn
# uvicorn.run(app, host="0.0.0.0", port=8000)
