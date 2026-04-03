'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Package, MapPin, Tag } from 'lucide-react';

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

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Location {
  id: string;
  name: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [search, categoryFilter, locationFilter]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter) params.append('categoryId', categoryFilter);
      if (locationFilter) params.append('locationId', locationFilter);

      const [itemsRes, categoriesRes, locationsRes] = await Promise.all([
        fetch(`/api/items?${params.toString()}`),
        fetch('/api/categories'),
        fetch('/api/locations')
      ]);

      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        setItems(itemsData);
      }
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }
      if (locationsRes.ok) {
        const locationsData = await locationsRes.json();
        setLocations(locationsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchImageUrls = async () => {
      const urls: Record<string, string> = {};
      for (const item of items) {
        if (item?.photoUrl) {
          try {
            const response = await fetch('/api/upload/url', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                cloud_storage_path: item.photoUrl,
                isPublic: item.isPublic ?? true
              })
            });
            if (response.ok) {
              const data = await response.json();
              urls[item.id] = data.url;
            }
          } catch (error) {
            console.error('Error fetching image URL:', error);
          }
        }
      }
      setImageUrls(urls);
    };

    if (items?.length > 0) {
      fetchImageUrls();
    }
  }, [items]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200"></div>
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Inventory
          </h1>
          <p className="text-muted-foreground">
            {items?.length ?? 0} items in your flat
          </p>
        </div>
        <Link href="/dashboard/inventory/add">
          <Button className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg">
            <Plus className="w-5 h-5" />
            Add Item
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="shadow-md">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat?.id} value={cat?.id ?? ''}>
                    {cat?.name ?? 'Unknown'}
                  </SelectItem>
                )) ?? null}
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations?.map((loc) => (
                  <SelectItem key={loc?.id} value={loc?.id ?? ''}>
                    {loc?.name ?? 'Unknown'}
                  </SelectItem>
                )) ?? null}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      {(!items || items.length === 0) ? (
        <Card className="shadow-md">
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground mb-6">
              Start by adding your first item to the inventory
            </p>
            <Link href="/dashboard/inventory/add">
              <Button className="gap-2">
                <Plus className="w-5 h-5" />
                Add First Item
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Link key={item?.id} href={`/dashboard/inventory/${item?.id}`}>
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
                  {imageUrls?.[item?.id ?? ''] ? (
                    <Image
                      src={imageUrls[item.id]}
                      alt={item?.name ?? 'Item'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                    {item?.uniqueId ?? 'N/A'}
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-bold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {item?.name ?? 'Unnamed Item'}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item?.category?.color ?? '#60B5FF' }}
                    ></div>
                    <Tag className="w-4 h-4" />
                    <span>{item?.category?.name ?? 'Uncategorized'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{item?.location?.name ?? 'Unknown'}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <span className="text-sm font-semibold">
                      Quantity: <span className="text-blue-600">{item?.quantity ?? 0}</span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
