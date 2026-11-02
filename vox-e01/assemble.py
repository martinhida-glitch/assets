from pathlib import Path
import asyncio, subprocess, urllib.request, zipfile
import edge_tts

ROOT = Path("VOX_E01_CAPCUT")
VID = ROOT / "VIDEOS_ORIGINALES"
AUD = ROOT / "AUDIO"
VID.mkdir(parents=True, exist_ok=True)
AUD.mkdir(parents=True, exist_ok=True)
SOURCES = [
("01_VOX_15s.mp4","https://resource2.heygen.ai/videos/ef43627cce4a401da1cd187493c8bd67/ef43627cce4a401da1cd187493c8bd67/7d7f307e-f33a-4ab0-ba57-4e9bb07039ed.mp4"),
("02_HISTORIA_10s.mp4","https://resource2.heygen.ai/videos/ef43627cce4a401da1cd187493c8bd67/ef43627cce4a401da1cd187493c8bd67/01a198ff-bdeb-7073-9e94-6d051b9ff82f.mp4"),
("03_HISTORIA_8s.mp4","https://resource2.heygen.ai/videos/ef43627cce4a401da1cd187493c8bd67/ef43627cce4a401da1cd187493c8bd67/01a19901-5018-7849-9b4e-06801c0cdba7.mp4"),
("04_HISTORIA_8s.mp4","https://resource2.heygen.ai/videos/ef43627cce4a401da1cd187493c8bd67/ef43627cce4a401da1cd187493c8bd67/01a19901-a610-7e2c-bf43-d06c90dc915b.mp4")
]
MUSIC = "https://heygen-product.s3-accelerate.amazonaws.com/astral_generated_music/795edf9803f14c14961bd605dd276574.wav?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA3FLD4S3AS7WYJKBK%2F20261102%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20261102T003453Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=f8b51e2b2b720dc369b88c37981fd7e31555160171c3366758d843da13b6bbf7"
SCRIPT = "¿Quién decidió que las naranjas tenían que convertirse en jugo todas las mañanas? Soy Vox, y esta historia tiene más publicidad que desayuno. A comienzos del siglo veinte, los productores de California tenían un problema: cosechaban más naranjas de las que podían vender. Entonces apareció el publicista Albert Lasker con una idea: en vez de comer una naranja, ¡bebela! En mil novecientos dieciséis, la campaña de Sunkist popularizó el exprimidor y el lema «Bebé una naranja». El detalle era perfecto para vender: un vaso necesitaba varias naranjas, no una sola. Con el tiempo, la industria llevó el jugo envasado a las mesas del desayuno. ¿Y la vitamina C? Es real. Pero no hace falta exprimir la fruta para obtenerla. Una naranja entera también aporta fibra y suele saciar más. Así que ese vaso tan familiar tiene dos historias: la nutrición y una campaña comercial brillante. Soy Vox. Dale me gusta, suscribite y abrí los ojos: las historias están en todas partes."
(ROOT/"GUION_COMPLETO.txt").write_text(SCRIPT, encoding="utf8")
(ROOT/"LEEME_CAPCUT.txt").write_text("""VOX E01 - CAPCUT
Los 4 MP4 son los videos ORIGINALES recuperados de HeyGen.
Incluye narracion completa en UNA VOZ y UNA musica continua.
VOZ: es-AR-TomasNeural es una alternativa natural gratuita. NO es Theo-Broadcaster; HeyGen rechaza la voz Theo porque solo dispone de 17s gratuitos y el audio requiere ~65s.
El MP4 terminado ajusta unicamente la velocidad de escenas ORIGINALES. Tambien se incluyen los MP4 sin editar para retocarlos en CapCut.
Importar el MP3 de voz en una pista, el WAV de musica en otra. Poner musica al 5% de volumen, con fades suaves. Subtitular y exportar 9:16.
""", encoding="utf8")

def get(url, path):
    print("Downloading", path, flush=True)
    req=urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
    with urllib.request.urlopen(req,timeout=200) as response, open(path,"wb") as f:
        while True:
            chunk=response.read(1024*1024)
            if not chunk: break
            f.write(chunk)
    assert path.stat().st_size>1000, str(path)

for name,url in SOURCES:
    get(url, VID/name)
get(MUSIC, AUD/"MUSICA_ORIGINAL.wav")

async def speak():
    await edge_tts.Communicate(SCRIPT, voice="es-AR-TomasNeural", rate="-5%").save(str(AUD/"NARRACION_TOMAS_ARGENTINA.mp3"))
asyncio.run(speak())
assert (AUD/"NARRACION_TOMAS_ARGENTINA.mp3").stat().st_size>10000

def run(args):
    print("Running", " ".join(map(str,args))[:200],flush=True)
    subprocess.run([str(a) for a in args],check=True)
def dur(path):
    return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1",str(path)]).decode().strip())

voice_d=dur(AUD/"NARRACION_TOMAS_ARGENTINA.mp3")
originals=[VID/a for a,b in SOURCES]
vid_d=[dur(f) for f in originals]
parts=[
    (originals[0],0,vid_d[0]*0.48),
    (originals[1],0,vid_d[1]),
    (originals[2],0,vid_d[2]),
    (originals[3],0,vid_d[3]),
    (originals[0],vid_d[0]*0.48,vid_d[0]*0.52),
]
factor=(voice_d+0.8)/sum(p[2] for p in parts)
Path("tmp").mkdir(exist_ok=True)
files=[]
for i,(src,seek,span) in enumerate(parts):
    dest=Path(f"tmp/segment_{i}.mp4")
    run(["ffmpeg","-hide_banner","-loglevel","error","-y","-ss",seek,"-t",span,"-i",src,
         "-vf",f"setpts={factor:.5f}*(PTS-STARTPTS),fps=24,scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,setsar=1,format=yuv420p",
         "-an","-c:v","libx264","-preset","fast","-crf","23",dest])
    files.append(dest)
Path("tmp/files.txt").write_text("".join("file '"+str(x.resolve())+"'\n" for x in files))
run(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i","tmp/files.txt","-c","copy","tmp/montage.mp4"])
total=voice_d+0.8
filt=(f"[1:a]volume=1,apad=pad_dur=1[v];"
      f"[2:a]atrim=duration={total:.2f},asetpts=PTS-STARTPTS,volume=0.052,afade=t=in:st=0:d=0.4,afade=t=out:st={total-1.5:.2f}:d=1.5[m];"
      f"[v][m]amix=inputs=2:duration=longest:normalize=0,atrim=duration={total:.2f}[mix]")
run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i","tmp/montage.mp4","-i",AUD/"NARRACION_TOMAS_ARGENTINA.mp3",
     "-i",AUD/"MUSICA_ORIGINAL.wav","-filter_complex",filt,"-map","0:v","-map","[mix]","-t",total,"-c:v","copy","-c:a","aac","-b:a","192k","-movflags","+faststart",ROOT/"VOX_E01_VIDEO_COMPLETO.mp4"])
assert dur(ROOT/"VOX_E01_VIDEO_COMPLETO.mp4")>45
with zipfile.ZipFile("VOX_E01_CAPCUT.zip","w",zipfile.ZIP_STORED,allowZip64=True) as z:
    for f in ROOT.rglob("*"):
        if f.is_file(): z.write(f)
with zipfile.ZipFile("VOX_E01_CAPCUT.zip") as z:
    bad=z.testzip()
    assert bad is None,bad
    print("ZIP VERIFIED",len(z.namelist()),"files",Path("VOX_E01_CAPCUT.zip").stat().st_size,"bytes",flush=True)
