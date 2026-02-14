-- Add portrait_url column to characters table
ALTER TABLE characters ADD COLUMN IF NOT EXISTS portrait_url text;

-- Create portraits storage bucket (public, for serving AI-generated portraits)
INSERT INTO storage.buckets (id, name, public)
VALUES ('portraits', 'portraits', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own portraits"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portraits'
  AND (storage.foldername(name))[1] = 'portraits'
  AND (storage.foldername(name))[2] = (SELECT auth.uid()::text)
);

-- Allow authenticated users to overwrite their own portraits
CREATE POLICY "Users can update their own portraits"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portraits'
  AND (storage.foldername(name))[1] = 'portraits'
  AND (storage.foldername(name))[2] = (SELECT auth.uid()::text)
);

-- Allow public read access to all portraits
CREATE POLICY "Public can view portraits"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'portraits');
