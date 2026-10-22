"use client";

import React, { useState, useRef } from "react";
import { Mic, Upload, Music, Sparkles, Play, Pause, Download, RefreshCw, Volume2, CheckCircle2, AlertCircle } from "lucide-react";

export default function Home() {
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [songFile, setSongFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  
  const [pitchShift, setPitchShift] = useState(0);
  const [autoTune, setAutoTune] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [convertedAudioUrl, setConvertedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Microfone direto no navegador
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        const file = new File([blob], "minha_voz_gravada.wav", { type: "audio/wav" });
        setVoiceFile(file);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert("Permissão de microfone necessária para gravar diretamente no navegador.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleConvert = async () => {
    if (!voiceFile || !songFile) {
      alert("Por favor, selecione tanto o áudio da sua voz quanto o áudio da música!");
      return;
    }

    setIsProcessing(true);
    setProgressText("Enviando áudios para o Worker Neural...");

    try {
      const formData = new FormData();
      formData.append("voice", voiceFile);
      formData.append("song", songFile);
      formData.append("pitch", pitchShift.toString());
      formData.append("autotune", autoTune ? "true" : "false");

      setProgressText("Processando separação de stems e clonagem vocal RVC...");
      const res = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Falha na conversão da voz.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setConvertedAudioUrl(url);
      setProgressText("Conversão concluída com sucesso!");
    } catch (err: any) {
      alert(err.message || "Erro durante o processamento.");
      setProgressText("");
    } finally {
      setIsProcessing(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <main className="min-h-screen bg-[#07080c] text-zinc-100 flex flex-col items-center p-6 md:p-12">
      {/* Header */}
      <header className="max-w-4xl w-full text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          ESTÚDIO DE CLONAGEM & CONVERSÃO VOCAL
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          Substitua a Voz de Qualquer Música Pela Sua
        </h1>
        <p className="text-zinc-400 mt-3 text-sm md:text-base max-w-2xl mx-auto">
          Faça upload da música que gerou no Suno/Udio e do áudio da sua voz. Nossa esteira separa o instrumental, clona o seu timbre vocal e entrega a faixa masterizada.
        </p>
      </header>

      {/* Main Grid */}
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Card 1: Sua Voz */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">Passo 1</span>
              <Mic className="w-5 h-5 text-violet-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">Amostra da Sua Voz</h2>
            <p className="text-xs text-zinc-400 mb-6">
              Envie um áudio de 15 a 60 segundos falando ou cantando, ou grave diretamente pelo microfone.
            </p>

            <div className="flex flex-col gap-3">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700/80 hover:border-violet-500/60 rounded-xl p-5 cursor-pointer transition bg-zinc-950/40">
                <Upload className="w-6 h-6 text-zinc-400 mb-2" />
                <span className="text-xs font-medium text-zinc-300">
                  {voiceFile ? voiceFile.name : "Clique para escolher o arquivo de voz"}
                </span>
                <span className="text-[11px] text-zinc-500 mt-1">.wav, .mp3, .m4a até 50MB</span>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && setVoiceFile(e.target.files[0])}
                />
              </label>

              <div className="flex items-center justify-center">
                <span className="text-xs text-zinc-600 font-semibold uppercase">ou</span>
              </div>

              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Mic className="w-4 h-4 text-red-400" /> Gravar Microfone Agora
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition animate-pulse"
                >
                  Parar Gravação ({recordingTime}s)
                </button>
              )}
            </div>
          </div>

          {voiceFile && (
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4" /> Voz carregada: {voiceFile.name}
            </div>
          )}
        </div>

        {/* Card 2: A Música */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-fuchsia-400 uppercase tracking-wider">Passo 2</span>
              <Music className="w-5 h-5 text-fuchsia-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">Música de Referência</h2>
            <p className="text-xs text-zinc-400 mb-6">
              Envie a música gerada no Suno, Udio ou gravação com a melodia que deseja substituir.
            </p>

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700/80 hover:border-fuchsia-500/60 rounded-xl p-8 cursor-pointer transition bg-zinc-950/40">
              <Upload className="w-7 h-7 text-zinc-400 mb-2" />
              <span className="text-xs font-medium text-zinc-300">
                {songFile ? songFile.name : "Clique para escolher a música"}
              </span>
              <span className="text-[11px] text-zinc-500 mt-1">.mp3, .wav, .m4a com voz e batida</span>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && setSongFile(e.target.files[0])}
              />
            </label>
          </div>

          {songFile && (
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4" /> Música pronta: {songFile.name}
            </div>
          )}
        </div>
      </div>

      {/* Settings & Action Card */}
      <div className="max-w-4xl w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Ajuste de Tom (Semitons)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="-12"
                  max="12"
                  value={pitchShift}
                  onChange={(e) => setPitchShift(Number(e.target.value))}
                  className="w-32 accent-violet-500"
                />
                <span className="text-xs font-mono text-zinc-400 w-8">{pitchShift > 0 ? `+${pitchShift}` : pitchShift}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="autotune"
                checked={autoTune}
                onChange={(e) => setAutoTune(e.target.checked)}
                className="w-4 h-4 rounded accent-violet-500 bg-zinc-800 border-zinc-700"
              />
              <label htmlFor="autotune" className="text-xs font-medium text-zinc-300 cursor-pointer">
                Auto-Tune Moderno (Trap Scale)
              </label>
            </div>
          </div>

          <button
            onClick={handleConvert}
            disabled={isProcessing || !voiceFile || !songFile}
            className={`w-full md:w-auto px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition ${
              isProcessing || !voiceFile || !songFile
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:brightness-110 text-white active:scale-95"
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Convertendo Voz...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Iniciar Clonagem & Conversão
              </>
            )}
          </button>
        </div>

        {progressText && (
          <div className="text-xs font-mono text-zinc-400 bg-zinc-950/60 p-3 rounded-lg border border-zinc-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
            {progressText}
          </div>
        )}
      </div>

      {/* Output Audio Player */}
      {convertedAudioUrl && (
        <div className="max-w-4xl w-full bg-gradient-to-br from-violet-950/40 via-zinc-900 to-zinc-900 border border-violet-500/40 rounded-2xl p-6 shadow-2xl animate-fade-in">
          <audio
            ref={audioRef}
            src={convertedAudioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />

          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-semibold uppercase text-violet-400 tracking-wider">Música Finalizada</span>
              <h3 className="text-xl font-bold text-white mt-0.5">Faixa Pronta com a Sua Voz</h3>
            </div>
            <a
              href={convertedAudioUrl}
              download="musica_com_minha_voz.wav"
              className="py-2 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4" /> Baixar .WAV
            </a>
          </div>

          <div className="flex items-center gap-4 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-0.5" />}
            </button>
            <div className="flex-1">
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 w-full animate-pulse"></div>
              </div>
            </div>
            <Volume2 className="w-5 h-5 text-zinc-400" />
          </div>
        </div>
      )}
    </main>
  );
}
