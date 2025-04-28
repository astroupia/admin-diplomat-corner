import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from '@/lib/db-connect';
import Car from '@/lib/models/car.model';
import Payment from '@/lib/models/payment.model';
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
  carId?: string;
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

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const userId = (await auth()).userId;
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized', paymentId: '' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const receiptFile = formData.get('receipt') as File;

    const carData = {
      name: formData.get('name') as string,
      year: Number(formData.get('year')),
      mileage: Number(formData.get('mileage')),
      speed: Number(formData.get('speed')),
      milesPerGallon: Number(formData.get('milesPerGallon')),
      transmission: formData.get('transmission') as string,
      fuel: formData.get('fuel') as string,
      bodyType: formData.get('bodyType') as string,
      condition: formData.get('condition') as string,
      engine: formData.get('engine') as string,
      maintenance: formData.get('maintenance') as string,
      price: Number(formData.get('price')),
      description: formData.get('description') as string,
      advertisementType: formData.get('advertisementType') as 'Rent' | 'Sale',
      paymentMethod: Number(formData.get('paymentMethod')),
      currency: formData.get('currency') as string,
      tags: formData.get('tags') as string,
      userId,
      visiblity: "Private",
      status: "Pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      timestamp: new Date().toISOString(),
    };

    // Validate required fields
    if (!carData.name || !carData.price || !carData.mileage) {
      return NextResponse.json({ success: false, error: 'Missing required fields', paymentId: '' }, { status: 400 });
    }

    // Generate payment ID
    const paymentId = `${Date.now()}-${uuidv4()}`;

    // Upload car image
    let imageUrl = '';
    if (file) {
      const uploadResult = await uploadImage(file, 'public_images');
      if (!uploadResult.success) {
        return NextResponse.json({ success: false, error: uploadResult.error, paymentId: '' }, { status: 500 });
      }
      imageUrl = uploadResult.publicUrl!;
    }

    // Upload receipt
    let receiptUrl = '';
    if (receiptFile) {
      const uploadResult = await uploadImage(receiptFile, 'receipts');
      if (!uploadResult.success) {
        return NextResponse.json({ success: false, error: uploadResult.error, paymentId: '' }, { status: 500 });
      }
      receiptUrl = uploadResult.publicUrl!;
    }

    await connectToDatabase();

    // Create car
    const car = await Car.create({
      ...carData,
      imageUrl,
      paymentId,
    });

    // Create payment record
    await Payment.create({
      paymentId,
      servicePrice: Number(formData.get('servicePrice')),
      receiptUrl,
      productId: car._id.toString(),
      productType: "car",
      userId,
    });

    return NextResponse.json({
      success: true,
      message: 'Car created successfully',
      carId: car._id.toString(),
      paymentId
    });

  } catch (error) {
    console.error('Car creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create car', paymentId: '' },
      { status: 500 }
    );
  }
} 