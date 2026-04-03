import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getFileUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { cloud_storage_path, isPublic = true } = body;

    if (!cloud_storage_path) {
      return NextResponse.json(
        { error: 'cloud_storage_path is required' },
        { status: 400 }
      );
    }

    const url = await getFileUrl(cloud_storage_path, isPublic);

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Error generating file URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate file URL' },
      { status: 500 }
    );
  }
}
