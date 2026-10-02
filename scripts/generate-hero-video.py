"""Create a silent 18-second loop from the project's existing photography.

Run with Python 3 and FFmpeg installed. A repeated first scene and a trimmed
crossfade make the final frame meet the first without a hard cut.
"""

from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "videos"
OUTPUT.mkdir(parents=True, exist_ok=True)


def run(*args):
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *map(str, args)], check=True)


with tempfile.TemporaryDirectory(prefix="wusool-hero-") as scratch:
    clips = []
    for index, name in enumerate(["flight-day", "city", "saadiyat-garden"]):
        clip = Path(scratch) / f"scene-{index}.mp4"
        movement = (
            "scale=2560:1440:force_original_aspect_ratio=increase,crop=2560:1440,"
            "zoompan=z='1.02+0.04*(0.5-0.5*cos(on*PI/180))':"
            "x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=180:s=1280x720:fps=24,"
            "eq=saturation=0.85:contrast=0.96,format=yuv420p"
        )
        run("-i", ROOT / "public" / "photos" / f"{name}.jpg", "-vf", movement,
            "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "22", clip)
        clips.append(clip)

    graph = (
        "[0:v][1:v]xfade=transition=fade:duration=1.5:offset=6[v1];"
        "[v1][2:v]xfade=transition=fade:duration=1.5:offset=12[v2];"
        "[v2][3:v]xfade=transition=fade:duration=1.5:offset=18,"
        "trim=start=1.5:duration=18,setpts=PTS-STARTPTS,format=yuv420p[out]"
    )
    inputs = [part for clip in [*clips, clips[0]] for part in ["-i", clip]]
    run(*inputs, "-filter_complex", graph, "-map", "[out]", "-an",
        "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-movflags", "+faststart",
        OUTPUT / "wusool-hero.mp4")
    run("-i", OUTPUT / "wusool-hero.mp4", "-frames:v", "1", "-q:v", "3",
        OUTPUT / "wusool-hero-poster.jpg")

print(f"Created {OUTPUT / 'wusool-hero.mp4'}")
