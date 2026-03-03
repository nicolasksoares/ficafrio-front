// src/components/ui/ImageGalleryModal.tsx
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'; // Certifique-se de ter o Carousel

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  spaceName: string;
}

export const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({ isOpen, onClose, images, spaceName }) => {
  if (!isOpen || images.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="p-4">
          <DialogTitle className="text-xl font-bold">{spaceName}</DialogTitle>
          <DialogDescription>Galeria de Imagens</DialogDescription>
        </DialogHeader>
        <Carousel className="w-full">
          <CarouselContent>
            {images.map((img, index) => (
              <CarouselItem key={index}>
                <div className="relative w-full h-[500px] flex items-center justify-center bg-black">
                  {/* Se estiver usando Next.js */}
                  {/* <Image src={img} alt={`${spaceName} - ${index + 1}`} layout="fill" objectFit="contain" /> */}
                  
                  {/* Se não estiver usando Next.js */}
                  <img src={img} alt={`${spaceName} - ${index + 1}`} className="max-h-full max-w-full object-contain" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </DialogContent>
    </Dialog>
  );
};