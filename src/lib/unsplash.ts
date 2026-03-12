export interface UnsplashImage {
  url: string;
  thumb: string;
  blur: string;
  alt: string;
  credit: {
    name: string;
    link: string;
  };
}

export async function getCityImage(
  cityName: string,
  country: string
): Promise<UnsplashImage[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.warn("UNSPLASH_ACCESS_KEY is not set");
    return [];
  }

  const query = encodeURIComponent(`${cityName} ${country} travel`);
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${query}&per_page=3&orientation=landscape`,
    {
      headers: { Authorization: `Client-ID ${accessKey}` },
      next: { revalidate: 86400 }, // cache 24h
    }
  );

  if (!res.ok) {
    console.error("Unsplash API error:", res.status);
    return [];
  }

  const data = await res.json();

  return data.results.map((photo: UnsplashPhoto) => ({
    url: photo.urls.regular,
    thumb: photo.urls.small,
    blur: photo.blur_hash,
    alt: photo.alt_description || `${cityName} ${country} travel photo`,
    credit: {
      name: photo.user.name,
      link: `${photo.user.links.html}?utm_source=asiapicks&utm_medium=referral`,
    },
  }));
}

interface UnsplashPhoto {
  urls: { regular: string; small: string };
  blur_hash: string;
  alt_description: string | null;
  user: {
    name: string;
    links: { html: string };
  };
}
