import { ImageResponse } from 'next/og'
import { getPostBySlug } from '@/lib/api'

export const runtime = 'edge'

export const alt = 'Arody Blog Post'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: { slug: string } }) {
  const slug = (await params).slug; // Await params in Next.js 15/canary if needed, safe in 14 too
  const post = await getPostBySlug(slug);
  
  // Resolve image URL (handle relative or absolute)
  const coverImage = post?.coverImage
    ? (post.coverImage.startsWith('/') ? `https://arody.cloud${post.coverImage}` : post.coverImage)
    : 'https://arody.cloud/arody-portrait.jpg' // fallback

  return new ImageResponse(
    (
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Background Image with object-fit cover simulation via flex/absolute */}
        <img
            src={coverImage}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
            }}
        />
        
        {/* Overlay for Title readability */}
        <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 60%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: 60,
        }}>
           <div style={{ 
               color: 'white', 
               fontSize: 72, 
               fontFamily: 'serif', 
               fontWeight: 900,
               lineHeight: 1.1,
               textShadow: '0 2px 10px rgba(0,0,0,0.3)',
               marginBottom: 20
           }}>
             {post?.title?.toUpperCase() || 'ARODY BLOG'}
           </div>
           
           <div style={{
               color: '#d4d4d4',
               fontSize: 28,
               fontFamily: 'sans-serif',
               textTransform: 'uppercase',
               letterSpacing: '0.1em',
               display: 'flex',
               alignItems: 'center',
               gap: 12
           }}>
                <span>Arody Fotografía</span>
                <span style={{ width: 40, height: 1, backgroundColor: '#d4d4d4' }}></span>
                <span>{post?.date ? new Date(post.date).getFullYear() : '2025'}</span>
           </div>
        </div>
      </div>
    ),
    {
        ...size,
        // Optional: Load fonts if we wanted, but sticking to system/standard for speed/reliability first
    }
  )
}
