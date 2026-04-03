'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, MapPin, Tag, Hash, Package, Trash2 } from 'lucide-react';

interface Item {
  id: string;
  uniqueId: string;
  name: string;
  quantity: number;
  photoUrl: string | null;
  isPublic: boolean;
  notes: string | null;
  category: { id: string; name: string; color: string };
  location: { id: string; name: string };
}

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      fetchItem();
    }
  }, [params?.id]);

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/items/${params?.id}`);
      if (response.ok) {
        const data = await response.json();
        setItem(data);
        
        if (data?.photoUrl) {
          const urlRes = await fetch('/api/upload/url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cloud_storage_path: data.photoUrl,
              isPublic: data.isPublic ?? true
            })
          });
          if (urlRes.ok) {
            const urlData = await urlRes.json();
            setImageUrl(urlData.url);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/items/${params?.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        router.push('/dashboard/inventory');
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <Card className="animate-pulse">
          <div className="aspect-video bg-gray-200"></div>
          <CardContent className="p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Item not found</h2>
        <Link href="/dashboard/inventory">
          <Button>Back to Inventory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/inventory">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Item Details
            </h1>
            <p className="text-muted-foreground">View and manage item information</p>
          </div>
        </div>
        <Button
          variant="destructive"
          onClick={handleDelete}
          className="gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </div>

      <Card className="overflow-hidden shadow-lg">
        {imageUrl ? (
          <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
            <Image
              src={imageUrl}
              alt={item?.name ?? 'Item'}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Package className="w-24 h-24 text-gray-400" />
          </div>
        )}
        
        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">{item?.name ?? 'Unnamed Item'}</h2>
            <div className="flex items-center gap-2 text-lg">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item?.category?.color ?? '#60B5FF' }}
              ></div>
              <span className="font-semibold text-muted-foreground">
                {item?.category?.name ?? 'Uncategorized'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Hash className="w-4 h-4" />
                <span>Unique ID</span>
              </div>
              <p className="text-lg font-bold text-blue-600">{item?.uniqueId ?? 'N/A'}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="w-4 h-4" />
                <span>Quantity</span>
              </div>
              <p className="text-lg font-bold">{item?.quantity ?? 0}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Location</span>
              </div>
              <p className="text-lg font-bold">{item?.location?.name ?? 'Unknown'}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="w-4 h-4" />
                <span>Category</span>
              </div>
              <p className="text-lg font-bold">{item?.category?.name ?? 'Uncategorized'}</p>
            </div>
          </div>

          {item?.notes && (
            <div className="space-y-2 pt-4 border-t">
              <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
              <p className="text-base whitespace-pre-wrap">{item.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
