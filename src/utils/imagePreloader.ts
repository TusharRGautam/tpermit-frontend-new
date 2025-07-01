export const preloadImages = (imageUrls: string[]): Promise<HTMLImageElement[]> => {
  return Promise.all(
    imageUrls.map((url) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to preload image: ${url}`));
        img.src = url;
      });
    })
  );
};

export const preloadCriticalImages = () => {
  const criticalImages = [
    '/Website-Images/Logo/logo.jpg',
    '/Website-Images/Banners/Ertiga.png',
    '/Website-Images/Banners/AURA.png',
    '/Website-Images/Banners/Rumion.png'
  ];
  
  return preloadImages(criticalImages).catch((error) => {
    console.warn('Some critical images failed to preload:', error);
  });
}; 