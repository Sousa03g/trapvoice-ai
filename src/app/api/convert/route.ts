import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300; // 5 minutos de timeout no plano Vercel

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const voiceFile = formData.get("voice") as Blob | null;
    const songFile = formData.get("song") as Blob | null;
    const pitch = formData.get("pitch") as string || "0";
    const autotune = formData.get("autotune") as string || "true";

    if (!voiceFile || !songFile) {
      return NextResponse.json(
        { error: "Arquivos de voz e música são obrigatórios." },
        { status: 400 }
      );
    }

    // URL do worker de IA (executando no Google Colab gratuito com GPU T4 ou HuggingFace ZeroGPU)
    const gpuWorkerUrl = process.env.GPU_BACKEND_URL;

    if (!gpuWorkerUrl) {
      return NextResponse.json(
        {
          error:
            "GPU_BACKEND_URL não configurada. Conecte o notebook do Google Colab (ou Hugging Face) nas variáveis de ambiente da Vercel para processar a conversão gratuitamente via GPU.",
        },
        { status: 500 }
      );
    }

    // Repassa os áudios para o worker com GPU
    const workerPayload = new FormData();
    workerPayload.append("voice", voiceFile, "user_voice.wav");
    workerPayload.append("song", songFile, "target_song.mp3");
    workerPayload.append("pitch", pitch);
    workerPayload.append("autotune", autotune);

    const workerResponse = await fetch(`${gpuWorkerUrl}/api/convert`, {
      method: "POST",
      body: workerPayload,
    });

    if (!workerResponse.ok) {
      const err = await workerResponse.text();
      return NextResponse.json(
        { error: `Erro no servidor GPU: ${err}` },
        { status: 502 }
      );
    }

    const audioArrayBuffer = await workerResponse.arrayBuffer();

    return new NextResponse(audioArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Disposition": 'attachment; filename="musica_convertida.wav"',
      },
    });
  } catch (error: any) {
    console.error("Erro na conversão:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
