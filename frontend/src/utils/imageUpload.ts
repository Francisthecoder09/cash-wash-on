export async function resizeVehicleImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Could not read selected image.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Selected file is not a valid image.'));
      image.onload = () => {
        const render = (maxWidth: number, maxHeight: number, quality: number) => {
          const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));

          const context = canvas.getContext('2d');
          if (!context) {
            reject(new Error('Could not prepare image upload.'));
            return null;
          }

          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL('image/jpeg', quality);
        };

        const primary = render(960, 640, 0.68);
        if (!primary) {
          return;
        }

        if (primary.length <= 500_000) {
          resolve(primary);
          return;
        }

        const secondary = render(800, 520, 0.52);
        if (!secondary) {
          return;
        }

        if (secondary.length <= 500_000) {
          resolve(secondary);
          return;
        }

        reject(new Error('Selected vehicle image is too large. Please choose a smaller photo.'));
      };
      image.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
