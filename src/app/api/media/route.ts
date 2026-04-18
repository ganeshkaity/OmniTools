import { NextResponse } from 'next/server';
import youtubedl from 'youtube-dl-exec';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  const format = searchParams.get('format');
  const provider = searchParams.get('provider');

  if (!url) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  try {
    const isMp3 = format === 'mp3';

    // yt-dlp arguments base configuration
    const options: any = {
      f: isMp3 ? 'bestaudio' : 'best',
      o: '-', // Output directly to standard out
      noWarnings: true,
      preferFreeFormats: true,
      noCheckCertificates: true,
    };

    if (isMp3) {
      options.x = true; // Extract audio
      options.audioFormat = 'mp3';
    }

    // Execute youtube-dl
    const subprocess = youtubedl.exec(url, options);

    // Convert Node.js readable stream (stdout) to web standard ReadableStream
    const webStream = new ReadableStream({
      start(controller) {
        if (!subprocess.stdout) {
          controller.close();
          return;
        }

        subprocess.stdout.on('data', (chunk) => {
          controller.enqueue(chunk);
        });

        subprocess.stdout.on('end', () => {
          controller.close();
        });

        subprocess.stdout.on('error', (err) => {
          console.error('Stream Error:', err);
          controller.error(err);
        });

        // Add error handling on the main process to catch if yt-dlp fails early
        subprocess.on('error', (err) => {
          console.error('Subprocess Error:', err);
          controller.error(err);
        });
      },
      cancel() {
        subprocess.kill();
      }
    });

    const contentType = isMp3 ? 'audio/mpeg' : 'video/mp4';
    const filename = `media-${Date.now()}.${isMp3 ? 'mp3' : 'mp4'}`;

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error: any) {
    console.error("Media Download Exception:", error);
    return NextResponse.json({ error: "Failed to process media request" }, { status: 500 });
  }
}
