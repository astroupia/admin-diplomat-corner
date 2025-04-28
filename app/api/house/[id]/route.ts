import { NextRequest, NextResponse } from "next/server";
import { getHouseById } from "@/lib/actions/house.actions";
import { connectToDatabase } from '@/lib/db-connect';
import House from '@/lib/models/house.model';
import { auth } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';

const CPANEL_API_URL = 'https://diplomatcorner.net:2083';
const CPANEL_USERNAME = 'diplomvv';
const CPANEL_API_TOKEN = '2JL5W3RUMNY0KOX451GL2PPY4L8RX9RS';
const PUBLIC_DOMAIN = 'https://diplomatcorner.net';

interface ApiResponse {
  success: boolean;
  error?: string;
  message?: string;
  houseId?: string;
  paymentId?: string;
}

async function uploadImage(file: File, folder: 'public_images' | 'receipts'): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  const extension = file.name.split('.').pop();
  const randomFileName = `${uuidv4()}.${extension}`;
  
  const uploadFolder = folder === 'receipts' ? 'public_images/receipts' : folder;
  
  const apiFormData = new FormData();
  apiFormData.append('dir', `/public_html/${uploadFolder}/`);
  apiFormData.append('file-1', file, randomFileName);

  const authHeader = `cpanel ${CPANEL_USERNAME}:${CPANEL_API_TOKEN.trim()}`;

  try {
    const response = await fetch(`${CPANEL_API_URL}/execute/Fileman/upload_files`, {
      method: 'POST',
      headers: { Authorization: authHeader },
      body: apiFormData,
    });

    const data = await response.json();
    
    if (data.status === 0) {
      return { success: false, error: data.errors?.join(', ') || 'Upload failed' };
    }

    const uploadedFile = data.data?.uploads[0];
    if (!uploadedFile || !uploadedFile.file) {
      return { success: false, error: 'No uploaded file details returned' };
    }

    const publicUrl = `${PUBLIC_DOMAIN}/${uploadFolder}/${uploadedFile.file}`;
    return { success: true, publicUrl };
  } catch (error) {
    console.error('Image upload error:', error);
    return { success: false, error: 'Failed to upload image' };
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = await params;
    await connectToDatabase();
    const house = await House.findById(id);

    if (!house) {
      return NextResponse.json({ success: false, error: 'House not found', paymentId: '' }, { status: 404 });
    }

    return NextResponse.json({ success: true, ...house.toObject() });
  } catch (error) {
    console.error('Error fetching house:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch house', paymentId: '' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = await params;
    const userId = (await auth()).userId;
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized', paymentId: '' }, { status: 401 });
    }

    await connectToDatabase();
    const existingHouse = await House.findById(id);
    
    if (!existingHouse) {
      return NextResponse.json({ success: false, error: 'House not found', paymentId: '' }, { status: 404 });
    }

    if (existingHouse.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized', paymentId: '' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const receiptFile = formData.get('receipt') as File;

    const houseData = {
      name: formData.get('name') as string,
      bedroom: Number(formData.get('bedroom')),
      size: Number(formData.get('size')),
      bathroom: Number(formData.get('bathroom')),
      parkingSpace: Number(formData.get('parkingSpace')),
      condition: formData.get('condition') as string,
      maintenance: formData.get('maintenance') as string,
      price: Number(formData.get('price')),
      description: formData.get('description') as string,
      advertisementType: formData.get('advertisementType') as 'Rent' | 'Sale',
      paymentMethod: formData.get('paymentMethod') as 'Monthly' | 'Quarterly' | 'Annual',
      houseType: formData.get('houseType') as 'House' | 'Apartment' | 'Guest House',
      essentials: JSON.parse(formData.get('essentials') as string),
      currency: formData.get('currency') as string,
    };

    // Validate required fields
    if (!houseData.name || !houseData.bedroom || !houseData.size || 
        !houseData.bathroom || !houseData.parkingSpace || !houseData.price || 
        !houseData.description) {
      return NextResponse.json({ success: false, error: 'Missing required fields', paymentId: '' }, { status: 400 });
    }

    // Upload new house image if provided
    let imageUrl = existingHouse.imageUrl;
    if (file) {
      const uploadResult = await uploadImage(file, 'public_images');
      if (!uploadResult.success) {
        return NextResponse.json({ success: false, error: uploadResult.error, paymentId: '' }, { status: 500 });
      }
      imageUrl = uploadResult.publicUrl;
    }

    // Upload new receipt if provided
    let receiptUrl = existingHouse.paymentReceipt?.url;
    if (receiptFile) {
      const uploadResult = await uploadImage(receiptFile, 'receipts');
      if (!uploadResult.success) {
        return NextResponse.json({ success: false, error: uploadResult.error, paymentId: '' }, { status: 500 });
      }
      receiptUrl = uploadResult.publicUrl;
    }

    // Update house
    const updatedHouse = await House.findByIdAndUpdate(
      id,
      { 
        ...houseData,
        imageUrl,
        paymentReceipt: receiptUrl ? {
          url: receiptUrl,
          paymentId: existingHouse.paymentId,
          uploadedAt: new Date()
        } : existingHouse.paymentReceipt
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'House updated successfully',
      houseId: updatedHouse._id.toString(),
      paymentId: existingHouse.paymentId
    });

  } catch (error) {
    console.error('House update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update house', paymentId: '' },
      { status: 500 }
    );
  }
}
