import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file found' }, { status: 400 });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ 
        success: false, 
        error: "Vercel Blob token manquant. Ajoutez BLOB_READ_WRITE_TOKEN dans votre fichier .env" 
      }, { status: 500 });
    }

    // Clean filename and upload to Vercel Blob
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    
    // Upload the file to Vercel Blob (requires access: 'public')
    const blob = await put(`garden-listings/${filename}`, file, {
      access: 'public',
    });

    // Return the Vercel Blob public URL path
    return NextResponse.json({ success: true, url: blob.url });
  } catch (error) {
    console.error('Vercel Blob Upload Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload file to Vercel Blob' }, { status: 500 });
  }
}
