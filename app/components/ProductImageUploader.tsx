import { useFetcher } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';

type UploadResponse = { url?: string; error?: string };

type ProductImageUploaderProps = {
  tempImageUrl: string;
  onTempImageUrlChange: (url: string) => void;
  existingImages?: { wooMediaId: number; src: string }[];
};

export default function ProductImageUploader({
  tempImageUrl,
  onTempImageUrlChange,
  existingImages = [],
}: ProductImageUploaderProps) {
  const fetcher = useFetcher<UploadResponse>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isUploading =
    fetcher.state === 'submitting' || fetcher.state === 'loading';
  const previewUrl = tempImageUrl || null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const formData = new FormData();
    formData.append('image', file);
    fetcher.submit(formData, {
      method: 'post',
      action: '/api/product-image-upload',
      encType: 'multipart/form-data',
    });
    e.target.value = '';
  };

  useEffect(() => {
    if (fetcher.data?.url) {
      onTempImageUrlChange(fetcher.data.url);
      setUploadError(null);
    }
    if (fetcher.data?.error) {
      setUploadError(fetcher.data.error);
    }
  }, [fetcher.data, onTempImageUrlChange]);

  const handleRemove = () => {
    if (tempImageUrl) {
      fetcher.submit(null, {
        method: 'delete',
        action: `/api/product-image-upload?url=${encodeURIComponent(tempImageUrl)}`,
      });
    }
    onTempImageUrlChange('');
    setUploadError(null);
  };

  return (
    <Box sx={{ marginLeft: 2, marginTop: 1 }}>
      {existingImages.length > 0 && (
        <>
          <Typography variant="body2">
            Current images in webshop ({existingImages.length})
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              alignItems: 'center',
              mb: 1,
            }}
          >
            {existingImages.map((image) => (
              <img
                key={image.wooMediaId}
                src={image.src}
                width={75}
                alt=""
              />
            ))}
          </Box>
        </>
      )}

      <Typography variant="body2" sx={{ mb: 1 }}>
        Upload new product image
      </Typography>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={handleFileChange}
      />

      <Button
        variant="outlined"
        size="small"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        sx={{ mr: 1 }}
      >
        {isUploading ? 'Uploading...' : 'Choose image'}
      </Button>

      {previewUrl && (
        <Button variant="text" size="small" onClick={handleRemove}>
          Remove
        </Button>
      )}

      {previewUrl && (
        <Box sx={{ mt: 1 }}>
          <img src={previewUrl} width={120} alt="Upload preview" />
          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
            Image will be sent to Woo when you save the product.
          </Typography>
        </Box>
      )}

      {uploadError && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {uploadError}
        </Alert>
      )}

      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
        JPEG, PNG or WebP, max 5 MB. Synced images from Woo may take up to an
        hour to appear here.
      </Typography>
    </Box>
  );
}
